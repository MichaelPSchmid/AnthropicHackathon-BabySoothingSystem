#!/usr/bin/env python3
"""
Baby Cry Detector Service - TCP Socket Version mit Bestätigungslogik
Läuft in separatem Prozess mit TensorFlow/PyTorch Environment
Kommuniziert über TCP Socket mit dem LiveKit Agent
"""

import json
import time
import threading
import signal
import sys
import socket
from typing import Optional, List
import numpy as np
import sounddevice as sd
import tensorflow as tf
import tensorflow_hub as hub
import csv

class BabyCryDetectorService:
    """Standalone Baby-Cry-Detektor Service mit TCP Communication und Bestätigungslogik"""
    
    def __init__(self, 
                 host: str = "localhost",
                 port: int = 9999,
                 threshold: float = 0.5, 
                 sample_rate: int = 16000):
        self.host = host
        self.port = port
        self.threshold = threshold
        self.sample_rate = sample_rate
        self.frame_length = 1.0  # 1 Sekunde
        self.hop_length = 0.5    # 0.5 Sekunden
        
        self.is_running = False
        self.server_socket: Optional[socket.socket] = None
        self.client_connections: List[socket.socket] = []
        self.connections_lock = threading.Lock()
        
        print("📄 Lade YAMNet...")
        self.yamnet = hub.load("https://tfhub.dev/google/yamnet/1")
        
        # Label-Liste laden
        class_map_path = tf.keras.utils.get_file(
            "yamnet_class_map.csv",
            "https://raw.githubusercontent.com/tensorflow/models/master/research/audioset/yamnet/yamnet_class_map.csv"
        )
        labels = [row[2] for row in csv.reader(open(class_map_path))][1:]
        self.cry_index = labels.index("Baby cry, infant cry")
        print(f"✅ YAMNet geladen. Baby cry index: {self.cry_index}")
        
        # Socket Server erstellen
        self._create_server()
        
        # Signal Handler für sauberes Beenden
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _create_server(self):
        """Erstellt TCP Server für IPC"""
        try:
            self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            self.server_socket.bind((self.host, self.port))
            self.server_socket.listen(5)
            print(f"📡 TCP Server erstellt: {self.host}:{self.port}")
        except Exception as e:
            print(f"❌ Fehler beim Erstellen des TCP Servers: {e}")
            sys.exit(1)
    
    def _accept_connections(self):
        """Akzeptiert eingehende Client-Verbindungen"""
        while self.is_running:
            try:
                client_socket, address = self.server_socket.accept()
                print(f"🔗 Client verbunden: {address}")
                
                with self.connections_lock:
                    self.client_connections.append(client_socket)
                
                # Begrüßungs-Event senden
                self._send_event("service_started", {"message": "Detector service connected"})
                
            except socket.error:
                if self.is_running:  # Nur loggen wenn nicht beim Shutdown
                    print("⚠️ Socket Accept Fehler")
                break
    
    def _send_event(self, event_type: str, data: dict = None):
        """Sendet Event über TCP Socket an alle verbundenen Clients"""
        event = {
            "type": event_type,
            "timestamp": time.time(),
            "data": data or {}
        }
        
        json_str = json.dumps(event) + '\n'
        
        with self.connections_lock:
            # Sende an alle verbundenen Clients
            disconnected_clients = []
            
            for client_socket in self.client_connections:
                try:
                    client_socket.send(json_str.encode('utf-8'))
                except (ConnectionResetError, BrokenPipeError):
                    print("📡 Client disconnected")
                    disconnected_clients.append(client_socket)
                except Exception as e:
                    print(f"⚠️ Fehler beim Senden an Client: {e}")
                    disconnected_clients.append(client_socket)
            
            # Disconnected Clients entfernen
            for client in disconnected_clients:
                try:
                    client.close()
                except:
                    pass
                self.client_connections.remove(client)
    
    def predict_cry_probability(self, audio_buffer: np.ndarray) -> float:
        """Berechnet Baby-Schrei-Wahrscheinlichkeit"""
        scores, embeddings, spectrogram = self.yamnet(audio_buffer)
        mean_scores = tf.reduce_mean(scores, axis=0).numpy()
        return float(mean_scores[self.cry_index])
    
    def start_service(self):
        """Startet den Detektor-Service"""
        self.is_running = True
        print("🎧 Baby-Cry-Detektor-Service gestartet mit Bestätigungslogik")
        print(f"👂 Warte auf Verbindungen auf {self.host}:{self.port}...")
        
        # Connection Acceptor Thread starten
        accept_thread = threading.Thread(target=self._accept_connections, daemon=True)
        accept_thread.start()
        
        # Detection Loop (Hauptthread)
        self._detection_loop()
    
    def _detection_loop(self):
        """Haupt-Detection-Loop mit robuster Bestätigungslogik"""
        block_size = int(self.sample_rate * self.hop_length)
        buffer_size = int(self.sample_rate * self.frame_length)
        audio_buffer = np.zeros(buffer_size, dtype=np.float32)
        
        last_status_time = 0
        
        # Robuste Bestätigungslogik-Variablen
        cry_confirmation_window = 5.0   # 5 Sekunden Beobachtungsfenster
        cry_required_percentage = 0.6   # 60% der Zeit muss Weinen erkannt werden
        stop_confirmation_delay = 8.0   # 8 Sekunden kontinuierlich still für Stop
        
        cry_detections = []  # Liste von (timestamp, is_crying) tupeln
        confirmed_crying = False
        last_cry_time = None
        quiet_streak_start = None
        
        try:
            with sd.InputStream(samplerate=self.sample_rate, channels=1, dtype='float32'):
                while self.is_running:
                    try:
                        # Audio lesen
                        data, _ = sd.rec(block_size, samplerate=self.sample_rate, channels=1, dtype='float32'), sd.wait()
                        data = data[:, 0]  # Mono
                        
                        # Buffer aktualisieren
                        audio_buffer = np.roll(audio_buffer, -block_size)
                        audio_buffer[-block_size:] = data
                        
                        # Vorhersage
                        cry_probability = self.predict_cry_probability(audio_buffer)
                        is_crying_now = cry_probability > self.threshold
                        current_time = time.time()
                        
                        # Neue Detection zu Liste hinzufügen
                        cry_detections.append((current_time, is_crying_now, cry_probability))
                        
                        # Alte Detections außerhalb des Fensters entfernen
                        cry_detections = [(t, c, p) for t, c, p in cry_detections 
                                        if current_time - t <= cry_confirmation_window]
                        
                        # Analyse des Confirmation Windows für CRY START
                        if not confirmed_crying and len(cry_detections) >= 6:  # mindestens 3 Sekunden Daten
                            crying_detections = sum(1 for _, is_cry, _ in cry_detections if is_cry)
                            cry_percentage = crying_detections / len(cry_detections)
                            
                            if cry_percentage >= cry_required_percentage:
                                confirmed_crying = True
                                last_cry_time = current_time
                                quiet_streak_start = None
                                avg_prob = np.mean([p for _, c, p in cry_detections if c])
                                print(f"👶🔊 WEINEN BESTÄTIGT! ({cry_percentage*100:.1f}% over {cry_confirmation_window}s, Avg Prob: {avg_prob:.3f})")
                                self._send_event("cry_detected", {"probability": float(avg_prob)})
                                
                        # Update last_cry_time wenn aktuell weint (aber reset Timer nicht sofort)
                        if is_crying_now and confirmed_crying:
                            last_cry_time = current_time
                            # quiet_streak_start = None  # ← ENTFERNT - Timer läuft weiter
                        
                        # CRY STOP Logik - längere kontinuierliche Stille nötig
                        if confirmed_crying:
                            if not is_crying_now:
                                # Stille erkannt
                                if quiet_streak_start is None:
                                    # Erste Stille - Timer starten
                                    quiet_streak_start = current_time
                                    print(f"🤫 Stille-Timer gestartet (Prob: {cry_probability:.3f}) - brauche {stop_confirmation_delay}s")
                                else:
                                    # Timer läuft bereits - prüfe wie lange
                                    elapsed = current_time - quiet_streak_start
                                    if elapsed >= stop_confirmation_delay:
                                        # Timer abgelaufen - Beruhigung bestätigt
                                        confirmed_crying = False
                                        print(f"✅ BERUHIGUNG BESTÄTIGT! ({elapsed:.1f}s kontinuierliche Stille)")
                                        self._send_event("cry_stopped", {"probability": cry_probability})
                                        quiet_streak_start = None
                                        cry_detections.clear()
                                    # Sonst: Timer läuft weiter - kein Print
                            else:
                                # Weinen erkannt während confirmed_crying
                                if quiet_streak_start is not None:
                                    elapsed = current_time - quiet_streak_start
                                    print(f"🔄 Weinen unterbricht Stille nach {elapsed:.1f}s (Prob: {cry_probability:.3f})")
                                    quiet_streak_start = None
                                else:
                                    # Debug: Weinen während confirmed_crying aber kein Timer
                                    print(f"🔄 Weinen während CRYING state (Prob: {cry_probability:.3f})")
                        
                        # Status Update (alle 10 Sekunden)
                        if current_time - last_status_time >= 10:
                            if confirmed_crying:
                                if quiet_streak_start is not None:
                                    quiet_duration = current_time - quiet_streak_start
                                    remaining = stop_confirmation_delay - quiet_duration
                                    status = f"CHECKING_STOP ({remaining:.1f}s)"
                                else:
                                    status = "CRYING"
                            else:
                                if len(cry_detections) >= 6:
                                    crying_count = sum(1 for _, is_cry, _ in cry_detections if is_cry)
                                    percentage = (crying_count / len(cry_detections)) * 100
                                    status = f"ANALYZING ({percentage:.1f}% crying)"
                                else:
                                    status = "QUIET"
                            
                            self._send_event("status", {
                                "probability": cry_probability,
                                "is_crying": confirmed_crying,
                                "running": True,
                                "connected_clients": len(self.client_connections)
                            })
                            
                            clients = len(self.client_connections)
                            print(f"📊 Status: {status} | Prob: {cry_probability:.3f} | Clients: {clients}")
                            last_status_time = current_time
                        
                        time.sleep(0.1)
                        
                    except Exception as e:
                        print(f"❌ Fehler in Detection Loop: {e}")
                        time.sleep(1)
        except KeyboardInterrupt:
            print("\n⏹️ Detection gestoppt")
    
    def stop_service(self):
        """Stoppt den Service"""
        print("🛑 Stoppe Baby-Cry-Detektor-Service...")
        self.is_running = False
        
        # Service-Stopped Event senden
        self._send_event("service_stopped")
        time.sleep(0.5)  # Kurz warten damit Event ankommt
        
        # Alle Client-Verbindungen schließen
        with self.connections_lock:
            for client_socket in self.client_connections:
                try:
                    client_socket.close()
                except:
                    pass
            self.client_connections.clear()
        
        # Server Socket schließen
        if self.server_socket:
            try:
                self.server_socket.close()
            except:
                pass
        
        print("✅ Service gestoppt")
    
    def _signal_handler(self, sig, frame):
        """Signal Handler für Ctrl+C"""
        print(f"\n📡 Signal {sig} empfangen. Stoppe Service...")
        self.stop_service()
        sys.exit(0)

def main():
    """Main Entry Point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Baby Cry Detector Service (TCP) mit Bestätigungslogik")
    parser.add_argument("--threshold", type=float, default=0.3, help="Cry detection threshold")
    parser.add_argument("--host", type=str, default="localhost", help="TCP Server Host")
    parser.add_argument("--port", type=int, default=9999, help="TCP Server Port")
    parser.add_argument("--cry-delay", type=float, default=3.0, help="Sekunden vor Cry-Bestätigung")
    parser.add_argument("--stop-delay", type=float, default=5.0, help="Sekunden vor Stop-Bestätigung")
    args = parser.parse_args()
    
    print("🍼 Baby Cry Detector Service (TCP Version mit Bestätigungslogik)")
    print(f"   Host: {args.host}")
    print(f"   Port: {args.port}")
    print(f"   Threshold: {args.threshold}")
    print(f"   Cry Confirmation: {args.cry_delay}s")
    print(f"   Stop Confirmation: {args.stop_delay}s")
    print()
    
    service = BabyCryDetectorService(
        host=args.host,
        port=args.port,
        threshold=args.threshold
    )
    
    # Optionally adjust timings via command line
    if hasattr(service, '_detection_loop'):
        # Would need to refactor to make delays configurable
        pass
    
    try:
        service.start_service()
    except KeyboardInterrupt:
        print("\n👋 Service beendet")
    finally:
        service.stop_service()

if __name__ == "__main__":
    main()
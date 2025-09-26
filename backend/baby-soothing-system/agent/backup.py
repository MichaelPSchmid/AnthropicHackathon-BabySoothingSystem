import asyncio
import json
import time
import threading
import socket
from enum import Enum
from typing import Optional

from dotenv import load_dotenv
from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import (
    anthropic,
    elevenlabs,
    silero,  # ✅ ADD: Silero TTS als Backup
    noise_cancellation,
    bey,     # ✅ ADD: Beyond Presence Avatar
)

load_dotenv(".env.local")

class AgentState(Enum):
    LISTENING = "listening"
    SOOTHING = "soothing" 
    COOLDOWN = "cooldown"

class BabyCryEventListener:
    """Empfängt Events vom Baby-Cry-Detektor Service über TCP Socket"""
    
    def __init__(self, host: str = "localhost", port: int = 9999):
        self.host = host
        self.port = port
        self.is_running = False
        self.client_socket: Optional[socket.socket] = None
        self.listener_thread: Optional[threading.Thread] = None
        
        # Callbacks
        self.on_cry_detected = None
        self.on_cry_stopped = None
        self.on_status_update = None
        self.on_service_started = None
        
    def start_listening(self):
        """Startet das Lauschen auf Events"""
        self.is_running = True
        self.listener_thread = threading.Thread(target=self._listen_loop, daemon=True)
        self.listener_thread.start()
        print(f"🔡 TCP Event Listener gestartet (verbinde zu {self.host}:{self.port})")
    
    def stop_listening(self):
        """Stoppt das Lauschen"""
        self.is_running = False
        if self.client_socket:
            try:
                self.client_socket.close()
            except:
                pass
        print("🛑 TCP Event Listener gestoppt")
    
    def _connect_to_service(self) -> bool:
        """Verbindet mit dem Detektor-Service"""
        try:
            self.client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.client_socket.settimeout(None)
            self.client_socket.connect((self.host, self.port))
            print("✅ Verbindung zum Detektor-Service hergestellt")
            return True
        except (ConnectionRefusedError, socket.timeout) as e:
            print(f"⏳ Detektor-Service nicht verfügbar: {e}")
            return False
        except Exception as e:
            print(f"❌ Verbindungsfehler: {e}")
            return False
    
    def _listen_loop(self):
        """Haupt-Listening-Loop"""
        while self.is_running:
            try:
                if not self._connect_to_service():
                    print("⏳ Warte 3 Sekunden und versuche erneut...")
                    time.sleep(3)
                    continue
                
                socket_file = self.client_socket.makefile('r')
                
                while self.is_running:
                    try:
                        line = socket_file.readline()
                        if not line:
                            print("🔡 Verbindung zum Service unterbrochen")
                            break
                        
                        line = line.strip()
                        if not line:
                            continue
                            
                        event = json.loads(line)
                        self._handle_event(event)
                        
                    except json.JSONDecodeError as e:
                        print(f"⚠️ JSON Decode Fehler: {e}")
                        continue
                    except socket.timeout:
                        continue
                    except Exception as e:
                        print(f"⚠️ Event Handling Fehler: {e}")
                        break
            
            except Exception as e:
                print(f"❌ TCP Listener Fehler: {e}")
            
            finally:
                if self.client_socket:
                    try:
                        self.client_socket.close()
                    except:
                        pass
                    self.client_socket = None
            
            if self.is_running:
                print("🔄 Reconnect in 3 Sekunden...")
                time.sleep(3)
    
    def _handle_event(self, event: dict):
        """Verarbeitet ein empfangenes Event"""
        event_type = event.get("type")
        data = event.get("data", {})
        
        if event_type == "service_started":
            print("🎉 Detektor-Service gestartet")
            if self.on_service_started:
                self.on_service_started(data)
        elif event_type == "cry_detected":
            if self.on_cry_detected:
                self.on_cry_detected(data)
        elif event_type == "cry_stopped":
            if self.on_cry_stopped:
                self.on_cry_stopped(data)
        elif event_type == "status":
            if self.on_status_update:
                self.on_status_update(data)
        elif event_type == "service_stopped":
            print("🔡 Detektor-Service wurde gestoppt")

class BabySoothingAssistant(Agent):
    """Baby-beruhigender Agent mit TCP Communication und Avatar"""
    
    def __init__(self):
        super().__init__(
            instructions="""Du bist ein sanfter Baby-Beruhigungs-Assistent. Deine Identität ist "Mom".
            Deine einzige Aufgabe ist es, weinende Babys mit ruhigen, sanften Worten zu beruhigen.
            
            Spreche sehr sanft, beruhigend und liebevoll. Verwende:
            - Kurze, einfache Sätze
            - Beruhigende Worte wie "Shhh", "Alles ist gut", "Ich bin da"
            - Sanfte Wiederholungen
            - Keine komplexen Erklärungen
            - Verhalte dich wie eine fürsorgliche Mutter
            
            Wichtig: Füge KEINE Regieanweisungen hinzu wie "*speaks in a calm voice*" - 
            sprich einfach direkt und sanft.
            
            Beispiele:
            - "Shhh, shhh... alles ist gut, kleiner Schatz"
            - "Ich bin da, du bist sicher"
            - "Ruhig, ruhig... gleich ist alles besser"
            - "Shhh, schlaf schön, mein Kleines"
            """
        )
        
        # State Management
        self.state = AgentState.LISTENING
        self.last_cry_time = 0
        self.cooldown_duration = 10.0
        self.agent_session: Optional[AgentSession] = None
        self.current_cry_probability = 0.0
        self.service_connected = False
        
        # Event Loop für Cross-Thread Communication
        self.main_loop: Optional[asyncio.AbstractEventLoop] = None
        
        # TCP Event Listener
        self.event_listener = BabyCryEventListener()
        self.event_listener.on_service_started = self._on_service_started
        self.event_listener.on_cry_detected = self._on_cry_detected
        self.event_listener.on_cry_stopped = self._on_cry_stopped
        self.event_listener.on_status_update = self._on_status_update
        
        # Monitoring Task
        self.monitor_task: Optional[asyncio.Task] = None
    
    def _on_service_started(self, data: dict):
        """Callback: Detektor-Service gestartet"""
        self.service_connected = True
        print("🔗 Verbindung zum Detektor-Service hergestellt")
    
    def _on_cry_detected(self, data: dict):
        """Callback: Baby-Schrei erkannt"""
        self.current_cry_probability = data.get("probability", 0.0)
        self.last_cry_time = time.time()
        
        if self.state != AgentState.SOOTHING:
            self.state = AgentState.SOOTHING
            print("👶🔊 Baby schreit! Starte Beruhigung...")
            
            # ✅ FIX: Async Task über Event Loop starten
            if self.main_loop and self.agent_session:
                future = asyncio.run_coroutine_threadsafe(
                    self._start_soothing(), 
                    self.main_loop
                )
                # Optional: Future für Error Handling speichern
                try:
                    # Kurz warten um Fehler zu catchen
                    future.result(timeout=0.1)
                except asyncio.TimeoutError:
                    # Normal - Task läuft noch
                    pass
                except Exception as e:
                    print(f"❌ Fehler beim Starten der Beruhigung: {e}")
    
    def _on_cry_stopped(self, data: dict):
        """Callback: Baby-Schrei gestoppt"""
        self.current_cry_probability = data.get("probability", 0.0)
        
        if self.state == AgentState.SOOTHING:
            self.state = AgentState.COOLDOWN
            print(f"⏱️ Cooldown gestartet ({self.cooldown_duration}s)")
    
    def _on_status_update(self, data: dict):
        """Callback: Status Update vom Detektor"""
        self.current_cry_probability = data.get("probability", 0.0)
        self.service_connected = data.get("running", False)
    
    async def _start_soothing(self):
        """Startet Beruhigungs-Prozess"""
        if not self.agent_session:
            print("❌ Keine Agent Session verfügbar")
            return
            
        print("👶 Starte Babyberuhigung...")
        print("🔄 Verwende say() anstatt generate_reply()...")
        
        try:
            # Direkte TTS-Ausgabe ohne Claude (umgeht Konsistenz-Probleme)
            soothing_texts = [
                "Shh, shh... everything is okay, little one. I'm here with you.",
                "There, there... you're safe and loved. Calm down, sweet baby.",
                "Shh, shh... it's alright, it's alright. Everything will be better soon.",
                "Rest now, little angel. You are so loved and protected.",
                "Shh, shh... breathe gently. Everything is peaceful and calm."
            ]
            
            import random
            selected_text = random.choice(soothing_texts)
            
            print(f"🗣️ Sage: '{selected_text}'")
            
            # Verwende say() für direkten TTS ohne Claude
            await self.agent_session.say(selected_text)
            
            print("✅ Beruhigungstext direkt an TTS gesendet!")
            
        except Exception as e:
            print(f"❌ Fehler beim direkten TTS: {e}")
            import traceback
            traceback.print_exc()
    
    async def _monitor_state(self):
        """Überwacht Agent-Status und Cooldown"""
        while True:
            try:
                current_time = time.time()
                
                # Cooldown-Logik
                if self.state == AgentState.COOLDOWN:
                    time_since_last_cry = current_time - self.last_cry_time
                    if time_since_last_cry >= self.cooldown_duration:
                        self.state = AgentState.LISTENING
                        print("✅ Cooldown beendet. Zurück zum Lauschen...")
                
                # Status-Log (alle 5 Sekunden)
                if int(current_time) % 5 == 0:
                    prob = self.current_cry_probability
                    connected = "🔗" if self.service_connected else "❌"
                    print(f"📊 Agent: {self.state.value} | Cry Prob: {prob:.3f} | Service: {connected}")
                
                await asyncio.sleep(1)
                
            except Exception as e:
                print(f"❌ Monitor Fehler: {e}")
                await asyncio.sleep(5)

async def entrypoint(ctx: agents.JobContext):
    """Agent Entry Point mit Avatar-Integration"""
    
    # Agent Session für Baby-Beruhigung
    session = AgentSession(
        stt=elevenlabs.STT(language_code="en"),  # ✅ Minimal STT für LiveKit Session
        llm=anthropic.LLM(
            model="claude-sonnet-4-20250514",
            temperature=0.3
        ),
        tts=elevenlabs.TTS(
            model="eleven_turbo_v2_5",
            voice_id="21m00Tcm4TlvDq8ikWAM",  # Rachel - sanfte weibliche Stimme
            streaming_latency=1
        ),
        vad=None,  # ✅ Kein VAD - Agent reagiert nur auf TCP Events
        turn_detection=None,  # ✅ Keine Turn-Detection
    )
    
    # ✅ Beyond Presence Avatar Session
    avatar_session = bey.AvatarSession(
        avatar_id="7c9ca52f-d4f7-46e1-a4b8-0c8655857cc3",  # Default Avatar ID
        avatar_participant_name="Mom"
    )
    
    # Baby Soothing Agent erstellen
    baby_agent = BabySoothingAssistant()
    baby_agent.agent_session = session
    
    # ✅ WICHTIG: Event Loop für Cross-Thread Communication speichern
    baby_agent.main_loop = asyncio.get_event_loop()
    
    # Agent Session starten
    await session.start(
        room=ctx.room,
        agent=baby_agent,
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )
    
    # ✅ Avatar Session starten (nach Agent Session)
    print("👤 Starte Beyond Presence Avatar...")
    await avatar_session.start(
        agent_session=session,
        room=ctx.room
    )
    print("✅ Avatar gestartet!")
    
    print("🍼 Baby Soothing Agent mit Avatar gestartet!")
    print("🔡 Starte TCP Event Listener...")
    
    # TCP Event Listener starten
    baby_agent.event_listener.start_listening()
    
    # State Monitor starten
    baby_agent.monitor_task = asyncio.create_task(baby_agent._monitor_state())
    
    # Kurz warten und dann Begrüßung
    await asyncio.sleep(2)
    await session.generate_reply(
        instructions="Introduce yourself quickly as a baby soothing assistant. Do not use more than three sentences."
    )
    
    try:
        # Läuft bis gestoppt
        await baby_agent.monitor_task
    except Exception as e:
        print(f"❌ Agent Fehler: {e}")
    finally:
        # Cleanup
        print("🧹 Cleanup...")
        baby_agent.event_listener.stop_listening()
        if baby_agent.monitor_task:
            baby_agent.monitor_task.cancel()

if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
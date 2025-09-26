# Somni - Intelligenter Baby Monitor

Somni ist ein KI-gestützter Baby Monitor, der automatisch Babygeschrei erkennt und darauf mit beruhigenden Worten reagiert. Das System ist speziell für frische Eltern entwickelt, die gerade nachts Unterstützung bei schreienden Babys benötigen.

## 🏗️ Projekt-Status

**Aktueller Entwicklungsstand:**
- ✅ **Backend**: Vollständig funktionsfähig mit Baby-Schrei-Erkennung und KI-Beruhigung
- ✅ **Frontend**: Fertig entwickelt (React/TypeScript mit Loveable)
- 🚧 **Integration**: Frontend-Backend-Integration steht noch aus
- ✅ **Interne Kommunikation**: TCP zwischen Detector und Agent implementiert

## 🎯 Funktionen

- **Intelligente Schrei-Erkennung**: Nutzt Google's YAMNet für präzise Baby-Schrei-Detektion
- **KI-Beruhigungs-Agent**: Spricht automatisch beruhigende Worte mit natürlicher Stimme
- **Echtzeit-Verarbeitung**: Sofortige Reaktion bei erkanntem Babygeschrei
- **Bestätigungslogik**: Vermeidet Fehlalarme durch mehrstufige Verifikation
- **LiveKit-Integration**: Hochqualitative Echtzeit-Audio-Übertragung


## 🚀 Quick Start

### Voraussetzungen

- **Python 3.9+** für Backend
- **Node.js 18+** für Frontend
- **Mikrofon** für Audio-Eingabe
- **Lautsprecher/Kopfhörer** für Audio-Ausgabe
- **Internet-Verbindung** für KI-Services

### 1. Repository klonen

```bash
git clone <your-repo-url>
cd somni
```

### 2. Backend einrichten

#### API-Keys konfigurieren
```bash
cd backend/agent
```

Erstelle `.env.local` mit:
```bash
# LiveKit Cloud (https://cloud.livekit.io/)
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_URL=wss://your-project.livekit.cloud

# KI Services
ANTHROPIC_API_KEY=your_claude_api_key
ELEVEN_API_KEY=your_elevenlabs_api_key
```

#### Baby-Schrei-Detektor starten
```bash
cd backend/detector

# Virtual Environment erstellen
python -m venv venv_detector

# Aktivieren (Windows)
venv_detector\Scripts\activate
# Aktivieren (macOS/Linux)
source venv_detector/bin/activate

# Dependencies installieren
pip install tensorflow tensorflow-hub sounddevice numpy

# Service starten
python baby_cry_detector_service.py --threshold 0.3
```

#### KI-Beruhigungs-Agent starten
```bash
# Neues Terminal
cd backend/agent

# Agent starten (Dev Mode - Audio über Browser)
uv run baby_soothing_agent.py dev

# Dann öffne: https://agents-playground.livekit.io/
# Verbinde mit deinen LiveKit Credentials
```

### 3. Frontend einrichten

```bash
cd frontend

# Dependencies installieren
npm install

# Development Server starten
npm run dev
```

Das Frontend ist vollständig entwickelt. Du kannst es über das [Loveable-Projekt](https://lovable.dev/projects/bc57c729-7974-4523-a111-622721564084) bearbeiten und anpassen.

**⚠️ Integration ausstehend**: Das Frontend kann noch nicht mit dem Backend kommunizieren. Eine REST API oder WebSocket-Verbindung muss noch implementiert werden.

## 🔧 Technischer Überblick

### Backend-Architektur

**Baby-Schrei-Detektor (`detector/`)**
- Nutzt Google's YAMNet für Audio-Klassifikation
- Kontinuierliche Mikrofon-Überwachung
- TCP-Server für Event-Kommunikation
- Bestätigungslogik: 60% Schrei-Erkennungsrate über 5 Sekunden

**KI-Beruhigungs-Agent (`agent/`)**
- LiveKit Voice Agent mit Claude 4 Sonnet
- ElevenLabs Text-to-Speech (natürliche Stimme)
- TCP-Client für Detektor-Events
- Cooldown-System verhindert Spam

**Kommunikation**
- TCP-Socket zwischen Detektor und Agent
- JSON-basierte Event-Messages
- Asynchrone Event-Verarbeitung

### Frontend-Architektur

**Technologie-Stack:**
- React mit TypeScript
- Vite Build-System  
- shadcn/ui Komponenten
- Tailwind CSS
- Loveable-basierte Entwicklung

**Aktuelle Features:**
- Moderne, responsive Benutzeroberfläche
- Baby Monitor Dashboard
- Einstellungen für Systemkonfiguration
- Status-Anzeigen und Logs

**⚠️ Integration fehlt noch:**
- REST API für Backend-Kommunikation
- WebSocket für Live-Updates
- Einstellungen-Synchronisation
- Live-Audio-Visualisierung

## 📊 System-Monitoring

### Detector Logs verstehen
```
🔍 Mögliches Weinen erkannt (Prob: 0.42) - warte 3.0s für Bestätigung...
👶🔊 WEINEN BESTÄTIGT! (65.2% over 5.0s, Avg Prob: 0.45)
📊 Status: CRYING | Prob: 0.52 | Clients: 1
🤫 Stille-Timer gestartet (Prob: 0.08) - brauche 8.0s
✅ BERUHIGUNG BESTÄTIGT! (8.2s kontinuierliche Stille)
```

### Agent Logs verstehen
```
🍼 Baby Soothing Agent gestartet!
📡 Starte TCP Event Listener...
🔗 Verbindung zum Detektor-Service hergestellt
👶🔊 Baby schreit! Starte Beruhigung...
🗣️ Sage: 'Shh, shh... everything is okay, little one.'
⏱️ Cooldown gestartet (10.0s)
```

## 🛠️ Konfiguration

### Detektor-Einstellungen

```python
# Empfindlichkeit anpassen
python baby_cry_detector_service.py --threshold 0.2    # Empfindlicher
python baby_cry_detector_service.py --threshold 0.4    # Weniger empfindlich

# Custom Host/Port
python baby_cry_detector_service.py --host localhost --port 9999
```

### Agent-Einstellungen

**Beruhigungs-Modi:**
- `dev`: Audio über Browser (https://agents-playground.livekit.io/)
- `console`: Direkte Audio-Ausgabe über System-Lautsprecher

```bash
# Dev Mode (empfohlen)
uv run baby_soothing_agent.py dev

# Console Mode
uv run baby_soothing_agent.py console
```

## 🔍 Testing

1. **System-Check**: Beide Services laufen und sind verbunden
2. **Baby-Schrei simulieren**: Lautes Weinen/Schreien ins Mikrofon
3. **Beruhigung hören**: Agent sollte beruhigende Worte sprechen

## 📋 Roadmap

### Kurzfristig (Höchste Priorität)
- [ ] **REST API für Frontend-Backend-Integration** 
  - Status-Endpunkte (Detector-Status, Agent-Status)
  - Konfigurations-Endpunkte (Threshold, Einstellungen)
  - Event-History-Endpunkte
- [ ] **WebSocket-Verbindung für Live-Updates**
  - Real-time Schrei-Ereignisse im Frontend anzeigen
  - Live-Probability-Updates
  - Agent-Status-Updates
- [ ] **Frontend-Backend-Integration testen und debuggen**

### Mittelfristig (Nach Integration)
- [ ] Erweiterte LLM-Integration für personalisiertere Beruhigung
- [ ] Mehrsprachige Unterstützung
- [ ] Mobile App (React Native)
- [ ] Smartphone-Benachrichtigungen
- [ ] Eltern-Dashboard mit detaillierten Statistiken

### Langfristig (Vision)
- [ ] Machine Learning für personalisierte Beruhigungsstrategien
- [ ] Integration mit Smart Home Systemen
- [ ] Video-Überwachung mit Avatar-Darstellung
- [ ] Medizinische Datenanalyse und Empfehlungen

## 🐛 Troubleshooting

### Häufige Probleme

**Detector**
- **"Models not found"**: `pip install tensorflow tensorflow-hub`
- **Mikrofon nicht erkannt**: Mikrofon-Berechtigungen prüfen
- **Keine Schrei-Erkennung**: Threshold auf 0.2 senken

**Agent**
- **Kein Audio im Dev Mode**: Browser mit LiveKit verbinden
- **ElevenLabs Fehler**: API Key und Credits prüfen
- **TCP Connection refused**: Detector zuerst starten

**Frontend**
- **Build-Fehler**: `npm ci` für saubere Installation  
- **Hot Reload funktioniert nicht**: Server neu starten
- **Frontend lädt nicht**: Port 5173 verfügbar? (`lsof -i :5173`)

**Integration**
- **Frontend kann Backend nicht erreichen**: REST API noch nicht implementiert
- **Keine Live-Updates**: WebSocket-Verbindung fehlt noch
- **Einstellungen nicht synchron**: Backend-Frontend-Integration ausstehend

## 🤝 Entwicklung

### Backend-Entwicklung
Das Backend ist vollständig in Python entwickelt und nutzt moderne async/await-Patterns für optimale Performance.

### Frontend-Entwicklung  
Das Frontend ist vollständig entwickelt und kann sowohl lokal als auch über das [Loveable-Projekt](https://lovable.dev/projects/bc57c729-7974-4523-a111-622721564084) bearbeitet werden.

### Integration (TO-DO)
Die Integration zwischen Frontend und Backend ist der nächste kritische Schritt:

**Benötigte API-Endpunkte:**
```python
# Beispiel REST API Struktur (noch zu implementieren)
GET /api/status          # System Status (Detector + Agent)
GET /api/events          # Event History  
POST /api/config         # Konfiguration ändern
WebSocket /ws/live       # Live Updates
```

**Frontend-Integration Tasks:**
- API Client implementieren
- WebSocket-Verbindung für Live-Updates
- Status-Dashboard mit Backend-Daten verbinden
- Konfigurationsseite mit Backend synchronisieren

### Beitragen
1. Fork das Repository
2. Erstelle einen Feature-Branch
3. Committe deine Änderungen
4. Push zum Branch
5. Öffne einen Pull Request

## 📄 Lizenz

[Lizenz noch zu definieren]

## 🙏 Credits

- **YAMNet**: Google's Audio-Klassifikations-Modell
- **LiveKit**: Echtzeit-Audio/Video-Infrastruktur
- **Anthropic Claude**: Large Language Model
- **ElevenLabs**: Text-to-Speech-Service
- **Loveable**: Frontend-Entwicklungsplattform

---

**Aktueller Entwicklungsstand**: Frontend und Backend sind einzeln vollständig funktionsfähig. Der nächste kritische Schritt ist die Implementation der REST API/WebSocket-Integration, damit das Frontend mit dem Backend kommunizieren kann. Bei Fragen oder Problemen, bitte Issues erstellen oder direkt kontaktieren.
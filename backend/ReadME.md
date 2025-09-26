# Baby Soothing System

Ein automatisches Baby-Beruhigungs-System bestehend aus einem Baby-Cry-Detector und einem AI-gesteuerten Soothing Agent.

## System-Architektur

- **Baby Cry Detector Service**: Läuft als separater Python-Prozess, erkennt Babygeschrei über Mikrofon
- **Baby Soothing Agent**: LiveKit Voice Agent der auf Cry-Events reagiert und beruhigende Worte spricht
- **Kommunikation**: TCP Socket zwischen Detector und Agent

## Ordnerstruktur

```
baby-soothing-system/
├── detector/
│   ├── baby_cry_detector_service.py
│   └── venv_detector/
├── agent/
│   ├── baby_soothing_agent.py
│   ├── agent_with_avatar.py
│   └── .env.local
├── pyproject.toml
└── README.md
```

## Setup

### 1. Repository clonen
```bash
git clone <your-repo>
cd baby-soothing-system
```

### 2. API Keys konfigurieren

Erstelle `.env.local` im **agent** Ordner:
```bash
cd agent
```

Erstelle die Datei `.env.local` mit folgendem Inhalt:
```bash
# LiveKit Cloud Credentials (https://cloud.livekit.io/)
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_URL=wss://your-project.livekit.cloud

# AI Services
ANTHROPIC_API_KEY=your_claude_api_key
ELEVEN_API_KEY=your_elevenlabs_api_key

# Optional: Beyond Presence Avatar
BEY_API_KEY=your_beyond_presence_api_key
```

## Teil 1: Baby Cry Detector Service

### Setup (Separates venv für TensorFlow)

```bash
# 1. Navigiere zum detector Ordner
cd detector

# 2. Python Virtual Environment erstellen
python -m venv venv_detector

# 3. Virtual Environment aktivieren
# Windows:
venv_detector\Scripts\activate
# macOS/Linux:
source venv_detector/bin/activate

# 4. Dependencies installieren
pip install tensorflow tensorflow-hub sounddevice numpy

# 5. Service starten
python baby_cry_detector_service.py --threshold 0.3
```

### Detector Konfiguration

```bash
# Verschiedene Threshold-Werte testen
python baby_cry_detector_service.py --threshold 0.2    # Empfindlicher
python baby_cry_detector_service.py --threshold 0.4    # Weniger empfindlich

# Custom Host/Port
python baby_cry_detector_service.py --host localhost --port 9999

# Hilfe anzeigen
python baby_cry_detector_service.py --help
```

### Was der Detector macht

- Verwendet YAMNet (Google's Audio-Klassifikations-Modell) 
- Analysiert kontinuierlich Mikrofon-Input
- Bestätigungslogik: 60% Crying in 5s Fenster für "Weinen bestätigt"
- 8 Sekunden kontinuierliche Stille für "Beruhigung bestätigt"
- Sendet Events über TCP Socket an Agent

### Detector Logs verstehen

```
🔍 Mögliches Weinen erkannt (Prob: 0.42) - warte 3.0s für Bestätigung...
👶🔊 WEINEN BESTÄTIGT! (65.2% over 5.0s, Avg Prob: 0.45)
📊 Status: CRYING | Prob: 0.52 | Clients: 1
🤫 Stille-Timer gestartet (Prob: 0.08) - brauche 8.0s
✅ BERUHIGUNG BESTÄTIGT! (8.2s kontinuierliche Stille)
```

## Teil 2: Baby Soothing Agent

### Setup (Mit uv)

```bash
# 1. Navigiere zum agent Ordner
cd agent

# 2. Agent starten (Dev Mode für Browser-Audio)
uv run baby_soothing_agent.py dev

# Alternative: Console Mode für direkte Lautsprecher-Ausgabe
uv run baby_soothing_agent.py console
```

### Agent Modi

**Dev Mode (Empfohlen für Testing):**
- Agent verbindet sich mit LiveKit Cloud
- Audio-Ausgabe über Browser
- Gehe zu: https://agents-playground.livekit.io
- Verbinde mit deinen LiveKit Credentials
- Höre Agent im Browser

**Console Mode:**
- Direkte Audio-Ausgabe über System-Lautsprecher
- Kein Browser nötig
- Weniger zuverlässig bei komplexeren Setups

### Agent Logs verstehen

```
🍼 Baby Soothing Agent gestartet!
📡 Starte TCP Event Listener...
🔗 Verbindung zum Detektor-Service hergestellt
👶🔊 Baby schreit! Starte Beruhigung...
💝 Starte Babyberuhigung...
🗣️ Sage: 'Shh, shh... everything is okay, little one. I'm here with you.'
✅ Beruhigungstext direkt an TTS gesendet!
⏱️ Cooldown gestartet (10.0s)
```

## Vollständiger Startup-Prozess

### Terminal 1: Detector starten
```bash
cd detector
venv_detector\Scripts\activate
python baby_cry_detector_service.py --threshold 0.3
```

### Terminal 2: Agent starten  
```bash
cd agent
uv run baby_soothing_agent.py dev
```

### Terminal 3: Browser (für Dev Mode)
```
https://agents-playground.livekit.io
```

## Testing

1. **System-Check**: Beide Services laufen und sind verbunden
   ```
   Detector: 📊 Status: QUIET | Prob: 0.02 | Clients: 1
   Agent: 📊 Agent: listening | Service: 🔗
   ```

2. **Baby-Schrei simulieren**: Lautes Weinen/Schreien ins Mikrofon
   ```
   Detector: 👶🔊 WEINEN BESTÄTIGT!
   Agent: 👶🔊 Baby schreit! Starte Beruhigung...
   ```

3. **Beruhigung hören**: Agent sollte beruhigende Worte sprechen
   - Dev Mode: Audio im Browser
   - Console Mode: Audio über Lautsprecher

## Konfiguration

### Detector Anpassen
```python
# In baby_cry_detector_service.py
cry_confirmation_window = 5.0      # Beobachtungsfenster (Sekunden)
cry_required_percentage = 0.6      # 60% Weinen für Bestätigung
stop_confirmation_delay = 8.0      # Sekunden Stille für Stop
```

### Agent Beruhigungstexte
```python
# In baby_soothing_agent.py - _start_soothing()
soothing_texts = [
    "Shh, shh... everything is okay, little one.",
    "There, there... you're safe and loved.",
    # Füge mehr Variationen hinzu...
]
```

## Troubleshooting

### Detector Probleme
- **"Models not found"**: `pip install tensorflow tensorflow-hub`
- **Mikrofon nicht erkannt**: Prüfe Mikrofon-Berechtigungen
- **Keine Cry-Detection**: Senke Threshold auf 0.2

### Agent Probleme  
- **Kein Audio im Dev Mode**: Browser mit LiveKit verbinden
- **ElevenLabs Errors**: API Key und Credits prüfen
- **"No STT available"**: Nur Dev Mode verwenden

### Verbindungsprobleme
- **"TCP Connection refused"**: Detector zuerst starten
- **"No clients connected"**: Agent nach Detector starten

## Advanced Features

### Mit Avatar (Optional)
```bash
uv add livekit-plugins-bey
uv run agent_with_avatar.py dev
```

### Custom Voice (ElevenLabs)
1. Gehe zu ElevenLabs Voice Lab
2. Clone/erstelle deine Stimme
3. Kopiere Voice ID in `baby_soothing_agent.py`

### Production Deployment
```bash
# LiveKit Cloud
lk agent create

# Custom Server
docker build -t baby-soothing-agent .
```

## System Requirements

- Python 3.9+
- Mikrofon für Audio-Input
- Lautsprecher/Headset für Audio-Output
- Internet-Verbindung für AI Services
- 4GB+ RAM für TensorFlow/YAMNet

## API Services

- **LiveKit**: Real-time Audio/Video Infrastructure  
- **Anthropic Claude**: Large Language Model
- **ElevenLabs**: Text-to-Speech
- **Google YAMNet**: Audio Classification (via TensorFlow Hub)
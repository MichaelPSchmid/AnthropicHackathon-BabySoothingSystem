# Baby Soothing System

An automatic baby soothing system consisting of a Baby Cry Detector and an AI-controlled Soothing Agent.

## System Architecture

- **Baby Cry Detector Service**: Runs as a separate Python process, detects baby crying via microphone
- **Baby Soothing Agent**: LiveKit Voice Agent that responds to cry events and speaks soothing words
- **Communication**: TCP socket between detector and agent

## Folder Structure

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

### 1. Clone Repository
```bash
git clone <your-repo>
cd baby-soothing-system
```

### 2. Configure API Keys

Create `.env.local` in the **agent** folder:
```bash
cd agent
```

Create the `.env.local` file with the following content:
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

## Part 1: Baby Cry Detector Service

### Setup (Separate venv for TensorFlow)

```bash
# 1. Navigate to detector folder
cd detector

# 2. Create Python Virtual Environment
python -m venv venv_detector

# 3. Activate Virtual Environment
# Windows:
venv_detector\Scripts\activate
# macOS/Linux:
source venv_detector/bin/activate

# 4. Install dependencies
pip install tensorflow tensorflow-hub sounddevice numpy

# 5. Start service
python baby_cry_detector_service.py --threshold 0.3
```

### Detector Configuration

```bash
# Test different threshold values
python baby_cry_detector_service.py --threshold 0.2    # More sensitive
python baby_cry_detector_service.py --threshold 0.4    # Less sensitive

# Custom Host/Port
python baby_cry_detector_service.py --host localhost --port 9999

# Show help
python baby_cry_detector_service.py --help
```

### What the Detector Does

- Uses YAMNet (Google's audio classification model) 
- Continuously analyzes microphone input
- Confirmation logic: 60% crying in 5s window for "crying confirmed"
- 8 seconds continuous silence for "soothing confirmed"
- Sends events via TCP socket to agent

### Understanding Detector Logs

```
🔍 Possible crying detected (Prob: 0.42) - waiting 3.0s for confirmation...
👶🔊 CRYING CONFIRMED! (65.2% over 5.0s, Avg Prob: 0.45)
📊 Status: CRYING | Prob: 0.52 | Clients: 1
🤫 Silence timer started (Prob: 0.08) - need 8.0s
✅ SOOTHING CONFIRMED! (8.2s continuous silence)
```

## Part 2: Baby Soothing Agent

### Setup (With uv)

```bash
# 1. Navigate to agent folder
cd agent

# 2. Start agent (Dev Mode for browser audio)
uv run baby_soothing_agent.py dev

# Alternative: Console Mode for direct speaker output
uv run baby_soothing_agent.py console
```

### Agent Modes

**Dev Mode (Recommended for Testing):**
- Agent connects to LiveKit Cloud
- Audio output via browser
- Go to: https://agents-playground.livekit.io
- Connect with your LiveKit credentials
- Listen to agent in browser

**Console Mode:**
- Direct audio output via system speakers
- No browser needed
- Less reliable with complex setups

### Understanding Agent Logs

```
🍼 Baby Soothing Agent started!
📡 Starting TCP Event Listener...
🔗 Connection to detector service established
👶🔊 Baby is crying! Starting soothing...
💝 Starting baby soothing...
🗣️ Saying: 'Shh, shh... everything is okay, little one. I'm here with you.'
✅ Soothing text sent directly to TTS!
⏱️ Cooldown started (10.0s)
```

## Complete Startup Process

### Terminal 1: Start Detector
```bash
cd detector
venv_detector\Scripts\activate
python baby_cry_detector_service.py --threshold 0.3
```

### Terminal 2: Start Agent  
```bash
cd agent
uv run baby_soothing_agent.py dev
```

### Terminal 3: Browser (for Dev Mode)
```
https://agents-playground.livekit.io
```

## Testing

1. **System Check**: Both services running and connected
   ```
   Detector: 📊 Status: QUIET | Prob: 0.02 | Clients: 1
   Agent: 📊 Agent: listening | Service: 🔗
   ```

2. **Simulate baby crying**: Loud crying/screaming into microphone
   ```
   Detector: 👶🔊 CRYING CONFIRMED!
   Agent: 👶🔊 Baby is crying! Starting soothing...
   ```

3. **Listen for soothing**: Agent should speak soothing words
   - Dev Mode: Audio in browser
   - Console Mode: Audio via speakers

## Configuration

### Customizing Detector
```python
# In baby_cry_detector_service.py
cry_confirmation_window = 5.0      # Observation window (seconds)
cry_required_percentage = 0.6      # 60% crying for confirmation
stop_confirmation_delay = 8.0      # Seconds of silence for stop
```

### Agent Soothing Texts
```python
# In baby_soothing_agent.py - _start_soothing()
soothing_texts = [
    "Shh, shh... everything is okay, little one.",
    "There, there... you're safe and loved.",
    # Add more variations...
]
```

## Troubleshooting

### Detector Problems
- **"Models not found"**: `pip install tensorflow tensorflow-hub`
- **Microphone not detected**: Check microphone permissions
- **No cry detection**: Lower threshold to 0.2

### Agent Problems  
- **No audio in Dev Mode**: Connect browser with LiveKit
- **ElevenLabs errors**: Check API key and credits
- **"No STT available"**: Use Dev Mode only

### Connection Problems
- **"TCP Connection refused"**: Start detector first
- **"No clients connected"**: Start agent after detector

## Advanced Features

### With Avatar (Optional)
```bash
uv add livekit-plugins-bey
uv run agent_with_avatar.py dev
```

### Custom Voice (ElevenLabs)
1. Go to ElevenLabs Voice Lab
2. Clone/create your voice
3. Copy Voice ID into `baby_soothing_agent.py`

### Production Deployment
```bash
# LiveKit Cloud
lk agent create

# Custom Server
docker build -t baby-soothing-agent .
```

## System Requirements

- Python 3.9+
- Microphone for audio input
- Speakers/headset for audio output
- Internet connection for AI services
- 4GB+ RAM for TensorFlow/YAMNet

## API Services

- **LiveKit**: Real-time Audio/Video Infrastructure  
- **Anthropic Claude**: Large Language Model
- **ElevenLabs**: Text-to-Speech
- **Google YAMNet**: Audio Classification (via TensorFlow Hub)
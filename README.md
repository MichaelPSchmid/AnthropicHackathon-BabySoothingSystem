# Somni - Intelligent Baby Monitor

Somni is an AI-powered baby monitor that automatically detects baby crying and responds with soothing words. The system is specifically designed for new parents who need support with crying babies, especially at night.

## 🗗️ Project Status

**Current Development Status:**
- ✅ **Backend**: Fully functional with baby cry detection and AI soothing
- ✅ **Frontend**: Fully developed (React/TypeScript with Loveable)
- 🚧 **Integration**: Frontend-backend integration is still pending
- ✅ **Internal Communication**: TCP between Detector and Agent implemented

## 🎯 Features

- **Intelligent Cry Detection**: Uses Google's YAMNet for precise baby cry detection
- **AI Soothing Agent**: Automatically speaks soothing words with natural voice
- **Real-time Processing**: Immediate response when baby crying is detected
- **Confirmation Logic**: Prevents false alarms through multi-stage verification
- **LiveKit Integration**: High-quality real-time audio transmission


## 🚀 Quick Start

### Prerequisites

- **Python 3.9+** for backend
- **Node.js 18+** for frontend
- **Microphone** for audio input
- **Speakers/Headphones** for audio output
- **Internet Connection** for AI services

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd somni
```

### 2. Backend Setup

#### Configure API Keys
```bash
cd backend/agent
```

Create `.env.local` with:
```bash
# LiveKit Cloud (https://cloud.livekit.io/)
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_URL=wss://your-project.livekit.cloud

# AI Services
ANTHROPIC_API_KEY=your_claude_api_key
ELEVEN_API_KEY=your_elevenlabs_api_key
```

#### Start Baby Cry Detector
```bash
cd backend/detector

# Create virtual environment
python -m venv venv_detector

# Activate (Windows)
venv_detector\Scripts\activate
# Activate (macOS/Linux)
source venv_detector/bin/activate

# Install dependencies
pip install tensorflow tensorflow-hub sounddevice numpy

# Start service
python baby_cry_detector_service.py --threshold 0.3
```

#### Start AI Soothing Agent
```bash
# New terminal
cd backend/agent

# Start agent (Dev Mode - Audio via browser)
uv run baby_soothing_agent.py dev

# Then open: https://agents-playground.livekit.io/
# Connect with your LiveKit credentials
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend is fully developed. You can edit and customize it via the [Loveable project](https://lovable.dev/projects/bc57c729-7974-4523-a111-622721564084).

**⚠️ Integration pending**: The frontend cannot yet communicate with the backend. A REST API or WebSocket connection still needs to be implemented.

## 🔧 Technical Overview

### Backend Architecture

**Baby Cry Detector (`detector/`)**
- Uses Google's YAMNet for audio classification
- Continuous microphone monitoring
- TCP server for event communication
- Confirmation logic: 60% cry detection rate over 5 seconds

**AI Soothing Agent (`agent/`)**
- LiveKit Voice Agent with Claude 4 Sonnet
- ElevenLabs Text-to-Speech (natural voice)
- TCP client for detector events
- Cooldown system prevents spam

**Communication**
- TCP socket between detector and agent
- JSON-based event messages
- Asynchronous event processing

### Frontend Architecture

**Technology Stack:**
- React with TypeScript
- Vite build system  
- shadcn/ui components
- Tailwind CSS
- Loveable-based development

**Current Features:**
- Modern, responsive user interface
- Baby monitor dashboard
- Settings for system configuration
- Status displays and logs

**⚠️ Integration still missing:**
- REST API for backend communication
- WebSocket for live updates
- Settings synchronization
- Live audio visualization

## 📊 System Monitoring

### Understanding Detector Logs
```
🔍 Possible crying detected (Prob: 0.42) - waiting 3.0s for confirmation...
👶🔊 CRYING CONFIRMED! (65.2% over 5.0s, Avg Prob: 0.45)
🔊 Status: CRYING | Prob: 0.52 | Clients: 1
🤫 Silence timer started (Prob: 0.08) - need 8.0s
✅ SOOTHING CONFIRMED! (8.2s continuous silence)
```

### Understanding Agent Logs
```
🍼 Baby Soothing Agent started!
📡 Starting TCP Event Listener...
🔗 Connection to detector service established
👶🔊 Baby is crying! Starting soothing...
🗣️ Saying: 'Shh, shh... everything is okay, little one.'
⏱️ Cooldown started (10.0s)
```

## 🛠️ Configuration

### Detector Settings

```python
# Adjust sensitivity
python baby_cry_detector_service.py --threshold 0.2    # More sensitive
python baby_cry_detector_service.py --threshold 0.4    # Less sensitive

# Custom host/port
python baby_cry_detector_service.py --host localhost --port 9999
```

### Agent Settings

**Soothing Modes:**
- `dev`: Audio via browser (https://agents-playground.livekit.io/)
- `console`: Direct audio output via system speakers

```bash
# Dev Mode (recommended)
uv run baby_soothing_agent.py dev

# Console Mode
uv run baby_soothing_agent.py console
```

## 🔍 Testing

1. **System Check**: Both services running and connected
2. **Simulate baby crying**: Loud crying/screaming into microphone
3. **Listen for soothing**: Agent should speak soothing words

## 📋 Roadmap

### Short-term (Highest Priority)
- [ ] **REST API for frontend-backend integration** 
  - Status endpoints (Detector status, Agent status)
  - Configuration endpoints (Threshold, settings)
  - Event history endpoints
- [ ] **WebSocket connection for live updates**
  - Display real-time cry events in frontend
  - Live probability updates
  - Agent status updates
- [ ] **Test and debug frontend-backend integration**

### Medium-term (After Integration)
- [ ] Advanced LLM integration for more personalized soothing
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Smartphone notifications
- [ ] Parent dashboard with detailed statistics

### Long-term (Vision)
- [ ] Machine learning for personalized soothing strategies
- [ ] Smart home system integration
- [ ] Video monitoring with avatar representation
- [ ] Medical data analysis and recommendations

## 🐛 Troubleshooting

### Common Issues

**Detector**
- **"Models not found"**: `pip install tensorflow tensorflow-hub`
- **Microphone not detected**: Check microphone permissions
- **No cry detection**: Lower threshold to 0.2

**Agent**
- **No audio in Dev Mode**: Connect browser with LiveKit
- **ElevenLabs error**: Check API key and credits
- **TCP Connection refused**: Start detector first

**Frontend**
- **Build errors**: `npm ci` for clean installation  
- **Hot reload not working**: Restart server
- **Frontend won't load**: Port 5173 available? (`lsof -i :5173`)

**Integration**
- **Frontend cannot reach backend**: REST API not yet implemented
- **No live updates**: WebSocket connection still missing
- **Settings not synchronized**: Backend-frontend integration pending

## 🤝 Development

### Backend Development
The backend is fully developed in Python and uses modern async/await patterns for optimal performance.

### Frontend Development  
The frontend is fully developed and can be edited both locally and via the [Loveable project](https://lovable.dev/projects/bc57c729-7974-4523-a111-622721564084).

### Integration (TO-DO)
Integration between frontend and backend is the next critical step:

**Required API Endpoints:**
```python
# Example REST API structure (still to be implemented)
GET /api/status          # System Status (Detector + Agent)
GET /api/events          # Event History  
POST /api/config         # Change Configuration
WebSocket /ws/live       # Live Updates
```

**Frontend Integration Tasks:**
- Implement API client
- WebSocket connection for live updates
- Connect status dashboard with backend data
- Synchronize configuration page with backend

### Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 🙏 Credits

- **YAMNet**: Google's audio classification model
- **LiveKit**: Real-time audio/video infrastructure
- **Anthropic Claude**: Large Language Model
- **ElevenLabs**: Text-to-Speech service
- **Loveable**: Frontend development platform

---

**Current Development Status**: Frontend and backend are individually fully functional. The next critical step is implementing the REST API/WebSocket integration so the frontend can communicate with the backend. For questions or issues, please create issues or contact directly.
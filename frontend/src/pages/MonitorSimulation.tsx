import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Play,
  Thermometer, 
  Clock, 
  Heart,
  Moon,
  Star,
  Music,
  ArrowLeft,
  Square,
  Baby
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { FloatingElements } from "@/components/FloatingElements";


const MonitorSimulation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const babyName = location.state?.babyName || "your baby";
  
  const [isAvatarActive, setIsAvatarActive] = useState(false);
  
  const [isPlayingLullaby, setIsPlayingLullaby] = useState(false);
  const [lullabyAudio, setLullabyAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlayingWhiteNoise, setIsPlayingWhiteNoise] = useState(false);
  const [whiteNoiseAudio, setWhiteNoiseAudio] = useState<HTMLAudioElement | null>(null);
  const [currentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [temperature] = useState(22);
  const [humidity] = useState(45);


  const playLullaby = () => {
    if (isPlayingLullaby) return;
    
    setIsPlayingLullaby(true);
    
    // Play lullaby sound from public folder
    const audio = new Audio('/lullaby.wav');
    audio.currentTime = 0;
    setLullabyAudio(audio);
    
    audio.play().catch((error) => {
      console.error('Error playing lullaby:', error);
    });
    
    // Stop lullaby after it finishes (or after 30 seconds max)
    audio.addEventListener('ended', () => {
      setIsPlayingLullaby(false);
      setLullabyAudio(null);
    });
    
    // Fallback to stop after 30 seconds if 'ended' event doesn't fire
    setTimeout(() => {
      setIsPlayingLullaby(false);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      setLullabyAudio(null);
    }, 30000);
  };

  const stopLullaby = () => {
    if (lullabyAudio) {
      lullabyAudio.pause();
      lullabyAudio.currentTime = 0;
      setLullabyAudio(null);
    }
    setIsPlayingLullaby(false);
  };

  const playWhiteNoise = () => {
    if (isPlayingWhiteNoise) return;
    
    setIsPlayingWhiteNoise(true);
    
    // Play white noise sound from public folder
    const audio = new Audio('/white-noise.mp3');
    audio.loop = true; // White noise should loop
    audio.currentTime = 0;
    setWhiteNoiseAudio(audio);
    
    audio.play().catch((error) => {
      console.error('Error playing white noise:', error);
    });
  };

  const stopWhiteNoise = () => {
    if (whiteNoiseAudio) {
      whiteNoiseAudio.pause();
      whiteNoiseAudio.currentTime = 0;
      setWhiteNoiseAudio(null);
    }
    setIsPlayingWhiteNoise(false);
  };

  const avatarMessages = [
    "Shh, shh, it's okay little one. Mommy is here with you...",
    "I know you're upset, but you're safe and loved.",
    "Let's take some deep breaths together. In... and out...",
    "Close your eyes, my sweet baby. Everything is alright."
  ];

  const [currentMessage] = useState(avatarMessages[0]);

  return (
    <Layout>
      <FloatingElements />
      
      {/* Additional Baby Symbols */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Baby className="absolute top-20 left-12 text-pink-200/40 w-6 h-6 gentle-float animate-delay-1" />
        <Baby className="absolute top-1/3 right-16 text-blue-200/40 w-5 h-5 gentle-float animate-delay-2" />
        <Baby className="absolute bottom-1/4 left-1/4 text-purple-200/40 w-7 h-7 gentle-float animate-delay-3" />
        <Baby className="absolute bottom-40 right-20 text-pink-200/40 w-4 h-4 gentle-float animate-delay-4" />
        <Baby className="absolute top-1/2 left-1/6 text-blue-200/40 w-6 h-6 gentle-float" />
        <Baby className="absolute top-3/4 right-1/3 text-purple-200/40 w-5 h-5 gentle-float animate-delay-1" />
        <Baby className="absolute bottom-1/6 left-2/3 text-pink-200/40 w-4 h-4 gentle-float animate-delay-2" />
        <Baby className="absolute top-1/6 right-2/3 text-blue-200/40 w-6 h-6 gentle-float animate-delay-3" />
      </div>
      
      <div className="container mx-auto px-6 py-4">
        <div className="max-w-7xl mx-auto">
          {/* Status Header */}
          <div className="text-center mb-6">
            <Badge variant="default" className="text-lg px-4 py-2">
              🟢 Monitoring Active
            </Badge>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            
            {/* Main Avatar Section */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Avatar Display */}
              <Card className="glass-card p-6">
                <div className="aspect-video bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-3xl relative overflow-hidden">
                  <iframe
                    src="https://agents-playground.livekit.io"
                    className="w-full h-full rounded-3xl border-0"
                    title="LiveKit Agents Playground"
                    allow="camera; microphone; autoplay; encrypted-media"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
                  />
                  
                  {/* Decorative Elements */}
                  <Star className="absolute top-6 left-6 text-yellow-200 w-6 h-6 twinkling pointer-events-none" />
                  <Star className="absolute top-8 right-8 text-yellow-300 w-4 h-4 twinkling animate-delay-1 pointer-events-none" />
                  <Moon className="absolute bottom-6 right-6 text-blue-200 w-6 h-6 floating-element pointer-events-none" />
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="glass-card p-6">
                <h3 className="font-bold text-lg mb-6 text-foreground">Quick Actions</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex gap-2">
                    <Button 
                      onClick={playLullaby}
                      disabled={isPlayingLullaby}
                      variant="outline" 
                      className={`flex-1 justify-start bg-white/30 border-white/40 ${isPlayingLullaby ? 'animate-pulse' : ''}`}
                    >
                      <Music className="w-4 h-4 mr-3" />
                      {isPlayingLullaby ? "Playing..." : "Play Lullaby"}
                    </Button>
                    
                    <Button 
                      onClick={stopLullaby}
                      disabled={!isPlayingLullaby}
                      variant="outline" 
                      className="bg-white/30 border-white/40 px-3"
                    >
                      <Square className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={playWhiteNoise}
                      disabled={isPlayingWhiteNoise}
                      variant="outline" 
                      className={`flex-1 justify-start bg-white/30 border-white/40 ${isPlayingWhiteNoise ? 'animate-pulse' : ''}`}
                    >
                      <Star className="w-4 h-4 mr-3" />
                      {isPlayingWhiteNoise ? "Playing..." : "White Noise"}
                    </Button>
                    
                    <Button 
                      onClick={stopWhiteNoise}
                      disabled={!isPlayingWhiteNoise}
                      variant="outline" 
                      className="bg-white/30 border-white/40 px-3"
                    >
                      <Square className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>

            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              

              {/* Environment Stats */}
              <Card className="glass-card p-6">
                <h3 className="font-bold text-lg mb-6 flex items-center text-foreground">
                  <Thermometer className="w-5 h-5 mr-2 text-primary" />
                  Room Environment
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white/30 rounded-xl">
                    <span className="text-muted-foreground font-medium">Temperature</span>
                    <span className="font-bold text-xl text-foreground">{temperature}°C</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-white/30 rounded-xl">
                    <span className="text-muted-foreground font-medium">Humidity</span>
                    <span className="font-bold text-xl text-foreground">{humidity}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-white/30 rounded-xl">
                    <span className="text-muted-foreground font-medium">Sound Level</span>
                    <span className="font-bold text-xl text-green-500">Low</span>
                  </div>
                </div>
              </Card>

              {/* Status & Time */}
              <Card className="glass-card p-6">
                <h3 className="font-bold text-lg mb-6 flex items-center text-foreground">
                  <Clock className="w-5 h-5 mr-2 text-accent" />
                  Monitor Status
                </h3>
                
                <div className="space-y-4">
                  <div className="text-center p-4 bg-white/30 rounded-xl">
                    <div className="text-3xl font-bold text-primary mb-1">{currentTime}</div>
                    <p className="text-muted-foreground text-sm">Current Time</p>
                  </div>
                  
                  <div className="text-center p-4 bg-white/30 rounded-xl">
                    <div className={`text-xl font-bold mb-1 ${
                      isAvatarActive ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {isAvatarActive ? "Responding" : "Listening"}
                    </div>
                    <p className="text-muted-foreground text-sm">Avatar Status</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-start pt-8">
            <Button 
              onClick={() => navigate('/avatar-demo')}
              variant="outline" 
              className="px-8 py-4 bg-white/50 border-white/30"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Edit Avatar
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MonitorSimulation;
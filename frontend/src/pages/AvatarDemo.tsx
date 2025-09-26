import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Play, Star, Sparkles, Heart, Baby, Moon } from "lucide-react";
import { Layout } from "@/components/Layout";

const AvatarDemo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPlaying, setIsPlaying] = useState(false);
  const babyName = location.state?.babyName || "your baby";
  const parentName = location.state?.parentName || "Parent";

  const handlePlayDemo = () => {
    setIsPlaying(true);
  };

  return (
    <Layout>
      {/* Floating Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Star className="absolute top-20 left-16 text-yellow-300 w-6 h-6 twinkling animate-delay-1" />
        <Star className="absolute top-32 right-20 text-yellow-200 w-4 h-4 twinkling animate-delay-2" />
        <Star className="absolute bottom-40 left-1/4 text-yellow-300 w-5 h-5 twinkling animate-delay-3" />
        <Star className="absolute top-1/2 left-1/6 text-yellow-200 w-5 h-5 twinkling animate-delay-4" />
        <Star className="absolute bottom-1/2 right-1/3 text-yellow-300 w-4 h-4 twinkling animate-delay-1" />
        
        <Sparkles className="absolute top-1/3 right-1/3 text-pink-300 w-6 h-6 wave-animation" />
        <Heart className="absolute bottom-1/3 right-1/5 text-red-300 w-5 h-5 heartbeat-animation" />
        
        {/* Baby Symbols */}
        <Baby className="absolute top-1/4 left-1/3 text-pink-300 w-6 h-6 wave-animation" />
        <Baby className="absolute bottom-1/4 right-1/4 text-blue-300 w-5 h-5 wave-animation animate-delay-2" />
        <Baby className="absolute top-2/3 left-1/5 text-purple-300 w-7 h-7 wave-animation animate-delay-3" />
        <Baby className="absolute bottom-1/2 left-2/3 text-pink-200 w-4 h-4 wave-animation animate-delay-1" />
        <Baby className="absolute top-1/5 right-1/2 text-blue-200 w-5 h-5 wave-animation animate-delay-4" />
        <Baby className="absolute bottom-3/4 left-1/4 text-purple-200 w-6 h-6 wave-animation" />
        <Baby className="absolute top-3/4 right-1/6 text-pink-300 w-4 h-4 wave-animation animate-delay-2" />
        <Baby className="absolute bottom-1/6 right-3/4 text-blue-300 w-5 h-5 wave-animation animate-delay-3" />
        
        {/* Moon Symbols */}
        <Moon className="absolute top-1/5 right-1/6 text-yellow-200 w-8 h-8 floating-element" />
        <Moon className="absolute bottom-1/3 left-1/4 text-yellow-100 w-6 h-6 floating-element animate-delay-2" />
        <Moon className="absolute top-3/4 right-2/3 text-yellow-300 w-5 h-5 floating-element animate-delay-4" />
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Hero Text */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 bg-clip-text text-transparent mb-6">
              {parentName}, here's your calming companion
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Your personalized AI avatar is ready to soothe your baby with your voice and gentle presence
            </p>
          </div>

          {/* Avatar Preview Section */}
          <div className="max-w-3xl mx-auto mb-12">
            <Card className="glass-card p-6 mb-12">
              <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-3xl relative overflow-hidden flex items-center justify-center">
                {/* Avatar Display */}
                {!isPlaying ? (
                  <>
                    <div className="text-center relative z-10 w-full h-full">
                      <div className="gentle-float flex flex-col justify-end h-full pb-16">
                        <h3 className="text-3xl font-bold text-foreground mb-4">Your Avatar is Ready!</h3>
                        <p className="text-xl text-muted-foreground">Click play to see a preview</p>
                      </div>
                    </div>
                    
                    {/* Decorative Stars */}
                    <Star className="absolute top-6 left-6 text-yellow-200 w-8 h-8 twinkling" />
                    <Star className="absolute top-12 right-12 text-yellow-300 w-6 h-6 twinkling animate-delay-1" />
                    <Star className="absolute bottom-8 left-16 text-yellow-200 w-7 h-7 twinkling animate-delay-2" />
                  </>
                ) : (
                  <video
                    src="/avatar-demo-video.mov"
                    autoPlay
                    className="w-full h-full object-contain rounded-3xl"
                  />
                )}
              </div>
            
            {/* Play Demo Button */}
            <div className="text-center mt-8">
              <Button 
                onClick={handlePlayDemo}
                disabled={isPlaying}
                className="hero-button px-12 py-4 text-xl"
              >
                <Play className="w-6 h-6 mr-3" />
                {isPlaying ? "Playing Demo..." : "Play Avatar Demo"}
              </Button>
            </div>
          </Card>
          </div>

          {/* Features Preview */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="glass-card p-8 text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/30 transition-colors">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-foreground">Personalized {parentName} Voice</h3>
              <p className="text-muted-foreground">
                Uses your recorded voice patterns to create authentic, calming responses
              </p>
            </Card>
            
            <Card className="glass-card p-8 text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-accent/30 transition-colors">
                <Heart className="w-10 h-10 text-accent heartbeat-animation" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-foreground">Gentle Movements</h3>
              <p className="text-muted-foreground">
                Soothing gestures and expressions designed to calm and comfort your baby
              </p>
            </Card>
            
            <Card className="glass-card p-8 text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-20 h-20 bg-highlight/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-highlight/30 transition-colors">
                <Play className="w-10 h-10 text-highlight" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-foreground">Instant Response</h3>
              <p className="text-muted-foreground">
                Immediately responds to your baby's cries with appropriate soothing techniques
              </p>
            </Card>
          </div>

          {/* Navigation */}
          <div className="flex justify-between gap-4 flex-wrap">
            <Button 
              variant="outline" 
              onClick={() => navigate('/create-avatar')}
              className="px-8 py-4 bg-white/50 border-white/30"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Edit Avatar
            </Button>
            
            <Button 
              onClick={() => navigate('/monitor', { state: { babyName, parentName } })}
              className="hero-button px-8 py-4"
            >
              Start Program
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AvatarDemo;
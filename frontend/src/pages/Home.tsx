import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Baby, Sparkles, Star } from "lucide-react";
import { Layout } from "@/components/Layout";
import { FloatingElements } from "@/components/FloatingElements";
import heroVideo from "@/assets/hero-video.mp4";

const Home = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <FloatingElements />
      
      {/* Baby Symbol Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Baby className="absolute top-16 left-10 text-pink-200/30 w-8 h-8 gentle-float animate-delay-1" />
        <Baby className="absolute top-32 right-16 text-blue-200/30 w-6 h-6 gentle-float animate-delay-2" />
        <Baby className="absolute bottom-32 left-20 text-purple-200/30 w-7 h-7 gentle-float animate-delay-3" />
        <Baby className="absolute bottom-48 right-24 text-pink-200/30 w-5 h-5 gentle-float animate-delay-4" />
        <Baby className="absolute top-1/2 left-8 text-blue-200/30 w-6 h-6 gentle-float" />
        <Baby className="absolute top-1/3 right-8 text-purple-200/30 w-8 h-8 gentle-float animate-delay-1" />
        <Baby className="absolute bottom-16 left-1/3 text-pink-200/30 w-6 h-6 gentle-float animate-delay-2" />
        <Baby className="absolute top-1/4 right-1/4 text-blue-200/30 w-5 h-5 gentle-float animate-delay-3" />
        <Baby className="absolute bottom-1/3 right-1/2 text-purple-200/30 w-7 h-7 gentle-float animate-delay-4" />
        <Baby className="absolute top-3/4 left-1/4 text-pink-200/30 w-4 h-4 gentle-float" />
        <Sparkles className="absolute top-24 left-1/4 text-yellow-200/40 w-5 h-5 twinkling animate-delay-2" />
        <Star className="absolute bottom-24 right-1/3 text-yellow-200/40 w-4 h-4 twinkling animate-delay-3" />
        <Heart className="absolute top-40 right-40 text-red-200/30 w-6 h-6 heartbeat-animation" />
      </div>
      
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-12 min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl w-full">
          {/* Hero Video - Left Side */}
          <div className="gentle-float relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/10 to-pink-400/20 rounded-3xl blur-3xl scale-150"></div>
            <video 
              src={heroVideo}
              autoPlay
              muted
              loop
              playsInline
              className="w-full max-w-md mx-auto drop-shadow-2xl relative z-10 rounded-2xl"
            />
          </div>

          {/* Hero Content - Right Side */}
          <div className="space-y-8 text-center lg:text-left">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Peace for your baby,{" "}
              <span className="bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
                peace of mind
              </span>{" "}
              for you
            </h2>
            
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              Our AI understands your child's cries and responds with personalized avatars and sounds, 
              calming them without ever waking you up.
            </p>

            {/* CTA Button */}
            <div className="pt-4">
              <Button 
                onClick={() => navigate('/create-avatar')}
                className="hero-button text-base px-6 md:px-8 py-4 relative overflow-hidden group"
              >
                <Heart className="w-4 h-4 mr-2 group-hover:heartbeat-animation" />
                <span style={{ color: 'hsl(270 50% 45%)' }}>End the midnight struggle – start creating your personalized avatar</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
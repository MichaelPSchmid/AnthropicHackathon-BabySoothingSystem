import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Baby, Star, Heart } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center night-sky relative">
      {/* Baby Symbols Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Baby className="absolute top-20 left-16 text-pink-200/30 w-8 h-8 gentle-float animate-delay-1" />
        <Baby className="absolute top-1/3 right-20 text-blue-200/30 w-6 h-6 gentle-float animate-delay-2" />
        <Baby className="absolute bottom-1/3 left-1/4 text-purple-200/30 w-7 h-7 gentle-float animate-delay-3" />
        <Baby className="absolute bottom-20 right-1/3 text-pink-200/30 w-5 h-5 gentle-float animate-delay-4" />
        <Star className="absolute top-16 right-16 text-yellow-200/40 w-4 h-4 twinkling" />
        <Star className="absolute bottom-16 left-16 text-yellow-200/40 w-5 h-5 twinkling animate-delay-2" />
        <Heart className="absolute top-1/2 left-10 text-red-200/30 w-6 h-6 heartbeat-animation" />
        <Heart className="absolute top-1/2 right-10 text-red-200/30 w-6 h-6 heartbeat-animation animate-delay-1" />
      </div>
      
      <div className="text-center relative z-10">
        <h1 className="mb-4 text-4xl font-bold text-white">404</h1>
        <p className="mb-4 text-xl text-white/80">Oops! Page not found</p>
        <a href="/" className="text-blue-300 underline hover:text-blue-200 transition-colors">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;

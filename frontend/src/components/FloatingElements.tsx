import { Cloud, Star, Moon } from "lucide-react";

export const FloatingElements = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Floating Clouds */}
      <Cloud 
        className="absolute text-white/20 w-16 h-16 top-20 left-10 floating-element" 
        style={{ animationDelay: '0s' }} 
      />
      <Cloud 
        className="absolute text-white/15 w-20 h-20 top-40 right-20 floating-element" 
        style={{ animationDelay: '2s' }} 
      />
      <Cloud 
        className="absolute text-white/25 w-12 h-12 bottom-32 left-1/4 floating-element" 
        style={{ animationDelay: '4s' }} 
      />
      
      {/* Twinkling Stars */}
      <Star 
        className="absolute text-yellow-200 w-4 h-4 top-16 right-1/3 twinkling" 
        style={{ animationDelay: '1s' }} 
      />
      <Star 
        className="absolute text-yellow-300 w-3 h-3 top-1/3 left-1/5 twinkling" 
        style={{ animationDelay: '3s' }} 
      />
      <Star 
        className="absolute text-yellow-200 w-5 h-5 bottom-1/4 right-1/4 twinkling" 
        style={{ animationDelay: '5s' }} 
      />
      <Star 
        className="absolute text-yellow-300 w-3 h-3 top-2/3 left-3/4 twinkling" 
        style={{ animationDelay: '2.5s' }} 
      />
      
      {/* Moon */}
      <Moon className="absolute top-10 right-10 text-yellow-100/60 w-12 h-12 animate-pulse" />
    </div>
  );
};
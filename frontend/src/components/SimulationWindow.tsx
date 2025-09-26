import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, BarChart3, Baby } from "lucide-react";
import babyCribImage from "@/assets/baby-crib.png";

interface SimulationWindowProps {
  isBabyCrying: boolean;
  isAvatarActive: boolean;
}

export const SimulationWindow = ({ isBabyCrying, isAvatarActive }: SimulationWindowProps) => {
  const [viewMode, setViewMode] = useState<'crib' | 'intensity' | 'heartbeat'>('crib');

  const renderCribAnimation = () => (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
      <div className="text-center">
        <img 
          src={babyCribImage} 
          alt="Baby crib" 
          className={`w-32 h-24 mx-auto mb-4 ${isBabyCrying ? 'animate-pulse' : 'gentle-float'}`}
        />
        <div className="relative">
          <Baby className={`w-8 h-8 mx-auto mb-2 ${isBabyCrying ? 'text-red-400 animate-pulse' : 'text-blue-400'}`} />
          <p className={`text-sm font-medium ${isBabyCrying ? 'text-red-600' : 'text-blue-600'}`}>
            {isBabyCrying ? 'Baby Crying' : isAvatarActive ? 'Calming Down' : 'Peaceful Sleep'}
          </p>
        </div>
      </div>
    </div>
  );

  const renderIntensityMeter = () => (
    <div className="h-full bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 flex items-center justify-center">
      <div className="w-full max-w-xs">
        <h4 className="text-center text-sm font-semibold mb-4 text-foreground">Cry Intensity</h4>
        <div className="flex items-end justify-center space-x-1 h-24">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`w-4 rounded-t transition-all duration-300 ${
                isBabyCrying 
                  ? 'bg-red-400 cry-bar' 
                  : isAvatarActive 
                    ? 'bg-yellow-300' 
                    : 'bg-green-300'
              }`}
              style={{ 
                height: isBabyCrying 
                  ? `${Math.random() * 60 + 20}px` 
                  : isAvatarActive 
                    ? `${Math.max(20 - i * 2, 5)}px`
                    : '8px'
              }}
            />
          ))}
        </div>
        <p className="text-center text-xs mt-2 text-muted-foreground">
          {isBabyCrying ? 'High' : isAvatarActive ? 'Decreasing' : 'Low'}
        </p>
      </div>
    </div>
  );

  const renderHeartbeatViz = () => (
    <div className="h-full bg-gradient-to-br from-pink-50 to-red-50 rounded-2xl p-6 flex items-center justify-center">
      <div className="text-center">
        <Heart className={`w-16 h-16 mx-auto mb-4 text-red-400 ${
          isBabyCrying ? 'animate-pulse' : isAvatarActive ? 'heartbeat-animation' : 'animate-pulse'
        }`} />
        <div className="space-y-2">
          <p className="text-lg font-bold text-foreground">
            {isBabyCrying ? '140' : isAvatarActive ? '120' : '100'} BPM
          </p>
          <p className="text-sm text-muted-foreground">
            {isBabyCrying ? 'Elevated' : isAvatarActive ? 'Calming' : 'Normal'}
          </p>
        </div>
        
        {/* Heartbeat waveform */}
        <div className="mt-4 flex items-center justify-center space-x-1">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-red-300 rounded"
              style={{
                height: `${isBabyCrying ? Math.random() * 20 + 10 : isAvatarActive ? 15 : 8}px`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <Card className="glass-card p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-foreground">Baby Monitor Simulation</h3>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'crib' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('crib')}
            className="text-xs"
          >
            <Baby className="w-3 h-3 mr-1" />
            Crib
          </Button>
          <Button
            variant={viewMode === 'intensity' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('intensity')}
            className="text-xs"
          >
            <BarChart3 className="w-3 h-3 mr-1" />
            Intensity
          </Button>
          <Button
            variant={viewMode === 'heartbeat' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('heartbeat')}
            className="text-xs"
          >
            <Heart className="w-3 h-3 mr-1" />
            Heartbeat
          </Button>
        </div>
      </div>
      
      <div className="h-32">
        {viewMode === 'crib' && renderCribAnimation()}
        {viewMode === 'intensity' && renderIntensityMeter()}
        {viewMode === 'heartbeat' && renderHeartbeatViz()}
      </div>
    </Card>
  );
};
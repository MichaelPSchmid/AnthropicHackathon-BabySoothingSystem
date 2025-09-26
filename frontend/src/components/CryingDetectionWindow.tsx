import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";

interface CryingDetectionWindowProps {
  onCryingDetected?: (isCrying: boolean) => void;
}

export const CryingDetectionWindow = ({ onCryingDetected }: CryingDetectionWindowProps) => {
  const [isCryingDetected, setIsCryingDetected] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isListening, setIsListening] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number>();
  const audioBufferRef = useRef<number[]>([]);
  const frequencyBufferRef = useRef<number[]>([]);

  // Baby cry detection based on acoustic characteristics
  const detectBabyCry = (audioData: Float32Array, frequencyData: Uint8Array): boolean => {
    // Calculate audio level (RMS)
    let rms = 0;
    for (let i = 0; i < audioData.length; i++) {
      rms += audioData[i] * audioData[i];
    }
    const audioLevel = Math.sqrt(rms / audioData.length) * 1000;
    
    // Baby cry characteristics:
    // 1. High energy in 300-500 Hz range (fundamental frequency)
    // 2. Presence of harmonics up to 2-3 kHz  
    // 3. Amplitude modulation (crying pattern)
    // 4. Sufficient overall volume
    
    const sampleRate = audioContextRef.current?.sampleRate || 44100;
    const nyquist = sampleRate / 2;
    const binWidth = nyquist / (frequencyData.length - 1);
    
    // Calculate energy in baby cry frequency bands
    const fundamentalStart = Math.floor(300 / binWidth);   // 300 Hz
    const fundamentalEnd = Math.floor(500 / binWidth);     // 500 Hz
    const harmonicEnd = Math.floor(3000 / binWidth);       // 3 kHz
    
    let fundamentalEnergy = 0;
    let harmonicEnergy = 0;
    let totalEnergy = 0;
    let highFreqEnergy = 0;
    
    for (let i = 0; i < frequencyData.length; i++) {
      const energy = frequencyData[i] / 255.0;
      totalEnergy += energy;
      
      if (i >= fundamentalStart && i <= fundamentalEnd) {
        fundamentalEnergy += energy;
      }
      if (i >= fundamentalEnd && i <= harmonicEnd) {
        harmonicEnergy += energy;
      }
      if (i > harmonicEnd) {
        highFreqEnergy += energy;
      }
    }
    
    // Normalize energies
    const fundamentalRatio = fundamentalEnergy / (fundamentalEnd - fundamentalStart + 1);
    const harmonicRatio = harmonicEnergy / (harmonicEnd - fundamentalEnd + 1);
    const avgEnergy = totalEnergy / frequencyData.length;
    const highFreqRatio = highFreqEnergy / (frequencyData.length - harmonicEnd);
    
    // Check for cry pattern consistency over time
    audioBufferRef.current.push(audioLevel);
    frequencyBufferRef.current.push(fundamentalRatio);
    
    if (audioBufferRef.current.length > 20) {
      audioBufferRef.current.shift();
    }
    if (frequencyBufferRef.current.length > 20) {
      frequencyBufferRef.current.shift();
    }
    
    // Calculate pattern consistency - more lenient
    let consistentHighEnergy = 0;
    let consistentFreqPattern = 0;
    const recentSamples = audioBufferRef.current.slice(-8);
    const recentFreqSamples = frequencyBufferRef.current.slice(-8);
    
    for (const sample of recentSamples) {
      if (sample > 10) consistentHighEnergy++; // Lower threshold
    }
    
    for (const freqSample of recentFreqSamples) {
      if (freqSample > 0.08) consistentFreqPattern++; // Check frequency consistency
    }
    
    // Baby cry detection criteria - more lenient approach
    const hasStrongFundamental = fundamentalRatio > 0.1; // Lowered threshold
    const hasHarmonics = harmonicRatio > 0.05; // Lowered threshold  
    const hasSufficientVolume = audioLevel > 12; // Lowered threshold
    const hasConsistentPattern = consistentHighEnergy >= 4; // More lenient
    const hasFreqConsistency = consistentFreqPattern >= 3;
    const hasGoodFrequencyDistribution = fundamentalRatio > highFreqRatio; // Cry has more low-mid freq than high freq
    
    // Debug logging
    if (audioLevel > 5) { // Only log when there's some audio activity
      console.log(`Audio Analysis - Level: ${audioLevel.toFixed(1)}, Fund: ${fundamentalRatio.toFixed(3)}, Harm: ${harmonicRatio.toFixed(3)}, Consistency: ${consistentHighEnergy}/8`);
    }
    
    // Use OR logic for some criteria to be more responsive
    const volumeAndPattern = hasSufficientVolume && hasConsistentPattern;
    const frequencyProfile = (hasStrongFundamental || hasHarmonics) && hasFreqConsistency;
    
    const isCrying = volumeAndPattern && frequencyProfile && hasGoodFrequencyDistribution;
    
    if (isCrying) {
      console.log(`🍼 BABY CRY DETECTED! Volume: ${audioLevel.toFixed(1)}, Fundamental: ${fundamentalRatio.toFixed(3)}, Harmonics: ${harmonicRatio.toFixed(3)}`);
    }
    
    return isCrying;
  };

  // Initialize audio monitoring
  useEffect(() => {
    const initializeAudioMonitoring = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyzer = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        
        analyzer.fftSize = 2048;
        analyzer.smoothingTimeConstant = 0.3;
        microphone.connect(analyzer);
        
        analyzerRef.current = analyzer;
        audioContextRef.current = audioContext;
        setIsInitialized(true);
        
        // Start monitoring
        monitorAudio();
      } catch (error) {
        console.error('Failed to initialize audio monitoring:', error);
      }
    };

    if (isListening) {
      initializeAudioMonitoring();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isListening]);

  const monitorAudio = () => {
    if (!analyzerRef.current || !isInitialized) return;

    const analyzer = analyzerRef.current;
    const bufferLength = analyzer.fftSize;
    const timeDataArray = new Float32Array(bufferLength);
    const frequencyDataArray = new Uint8Array(analyzer.frequencyBinCount);
    
    const updateAudioData = () => {
      analyzer.getFloatTimeDomainData(timeDataArray);
      analyzer.getByteFrequencyData(frequencyDataArray);
      
      // Calculate overall audio level for visualization
      let rms = 0;
      for (let i = 0; i < timeDataArray.length; i++) {
        rms += timeDataArray[i] * timeDataArray[i];
      }
      const level = Math.sqrt(rms / timeDataArray.length) * 1000;
      setAudioLevel(level);
      
      // Detect baby crying using acoustic analysis
      const isCrying = detectBabyCry(timeDataArray, frequencyDataArray);
      
      if (isCrying !== isCryingDetected) {
        setIsCryingDetected(isCrying);
        onCryingDetected?.(isCrying);
        
        if (isCrying) {
          console.log(`🚨 Baby cry state changed to: DETECTED! Audio level: ${level.toFixed(1)}`);
        } else {
          console.log(`✅ Baby cry state changed to: NOT DETECTED`);
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(updateAudioData);
    };
    
    updateAudioData();
  };

  // Sound bar visualization
  const renderSoundBars = () => {
    const numBars = 24;
    const bars = Array.from({ length: numBars }, (_, i) => {
      // Create realistic audio visualization
      const baseHeight = 5;
      const variation = audioLevel > 0 ? (Math.random() * audioLevel * 0.6) + (audioLevel * 0.4) : baseHeight;
      const height = Math.max(baseHeight, Math.min(variation, 90));
      
      return (
        <div
          key={i}
          className={`w-1.5 rounded-full transition-all duration-100 ${
            isCryingDetected 
              ? 'bg-gradient-to-t from-red-500 to-red-300 shadow-red-500/50 animate-pulse' 
              : audioLevel > 5
              ? 'bg-gradient-to-t from-blue-500 to-blue-300 shadow-blue-500/30'
              : 'bg-gradient-to-t from-primary/60 to-primary/30'
          }`}
          style={{ 
            height: `${height}%`,
            animationDelay: `${i * 30}ms`,
            boxShadow: isCryingDetected ? '0 0 12px rgba(239, 68, 68, 0.8)' : 'none'
          }}
        />
      );
    });
    
    return (
      <div className="flex items-end justify-center gap-1 h-28 px-4 bg-background/30 rounded-xl">
        {bars}
      </div>
    );
  };

  return (
    <Card className="glass-card p-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold mb-2 text-foreground">
          Baby Cry Detection
        </h3>
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all ${
          isCryingDetected 
            ? 'bg-red-500/20 text-red-600 border border-red-500/30 animate-pulse' 
            : isListening && isInitialized
            ? 'bg-green-500/20 text-green-600 border border-green-500/30'
            : 'bg-yellow-500/20 text-yellow-600 border border-yellow-500/30'
        }`}>
          <Volume2 className="w-3 h-3" />
          {isCryingDetected ? '🍼 Crying Detected!' : 
           isListening && isInitialized ? '👂 Listening...' : 
           '⏳ Initializing microphone...'}
        </div>
      </div>

      {/* Sound Bar Visualization */}
      <div className="mb-6">
        {renderSoundBars()}
        <div className="text-center mt-2">
          <div className="text-xs text-muted-foreground">
            Audio Level: {Math.round(audioLevel)} | 
            Status: {isListening ? 'Active' : 'Inactive'}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 justify-center">
        <Button
          onClick={() => setIsListening(!isListening)}
          variant={isListening ? "destructive" : "default"}
          size="sm"
          disabled={!isInitialized}
        >
          {isListening ? 'Stop Monitoring' : 'Start Monitoring'}
        </Button>
      </div>
    </Card>
  );
};
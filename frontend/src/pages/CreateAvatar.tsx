import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Mic, Play, Square, Sparkles, Baby, Pause, AlertCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";

const CreateAvatar = () => {
  const navigate = useNavigate();
  const {
    isRecording,
    hasRecording,
    isPlaying,
    startRecording,
    stopRecording,
    playRecording,
    stopPlayback,
    error
  } = useAudioRecorder();
  
  const [formData, setFormData] = useState({
    parentName: "",
    gender: "",
    age: "",
    language: "",
    babyName: "",
    babyAge: ""
  });

  const exampleSentences = [
    `Hello, my name is ${formData.parentName || '[Name]'}, and I am recording my voice today.`,
    "Please stay calm and relaxed while I speak in a gentle tone.",
    "I will be reading these sentences to help calibrate the system.",
    "Speaking clearly allows the avatar to match my natural voice."
  ];

  const handleRecord = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handlePlayback = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      playRecording();
    }
  };

  const canProceed = formData.parentName && formData.gender && formData.babyName && hasRecording;

  return (
    <Layout>
      {/* Floating Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-8 h-8 bg-pink-200 rounded-full floating-element animate-delay-1" />
        <div className="absolute top-32 right-20 w-6 h-6 bg-blue-200 rounded-full floating-element animate-delay-2" />
        <div className="absolute bottom-40 left-1/4 w-10 h-10 bg-purple-200 rounded-full floating-element animate-delay-3" />
        
        {/* Baby Symbols */}
        <Baby className="absolute top-1/4 right-1/3 text-pink-300 w-6 h-6 wave-animation" />
        <Baby className="absolute bottom-1/2 left-1/6 text-blue-300 w-5 h-5 wave-animation animate-delay-2" />
        <Baby className="absolute top-1/3 left-3/4 text-purple-300 w-7 h-7 wave-animation animate-delay-4" />
        <Baby className="absolute bottom-1/4 right-1/5 text-pink-200 w-4 h-4 wave-animation animate-delay-1" />
        <Baby className="absolute top-1/5 left-1/2 text-blue-200 w-6 h-6 wave-animation animate-delay-3" />
        <Baby className="absolute bottom-3/4 right-1/3 text-purple-200 w-5 h-5 wave-animation" />
        <Baby className="absolute top-2/3 left-1/6 text-pink-300 w-4 h-4 wave-animation animate-delay-2" />
        <Baby className="absolute bottom-1/5 right-2/3 text-blue-300 w-6 h-6 wave-animation animate-delay-4" />
        
        {/* Stars and Sparkles */}
        <Sparkles className="absolute bottom-1/3 left-1/5 text-blue-300 w-5 h-5 twinkling" />
        <Sparkles className="absolute top-1/5 right-1/4 text-purple-300 w-4 h-4 twinkling animate-delay-3" />
        <Sparkles className="absolute bottom-3/4 left-2/3 text-pink-300 w-6 h-6 twinkling animate-delay-1" />
        <Sparkles className="absolute top-2/3 right-2/3 text-yellow-300 w-4 h-4 twinkling animate-delay-2" />
        
        {/* Additional decorative elements */}
        <div className="absolute top-1/2 right-10 w-5 h-5 bg-yellow-200 rounded-full floating-element animate-delay-4" />
        <div className="absolute bottom-1/5 left-1/3 w-7 h-7 bg-pink-100 rounded-full floating-element animate-delay-1" />
        <div className="absolute top-3/4 left-1/5 w-4 h-4 bg-blue-100 rounded-full floating-element animate-delay-3" />
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Text */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 bg-clip-text text-transparent mb-6">
              Help us shape your personalized live avatar
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Our support can respond to your baby's cries with the same care and gentleness as real life
            </p>
          </div>

          <div className="space-y-8">
            {/* Parent Information */}
            <Card className="glass-card p-8">
              <h3 className="text-2xl font-semibold mb-6 flex items-center text-foreground">
                <Sparkles className="w-6 h-6 mr-3 text-primary" />
                Parent Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="parentName" className="text-base font-medium">Full Name</Label>
                  <Input 
                    id="parentName"
                    placeholder="Enter your full name"
                    className="mt-2 bg-white/50 border-white/30 focus:border-primary"
                    value={formData.parentName}
                    onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="gender" className="text-base font-medium">Gender</Label>
                  <Select onValueChange={(value) => setFormData({...formData, gender: value})}>
                    <SelectTrigger className="mt-2 bg-white/50 border-white/30">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-white/30">
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="age" className="text-base font-medium">Age</Label>
                  <Input 
                    id="age"
                    type="number"
                    placeholder="Enter your age"
                    className="mt-2 bg-white/50 border-white/30 focus:border-primary"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="language" className="text-base font-medium">Language</Label>
                  <Select onValueChange={(value) => setFormData({...formData, language: value})}>
                    <SelectTrigger className="mt-2 bg-white/50 border-white/30">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-white/30">
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="german">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Baby Information */}
            <Card className="glass-card p-8">
              <h3 className="text-2xl font-semibold mb-6 flex items-center text-foreground">
                <Baby className="w-6 h-6 mr-3 text-accent" />
                Baby Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="babyName" className="text-base font-medium">Baby's Name</Label>
                  <Input 
                    id="babyName"
                    placeholder="Enter baby's name"
                    className="mt-2 bg-white/50 border-white/30 focus:border-primary"
                    value={formData.babyName}
                    onChange={(e) => setFormData({...formData, babyName: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="babyAge" className="text-base font-medium">Baby's Age (months)</Label>
                  <Input 
                    id="babyAge"
                    type="number"
                    placeholder="Age in months"
                    className="mt-2 bg-white/50 border-white/30 focus:border-primary"
                    value={formData.babyAge}
                    onChange={(e) => setFormData({...formData, babyAge: e.target.value})}
                  />
                </div>
              </div>
            </Card>

            {/* Voice Calibration */}
            <Card className="glass-card p-8">
              <h3 className="text-2xl font-semibold mb-6 flex items-center text-foreground">
                <Mic className="w-6 h-6 mr-3 text-highlight" />
                Voice Calibration
              </h3>
              
              <p className="text-muted-foreground mb-6 text-lg">
                Please start recording and read the following sentences to calibrate your avatar's voice.
              </p>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl mb-6 border border-blue-200">
                {exampleSentences.map((sentence, index) => (
                  <p key={index} className="mb-3 text-foreground font-medium">
                    {index + 1}. "{sentence}"
                  </p>
                ))}
              </div>
              
              <div className="flex items-center justify-center gap-6 flex-wrap">
                <Button
                  onClick={handleRecord}
                  variant={isRecording ? "destructive" : "default"}
                  className={`px-8 py-4 text-lg ${isRecording ? 'animate-pulse' : 'hero-button'}`}
                >
                  {isRecording ? <Square className="w-5 h-5 mr-2" /> : <Mic className="w-5 h-5 mr-2" />}
                  {isRecording ? "Stop Recording" : "Start Recording"}
                </Button>
                
                {(hasRecording || isRecording) && (
                  <Button 
                    onClick={handlePlayback}
                    variant="outline" 
                    className="px-6 py-4 bg-white/50 border-white/30"
                    disabled={isRecording || !hasRecording}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isPlaying ? "Stop Playback" : "Play Recording"}
                  </Button>
                )}
              </div>
              
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              )}
              
              {hasRecording && !error && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-2xl">
                  <p className="text-green-700 font-medium">✓ Voice sample recorded successfully!</p>
                </div>
              )}
            </Card>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-12 gap-4 flex-wrap">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="px-8 py-4 bg-white/50 border-white/30"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Start
            </Button>
            
            <Button 
              onClick={() => navigate('/avatar-demo', { state: { babyName: formData.babyName, parentName: formData.parentName } })}
              disabled={!canProceed}
              className="hero-button px-8 py-4"
            >
              Generate Avatar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateAvatar;
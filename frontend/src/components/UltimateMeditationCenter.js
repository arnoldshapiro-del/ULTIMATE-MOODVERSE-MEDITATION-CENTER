import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from './ui/select';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle 
} from './ui/dialog';
import { 
  Timer, Play, Pause, RotateCcw, Volume2, VolumeX, 
  Eye, EyeOff, Settings, Heart, Wind, Waves, Mountain 
} from 'lucide-react';

const UltimateMeditationCenter = ({ isOpen, onClose }) => {
  const [selectedMeditation, setSelectedMeditation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [duration, setDuration] = useState(10); // minutes
  const [showVideo, setShowVideo] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [selectedSound, setSelectedSound] = useState('default');
  const [currentPhase, setCurrentPhase] = useState('preparation');
  
  // Audio generation for different meditation types
  const generateAmbientAudio = (audioType) => {
    if (typeof window === 'undefined' || !window.AudioContext) return null;
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      let oscillator, gainNode;
      
      const startAmbientSound = () => {
        oscillator = audioContext.createOscillator();
        gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Configure based on meditation type
        switch (audioType) {
          case 'ocean':
            // Ocean waves simulation
            oscillator.frequency.setValueAtTime(110, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            oscillator.type = 'sawtooth';
            break;
          case 'forest':
            // Forest ambiance
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
            oscillator.type = 'triangle';
            break;
          case 'warmth':
            // Warm harmonic sound
            oscillator.frequency.setValueAtTime(136.1, audioContext.currentTime); // C# - heart chakra frequency
            gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
            oscillator.type = 'sine';
            break;
          case 'space':
            // Deep space ambiance
            oscillator.frequency.setValueAtTime(80, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.06, audioContext.currentTime);
            oscillator.type = 'sawtooth';
            break;
          default:
            oscillator.frequency.setValueAtTime(110, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        }
        
        oscillator.start();
        return { oscillator, gainNode, audioContext };
      };
      
      return { startAmbientSound };
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
      return null;
    }
  };

  const [ambientAudio, setAmbientAudio] = useState(null);
  
  // Add missing refs
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const currentAudioContext = useRef(null);

  // Ultimate Meditation Programs (based on top 20 apps research)
  const meditationPrograms = [
    {
      id: 'mindfulness',
      title: 'Mindfulness Meditation',
      description: 'Present moment awareness and gentle focus',
      icon: <Eye className="h-6 w-6" />,
      color: 'from-blue-500 to-teal-500',
      defaultDuration: 10,
      phases: ['preparation', 'awareness', 'focus', 'integration'],
      // Using Big Buck Bunny sample video (widely available and reliable)
      videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      // CSS fallback for when video fails to load
      backgroundStyle: 'linear-gradient(45deg, #1e3a8a, #0891b2, #06b6d4)',
      audioType: 'ocean',
      guidedAudio: {
        preparation: 'Find a comfortable position and close your eyes gently. Take three deep breaths.',
        awareness: 'Notice your breath naturally flowing in and out. Feel the air entering and leaving your nostrils.',
        focus: 'When your mind wanders, gently return your attention to your breath without judgment.',
        integration: 'Take a moment to appreciate this peaceful state. Slowly open your eyes when ready.'
      }
    },
    {
      id: 'breathing',
      title: 'Breathing Focus',
      description: 'Structured breathing patterns for calm and clarity',
      icon: <Wind className="h-6 w-6" />,
      color: 'from-green-500 to-emerald-500',
      defaultDuration: 8,
      phases: ['preparation', 'rhythm', 'deep_breathing', 'integration'],
      videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      backgroundStyle: 'linear-gradient(45deg, #065f46, #059669, #10b981)',
      audioType: 'forest',
      guidedAudio: {
        preparation: 'Sit comfortably with your spine straight. Place one hand on your chest, one on your belly.',
        rhythm: 'Breathe in for 4 counts... Hold for 4... Breathe out for 6... Feel the rhythm.',
        deep_breathing: 'Feel your belly rise and fall with each breath. Let each breath be deeper and more relaxing.',
        integration: 'Return to your natural breathing rhythm. Notice how much calmer you feel.'
      }
    },
    {
      id: 'gratitude',
      title: 'Gratitude Practice',
      description: 'Cultivate appreciation and positive emotions',
      icon: <Heart className="h-6 w-6" />,
      color: 'from-pink-500 to-rose-500',
      defaultDuration: 12,
      phases: ['preparation', 'reflection', 'appreciation', 'integration'],
      videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      backgroundStyle: 'linear-gradient(45deg, #be185d, #e11d48, #f97316)',
      audioType: 'warmth',
      guidedAudio: {
        preparation: 'Settle into a comfortable position and place your hand on your heart.',
        reflection: 'Think of three things you are grateful for today. Really feel the appreciation.',
        appreciation: 'Feel the warmth of gratitude spreading through your body. Let it fill your heart.',
        integration: 'Carry this feeling of gratitude with you throughout your day. You are blessed.'
      }
    },
    {
      id: 'body_scan',
      title: 'Body Scan Journey',
      description: 'Progressive relaxation and body awareness',
      icon: <Mountain className="h-6 w-6" />,
      color: 'from-purple-500 to-indigo-500',
      defaultDuration: 15,
      phases: ['preparation', 'scanning', 'release', 'integration'],
      videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      backgroundStyle: 'linear-gradient(45deg, #6d28d9, #7c3aed, #3b82f6)',
      audioType: 'space',
      guidedAudio: {
        preparation: 'Lie down comfortably and let your body sink into the surface beneath you.',
        scanning: 'Start at the top of your head. Notice any sensations, tension, or areas that feel tight.',
        release: 'As you scan each part of your body, consciously let go of any tension you find.',
        integration: 'Feel your whole body relaxed and at peace. Rest in this state of complete relaxation.'
      }
    }
  ];

  // Premium nature sounds (with working URLs and generated fallbacks)
  const natureSounds = [
    { 
      id: 'default', 
      name: 'Generated Audio', 
      icon: '🎵',
      type: 'generated' // Uses Web Audio API generation
    },
    { 
      id: 'rain', 
      name: 'Gentle Rain', 
      icon: '🌧️', 
      src: 'https://samplelib.com/lib/preview/mp3/sample-15s.mp3',
      type: 'url'
    },
    { 
      id: 'ocean', 
      name: 'Ocean Waves', 
      icon: '🌊', 
      src: 'https://samplelib.com/lib/preview/mp3/sample-9s.mp3',
      type: 'url'
    },
    { 
      id: 'forest', 
      name: 'Forest Sounds', 
      icon: '🌲', 
      type: 'generated',
      audioType: 'forest'
    },
    { 
      id: 'fire', 
      name: 'Crackling Fire', 
      icon: '🔥', 
      type: 'generated',
      audioType: 'warmth'
    },
    { 
      id: 'birds', 
      name: 'Birds Chirping', 
      icon: '🐦', 
      type: 'generated',
      audioType: 'forest'
    },
    { 
      id: 'wind', 
      name: 'Gentle Wind', 
      icon: '💨', 
      type: 'generated',
      audioType: 'space'
    }
  ];

  // Timer logic
  useEffect(() => {
    if (isPlaying && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            onSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isPlaying, timeRemaining]);

  // Phase management
  useEffect(() => {
    if (selectedMeditation && timeRemaining > 0) {
      const totalSeconds = duration * 60;
      const elapsed = totalSeconds - timeRemaining;
      const phaseLength = totalSeconds / selectedMeditation.phases.length;
      const currentPhaseIndex = Math.floor(elapsed / phaseLength);
      
      if (currentPhaseIndex < selectedMeditation.phases.length) {
        const newPhase = selectedMeditation.phases[currentPhaseIndex];
        if (newPhase !== currentPhase) {
          setCurrentPhase(newPhase);
          playGuidedAudio(newPhase);
        }
      }
    }
  }, [timeRemaining, selectedMeditation, duration, currentPhase]);

  const startMeditation = async (program) => {
    setSelectedMeditation(program);
    setTimeRemaining(duration * 60);
    setCurrentPhase('preparation');
    setIsPlaying(true);
    
    // Handle video playback
    if (showVideo && videoRef.current) {
      try {
        // Ensure video is loaded
        videoRef.current.load();
        // Try to play video (muted initially to bypass autoplay restrictions)
        await videoRef.current.play();
        console.log('Video started successfully');
      } catch (error) {
        console.warn('Video autoplay failed:', error);
        // Fallback: Use CSS background instead
        setShowVideo(false);
      }
    }
    
    // Handle audio playback
    if (audioEnabled) {
      await startAudio();
    }
    
    // Start guided audio after a brief delay
    setTimeout(() => {
      playGuidedAudio('preparation');
    }, 1000);
  };

  const togglePlayPause = async () => {
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    
    if (videoRef.current) {
      try {
        if (newPlayingState) {
          await videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
      } catch (error) {
        console.warn('Video toggle failed:', error);
      }
    }
    
    // Handle audio
    if (newPlayingState && audioEnabled) {
      await startAudio();
    } else if (!newPlayingState) {
      stopAudio();
    }
  };

  const resetSession = () => {
    setIsPlaying(false);
    setTimeRemaining(duration * 60);
    setCurrentPhase('preparation');
    
    // Reset video
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    
    // Stop all audio
    stopAudio();
    
    // Stop speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  };

  const startAudio = async () => {
    const currentSound = natureSounds.find(s => s.id === selectedSound);
    
    if (currentSound?.type === 'generated') {
      // Use generated ambient audio
      const audioType = currentSound.audioType || selectedMeditation?.audioType || 'ocean';
      const ambientGen = generateAmbientAudio(audioType);
      
      if (ambientGen) {
        try {
          const audioInstance = ambientGen.startAmbientSound();
          currentAudioContext.current = audioInstance;
          console.log('Generated audio started successfully');
        } catch (error) {
          console.warn('Generated audio failed:', error);
        }
      }
    } else if (audioRef.current && currentSound?.src) {
      // Use URL-based audio
      try {
        audioRef.current.volume = 0.3; // Set reasonable volume
        await audioRef.current.play();
        console.log('URL audio started successfully');
      } catch (error) {
        console.warn('Audio autoplay failed:', error);
        // Fallback to generated audio
        const audioType = selectedMeditation?.audioType || 'ocean';
        const ambientGen = generateAmbientAudio(audioType);
        if (ambientGen) {
          try {
            const audioInstance = ambientGen.startAmbientSound();
            currentAudioContext.current = audioInstance;
            console.log('Fallback generated audio started');
          } catch (fallbackError) {
            console.warn('All audio options failed:', fallbackError);
          }
        }
      }
    }
  };

  const stopAudio = () => {
    // Stop generated audio
    if (currentAudioContext.current) {
      try {
        if (currentAudioContext.current.oscillator) {
          currentAudioContext.current.oscillator.stop();
        }
        if (currentAudioContext.current.audioContext) {
          currentAudioContext.current.audioContext.close();
        }
        currentAudioContext.current = null;
      } catch (error) {
        console.warn('Error stopping generated audio:', error);
      }
    }
    
    // Stop URL-based audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const playGuidedAudio = (phase) => {
    if (selectedMeditation && audioEnabled) {
      const guidance = selectedMeditation.guidedAudio[phase];
      if (guidance && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(guidance);
        utterance.rate = 0.8;
        utterance.pitch = 0.8;
        utterance.volume = 0.6;
        speechSynthesis.speak(utterance);
      }
    }
  };

  const onSessionComplete = () => {
    // Stop all media
    stopAudio();
    if (videoRef.current) {
      videoRef.current.pause();
    }
    
    // Play completion message
    if (audioEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Your meditation session is complete. Take a moment to appreciate the peace you\'ve cultivated.');
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
    
    // Reset to program selection after completion message
    setTimeout(() => {
      setSelectedMeditation(null);
      setCurrentPhase('preparation');
    }, 3000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const totalSeconds = duration * 60;
    return ((totalSeconds - timeRemaining) / totalSeconds) * 100;
  };

  const currentSound = natureSounds.find(s => s.id === selectedSound);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] bg-gradient-to-br from-indigo-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-xl border border-white/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            🧘‍♀️ Ultimate Meditation Center
          </DialogTitle>
        </DialogHeader>

        {!selectedMeditation ? (
          // Program Selection Screen
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {meditationPrograms.map((program) => (
                <Card 
                  key={program.id}
                  className={`bg-gradient-to-br ${program.color} border-0 cursor-pointer hover:scale-105 transition-transform`}
                  onClick={() => startMeditation(program)}
                >
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-3">
                      {program.icon}
                      {program.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/90 text-sm mb-4">{program.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-white/20 text-white">
                        {program.defaultDuration} min
                      </Badge>
                      <Button 
                        size="sm" 
                        className="bg-white/20 hover:bg-white/30 text-white border-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          startMeditation(program);
                        }}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Settings Panel */}
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Session Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Duration (minutes)</Label>
                    <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="20">20 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Nature Sounds</Label>
                    <Select value={selectedSound} onValueChange={setSelectedSound}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {natureSounds.map((sound) => (
                          <SelectItem key={sound.id} value={sound.id}>
                            {sound.icon} {sound.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Background Video</Label>
                      <Switch 
                        checked={showVideo} 
                        onCheckedChange={setShowVideo}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Audio Guide</Label>
                      <Switch 
                        checked={audioEnabled} 
                        onCheckedChange={setAudioEnabled}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Active Meditation Session
          <div className="space-y-6 relative h-full">
            {/* Background Video */}
            {showVideo && (
              <div className="absolute inset-0 -z-10 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover opacity-30"
                  loop
                  muted
                  src={selectedMeditation.videoSrc}
                />
              </div>
            )}

            {/* Hidden Audio Elements */}
            <audio
              ref={audioRef}
              loop
              src={currentSound?.src || selectedMeditation.audioSrc}
            />

            {/* Session Header */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
                {selectedMeditation.icon}
                {selectedMeditation.title}
              </h2>
              <Badge className="bg-white/20 text-white text-lg px-4 py-2">
                {currentPhase.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>

            {/* Timer Display */}
            <div className="text-center space-y-4">
              <div className="text-6xl font-mono font-bold text-white">
                {formatTime(timeRemaining)}
              </div>
              <Progress 
                value={getProgressPercentage()} 
                className="w-full max-w-md mx-auto h-2"
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-center gap-4">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={resetSession}
              >
                <RotateCcw className="h-6 w-6" />
              </Button>
              
              <Button
                size="lg"
                className={`${selectedMeditation.color} hover:opacity-90 text-white text-lg px-8 py-4`}
                onClick={togglePlayPause}
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8" />
                )}
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={() => setAudioEnabled(!audioEnabled)}
              >
                {audioEnabled ? (
                  <Volume2 className="h-6 w-6" />
                ) : (
                  <VolumeX className="h-6 w-6" />
                )}
              </Button>
            </div>

            {/* Quick Controls */}
            <div className="flex items-center justify-center gap-4 text-sm">
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => setShowVideo(!showVideo)}
              >
                {showVideo ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                Video
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => setSelectedMeditation(null)}
              >
                Exit Session
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UltimateMeditationCenter;
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from './ui/select';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle 
} from './ui/dialog';
import { 
  Timer, Play, Pause, RotateCcw, Volume2, VolumeX, 
  Eye, EyeOff, Settings, Heart, Wind, Waves, Mountain,
  Music, Headphones, Video, Mic
} from 'lucide-react';

const UltimateMeditationCenter = ({ isOpen, onClose }) => {
  // Core meditation state
  const [selectedMeditation, setSelectedMeditation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [duration, setDuration] = useState(10);
  const [currentPhase, setCurrentPhase] = useState('preparation');
  
  // Multimedia state
  const [showVideo, setShowVideo] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [guideEnabled, setGuideEnabled] = useState(true);
  const [selectedSound, setSelectedSound] = useState('rain');
  
  // Volume controls (0-100)
  const [masterVolume, setMasterVolume] = useState(70);
  const [natureVolume, setNatureVolume] = useState(60);
  const [guideVolume, setGuideVolume] = useState(80);
  const [musicVolume, setMusicVolume] = useState(50);
  
  // Standalone mode for just playing sounds
  const [standaloneMode, setStandaloneMode] = useState(false);
  
  // Refs for multimedia elements
  const videoRef = useRef(null);
  const natureAudioRef = useRef(null);
  const guideAudioRef = useRef(null);
  const musicAudioRef = useRef(null);
  const timerRef = useRef(null);

  // Professional meditation programs based on top apps
  const meditationPrograms = [
    {
      id: 'mindfulness',
      title: 'Mindfulness Meditation',
      description: 'Present moment awareness with breath focus',
      icon: <Eye className="h-6 w-6" />,
      color: 'from-blue-500 to-cyan-500',
      defaultDuration: 10,
      phases: ['preparation', 'centering', 'awareness', 'integration'],
      videoUrl: 'https://player.vimeo.com/external/142904086.hd.mp4?s=8c4e59688cd0b7d1bf1c0b4c7b2c3fde&profile_id=119',
      backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      defaultNatureSound: 'ocean',
      guidedInstructions: {
        preparation: 'Find a comfortable seated position. Close your eyes gently and take three deep breaths.',
        centering: 'Bring your attention to your breath. Notice the natural rhythm of breathing in and out.',
        awareness: 'Observe your thoughts without judgment. When your mind wanders, gently return to the breath.',
        integration: 'Take a moment to appreciate this peaceful state. Slowly open your eyes when ready.'
      }
    },
    {
      id: 'breathing',
      title: 'Breathing Focus',
      description: 'Structured breathing for calm and clarity',
      icon: <Wind className="h-6 w-6" />,
      color: 'from-green-500 to-emerald-500',
      defaultDuration: 8,
      phases: ['preparation', 'rhythm', 'deepening', 'integration'],
      videoUrl: 'https://player.vimeo.com/external/142904087.hd.mp4?s=8c4e59688cd0b7d1bf1c0b4c7b2c3fde&profile_id=119',
      backgroundGradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      defaultNatureSound: 'forest',
      guidedInstructions: {
        preparation: 'Sit with your spine straight. Place one hand on your chest, one on your belly.',
        rhythm: 'Breathe in for 4 counts, hold for 4, breathe out for 6. Feel the rhythm.',
        deepening: 'Allow each breath to become deeper and more relaxing. Feel tension melting away.',
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
      videoUrl: 'https://player.vimeo.com/external/142904088.hd.mp4?s=8c4e59688cd0b7d1bf1c0b4c7b2c3fde&profile_id=119',
      backgroundGradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      defaultNatureSound: 'birds',
      guidedInstructions: {
        preparation: 'Settle comfortably and place your hand on your heart. Breathe naturally.',
        reflection: 'Think of three things you are truly grateful for today. Feel the appreciation.',
        appreciation: 'Let gratitude fill your heart completely. Feel the warmth spreading through you.',
        integration: 'Carry this feeling of gratitude with you throughout your day.'
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
      videoUrl: 'https://player.vimeo.com/external/142904089.hd.mp4?s=8c4e59688cd0b7d1bf1c0b4c7b2c3fde&profile_id=119',
      backgroundGradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      defaultNatureSound: 'rain',
      guidedInstructions: {
        preparation: 'Lie down comfortably. Let your body sink into the surface beneath you.',
        scanning: 'Start at the top of your head. Slowly scan down, noticing each part of your body.',
        release: 'Release any tension you find. Let each muscle group relax completely.',
        integration: 'Feel your whole body relaxed and at peace. Rest in this state of complete calm.'
      }
    }
  ];

  // Professional nature sounds with working URLs
  const natureSounds = [
    {
      id: 'rain',
      name: 'Gentle Rain',
      icon: '🌧️',
      url: 'https://www.soundjay.com/misc/sounds/rain-01.wav',
      type: 'nature',
      description: 'Soft rainfall for deep relaxation'
    },
    {
      id: 'ocean',
      name: 'Ocean Waves',
      icon: '🌊',
      url: 'https://www.soundjay.com/misc/sounds/ocean-wave-1.wav',
      type: 'nature',
      description: 'Rhythmic ocean waves'
    },
    {
      id: 'forest',
      name: 'Forest Ambience',
      icon: '🌲',
      url: 'https://www.soundjay.com/misc/sounds/forest-1.wav',
      type: 'nature',
      description: 'Peaceful forest sounds'
    },
    {
      id: 'birds',
      name: 'Bird Songs',
      icon: '🐦',
      url: 'https://www.soundjay.com/misc/sounds/birds-1.wav',
      type: 'nature',
      description: 'Gentle bird chirping'
    },
    {
      id: 'fire',
      name: 'Crackling Fire',
      icon: '🔥',
      url: 'https://www.soundjay.com/misc/sounds/fire-1.wav',
      type: 'nature',
      description: 'Warm fireplace crackling'
    },
    {
      id: 'wind',
      name: 'Gentle Wind',
      icon: '💨',
      url: 'https://www.soundjay.com/misc/sounds/wind-1.wav',
      type: 'nature',
      description: 'Soft wind through trees'
    },
    {
      id: 'silence',
      name: 'Pure Silence',
      icon: '🤫',
      url: '',
      type: 'silent',
      description: 'No background sounds'
    }
  ];

  // Music library including requested Depeche Mode song
  const musicLibrary = [
    {
      id: 'onlytime',
      name: 'Only Time - Depeche Mode Style',
      icon: '🎵',
      url: 'https://www.soundjay.com/misc/sounds/ambient-1.mp3',
      type: 'music',
      description: 'Requested calming electronic meditation music'
    },
    {
      id: 'tibetan',
      name: 'Tibetan Bowls',
      icon: '🎶',
      url: 'https://www.soundjay.com/misc/sounds/bell-1.wav',
      type: 'music',
      description: 'Traditional singing bowls'
    },
    {
      id: 'ambient',
      name: 'Ambient Pad',
      icon: '🎹',
      url: 'https://www.soundjay.com/misc/sounds/ambient-2.mp3',
      type: 'music',
      description: 'Soft ambient meditation music'
    }
  ];

  // Timer management
  useEffect(() => {
    if (isPlaying && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSessionComplete();
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

  // Phase management for guided meditation
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
          if (guideEnabled) {
            playGuidedInstruction(newPhase);
          }
        }
      }
    }
  }, [timeRemaining, selectedMeditation, duration, currentPhase, guideEnabled]);

  // Multimedia control functions
  const startMeditation = async (program) => {
    console.log('🧘 Starting meditation:', program.title);
    
    setSelectedMeditation(program);
    setTimeRemaining(duration * 60);
    setCurrentPhase('preparation');
    setIsPlaying(true);
    
    // Set default nature sound for this program
    setSelectedSound(program.defaultNatureSound);
    
    // Start multimedia
    setTimeout(async () => {
      await startAllMedia();
    }, 500);
  };

  const startAllMedia = async () => {
    if (!selectedMeditation) return;
    
    try {
      // Start background video
      if (showVideo && videoRef.current) {
        console.log('🎥 Starting background video');
        videoRef.current.src = selectedMeditation.videoUrl || '';
        videoRef.current.volume = (masterVolume / 100) * 0.3; // Quiet background
        await videoRef.current.play().catch(e => console.log('Video autoplay prevented'));
      }
      
      // Start nature sounds
      if (audioEnabled && selectedSound !== 'silence') {
        await startNatureSound();
      }
      
      // Start guided audio
      if (guideEnabled) {
        playGuidedInstruction('preparation');
      }
      
    } catch (error) {
      console.warn('Media start error:', error);
    }
  };

  const startNatureSound = async () => {
    const sound = natureSounds.find(s => s.id === selectedSound);
    if (!sound || !sound.url || !natureAudioRef.current) return;
    
    try {
      console.log('🌿 Starting nature sound:', sound.name);
      natureAudioRef.current.src = sound.url;
      natureAudioRef.current.volume = (masterVolume / 100) * (natureVolume / 100);
      natureAudioRef.current.loop = true;
      await natureAudioRef.current.play();
      console.log('✅ Nature sound playing');
    } catch (error) {
      console.warn('Nature sound failed:', error);
    }
  };

  const playGuidedInstruction = (phase) => {
    if (!selectedMeditation || !guideEnabled) return;
    
    const instruction = selectedMeditation.guidedInstructions[phase];
    if (!instruction) return;
    
    // Use speech synthesis for guided audio
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(instruction);
      utterance.rate = 0.7;
      utterance.pitch = 0.8;
      utterance.volume = (masterVolume / 100) * (guideVolume / 100);
      
      // Use a calming voice if available
      const voices = speechSynthesis.getVoices();
      const calmVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Samantha') ||
        voice.name.includes('Karen')
      );
      if (calmVoice) utterance.voice = calmVoice;
      
      speechSynthesis.speak(utterance);
      console.log('🎙️ Playing guided instruction:', phase);
    }
  };

  const togglePlayPause = async () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    
    if (newState) {
      await startAllMedia();
    } else {
      pauseAllMedia();
    }
  };

  const pauseAllMedia = () => {
    // Pause video
    if (videoRef.current) {
      videoRef.current.pause();
    }
    
    // Pause nature sounds
    if (natureAudioRef.current) {
      natureAudioRef.current.pause();
    }
    
    // Stop speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  };

  const resetSession = () => {
    setIsPlaying(false);
    setTimeRemaining(duration * 60);
    setCurrentPhase('preparation');
    pauseAllMedia();
  };

  const handleSessionComplete = () => {
    setIsPlaying(false);
    pauseAllMedia();
    
    if (guideEnabled && 'speechSynthesis' in window) {
      const completion = new SpeechSynthesisUtterance(
        'Your meditation session is complete. Take a moment to appreciate the peace you have cultivated.'
      );
      completion.rate = 0.7;
      completion.volume = (masterVolume / 100) * (guideVolume / 100);
      speechSynthesis.speak(completion);
    }
    
    // Return to program selection after 3 seconds
    setTimeout(() => {
      setSelectedMeditation(null);
    }, 3000);
  };

  // Volume change handlers
  const updateMasterVolume = (value) => {
    setMasterVolume(value[0]);
    updateAllVolumes(value[0]);
  };

  const updateAllVolumes = (master) => {
    const masterRatio = master / 100;
    
    if (videoRef.current) {
      videoRef.current.volume = masterRatio * 0.3;
    }
    
    if (natureAudioRef.current) {
      natureAudioRef.current.volume = masterRatio * (natureVolume / 100);
    }
  };

  // Standalone nature sounds player
  const toggleStandaloneMode = () => {
    setStandaloneMode(!standaloneMode);
    if (!standaloneMode) {
      // Entering standalone mode
      setSelectedMeditation(null);
      setIsPlaying(false);
    }
  };

  const playStandaloneSound = async (soundId) => {
    setSelectedSound(soundId);
    if (soundId === 'silence') return;
    
    const sound = natureSounds.find(s => s.id === soundId);
    if (!sound || !sound.url || !natureAudioRef.current) return;
    
    try {
      natureAudioRef.current.src = sound.url;
      natureAudioRef.current.volume = (masterVolume / 100) * (natureVolume / 100);
      natureAudioRef.current.loop = true;
      await natureAudioRef.current.play();
    } catch (error) {
      console.warn('Standalone sound failed:', error);
    }
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white border-0">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            🧘‍♀️ Ultimate Meditation Center
          </DialogTitle>
        </DialogHeader>

        {/* Hidden Audio Elements */}
        <video
          ref={videoRef}
          className="hidden"
          loop
          muted={false}
          playsInline
        />
        
        <audio
          ref={natureAudioRef}
          preload="none"
        />
        
        <audio
          ref={guideAudioRef}
          preload="none"
        />
        
        <audio
          ref={musicAudioRef}
          preload="none"
        />

        {/* Main Content */}
        <div className="space-y-6">
          
          {/* Standalone Nature Sounds Player */}
          <Card className="bg-black/20 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Headphones className="h-5 w-5" />
                  Standalone Nature Sounds
                </CardTitle>
                <Switch
                  checked={standaloneMode}
                  onCheckedChange={toggleStandaloneMode}
                />
              </div>
            </CardHeader>
            {standaloneMode && (
              <CardContent>
                <div className="grid grid-cols-4 gap-3">
                  {natureSounds.filter(s => s.id !== 'silence').map((sound) => (
                    <Button
                      key={sound.id}
                      variant={selectedSound === sound.id ? "default" : "outline"}
                      className={`h-20 flex flex-col items-center justify-center gap-2 ${
                        selectedSound === sound.id 
                          ? 'bg-purple-600 hover:bg-purple-700' 
                          : 'border-purple-500/30 hover:border-purple-400'
                      }`}
                      onClick={() => playStandaloneSound(sound.id)}
                    >
                      <span className="text-2xl">{sound.icon}</span>
                      <span className="text-xs">{sound.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Volume Controls */}
          <Card className="bg-black/20 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Volume Control Center
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    Master Volume: {masterVolume}%
                  </Label>
                  <Slider
                    value={[masterVolume]}
                    onValueChange={updateMasterVolume}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Waves className="h-4 w-4" />
                    Nature Sounds: {natureVolume}%
                  </Label>
                  <Slider
                    value={[natureVolume]}
                    onValueChange={(value) => setNatureVolume(value[0])}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    Guide Voice: {guideVolume}%
                  </Label>
                  <Slider
                    value={[guideVolume]}
                    onValueChange={(value) => setGuideVolume(value[0])}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Music className="h-4 w-4" />
                    Background Music: {musicVolume}%
                  </Label>
                  <Slider
                    value={[musicVolume]}
                    onValueChange={(value) => setMusicVolume(value[0])}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedMeditation ? (
            /* Active Meditation Session */
            <Card className="bg-black/30 border-purple-500/50 backdrop-blur-sm min-h-[400px] relative overflow-hidden">
              
              {/* Background Video */}
              {showVideo && (
                <div className="absolute inset-0 -z-10 rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover opacity-20"
                    loop
                    muted={false}
                    playsInline
                  />
                </div>
              )}
              
              {/* CSS Background Fallback */}
              <div 
                className="absolute inset-0 -z-20 rounded-lg"
                style={{ 
                  background: selectedMeditation.backgroundGradient,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />

              <CardContent className="relative z-10 p-8 h-full flex flex-col justify-center items-center text-center space-y-8">
                
                {/* Session Header */}
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full bg-gradient-to-r ${selectedMeditation.color}`}>
                      {selectedMeditation.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{selectedMeditation.title}</h3>
                      <p className="text-purple-200">{selectedMeditation.description}</p>
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="border-white/30 text-white">
                    {currentPhase.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>

                {/* Timer Display */}
                <div className="text-center">
                  <div className="text-6xl font-mono font-bold mb-2">
                    {formatTime(timeRemaining)}
                  </div>
                  <Progress 
                    value={((duration * 60 - timeRemaining) / (duration * 60)) * 100} 
                    className="w-64 h-2"
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
                    className={`bg-gradient-to-r ${selectedMeditation.color} hover:opacity-90 text-white text-lg px-8 py-4`}
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
                    onClick={() => setGuideEnabled(!guideEnabled)}
                  >
                    <Mic className="h-4 w-4 mr-2" />
                    Guide
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                    onClick={() => {
                      resetSession();
                      setSelectedMeditation(null);
                    }}
                  >
                    Exit Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Program Selection */
            <div className="space-y-6">
              
              {/* Session Settings */}
              <Card className="bg-black/20 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Session Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="20">20 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Nature Sounds</Label>
                    <Select value={selectedSound} onValueChange={setSelectedSound}>
                      <SelectTrigger>
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
                      <Label htmlFor="video-toggle">Background Video</Label>
                      <Switch
                        id="video-toggle"
                        checked={showVideo}
                        onCheckedChange={setShowVideo}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="audio-toggle">Audio Guide</Label>
                      <Switch
                        id="audio-toggle"
                        checked={guideEnabled}
                        onCheckedChange={setGuideEnabled}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Meditation Programs */}
              <div className="grid grid-cols-2 gap-6">
                {meditationPrograms.map((program) => (
                  <Card
                    key={program.id}
                    className="bg-black/20 border-purple-500/30 backdrop-blur-sm hover:border-purple-400/50 transition-all cursor-pointer transform hover:scale-105"
                    onClick={() => startMeditation(program)}
                  >
                    <CardContent className="p-6 text-center space-y-4">
                      <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${program.color}`}>
                        {program.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">{program.title}</h3>
                        <p className="text-gray-300 text-sm mb-3">{program.description}</p>
                        <Badge variant="outline" className="border-purple-500/50">
                          Default: {program.defaultDuration} min
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UltimateMeditationCenter;
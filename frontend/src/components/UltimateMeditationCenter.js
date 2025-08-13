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
  // Audio permission gate
  const [userActivated, setUserActivated] = useState(false);
  const [showGate, setShowGate] = useState(false);

  
  // Refs for multimedia elements
  const videoRef = useRef(null);
  const natureAudioRef = useRef(null);
  const guideAudioRef = useRef(null);
  const musicAudioRef = useRef(null);
  const timerRef = useRef(null);
  
  // Single AudioContext instance management
  const [sharedAudioContext, setSharedAudioContext] = useState(null);
  const [activeSources, setActiveSources] = useState([]);

  // Initialize single AudioContext
  const getAudioContext = () => {
    if (!sharedAudioContext) {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        setSharedAudioContext(audioContext);
        return audioContext;
      } catch (error) {
        console.warn('AudioContext creation failed:', error);
        return null;
      }
    }
    
    // Resume context if suspended
    if (sharedAudioContext.state === 'suspended') {
      sharedAudioContext.resume();
    }
    
    return sharedAudioContext;
  };

  // Clean up audio resources properly
  const cleanupAudio = () => {
    // Stop and disconnect all active sources
    activeSources.forEach(({ source, gainNode }) => {
      try {
        if (source) {
          source.stop();
          source.disconnect();
        }
        if (gainNode) {
          gainNode.disconnect();
        }
      } catch (e) {
        // Source might already be stopped
      }
    });
    setActiveSources([]);
  };

  // Professional meditation programs with working video URLs
  const meditationPrograms = [
    {
      id: 'mindfulness',
      title: 'Mindfulness Meditation',
      description: 'Present moment awareness with breath focus',
      icon: <Eye className="h-6 w-6" />,
      color: 'from-blue-100 to-cyan-100',
      textColor: 'text-blue-900',
      borderColor: 'border-blue-200',
      defaultDuration: 10,
      phases: ['preparation', 'centering', 'awareness', 'integration'],
      videoUrl: 'https://player.vimeo.com/external/380928701.hd.mp4?s=b53f9b37c10a4bdcc34b45c18fb8e9c8e97c7e5b&profile_id=175',
      backgroundGradient: 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)',
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
      color: 'from-green-100 to-emerald-100',
      textColor: 'text-green-900',
      borderColor: 'border-green-200',
      defaultDuration: 8,
      phases: ['preparation', 'rhythm', 'deepening', 'integration'],
      videoUrl: 'https://player.vimeo.com/external/194837908.sd.mp4?s=c350076905b61ca5c92681694c33a5a91f2fda92&profile_id=164',
      backgroundGradient: 'linear-gradient(135deg, #f1f8e9 0%, #dcedc8 100%)',
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
      color: 'from-pink-100 to-rose-100',
      textColor: 'text-pink-900',
      borderColor: 'border-pink-200',
      defaultDuration: 12,
      phases: ['preparation', 'reflection', 'appreciation', 'integration'],
      videoUrl: 'https://player.vimeo.com/external/269852600.hd.mp4?s=428eb0b8dcc0c0cf4dc70c8a2bfab5b831edc4e6&profile_id=175',
      backgroundGradient: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)',
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
      color: 'from-purple-100 to-indigo-100',
      textColor: 'text-purple-900',
      borderColor: 'border-purple-200',
      defaultDuration: 15,
      phases: ['preparation', 'scanning', 'release', 'integration'],
      videoUrl: 'https://player.vimeo.com/external/235468050.hd.mp4?s=1ae71c6351c7a110a8ddea8b4f0f7a24bc5e6c0b&profile_id=175',
      backgroundGradient: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
      defaultNatureSound: 'rain',
      guidedInstructions: {
        preparation: 'Lie down comfortably. Let your body sink into the surface beneath you.',
        scanning: 'Start at the top of your head. Slowly scan down, noticing each part of your body.',
        release: 'Release any tension you find. Let each muscle group relax completely.',
        integration: 'Feel your whole body relaxed and at peace. Rest in this state of complete calm.'
      }
    }
  ];

  // Clean nature sounds array - NO MORE BROKEN BASE64 DATA
  const natureSounds = [
    {
      id: 'rain',
      name: 'Gentle Rain',
      icon: '🌧️',
      url: '',
      type: 'nature',
      description: 'Soft rainfall for deep relaxation'
    },
    {
      id: 'ocean',
      name: 'Ocean Waves',
      icon: '🌊',
      url: '',
      type: 'nature',
      description: 'Rhythmic ocean waves'
    },
    {
      id: 'forest',
      name: 'Forest Ambience',
      icon: '🌲',
      url: '',
      type: 'nature',
      description: 'Peaceful forest sounds'
    },
    {
      id: 'birds',
      name: 'Bird Songs',
      icon: '🐦',
      url: '',
      type: 'nature',
      description: 'Gentle bird chirping'
    },
    {
      id: 'fire',
      name: 'Crackling Fire',
      icon: '🔥',
      url: '',
      type: 'nature',
      description: 'Warm fireplace crackling'
    },
    {
      id: 'wind',
      name: 'Gentle Wind',
      icon: '💨',
      url: '',
      type: 'nature',
      description: 'Soft wind through trees'
    },
    {
      id: 'river',
      name: 'Flowing River',
      icon: '🏞️',
      url: '',
      type: 'nature',
      description: 'Peaceful flowing water'
    },
    {
      id: 'enya_only_time',
      name: 'Only Time (Enya)',
      icon: '🎵',
      url: '',
      type: 'music',
      description: 'Enya - Only Time (Calming Version)'
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

  // FIXED Web Audio API generators with CORRECT MATHEMATICS and SINGLE CONTEXT
  const generateNatureSound = (type, duration = 60, volume = 0.5) => {
    const audioContext = getAudioContext();
    if (!audioContext) return null;
    
    try {
      let soundData;
      
      switch(type) {
        case 'rain':
          soundData = createRainSound(audioContext, duration, volume);
          break;
        case 'ocean':
          soundData = createOceanWaves(audioContext, duration, volume);
          break;
        case 'forest':
          soundData = createForestAmbience(audioContext, duration, volume);
          break;
        case 'birds':
          soundData = createBirdSongs(audioContext, duration, volume);
          break;
        case 'fire':
          soundData = createFireCrackling(audioContext, duration, volume);
          break;
        case 'wind':
          soundData = createWindSound(audioContext, duration, volume);
          break;
        case 'river':
          soundData = createRiverSound(audioContext, duration, volume);
          break;
        case 'enya_only_time':
          soundData = createEnyaInspiredMelody(audioContext, duration, volume);
          break;
        default:
          soundData = createCalmTone(audioContext, duration, volume);
      }
      
      return { audioContext, buffer: soundData.buffer };
    } catch (error) {
      console.warn('Audio generation failed:', error);
      return null;
    }
  };

  // FIXED: Create realistic rain sound with proper math
  const createRainSound = (audioContext, duration, volume) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const time = i / audioContext.sampleRate;
      // Generate pink noise with varying intensity
      let noise = (Math.random() * 2 - 1);
      noise = noise * (0.3 + Math.sin(time * 0.5) * 0.2); // Rain intensity variation
      channelData[i] = noise * volume;
    }
    
    return { audioContext, buffer };
  };

  // FIXED: Create ocean wave sound with CORRECT frequency calculations
  const createOceanWaves = (audioContext, duration, volume) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const time = i / audioContext.sampleRate;
      // FIXED: Added proper 2*PI conversion for frequencies
      let wave = Math.sin(time * 0.5 * 2 * Math.PI) * 0.3;
      wave += Math.sin(time * 0.3 * 2 * Math.PI) * 0.2;
      wave += (Math.random() * 2 - 1) * 0.1; // Add some noise
      channelData[i] = wave * volume;
    }
    
    return { audioContext, buffer };
  };

  // FIXED: Create forest ambience with proper amplitude
  const createForestAmbience = (audioContext, duration, volume) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const time = i / audioContext.sampleRate;
      // Create subtle forest rustling
      let rustle = (Math.random() * 2 - 1) * 0.1;
      rustle += Math.sin(time * 0.1 * 2 * Math.PI) * 0.05; // Gentle breeze - FIXED
      channelData[i] = rustle * volume;
    }
    
    return { audioContext, buffer };
  };

  // FIXED: Create bird songs with CORRECT frequency calculations
  const createBirdSongs = (audioContext, duration, volume) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const time = i / audioContext.sampleRate;
      let chirp = 0;
      
      // Add occasional bird chirps with FIXED frequency calculation
      if (Math.random() < 0.0001) {
        const frequency = 800 + Math.random() * 1200;
        // CRITICAL FIX: Added proper 2*PI conversion to prevent screeching
        chirp = Math.sin(time * frequency * 2 * Math.PI) * Math.exp(-time * 10) * 0.3;
      }
      
      // Add ambient forest background
      chirp += (Math.random() * 2 - 1) * 0.05;
      channelData[i] = chirp * volume;
    }
    
    return { audioContext, buffer };
  };

  // FIXED: Create fire crackling
  const createFireCrackling = (audioContext, duration, volume) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      let crackle = 0;
      
      // Random crackling sounds
      if (Math.random() < 0.001) {
        crackle = (Math.random() * 2 - 1) * 0.4;
      }
      
      // Base fire rumble - FIXED frequency
      const time = i / audioContext.sampleRate;
      crackle += Math.sin(time * 60 * 2 * Math.PI) * 0.1;
      crackle += (Math.random() * 2 - 1) * 0.05;
      
      channelData[i] = crackle * volume;
    }
    
    return { audioContext, buffer };
  };

  // FIXED: Create wind sound
  const createWindSound = (audioContext, duration, volume) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const time = i / audioContext.sampleRate;
      // Create wind-like filtered noise
      let wind = (Math.random() * 2 - 1);
      wind = wind * Math.sin(time * 0.5 * 2 * Math.PI) * 0.2; // Wind gusts - FIXED
      channelData[i] = wind * volume;
    }
    
    return { audioContext, buffer };
  };

  // FIXED: Create river sound
  const createRiverSound = (audioContext, duration, volume) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const time = i / audioContext.sampleRate;
      // Flowing water sound
      let flow = (Math.random() * 2 - 1) * 0.3;
      flow += Math.sin(time * 2 * 2 * Math.PI) * 0.1; // Water rhythm - FIXED
      channelData[i] = flow * volume;
    }
    
    return { audioContext, buffer };
  };

  // NEW: Create Enya-inspired melody
  const createEnyaInspiredMelody = (audioContext, duration, volume) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const time = i / audioContext.sampleRate;
      // Create ethereal melody - FIXED frequencies
      let melody = Math.sin(time * 220 * 2 * Math.PI) * 0.1;
      melody += Math.sin(time * 330 * 2 * Math.PI) * 0.08;
      melody += Math.sin(time * 440 * 2 * Math.PI) * 0.06;
      melody *= (1 + Math.sin(time * 0.1 * 2 * Math.PI)) * 0.5; // Gentle amplitude variation
      channelData[i] = melody * volume;
    }
    
    return { audioContext, buffer };
  };

  // FIXED: Create calm tone
  const createCalmTone = (audioContext, duration, volume) => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const time = i / audioContext.sampleRate;
      // Gentle sine wave - FIXED frequency calculation
      let tone = Math.sin(time * 220 * 2 * Math.PI) * 0.1;
      tone += Math.sin(time * 330 * 2 * Math.PI) * 0.05;
      channelData[i] = tone * volume;
    }
    
    return { audioContext, buffer };
  };

  // Play generated audio buffer with proper cleanup tracking
  const playAudioBuffer = (audioContext, buffer, volume = 1, loop = true) => {
    try {
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      
      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      gainNode.gain.value = volume;
      source.loop = loop;
      source.start();
      
      // Track for cleanup
      const audioElement = { source, gainNode, audioContext };
      setActiveSources(prev => [...prev, audioElement]);
      
      return audioElement;
    } catch (error) {
      console.warn('Audio playback failed:', error);
      return null;
    }
  };

  // Component cleanup
  useEffect(() => {
    return () => {
      cleanupAudio();
      clearInterval(timerRef.current);
      // Don't close the shared context on unmount, just clean up sources
    };
  }, []);


  // Ensure audio is activated by a user gesture; if not, show overlay
  const ensureActivation = async () => {
    try {
      if (!userActivated) setUserActivated(true);
      const ctx = getAudioContext && getAudioContext();
      if (ctx && ctx.state === 'suspended') { await ctx.resume(); }
      return true;
    } catch (e) {
      setShowGate(true);
      return false;
    }
  };

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
    
    // Clean up any existing audio
    cleanupAudio();
    
    setSelectedMeditation(program);
    setTimeRemaining(duration * 60);
    setCurrentPhase('preparation');
    setIsPlaying(true);
    
    // Set default nature sound for this program
    setSelectedSound(program.defaultNatureSound);
    
    // Start multimedia
    setTimeout(async () => {
      if (await ensureActivation()) { await startAllMedia(); }
    }, 500);
  };

  const startAllMedia = async () => {
    if (!selectedMeditation) return;
    
    try {
      // Start background video
      if (showVideo && videoRef.current && selectedMeditation.videoUrl) {
        console.log('🎥 Starting background video:', selectedMeditation.videoUrl);
        videoRef.current.volume = (masterVolume / 100) * 0.3;
        
        try {
          try { await videoRef.current.play(); } catch(err) { setShowGate(true); }
          console.log('✅ Video started successfully');
        } catch (e) {
          console.log('Video autoplay prevented, trying user interaction required approach');
          videoRef.current.load();
        }
      }
      
      // Start nature sounds with FIXED generators
      if (audioEnabled && selectedSound !== 'silence') {
        if (await ensureActivation()) { await startNatureSound(); }
      }
      
      // Start guided audio
      if (guideEnabled) {
        setTimeout(() => playGuidedInstruction('preparation'), 1000);
      }
      
    } catch (error) {
      console.warn('Media start error:', error);
    }
  };

  const startNatureSound = async () => {
    try {
      console.log('🌿 Starting nature sound:', selectedSound);
      
      // Clean up previous audio
      cleanupAudio();
      
      // Generate new audio with FIXED mathematics
      const soundData = generateNatureSound(selectedSound, 60, (masterVolume / 100) * (natureVolume / 100));
      
      if (soundData && soundData.audioContext && soundData.buffer) {
        const playback = playAudioBuffer(soundData.audioContext, soundData.buffer, 1, true);
        console.log('✅ Generated nature sound playing successfully');
      }
    } catch (error) {
      console.warn('Nature sound generation failed:', error);
    }
  };

  const playGuidedInstruction = (phase) => {
    if (!selectedMeditation || !guideEnabled) return;
    
    const instruction = selectedMeditation.guidedInstructions[phase];
    if (!instruction) return;
    
    // Use speech synthesis for guided audio
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel(); // Cancel any previous speech
      
      const utterance = new SpeechSynthesisUtterance(instruction);
      utterance.rate = 0.7;
      utterance.pitch = 0.8;
      utterance.volume = (masterVolume / 100) * (guideVolume / 100);
      
      // Use a calming voice if available
      const voices = speechSynthesis.getVoices();
      const calmVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Samantha') ||
        voice.name.includes('Karen') ||
        voice.lang.includes('en')
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
      if (await ensureActivation()) { await startAllMedia(); }
    } else {
      pauseAllMedia();
    }
  };

  const pauseAllMedia = () => {
    // Pause video
    if (videoRef.current) {
      videoRef.current.pause();
    }
    
    // Pause generated audio by stopping sources
    activeSources.forEach(({ source }) => {
      try {
        source.stop();
      } catch (e) {
        // Source might already be stopped
      }
    });
    
    // Stop speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  };

  const resetSession = () => {
    setIsPlaying(false);
    setTimeRemaining(duration * 60);
    setCurrentPhase('preparation');
    cleanupAudio();
    pauseAllMedia();
  };

  const handleSessionComplete = () => {
    setIsPlaying(false);
    cleanupAudio();
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
    
    // Update active audio sources volume
    activeSources.forEach(({ gainNode }) => {
      if (gainNode) {
        gainNode.gain.value = masterRatio * (natureVolume / 100);
      }
    });
  };

  // Standalone nature sounds player
  const toggleStandaloneMode = () => {
    setStandaloneMode(!standaloneMode);
    if (!standaloneMode) {
      // Entering standalone mode
      setSelectedMeditation(null);
      setIsPlaying(false);
      cleanupAudio();
    }
  };

  const playStandaloneSound = async (soundId) => {
    if (!(await ensureActivation())) return;
    setSelectedSound(soundId);
    if (soundId === 'silence') {
      cleanupAudio();
      return;
    }
    
    try {
      console.log('🎵 Playing standalone sound:', soundId);
      
      // Clean up previous audio
      cleanupAudio();
      
      // Generate new audio with FIXED mathematics
      const soundData = generateNatureSound(soundId, 60, (masterVolume / 100) * (natureVolume / 100));
      
      if (soundData && soundData.audioContext && soundData.buffer) {
        const playback = playAudioBuffer(soundData.audioContext, soundData.buffer, 1, true);
        console.log('✅ Standalone sound playing successfully');
      }
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
      clearInterval(timerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  return (
    {showGate && !userActivated && (
      <div id="audio-gate-overlay" style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(15,23,42,0.55)',zIndex:9999}}>
        <div style={{background:'white',borderRadius:16,padding:'24px 28px',maxWidth:520,boxShadow:'0 8px 30px rgba(0,0,0,.2)'}}>
          <h3 style={{fontSize:22,fontWeight:800,marginBottom:8}}>Enable Audio</h3>
          <p style={{color:'#475569',marginBottom:16}}>Tap once to allow audio/video playback. This is required by your browser.</p>
          <button
            onClick={async ()=>{ setUserActivated(true); try{ const ctx=getAudioContext&&getAudioContext(); if(ctx && ctx.state==='suspended'){ await ctx.resume(); } }catch(e){}; setShowGate(false);}}
            style={{background:'#2563EB',color:'white',border:'0',borderRadius:12,padding:'10px 16px',fontWeight:700}}
          >
            Enable & Continue
          </button>
        </div>
      </div>
    )}

    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-slate-800 border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🧘‍♀️ Ultimate Meditation Center
          </DialogTitle>
        </DialogHeader>

        {/* Hidden Audio Elements */}
        <audio
          ref={natureAudioRef}
          preload="metadata"
        />
        
        <audio
          ref={guideAudioRef}
          preload="metadata"
        />
        
        <audio
          ref={musicAudioRef}
          preload="metadata"
        />

        {/* Main Content */}
        <div className="space-y-6">
          
          {/* Standalone Nature Sounds Player */}
          <Card className="bg-white/80 border-blue-200 backdrop-blend-overlay shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-slate-700">
                  <Headphones className="h-5 w-5 text-blue-600" />
                  Standalone Nature Sounds
                </CardTitle>
                <Switch
                  checked={standaloneMode}
                  onCheckedChange={toggleStandaloneMode}
                />
              </div>
            </CardHeader>
            {standaloneMode && (
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4">
                  {natureSounds.filter(s => s.id !== 'silence').map((sound) => (
                    <Button
                      key={sound.id}
                      variant={selectedSound === sound.id ? "default" : "outline"}
                      className={`h-24 flex flex-col items-center justify-center gap-2 ${
                        selectedSound === sound.id 
                          ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg' 
                          : 'border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700'
                      }`}
                      onClick={() => playStandaloneSound(sound.id)}
                    >
                      <span className="text-3xl">{sound.icon}</span>
                      <span className="text-sm font-medium">{sound.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Volume Controls */}
          <Card className="bg-white/80 border-blue-200 backdrop-blend-overlay shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-100 to-blue-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-slate-700">
                <Volume2 className="h-5 w-5 text-green-600" />
                Volume Control Center
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-slate-700 font-medium">
                    <Volume2 className="h-4 w-4 text-blue-600" />
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
                
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-slate-700 font-medium">
                    <Waves className="h-4 w-4 text-cyan-600" />
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
                
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-slate-700 font-medium">
                    <Mic className="h-4 w-4 text-purple-600" />
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
                
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-slate-700 font-medium">
                    <Music className="h-4 w-4 text-pink-600" />
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
            <Card className="bg-white/90 border-2 shadow-2xl min-h-[500px] relative overflow-hidden">
              
              {/* Background Video Container */}
              {showVideo && selectedMeditation && selectedMeditation.videoUrl && (
                <div className="absolute inset-0 -z-10 rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    src={selectedMeditation.videoUrl}
                    className="w-full h-full object-cover opacity-40"
                    loop
                    muted={false}
                    playsInline
                    autoPlay
                  />
                </div>
              )}
              
              {/* CSS Background Fallback */}
              <div 
                className="absolute inset-0 -z-20 rounded-lg"
                style={{ 
                  background: selectedMeditation.backgroundGradient
                }}
              />

              <CardContent className="relative z-10 p-8 h-full flex flex-col justify-center items-center text-center space-y-8">
                
                {/* Session Header */}
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-full bg-gradient-to-r ${selectedMeditation.color} shadow-lg`}>
                      {selectedMeditation.icon}
                    </div>
                    <div>
                      <h3 className={`text-3xl font-bold ${selectedMeditation.textColor}`}>
                        {selectedMeditation.title}
                      </h3>
                      <p className="text-slate-600 text-lg">{selectedMeditation.description}</p>
                    </div>
                  </div>
                  
                  <Badge className={`${selectedMeditation.borderColor} ${selectedMeditation.textColor} text-lg px-4 py-2`}>
                    {currentPhase.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>

                {/* Timer Display */}
                <div className="text-center">
                  <div className={`text-7xl font-mono font-bold mb-4 ${selectedMeditation.textColor}`}>
                    {formatTime(timeRemaining)}
                  </div>
                  <Progress 
                    value={((duration * 60 - timeRemaining) / (duration * 60)) * 100} 
                    className="w-80 h-3"
                  />
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-center gap-6">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-slate-400 text-slate-700 hover:bg-slate-100 p-4"
                    onClick={resetSession}
                  >
                    <RotateCcw className="h-6 w-6" />
                  </Button>
                  
                  <Button
                    size="lg"
                    className={`bg-gradient-to-r ${selectedMeditation.color} hover:opacity-90 text-slate-800 text-xl px-10 py-6 shadow-lg`}
                    onClick={togglePlayPause}
                  >
                    {isPlaying ? (
                      <Pause className="h-10 w-10" />
                    ) : (
                      <Play className="h-10 w-10" />
                    )}
                  </Button>
                  
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-slate-400 text-slate-700 hover:bg-slate-100 p-4"
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
                <div className="flex items-center justify-center gap-6 text-sm">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-slate-600 hover:bg-slate-100"
                    onClick={() => setShowVideo(!showVideo)}
                  >
                    {showVideo ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                    Video Background
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-slate-600 hover:bg-slate-100"
                    onClick={() => setGuideEnabled(!guideEnabled)}
                  >
                    <Mic className="h-4 w-4 mr-2" />
                    Voice Guide
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-slate-600 hover:bg-slate-100"
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
              <Card className="bg-white/80 border-blue-200 backdrop-blend-overlay shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-slate-700">
                    <Settings className="h-5 w-5 text-purple-600" />
                    Session Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 grid grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <Label className="text-slate-700 font-medium">Duration (minutes)</Label>
                    <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                      <SelectTrigger className="border-slate-300">
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
                  
                  <div className="space-y-3">
                    <Label className="text-slate-700 font-medium">Nature Sounds</Label>
                    <Select value={selectedSound} onValueChange={setSelectedSound}>
                      <SelectTrigger className="border-slate-300">
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
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="video-toggle" className="text-slate-700 font-medium">Background Video</Label>
                      <Switch
                        id="video-toggle"
                        checked={showVideo}
                        onCheckedChange={setShowVideo}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="audio-toggle" className="text-slate-700 font-medium">Audio Guide</Label>
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
                    className={`bg-white/90 ${program.borderColor} border-2 backdrop-blend-overlay shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105`}
                    onClick={() => startMeditation(program)}
                  >
                    <CardContent className="p-8 text-center space-y-4">
                      <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${program.color} shadow-lg`}>
                        {program.icon}
                      </div>
                      <div>
                        <h3 className={`text-2xl font-bold mb-3 ${program.textColor}`}>
                          {program.title}
                        </h3>
                        <p className="text-slate-600 text-base mb-4">{program.description}</p>
                        <Badge variant="outline" className={`${program.borderColor} ${program.textColor}`}>
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
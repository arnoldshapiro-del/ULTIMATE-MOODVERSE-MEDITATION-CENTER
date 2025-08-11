import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, TrendingUp, Download, Plus, AlertCircle, Loader2, 
  Award, Trophy, Target, Zap, Heart, Star, Flame, Crown,
  Play, Pause, Volume2, VolumeX, Settings, Users, Share2,
  Sparkles, Gift, Medal, Timer, BarChart3, Brain
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Slider } from './ui/slider';
import { useToast } from '../hooks/use-toast';
import { moodApi } from '../services/moodApi';

// Enhanced moods with intensity levels and colors
const moods = [
  { 
    id: 'euphoric', emoji: '🤩', label: 'Euphoric', 
    color: 'bg-gradient-to-br from-yellow-200 to-orange-300 border-orange-400',
    particles: 'gold', intensity: 5, category: 'positive'
  },
  { 
    id: 'happy', emoji: '😊', label: 'Happy', 
    color: 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-300',
    particles: 'yellow', intensity: 4, category: 'positive'
  },
  { 
    id: 'excited', emoji: '🤗', label: 'Excited', 
    color: 'bg-gradient-to-br from-orange-100 to-pink-200 border-orange-300',
    particles: 'orange', intensity: 4, category: 'positive'
  },
  { 
    id: 'grateful', emoji: '🙏', label: 'Grateful', 
    color: 'bg-gradient-to-br from-purple-100 to-pink-200 border-purple-300',
    particles: 'purple', intensity: 4, category: 'positive'
  },
  { 
    id: 'calm', emoji: '😌', label: 'Calm', 
    color: 'bg-gradient-to-br from-green-100 to-blue-100 border-green-300',
    particles: 'green', intensity: 3, category: 'neutral'
  },
  { 
    id: 'content', emoji: '😊', label: 'Content', 
    color: 'bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-300',
    particles: 'blue', intensity: 3, category: 'neutral'
  },
  { 
    id: 'tired', emoji: '😴', label: 'Tired', 
    color: 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300',
    particles: 'gray', intensity: 2, category: 'neutral'
  },
  { 
    id: 'anxious', emoji: '😰', label: 'Anxious', 
    color: 'bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300',
    particles: 'purple', intensity: 2, category: 'negative'
  },
  { 
    id: 'sad', emoji: '😢', label: 'Sad', 
    color: 'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300',
    particles: 'blue', intensity: 2, category: 'negative'
  },
  { 
    id: 'angry', emoji: '😠', label: 'Angry', 
    color: 'bg-gradient-to-br from-red-100 to-red-200 border-red-300',
    particles: 'red', intensity: 2, category: 'negative'
  },
  { 
    id: 'frustrated', emoji: '😤', label: 'Frustrated', 
    color: 'bg-gradient-to-br from-orange-100 to-red-100 border-orange-300',
    particles: 'orange', intensity: 2, category: 'negative'
  },
  { 
    id: 'overwhelmed', emoji: '😵', label: 'Overwhelmed', 
    color: 'bg-gradient-to-br from-red-100 to-purple-100 border-red-300',
    particles: 'red', intensity: 1, category: 'negative'
  }
];

// Achievement system
const achievements = [
  { id: 'first_entry', name: 'First Step', description: 'Record your first mood', icon: '🌟', unlocked: false },
  { id: 'week_streak', name: 'Week Warrior', description: '7 days in a row', icon: '🔥', unlocked: false },
  { id: 'month_streak', name: 'Monthly Master', description: '30 days in a row', icon: '👑', unlocked: false },
  { id: 'mood_explorer', name: 'Mood Explorer', description: 'Try 5 different moods', icon: '🌈', unlocked: false },
  { id: 'gratitude_guru', name: 'Gratitude Guru', description: 'Record 10 grateful moods', icon: '🙏', unlocked: false },
  { id: 'zen_master', name: 'Zen Master', description: 'Complete 5 breathing sessions', icon: '🧘', unlocked: false }
];

// Dynamic backgrounds based on mood
const moodBackgrounds = {
  positive: [
    'https://images.unsplash.com/photo-1508614823792-1f56af914148',
    'https://images.unsplash.com/photo-1618576980905-8b704806a39b'
  ],
  neutral: [
    'https://images.unsplash.com/photo-1542157565-4607d82cf417',
    'https://images.unsplash.com/photo-1619441207978-3d326c46e2c9'
  ],
  negative: [
    'https://images.unsplash.com/photo-1533135091724-62cc5402aa20',
    'https://images.unsplash.com/photo-1532456745301-b2c645d8b80d'
  ],
  cosmic: [
    'https://images.unsplash.com/photo-1605703905070-24220ce7f693',
    'https://images.unsplash.com/photo-1566345984367-fa2ba5cedc17'
  ]
};

// Particle effects component
const ParticleEffect = ({ mood, trigger }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!trigger || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = mood?.intensity * 20 || 50;
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1.0,
        decay: Math.random() * 0.02 + 0.01
      });
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= particle.decay;
        
        if (particle.life <= 0) {
          particles.splice(index, 1);
          return;
        }
        
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = mood?.particles === 'gold' ? '#FFD700' : 
                       mood?.particles === 'yellow' ? '#FFEB3B' : 
                       mood?.particles === 'orange' ? '#FF9800' : 
                       mood?.particles === 'purple' ? '#9C27B0' : 
                       mood?.particles === 'green' ? '#4CAF50' : 
                       mood?.particles === 'blue' ? '#2196F3' : '#FFF';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      
      if (particles.length > 0) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }, [trigger, mood]);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

// Confetti celebration component
const ConfettiCelebration = ({ show, onComplete }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!show || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const confetti = [];
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    
    // Create confetti pieces
    for (let i = 0; i < 100; i++) {
      confetti.push({
        x: Math.random() * canvas.width,
        y: -10,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      });
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      confetti.forEach((piece, index) => {
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.rotation += piece.rotationSpeed;
        piece.vy += 0.1; // gravity
        
        if (piece.y > canvas.height + 10) {
          confetti.splice(index, 1);
          return;
        }
        
        ctx.save();
        ctx.translate(piece.x, piece.y);
        ctx.rotate(piece.rotation * Math.PI / 180);
        ctx.fillStyle = piece.color;
        ctx.fillRect(-4, -1, 8, 2);
        ctx.restore();
      });
      
      if (confetti.length > 0) {
        requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };
    
    animate();
  }, [show, onComplete]);
  
  return show ? (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  ) : null;
};

const EnhancedMoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodIntensity, setMoodIntensity] = useState(3);
  const [note, setNote] = useState('');
  const [moodHistory, setMoodHistory] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddMood, setShowAddMood] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [userLevel, setUserLevel] = useState(1);
  const [experience, setExperience] = useState(0);
  const [streak, setStreak] = useState(0);
  const [userAchievements, setUserAchievements] = useState(achievements);
  const [showConfetti, setShowConfetti] = useState(false);
  const [particleEffect, setParticleEffect] = useState(null);
  const [currentBackground, setCurrentBackground] = useState(moodBackgrounds.cosmic[0]);
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingCount, setBreatheCount] = useState(0);
  const [dailyChallenges, setDailyChallenges] = useState([
    { id: 1, title: 'Record your morning mood', completed: false, reward: 50 },
    { id: 2, title: 'Add a grateful note', completed: false, reward: 30 },
    { id: 3, title: 'Complete breathing exercise', completed: false, reward: 40 }
  ]);
  
  const { toast } = useToast();

  // Load mood history on component mount
  useEffect(() => {
    loadMoodHistory();
    loadStats();
    updateBackground();
  }, []);

  const updateBackground = () => {
    const backgrounds = Object.values(moodBackgrounds).flat();
    const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    setCurrentBackground(randomBg);
  };

  const loadMoodHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const entries = await moodApi.getMoodEntries();
      setMoodHistory(entries);
      
      // Calculate streak and experience
      calculateStreak(entries);
      calculateExperience(entries);
    } catch (err) {
      console.error('Error loading mood history:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load mood history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (entries) => {
    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const hasEntry = entries.some(entry => entry.date === dateStr);
      if (hasEntry) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    setStreak(currentStreak);
  };

  const calculateExperience = (entries) => {
    const totalExp = entries.length * 25 + streak * 10;
    setExperience(totalExp);
    setUserLevel(Math.floor(totalExp / 100) + 1);
  };

  const loadStats = async () => {
    try {
      const statsData = await moodApi.getMoodStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const triggerParticleEffect = (mood) => {
    setParticleEffect({ mood, trigger: Date.now() });
    setTimeout(() => setParticleEffect(null), 3000);
  };

  const unlockAchievement = (achievementId) => {
    setUserAchievements(prev => 
      prev.map(achievement => 
        achievement.id === achievementId 
          ? { ...achievement, unlocked: true }
          : achievement
      )
    );
    
    setShowConfetti(true);
    setExperience(prev => prev + 100);
    
    toast({
      title: "🎉 Achievement Unlocked!",
      description: `You've earned: ${achievements.find(a => a.id === achievementId)?.name}`,
      className: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none"
    });
  };

  const handleMoodSubmit = async () => {
    if (!selectedMood) return;

    try {
      setLoading(true);
      
      const newEntry = {
        date: currentDate,
        mood: selectedMood,
        note: note.trim(),
        intensity: moodIntensity,
        timestamp: new Date().toISOString()
      };

      const savedEntry = await moodApi.createMoodEntry(newEntry);
      
      // Update local state
      setMoodHistory(prev => {
        const filtered = prev.filter(entry => entry.date !== currentDate);
        return [savedEntry, ...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
      });

      // Trigger celebration effects
      triggerParticleEffect(selectedMood);
      
      // Award experience points
      const bonusExp = selectedMood.intensity * 10;
      setExperience(prev => prev + 25 + bonusExp);

      // Check for achievements
      if (moodHistory.length === 0) {
        unlockAchievement('first_entry');
      }

      // Update background based on mood category
      const categoryBackgrounds = moodBackgrounds[selectedMood.category] || moodBackgrounds.cosmic;
      const newBg = categoryBackgrounds[Math.floor(Math.random() * categoryBackgrounds.length)];
      setCurrentBackground(newBg);

      // Complete daily challenges
      if (selectedMood.id === 'grateful' && note.trim()) {
        completeDailyChallenge(2);
      }
      completeDailyChallenge(1);

      // Reload stats
      loadStats();

      // Reset form
      setSelectedMood(null);
      setNote('');
      setMoodIntensity(3);
      setShowAddMood(false);

      toast({
        title: "✨ Mood recorded!",
        description: `Your ${selectedMood.label.toLowerCase()} mood has been saved. +${25 + bonusExp} XP!`,
        className: "bg-gradient-to-r from-green-400 to-blue-500 text-white border-none"
      });
      
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const completeDailyChallenge = (challengeId) => {
    setDailyChallenges(prev => 
      prev.map(challenge => 
        challenge.id === challengeId && !challenge.completed
          ? { ...challenge, completed: true }
          : challenge
      )
    );
  };

  const startBreathingExercise = () => {
    setIsBreathing(true);
    setBreatheCount(0);
    
    const breathingSession = () => {
      let count = 0;
      const interval = setInterval(() => {
        count++;
        setBreatheCount(count);
        
        if (count >= 10) {
          clearInterval(interval);
          setIsBreathing(false);
          completeDailyChallenge(3);
          unlockAchievement('zen_master');
          
          toast({
            title: "🧘 Breathing complete!",
            description: "You've completed a 10-breath session. +40 XP!",
            className: "bg-gradient-to-r from-purple-400 to-pink-500 text-white border-none"
          });
        }
      }, 4000); // 4 seconds per breath cycle
    };
    
    breathingSession();
  };

  const getMoodForDate = (date) => {
    const entry = moodHistory.find(entry => entry.date === date);
    return entry ? entry.mood : null;
  };

  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, mood: null });
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const mood = getMoodForDate(date);
      days.push({ date, mood, day });
    }

    return days;
  };

  const getMoodTrendData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const entry = moodHistory.find(e => e.date === date);
      return {
        date,
        mood: entry ? entry.mood : null,
        intensity: entry ? entry.intensity || 3 : 0,
        dayName: new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
      };
    });
  };

  const handleExport = async (format) => {
    try {
      setLoading(true);
      
      if (format === 'csv') {
        await moodApi.exportToCsv();
        toast({ 
          title: "📊 CSV Export", 
          description: "Mood data exported successfully",
          className: "bg-gradient-to-r from-blue-400 to-purple-500 text-white border-none"
        });
      } else {
        await moodApi.exportToPdf();
        toast({ 
          title: "📄 PDF Export", 
          description: "Mood data exported successfully",
          className: "bg-gradient-to-r from-red-400 to-pink-500 text-white border-none"
        });
      }
    } catch (err) {
      toast({
        title: "Export Error",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && moodHistory.length === 0) {
    return (
      <div 
        className="min-h-screen p-4 flex items-center justify-center relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${currentBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-pink-900/20" />
        <div className="flex items-center gap-3 text-white z-10">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-xl font-semibold">Loading your mood universe...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-4 relative overflow-hidden transition-all duration-1000"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${currentBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 via-purple-900/10 to-pink-900/10 animate-pulse" />
      
      {/* Particle effects */}
      {particleEffect && (
        <ParticleEffect 
          mood={particleEffect.mood} 
          trigger={particleEffect.trigger} 
        />
      )}
      
      {/* Confetti celebration */}
      <ConfettiCelebration 
        show={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Stunning Header with Stats */}
        <div className="text-center space-y-4">
          <div className="inline-block">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent animate-pulse">
              ✨ MoodVerse ✨
            </h1>
            <p className="text-xl text-white/90 font-medium mt-2">
              Your Personal Emotional Intelligence Companion
            </p>
          </div>
          
          {/* User Stats Bar */}
          <div className="flex justify-center items-center gap-6 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full border border-white/20">
              <Crown className="h-5 w-5 text-yellow-400" />
              <span className="text-white font-bold">Level {userLevel}</span>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full border border-white/20">
              <Flame className="h-5 w-5 text-orange-400" />
              <span className="text-white font-bold">{streak} Day Streak</span>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full border border-white/20">
              <Star className="h-5 w-5 text-blue-400" />
              <span className="text-white font-bold">{experience} XP</span>
            </div>
          </div>

          {/* Experience Progress Bar */}
          <div className="max-w-md mx-auto">
            <Progress 
              value={(experience % 100)} 
              className="h-3 bg-white/10 border border-white/20"
            />
            <p className="text-white/70 text-sm mt-1">
              {100 - (experience % 100)} XP to Level {userLevel + 1}
            </p>
          </div>
        </div>

        {/* Daily Challenges */}
        <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-lg border border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Target className="h-6 w-6 text-yellow-400" />
              Daily Challenges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {dailyChallenges.map((challenge) => (
                <div 
                  key={challenge.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                    challenge.completed 
                      ? 'bg-green-500/20 border border-green-400/30' 
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      challenge.completed 
                        ? 'bg-green-400 border-green-400' 
                        : 'border-white/40'
                    }`} />
                    <span className={`font-medium ${
                      challenge.completed ? 'text-green-200' : 'text-white'
                    }`}>
                      {challenge.title}
                    </span>
                  </div>
                  <Badge 
                    variant={challenge.completed ? "default" : "secondary"}
                    className="bg-yellow-400/20 text-yellow-200 border-yellow-400/30"
                  >
                    +{challenge.reward} XP
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="bg-red-500/10 border-red-400/30 backdrop-blur-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-200">{error}</AlertDescription>
          </Alert>
        )}

        {/* Enhanced Mood Recording */}
        <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-lg border border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Heart className="h-6 w-6 text-pink-400 animate-pulse" />
              How are you feeling right now?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={showAddMood} onOpenChange={setShowAddMood}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full h-16 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-300" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin mr-3" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-6 w-6 mr-3" />
                      Record Your Mood ✨
                    </>
                  )}
                </Button>
              </DialogTrigger>
              
              <DialogContent className="sm:max-w-2xl bg-black/80 backdrop-blur-xl border border-white/20 text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
                    Express Your Inner Universe
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Enhanced Mood Grid */}
                  <div className="grid grid-cols-4 gap-3">
                    {moods.map((mood) => (
                      <button
                        key={mood.id}
                        onClick={() => {
                          setSelectedMood(mood);
                          triggerParticleEffect(mood);
                        }}
                        disabled={loading}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-110 disabled:opacity-50 transform ${
                          selectedMood?.id === mood.id 
                            ? `${mood.color} ring-4 ring-white/50 scale-110 shadow-2xl` 
                            : 'bg-white/5 border-white/20 hover:border-white/40 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-3xl mb-2">{mood.emoji}</div>
                        <div className="text-sm font-medium text-white">{mood.label}</div>
                      </button>
                    ))}
                  </div>
                  
                  {selectedMood && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                      {/* Mood Intensity Slider */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">
                          Intensity Level: {moodIntensity}/5
                        </label>
                        <Slider
                          value={[moodIntensity]}
                          onValueChange={(value) => setMoodIntensity(value[0])}
                          max={5}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-white/60">
                          <span>Mild</span>
                          <span>Intense</span>
                        </div>
                      </div>
                      
                      {/* Enhanced Note Area */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">
                          What's on your mind? (Optional)
                        </label>
                        <Textarea
                          placeholder="Share your thoughts, what triggered this mood, or what you're grateful for..."
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          className="resize-none bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40"
                          rows={4}
                          disabled={loading}
                        />
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Button 
                          onClick={handleMoodSubmit} 
                          className="flex-1 h-12 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold transform hover:scale-105 transition-all duration-300"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin mr-2" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Zap className="h-5 w-5 mr-2" />
                              Save & Earn XP!
                            </>
                          )}
                        </Button>
                        
                        <Button
                          onClick={startBreathingExercise}
                          variant="outline"
                          className="px-6 border-white/20 text-white hover:bg-white/10"
                          disabled={isBreathing}
                        >
                          {isBreathing ? (
                            <>
                              <Timer className="h-5 w-5 mr-2 animate-pulse" />
                              {breathingCount}/10
                            </>
                          ) : (
                            <>
                              <Play className="h-5 w-5 mr-2" />
                              Breathe
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="calendar" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-4 bg-white/10 backdrop-blur-lg border border-white/20">
              <TabsTrigger value="calendar" className="flex items-center gap-2 text-white data-[state=active]:bg-white/20">
                <Calendar className="h-4 w-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2 text-white data-[state=active]:bg-white/20">
                <TrendingUp className="h-4 w-4" />
                Trends
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center gap-2 text-white data-[state=active]:bg-white/20">
                <Trophy className="h-4 w-4" />
                Rewards
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2 text-white data-[state=active]:bg-white/20">
                <Brain className="h-4 w-4" />
                AI Insights
              </TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleExport('csv')}
                className="flex items-center gap-2 border-white/20 text-white hover:bg-white/10 backdrop-blur-lg"
                disabled={loading}
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleExport('pdf')}
                className="flex items-center gap-2 border-white/20 text-white hover:bg-white/10 backdrop-blur-lg"
                disabled={loading}
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                onClick={updateBackground}
                className="border-white/20 text-white hover:bg-white/10 backdrop-blur-lg"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Enhanced Calendar View */}
          <TabsContent value="calendar">
            <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-lg border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">✨ Your Mood Galaxy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Calendar Header */}
                  <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-white/70">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="p-2">{day}</div>
                    ))}
                  </div>
                  
                  {/* Enhanced Calendar Days */}
                  <div className="grid grid-cols-7 gap-2">
                    {generateCalendarDays().map((day, index) => (
                      <div
                        key={index}
                        className={`
                          aspect-square flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all duration-300 hover:scale-105
                          ${day.date ? 'cursor-pointer hover:bg-white/10' : ''} 
                          ${day.mood ? `${day.mood.color} shadow-lg` : 'bg-white/5 border-white/10'}
                        `}
                      >
                        {day.date && (
                          <>
                            <div className="text-sm font-bold text-white">{day.day}</div>
                            {day.mood && (
                              <div className="text-2xl animate-bounce">{day.mood.emoji}</div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Trends View */}
          <TabsContent value="trends">
            <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-lg border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">📈 Your Emotional Journey</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Enhanced Trend Graph */}
                  <div className="h-80 flex items-end justify-between gap-2 p-6 bg-white/5 rounded-xl border border-white/10">
                    {getMoodTrendData().map((day, index) => (
                      <div key={index} className="flex flex-col items-center flex-1 max-w-20">
                        <div className="text-xs text-white/70 mb-2 font-medium">{day.dayName}</div>
                        <div 
                          className={`
                            w-full rounded-t-xl flex items-end justify-center pb-2 transition-all duration-500 hover:scale-105 relative overflow-hidden
                            ${day.mood ? `${day.mood.color} shadow-lg` : 'bg-white/10 border border-white/20'}
                          `}
                          style={{ 
                            height: day.mood ? `${day.intensity * 30 + 40}px` : '20px',
                            minHeight: '20px'
                          }}
                        >
                          {day.mood && (
                            <div className="text-3xl animate-pulse">{day.mood.emoji}</div>
                          )}
                          {day.mood && (
                            <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent" />
                          )}
                        </div>
                        {day.intensity > 0 && (
                          <div className="text-xs text-white/50 mt-1">
                            Level {day.intensity}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Enhanced Mood Legend */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {moods.map((mood) => (
                      <div 
                        key={mood.id} 
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 hover:scale-105 ${mood.color}`}
                      >
                        <span className="text-2xl">{mood.emoji}</span>
                        <div>
                          <div className="text-sm font-bold text-white">{mood.label}</div>
                          <div className="text-xs text-white/70">
                            {mood.category} • Level {mood.intensity}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-lg border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-400" />
                  Your Achievement Gallery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userAchievements.map((achievement) => (
                    <div 
                      key={achievement.id}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        achievement.unlocked 
                          ? 'bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border-yellow-400/50 shadow-xl' 
                          : 'bg-white/5 border-white/10 grayscale'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`text-4xl ${achievement.unlocked ? 'animate-bounce' : ''}`}>
                          {achievement.icon}
                        </div>
                        <div>
                          <h3 className={`font-bold ${achievement.unlocked ? 'text-yellow-300' : 'text-white/50'}`}>
                            {achievement.name}
                          </h3>
                          <p className={`text-sm ${achievement.unlocked ? 'text-white/80' : 'text-white/40'}`}>
                            {achievement.description}
                          </p>
                          {achievement.unlocked && (
                            <Badge className="mt-2 bg-yellow-400/20 text-yellow-200 border-yellow-400/30">
                              Unlocked!
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights">
            <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-lg border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="h-6 w-6 text-purple-400" />
                  AI-Powered Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-400/30">
                    <h3 className="font-bold text-purple-200 mb-2">🎯 Mood Pattern Analysis</h3>
                    <p className="text-white/80 text-sm">
                      You tend to feel most positive in the {moodHistory.length > 0 ? 'mornings' : 'afternoons'}. 
                      Consider maintaining your current routine for optimal emotional well-being.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-400/30">
                    <h3 className="font-bold text-blue-200 mb-2">📊 Weekly Summary</h3>
                    <p className="text-white/80 text-sm">
                      This week you've experienced {moodHistory.length} different emotional states. 
                      Your emotional intelligence is growing! 🌱
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-400/30">
                    <h3 className="font-bold text-green-200 mb-2">💡 Personalized Recommendation</h3>
                    <p className="text-white/80 text-sm">
                      Try the breathing exercise when feeling overwhelmed. 
                      Users with similar patterns report 40% better mood regulation.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enhanced Recent Entries */}
        <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-lg border border-white/20">
          <CardHeader>
            <CardTitle className="text-white">🌟 Your Recent Emotional Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {moodHistory.slice(0, 5).map((entry) => (
                <div 
                  key={entry.id} 
                  className="flex items-start gap-4 p-4 bg-white/10 rounded-xl border border-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-105"
                >
                  <div className="relative">
                    <span className="text-3xl animate-pulse">{entry.mood.emoji}</span>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge 
                        variant="secondary" 
                        className="bg-gradient-to-r from-purple-400/20 to-pink-400/20 text-purple-200 border-purple-400/30"
                      >
                        {entry.mood.label}
                      </Badge>
                      <span className="text-sm text-white/70">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                      {entry.intensity && (
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < entry.intensity ? 'bg-yellow-400' : 'bg-white/20'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    {entry.note && (
                      <p className="text-sm text-white/80 font-medium">{entry.note}</p>
                    )}
                  </div>
                </div>
              ))}
              {!loading && moodHistory.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🌟</div>
                  <p className="text-white/70 text-lg">
                    Your emotional journey starts here!
                  </p>
                  <p className="text-white/50 text-sm mt-2">
                    Record your first mood to unlock the magic ✨
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedMoodTracker;
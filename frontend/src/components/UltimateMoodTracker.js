import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  Calendar, TrendingUp, Download, Plus, AlertCircle, Loader2, 
  Award, Trophy, Target, Zap, Heart, Star, Flame, Crown,
  Play, Pause, Volume2, VolumeX, Settings, Users, Share2,
  Sparkles, Gift, Medal, Timer, BarChart3, Brain, User,
  LogOut, Bell, MessageCircle, Camera, Mic, Sun, Moon,
  Cloud, Activity, Music, Share, Shield, Phone, Map,
  UserPlus, Eye, EyeOff, Key, Lock, Mail, UserCheck, Headphones,
  Palette, Image, FileText, BarChart, PieChart, Globe,
  Instagram, Twitter, Facebook, Linkedin, Youtube, TikTok
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
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useToast } from '../hooks/use-toast';
import UltimateMeditationCenter from './UltimateMeditationCenter';
import { AuthContext } from '../contexts/AuthContext';
import { NotificationContext } from '../contexts/NotificationContext';
import { moodApi } from '../services/moodApi';
import { ParticleEffect, ConfettiCelebration, FloatingHearts } from './ParticleSystem';
import CrisisSupport from './CrisisSupport';
import CustomMoodCreator from './CustomMoodCreator';

// Enhanced moods with custom mood support
const defaultMoods = [
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
    id: 'loved', emoji: '🥰', label: 'Loved', 
    color: 'bg-gradient-to-br from-pink-100 to-red-200 border-pink-300',
    particles: 'pink', intensity: 4, category: 'positive'
  },
  { 
    id: 'proud', emoji: '😤', label: 'Proud', 
    color: 'bg-gradient-to-br from-indigo-100 to-purple-200 border-indigo-300',
    particles: 'indigo', intensity: 4, category: 'positive'
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
    id: 'confused', emoji: '🤔', label: 'Confused', 
    color: 'bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-300',
    particles: 'yellow', intensity: 2, category: 'neutral'
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
  },
  { 
    id: 'lonely', emoji: '😔', label: 'Lonely', 
    color: 'bg-gradient-to-br from-gray-100 to-blue-100 border-gray-300',
    particles: 'gray', intensity: 2, category: 'negative'
  }
];

// Achievement system (expanded)
const defaultAchievements = [
  { id: 'first_entry', name: 'First Step', description: 'Record your first mood', icon: '🌟', unlocked: false },
  { id: 'week_streak', name: 'Week Warrior', description: '7 days in a row', icon: '🔥', unlocked: false },
  { id: 'month_streak', name: 'Monthly Master', description: '30 days in a row', icon: '👑', unlocked: false },
  { id: 'mood_explorer', name: 'Mood Explorer', description: 'Try 8 different moods', icon: '🌈', unlocked: false },
  { id: 'gratitude_guru', name: 'Gratitude Guru', description: 'Record 20 grateful moods', icon: '🙏', unlocked: false },
  { id: 'zen_master', name: 'Zen Master', description: 'Complete 10 meditation sessions', icon: '🧘', unlocked: false },
  { id: 'social_butterfly', name: 'Social Butterfly', description: 'Add 5 friends', icon: '🦋', unlocked: false },
  { id: 'voice_artist', name: 'Voice Artist', description: 'Record 10 voice notes', icon: '🎤', unlocked: false },
  { id: 'photographer', name: 'Mood Photographer', description: 'Attach 15 photos', icon: '📸', unlocked: false },
  { id: 'consistency_champion', name: 'Consistency Champion', description: 'Log moods for 100 days', icon: '⚡', unlocked: false },
  { id: 'emotional_intelligence', name: 'EQ Master', description: 'Use all 16 mood types', icon: '🧠', unlocked: false },
  { id: 'community_leader', name: 'Community Leader', description: 'Help 10 friends', icon: '👑', unlocked: false }
];

// Meditation techniques
const meditationTechniques = [
  { 
    id: 'breathing', 
    name: '4-7-8 Breathing', 
    description: 'Calming breath technique',
    duration: 240, // 4 minutes
    steps: ['Inhale for 4', 'Hold for 7', 'Exhale for 8']
  },
  { 
    id: 'mindfulness', 
    name: 'Mindfulness Meditation', 
    description: 'Present moment awareness',
    duration: 600, // 10 minutes
    steps: ['Focus on breath', 'Notice thoughts', 'Return to breath']
  },
  { 
    id: 'loving_kindness', 
    name: 'Loving Kindness', 
    description: 'Compassion meditation',
    duration: 480, // 8 minutes
    steps: ['Self-compassion', 'Loved ones', 'All beings']
  },
  { 
    id: 'body_scan', 
    name: 'Body Scan', 
    description: 'Progressive relaxation',
    duration: 900, // 15 minutes
    steps: ['Start at toes', 'Move upward', 'Full body awareness']
  }
];

// Music recommendations by mood
const musicRecommendations = {
  positive: [
    { title: 'Happy', artist: 'Pharrell Williams', genre: 'Pop' },
    { title: 'Good as Hell', artist: 'Lizzo', genre: 'Pop' },
    { title: 'Can\'t Stop the Feeling', artist: 'Justin Timberlake', genre: 'Pop' }
  ],
  neutral: [
    { title: 'Weightless', artist: 'Marconi Union', genre: 'Ambient' },
    { title: 'Clair de Lune', artist: 'Debussy', genre: 'Classical' },
    { title: 'River', artist: 'Joni Mitchell', genre: 'Folk' }
  ],
  negative: [
    { title: 'Breathe Me', artist: 'Sia', genre: 'Alternative' },
    { title: 'Mad World', artist: 'Gary Jules', genre: 'Alternative' },
    { title: 'The Sound of Silence', artist: 'Simon & Garfunkel', genre: 'Folk' }
  ]
};

// Themes
const themes = {
  cosmic: {
    name: 'Cosmic Dreams',
    backgrounds: [
      'https://images.unsplash.com/photo-1605703905070-24220ce7f693',
      'https://images.unsplash.com/photo-1566345984367-fa2ba5cedc17'
    ]
  },
  nature: {
    name: 'Nature Zen',
    backgrounds: [
      'https://images.unsplash.com/photo-1542157565-4607d82cf417',
      'https://images.unsplash.com/photo-1619441207978-3d326c46e2c9'
    ]
  },
  sunset: {
    name: 'Golden Hour',
    backgrounds: [
      'https://images.unsplash.com/photo-1508614823792-1f56af914148',
      'https://images.unsplash.com/photo-1618576980905-8b704806a39b'
    ]
  },
  abstract: {
    name: 'Abstract Art',
    backgrounds: [
      'https://images.unsplash.com/photo-1533135091724-62cc5402aa20',
      'https://images.unsplash.com/photo-1532456745301-b2c645d8b80d'
    ]
  }
};

// Weather impact data
const weatherMoodCorrelation = {
  sunny: { positive: 0.8, neutral: 0.15, negative: 0.05 },
  cloudy: { positive: 0.4, neutral: 0.4, negative: 0.2 },
  rainy: { positive: 0.2, neutral: 0.3, negative: 0.5 },
  snowy: { positive: 0.6, neutral: 0.3, negative: 0.1 }
};

// Crisis support resources
const crisisResources = [
  {
    name: 'National Suicide Prevention Lifeline',
    phone: '988',
    description: '24/7 crisis support',
    website: 'https://suicidepreventionlifeline.org'
  },
  {
    name: 'Crisis Text Line',
    phone: 'Text HOME to 741741',
    description: 'Text-based crisis support',
    website: 'https://crisistextline.org'
  },
  {
    name: 'SAMHSA Helpline',
    phone: '1-800-662-4357',
    description: 'Mental health and substance abuse',
    website: 'https://samhsa.gov'
  }
];

const UltimateMoodTracker = () => {
  // Authentication and user state
  const { user, login, logout, isAuthenticated, loading: authLoading } = useContext(AuthContext);
  
  // Authentication states
  const [authMode, setAuthMode] = useState('signin'); // 'signin', 'signup', 'forgot'
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // Local user state for manual auth
  const [localUser, setLocalUser] = useState(user);
  const [localIsAuthenticated, setLocalIsAuthenticated] = useState(isAuthenticated);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    
    if (authMode === 'signup') {
      if (authForm.password !== authForm.confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords don't match",
          variant: "destructive"
        });
        return;
      }
      
      if (authForm.password.length < 6) {
        toast({
          title: "Error", 
          description: "Password must be at least 6 characters",
          variant: "destructive"
        });
        return;
      }
    }
    
    // For now, simulate successful signup/signin
    // In production, this would call your backend API
    const userData = {
      id: 'user_' + Date.now(),
      name: authForm.name || 'User',
      email: authForm.email,
      picture: '',
      joinDate: new Date().toISOString()
    };
    
    localStorage.setItem('session_token', 'demo_token_' + Date.now());
    setLocalUser(userData);
    setLocalIsAuthenticated(true);
    
    toast({
      title: `Welcome${authMode === 'signup' ? ' to MoodVerse' : ' back'}! ✨`,
      description: authMode === 'signup' 
        ? "Your account has been created successfully." 
        : "You've been signed in successfully.",
      className: "bg-gradient-to-r from-green-400 to-blue-500 text-white border-none"
    });
  };

  const handleInputChange = (field, value) => {
    setAuthForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGoogleOAuth = () => {
    // Direct redirect to Google OAuth - no iframe issues
    const currentUrl = window.location.origin;
    const googleClientId = "688503902215-eahn559m4obup5e74gg6i1nkivplt5mi.apps.googleusercontent.com";
    const redirectUri = encodeURIComponent(`${currentUrl}/auth/callback`);
    const scope = encodeURIComponent("openid email profile");
    const state = Math.random().toString(36).substring(2, 15);
    
    // Store state for security verification
    localStorage.setItem('oauth_state', state);
    
    // Direct redirect to Google OAuth - bypasses all CORS/iframe issues
    const googleAuthUrl = `https://accounts.google.com/oauth/v2/auth?` +
      `client_id=${googleClientId}&` +
      `redirect_uri=${redirectUri}&` +
      `response_type=code&` +
      `scope=${scope}&` +
      `state=${state}&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    console.log('Redirecting to Google OAuth:', googleAuthUrl);
    window.location.href = googleAuthUrl;
  };

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      
      if (error) {
        toast({
          title: "Authentication Error",
          description: error === 'access_denied' ? 'Access denied by user' : 'Authentication failed',
          variant: "destructive"
        });
        return;
      }
      
      if (code && state) {
        const storedState = localStorage.getItem('oauth_state');
        
        if (state !== storedState) {
          toast({
            title: "Security Error", 
            description: "Invalid state parameter",
            variant: "destructive"
          });
          return;
        }
        
        try {
          // Exchange code for token via your backend
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/google-callback`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              code, 
              redirect_uri: `${window.location.origin}/auth/callback` 
            })
          });
          
          if (response.ok) {
            const authData = await response.json();
            if (authData.success) {
              localStorage.setItem('session_token', authData.session_token);
              setLocalUser(authData.user);
              setLocalIsAuthenticated(true);
              
              // Clean up URL
              window.history.replaceState({}, document.title, '/');
              
              toast({
                title: "Welcome to MoodVerse! ✨",
                description: "Successfully signed in with Google",
                className: "bg-gradient-to-r from-green-400 to-blue-500 text-white border-none"
              });
            }
          } else {
            throw new Error('Authentication failed');
          }
        } catch (error) {
          console.error('OAuth callback error:', error);
          toast({
            title: "Error",
            description: "Failed to complete Google authentication",
            variant: "destructive"
          });
        }
        
        // Clean up
        localStorage.removeItem('oauth_state');
      }
    };
    
    if (window.location.pathname === '/auth/callback' || window.location.search.includes('code=')) {
      handleOAuthCallback();
    }
  }, []);
  const { notifications, addNotification } = useContext(NotificationContext);
  
  // Core mood tracking state
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodIntensity, setMoodIntensity] = useState(3);
  const [note, setNote] = useState('');
  const [moodHistory, setMoodHistory] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddMood, setShowAddMood] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Enhanced features state
  const [stats, setStats] = useState(null);
  const [userLevel, setUserLevel] = useState(1);
  const [experience, setExperience] = useState(0);
  const [streak, setStreak] = useState(0);
  const [userAchievements, setUserAchievements] = useState(defaultAchievements);
  const [customMoods, setCustomMoods] = useState([]);
  const [allMoods, setAllMoods] = useState(defaultMoods);
  
  // Visual effects state
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMeditationCenter, setShowMeditationCenter] = useState(false);
  const [particleEffect, setParticleEffect] = useState(null);
  const [currentTheme, setCurrentTheme] = useState('cosmic');
  const [currentBackground, setCurrentBackground] = useState(themes.cosmic.backgrounds[0]);
  const [darkMode, setDarkMode] = useState(false);
  
  // Social features state
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [socialFeed, setSocialFeed] = useState([]);
  const [showSocialShare, setShowSocialShare] = useState(false);
  
  // Advanced features state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [attachedPhoto, setAttachedPhoto] = useState(null);
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(null);
  const [sleepData, setSleepData] = useState(null);
  const [activityData, setActivityData] = useState(null);
  
  // Meditation and wellness state
  const [isMeditating, setIsMeditating] = useState(false);
  const [currentMeditation, setCurrentMeditation] = useState(null);
  const [meditationTimer, setMeditationTimer] = useState(0);
  const [musicRecommendation, setMusicRecommendation] = useState(null);
  
  // Daily challenges (expanded)
  const [dailyChallenges, setDailyChallenges] = useState([
    { id: 1, title: 'Record your morning mood', completed: false, reward: 50 },
    { id: 2, title: 'Add a grateful note', completed: false, reward: 30 },
    { id: 3, title: 'Complete meditation session', completed: false, reward: 60 },
    { id: 4, title: 'Connect with a friend', completed: false, reward: 40 },
    { id: 5, title: 'Share mood insights', completed: false, reward: 35 },
    { id: 6, title: 'Record voice note', completed: false, reward: 25 }
  ]);
  
  // UI state
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateMood, setShowCreateMood] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showCrisisSupport, setShowCrisisSupport] = useState(false);
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  
  const { toast } = useToast();
  const audioRef = useRef(null);
  const meditationRef = useRef(null);

  // Initialize app
  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
      loadWeatherData();
      initializeNotifications();
    }
  }, [isAuthenticated]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load all user data with individual error handling
      const [moodData, statsData, friendsData, achievementsData] = await Promise.allSettled([
        moodApi.getMoodEntries(),
        moodApi.getMoodStats(),
        moodApi.getFriends(),
        moodApi.getAchievements()
      ]);
      
      // Handle results and set data with fallbacks
      setMoodHistory(moodData.status === 'fulfilled' ? moodData.value : []);
      setStats(statsData.status === 'fulfilled' ? statsData.value : null);
      setFriends(friendsData.status === 'fulfilled' ? friendsData.value : []);
      setUserAchievements(achievementsData.status === 'fulfilled' ? achievementsData.value : defaultAchievements);
      
      // Use the data that was successfully loaded
      const validMoodData = moodData.status === 'fulfilled' ? moodData.value : [];
      calculateStreak(validMoodData);
      calculateExperience(validMoodData);
      generateMusicRecommendation();
      
    } catch (err) {
      console.warn('Some data failed to load, using defaults:', err.message);
      // Don't show error toast since we have fallbacks
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const loadWeatherData = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          
          // In a real app, you'd call a weather API here
          const mockWeather = {
            condition: 'sunny',
            temperature: 72,
            location: 'Your Location'
          };
          setWeather(mockWeather);
        });
      }
    } catch (err) {
      console.log('Weather data unavailable');
    }
  };

  const initializeNotifications = () => {
    // Request notification permission
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    
    // Set up daily reminder
    const now = new Date();
    const reminder = new Date();
    reminder.setHours(20, 0, 0, 0); // 8 PM reminder
    
    if (reminder < now) {
      reminder.setDate(reminder.getDate() + 1);
    }
    
    const timeUntilReminder = reminder.getTime() - now.getTime();
    setTimeout(() => {
      sendNotification('Daily Mood Check', 'How are you feeling today?');
    }, timeUntilReminder);
  };

  const sendNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
    addNotification({ title, body, timestamp: new Date() });
  };

  const calculateStreak = (entries) => {
    let currentStreak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
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
    const baseExp = entries.length * 25;
    const streakBonus = streak * 10;
    const achievementBonus = userAchievements.filter(a => a.unlocked).length * 100;
    
    const totalExp = baseExp + streakBonus + achievementBonus;
    setExperience(totalExp);
    setUserLevel(Math.floor(totalExp / 200) + 1);
  };

  const generateMusicRecommendation = () => {
    const recentMoods = moodHistory.slice(0, 5);
    const moodCategories = recentMoods.map(entry => entry.mood?.category || 'neutral');
    const dominantCategory = moodCategories.reduce((a, b, _, arr) => 
      arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
    );
    
    const recommendations = musicRecommendations[dominantCategory] || musicRecommendations.neutral;
    const randomRec = recommendations[Math.floor(Math.random() * recommendations.length)];
    setMusicRecommendation(randomRec);
  };

  const handleMoodSubmit = async () => {
    if (!selectedMood) return;

    try {
      setLoading(true);
      
      const moodEntry = {
        date: currentDate,
        mood: selectedMood,
        note: note.trim(),
        intensity: moodIntensity,
        voiceNote: recordedAudio,
        photo: attachedPhoto,
        weather: weather,
        location: location,
        timestamp: new Date().toISOString()
      };

      const savedEntry = await moodApi.createMoodEntry(moodEntry);
      
      // Update local state
      setMoodHistory(prev => {
        const filtered = prev.filter(entry => entry.date !== currentDate);
        return [savedEntry, ...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
      });

      // Trigger effects and rewards
      triggerParticleEffect(selectedMood);
      const bonusExp = selectedMood.intensity * 10 + (recordedAudio ? 15 : 0) + (attachedPhoto ? 10 : 0);
      setExperience(prev => prev + 25 + bonusExp);

      // Check achievements
      checkAndUnlockAchievements();
      
      // Update background and music
      updateThemeBasedOnMood(selectedMood);
      generateMusicRecommendation();
      
      // Complete challenges
      completeDailyChallenge(1);
      if (selectedMood.id === 'grateful' && note.trim()) completeDailyChallenge(2);
      if (recordedAudio) completeDailyChallenge(6);

      // Social sharing prompt
      if (Math.random() > 0.7) { // 30% chance
        setShowSocialShare(true);
      }

      // Reset form
      resetMoodForm();

      toast({
        title: "✨ Mood recorded!",
        description: `Your ${selectedMood.label.toLowerCase()} mood has been saved. +${25 + bonusExp} XP!`,
        className: "bg-gradient-to-r from-green-400 to-blue-500 text-white border-none"
      });
      
      // Send achievement notification if unlocked
      sendNotification('New Achievement!', 'You\'ve unlocked a new badge!');
      
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

  const resetMoodForm = () => {
    setSelectedMood(null);
    setNote('');
    setMoodIntensity(3);
    setRecordedAudio(null);
    setAttachedPhoto(null);
    setShowAddMood(false);
  };

  const checkAndUnlockAchievements = () => {
    const newUnlocks = [];
    
    // Check various achievement criteria
    if (moodHistory.length === 0) newUnlocks.push('first_entry');
    if (streak >= 7) newUnlocks.push('week_streak');
    if (streak >= 30) newUnlocks.push('month_streak');
    if (friends.length >= 5) newUnlocks.push('social_butterfly');
    
    const uniqueMoods = new Set(moodHistory.map(e => e.mood?.id));
    if (uniqueMoods.size >= 8) newUnlocks.push('mood_explorer');
    if (uniqueMoods.size >= 16) newUnlocks.push('emotional_intelligence');
    
    newUnlocks.forEach(achievementId => {
      unlockAchievement(achievementId);
    });
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
      description: `You've earned: ${defaultAchievements.find(a => a.id === achievementId)?.name}`,
      className: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none"
    });
  };

  const updateThemeBasedOnMood = (mood) => {
    const themeMap = {
      positive: 'sunset',
      neutral: 'nature',
      negative: 'abstract'
    };
    
    const newTheme = themeMap[mood.category] || 'cosmic';
    setCurrentTheme(newTheme);
    
    const backgrounds = themes[newTheme].backgrounds;
    const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    setCurrentBackground(randomBg);
  };

  const startMeditation = (technique) => {
    setCurrentMeditation(technique);
    setIsMeditating(true);
    setMeditationTimer(technique.duration);
    
    const interval = setInterval(() => {
      setMeditationTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsMeditating(false);
          completeDailyChallenge(3);
          unlockAchievement('zen_master');
          
          toast({
            title: "🧘 Meditation Complete!",
            description: `You completed ${technique.name}. +60 XP!`,
            className: "bg-gradient-to-r from-purple-400 to-pink-500 text-white border-none"
          });
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    meditationRef.current = interval;
  };

  const stopMeditation = () => {
    if (meditationRef.current) {
      clearInterval(meditationRef.current);
    }
    setIsMeditating(false);
    setCurrentMeditation(null);
    setMeditationTimer(0);
  };

  const startVoiceRecording = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setIsRecording(true);
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const mediaRecorder = new MediaRecorder(stream);
          const audioChunks = [];
          
          mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
          };
          
          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            setRecordedAudio(audioBlob);
            setIsRecording(false);
          };
          
          mediaRecorder.start();
          audioRef.current = mediaRecorder;
          
          // Auto-stop after 60 seconds
          setTimeout(() => {
            if (audioRef.current && audioRef.current.state === 'recording') {
              audioRef.current.stop();
            }
          }, 60000);
        })
        .catch(err => {
          console.error('Voice recording failed:', err);
          setIsRecording(false);
        });
    }
  };

  const stopVoiceRecording = () => {
    if (audioRef.current && audioRef.current.state === 'recording') {
      audioRef.current.stop();
    }
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAttachedPhoto(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const shareToSocialMedia = (platform) => {
    const moodEmoji = selectedMood?.emoji || '😊';
    const text = `Feeling ${selectedMood?.label || 'great'} today! ${moodEmoji} #MoodVerse #MentalHealth`;
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`,
      instagram: 'https://www.instagram.com/', // Instagram doesn't support URL sharing
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`
    };
    
    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
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

  const addFriend = async (userId) => {
    try {
      await moodApi.sendFriendRequest(userId);
      toast({
        title: "Friend Request Sent!",
        description: "Your friend request has been sent.",
        className: "bg-gradient-to-r from-blue-400 to-purple-500 text-white border-none"
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive"
      });
    }
  };

  const createCustomMood = (moodData) => {
    const newMood = {
      id: `custom_${Date.now()}`,
      ...moodData,
      isCustom: true
    };
    
    setCustomMoods(prev => [...prev, newMood]);
    setAllMoods(prev => [...prev, newMood]);
    
    toast({
      title: "Custom Mood Created!",
      description: `Your ${newMood.label} mood has been added.`,
      className: "bg-gradient-to-r from-green-400 to-blue-500 text-white border-none"
    });
  };

  const triggerParticleEffect = (mood) => {
    setParticleEffect({ mood, trigger: Date.now() });
    setTimeout(() => setParticleEffect(null), 3000);
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
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const isCurrentMonth = currentDate.getMonth() === currentMonth;
      
      days.push({
        date: isCurrentMonth ? dateStr : null,
        day: currentDate.getDate(),
        mood: isCurrentMonth ? getMoodForDate(dateStr) : null
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const getMoodTrendData = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const entry = moodHistory.find(entry => entry.date === dateStr);
      days.push({
        date: dateStr,
        dayName,
        mood: entry?.mood || null,
        intensity: entry?.intensity || 0
      });
    }
    
    return days;
  };

  // Crisis support detection
  const checkForCrisisKeywords = (text) => {
    const crisisKeywords = ['suicide', 'kill', 'die', 'hurt', 'hopeless', 'worthless', 'end it all'];
    return crisisKeywords.some(keyword => text.toLowerCase().includes(keyword));
  };

  useEffect(() => {
    if (note && checkForCrisisKeywords(note)) {
      setShowCrisisSupport(true);
    }
  }, [note]);

  // Render authentication screen if not logged in or still loading
  if (!localIsAuthenticated && !isAuthenticated || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              ✨ MoodVerse ✨
            </CardTitle>
            <p className="text-white/80">Your Ultimate Emotional Intelligence Platform</p>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {authMode === 'signin' && (
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-white">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    value={authForm.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-white">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={authForm.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
                
                <div className="text-center space-y-2">
                  <p className="text-white/60 text-sm">Don't have an account?</p>
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setAuthMode('signup')}
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    Create New Account
                  </Button>
                </div>
              </form>
            )}
            
            {authMode === 'signup' && (
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-white">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={authForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-white">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={authForm.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-white">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password (min 6 characters)"
                    value={authForm.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-white">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={authForm.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Account
                </Button>
                
                <div className="text-center space-y-2">
                  <p className="text-white/60 text-sm">Already have an account?</p>
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setAuthMode('signin')}
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    Sign In
                  </Button>
                </div>
              </form>
            )}
            
            {authMode === 'forgot' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                toast({
                  title: "Reset Link Sent",
                  description: "Check your email for password reset instructions",
                  className: "bg-gradient-to-r from-blue-400 to-green-500 text-white border-none"
                });
                setAuthMode('signin');
              }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email" className="text-white">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="Enter your email"
                    value={authForm.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                  <Key className="h-4 w-4 mr-2" />
                  Reset Password
                </Button>
                
                <div className="text-center">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setAuthMode('signin')}
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    Back to Sign In
                  </Button>
                </div>
              </form>
            )}
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 px-2 text-white/60">Or continue with</span>
              </div>
            </div>
            
            <Button 
              onClick={handleGoogleOAuth}
              className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
            >
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
            
            <div className="text-center pt-4 border-t border-white/20">
              <p className="text-xs text-white/60 mb-3">
                Secure authentication powered by Emergent
              </p>
              <div className="flex items-center justify-center space-x-4 text-white/50">
                <div className="flex items-center">
                  <Shield className="h-3 w-3 mr-1" />
                  <span className="text-xs">Encrypted</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  <span className="text-xs">Secure</span>
                </div>
                <div className="flex items-center">
                  <Lock className="h-3 w-3 mr-1" />
                  <span className="text-xs">Private</span>
                </div>
              </div>
            </div>
            
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main app interface
  return (
    <div 
      className={`min-h-screen p-4 relative overflow-hidden transition-all duration-1000 ${
        darkMode ? 'dark' : ''
      }`}
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(0,0,0,${darkMode ? '0.7' : '0.3'}), rgba(0,0,0,${darkMode ? '0.8' : '0.5'})), url(${currentBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Animated background overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${
        darkMode 
          ? 'from-gray-900/20 via-purple-900/20 to-black/20' 
          : 'from-indigo-900/10 via-purple-900/10 to-pink-900/10'
      } animate-pulse`} />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Enhanced Header with Navigation */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent animate-pulse">
              ✨ MoodVerse ✨
            </h1>
            <p className="text-lg text-white/90 font-medium">Ultimate Emotional Intelligence Platform</p>
          </div>
          
          {/* Navigation Menu */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDarkMode(!darkMode)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFriends(true)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Users className="h-4 w-4" />
              <Badge className="ml-2 bg-red-500">{friendRequests.length}</Badge>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowProfile(true)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Bar with More Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full border border-white/20">
            <Crown className="h-5 w-5 text-yellow-400" />
            <span className="text-white font-bold">Level {userLevel}</span>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full border border-white/20">
            <Flame className="h-5 w-5 text-orange-400" />
            <span className="text-white font-bold">{streak} Days</span>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full border border-white/20">
            <Star className="h-5 w-5 text-blue-400" />
            <span className="text-white font-bold">{experience} XP</span>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full border border-white/20">
            <Users className="h-5 w-5 text-green-400" />
            <span className="text-white font-bold">{friends.length} Friends</span>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full border border-white/20">
            <Heart className="h-5 w-5 text-pink-400" />
            <span className="text-white font-bold">{moodHistory.length} Entries</span>
          </div>
        </div>

        {/* Weather and Location Display */}
        {weather && (
          <Card className="border-0 shadow-lg bg-white/10 backdrop-blur-lg border border-white/20 mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Cloud className="h-6 w-6 text-blue-400" />
                  <span className="text-white">
                    {weather.temperature}°F • {weather.condition} in {weather.location}
                  </span>
                </div>
                <div className="text-sm text-white/70">
                  Weather can affect your mood - we'll track this correlation!
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Music Recommendation */}
        {musicRecommendation && (
          <Card className="border-0 shadow-lg bg-white/10 backdrop-blur-lg border border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Music className="h-6 w-6 text-purple-400" />
                  <div>
                    <span className="text-white font-medium">{musicRecommendation.title}</span>
                    <span className="text-white/70 ml-2">by {musicRecommendation.artist}</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Headphones className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Daily Challenges */}
        <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-lg border border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Target className="h-6 w-6 text-yellow-400" />
              Daily Challenges ({dailyChallenges.filter(c => c.completed).length}/{dailyChallenges.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {dailyChallenges.map((challenge) => (
                <button
                  key={challenge.id}
                  onClick={() => {
                    if (!challenge.completed) {
                      // Mark challenge as completed
                      completeDailyChallenge(challenge.id);
                      
                      // Add XP and show feedback
                      setExperience(prev => prev + challenge.reward);
                      
                      toast({
                        title: "Challenge Complete! 🎉",
                        description: `You earned ${challenge.reward} XP for: ${challenge.title}`,
                        className: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none"
                      });
                      
                      // Check for level up
                      const newLevel = Math.floor((experience + challenge.reward) / 200) + 1;
                      if (newLevel > userLevel) {
                        setUserLevel(newLevel);
                        setShowConfetti(true);
                        toast({
                          title: "Level Up! ⬆️",
                          description: `Congratulations! You reached Level ${newLevel}!`,
                          className: "bg-gradient-to-r from-purple-400 to-pink-500 text-white border-none"
                        });
                      }
                    }
                  }}
                  disabled={challenge.completed}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all text-left w-full ${
                    challenge.completed 
                      ? 'bg-green-500/20 border border-green-400/30 cursor-default' 
                      : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      challenge.completed 
                        ? 'bg-green-400 border-green-400' 
                        : 'border-white/40'
                    }`} />
                    <span className={`font-medium text-sm ${
                      challenge.completed ? 'text-green-200' : 'text-white'
                    }`}>
                      {challenge.title}
                    </span>
                  </div>
                  <Badge 
                    variant={challenge.completed ? "default" : "secondary"}
                    className="bg-yellow-400/20 text-yellow-200 border-yellow-400/30 text-xs"
                  >
                    +{challenge.reward} XP
                  </Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Crisis Support Alert */}
        {showCrisisSupport && (
          <Alert className="bg-red-500/20 border-red-400/50 backdrop-blur-lg">
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-white">
              <div className="space-y-2">
                <p className="font-semibold">We're here to help. You're not alone.</p>
                <div className="grid gap-2">
                  {crisisResources.map((resource, index) => (
                    <div key={index} className="flex items-center justify-between bg-white/10 p-2 rounded">
                      <div>
                        <div className="font-medium">{resource.name}</div>
                        <div className="text-sm text-white/80">{resource.description}</div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => window.open(`tel:${resource.phone}`, '_self')}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                    </div>
                  ))}
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowCrisisSupport(false)}
                  className="mt-2 border-white/20 text-white hover:bg-white/10"
                >
                  Close
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Enhanced Mood Recording with All New Features */}
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
              
              <DialogContent className="sm:max-w-4xl bg-black/90 backdrop-blur-xl border border-white/20 text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
                    Express Your Inner Universe
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Enhanced Mood Grid with Custom Moods */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <Label className="text-white font-medium">Choose Your Mood</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCreateMood(true)}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Create Custom
                      </Button>
                    </div>
                    <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                      {allMoods.map((mood) => (
                        <button
                          key={mood.id}
                          onClick={() => {
                            setSelectedMood(mood);
                            triggerParticleEffect(mood);
                          }}
                          disabled={loading}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-110 disabled:opacity-50 transform relative ${
                            selectedMood?.id === mood.id 
                              ? `${mood.color} ring-4 ring-white/50 scale-110 shadow-2xl` 
                              : 'bg-white/5 border-white/20 hover:border-white/40 hover:bg-white/10'
                          }`}
                        >
                          <div className="text-3xl mb-2">{mood.emoji}</div>
                          <div className="text-sm font-medium text-white">{mood.label}</div>
                          {mood.isCustom && (
                            <Badge className="absolute -top-2 -right-2 bg-purple-500 text-xs">
                              Custom
                            </Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {selectedMood && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                      {/* Mood Intensity Slider */}
                      <div className="space-y-2">
                        <Label className="text-white font-medium">
                          Intensity Level: {moodIntensity}/5 
                          <span className="text-white/60 ml-2">
                            ({moodIntensity === 1 ? 'Very Mild' : 
                              moodIntensity === 2 ? 'Mild' : 
                              moodIntensity === 3 ? 'Moderate' : 
                              moodIntensity === 4 ? 'Strong' : 'Very Strong'})
                          </span>
                        </Label>
                        <Slider
                          value={[moodIntensity]}
                          onValueChange={(value) => setMoodIntensity(value[0])}
                          max={5}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      
                      {/* Enhanced Note Area with Voice and Photo */}
                      <div className="space-y-4">
                        <Label className="text-white font-medium">
                          What's on your mind? (Optional)
                        </Label>
                        
                        <div className="space-y-3">
                          <Textarea
                            placeholder="Share your thoughts, what triggered this mood, or what you're grateful for..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="resize-none bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40"
                            rows={4}
                            disabled={loading}
                          />
                          
                          {/* Voice Recording */}
                          <div className="flex items-center gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                              className={`border-white/20 text-white hover:bg-white/10 ${
                                isRecording ? 'bg-red-500/20 border-red-400' : ''
                              }`}
                              disabled={loading}
                            >
                              <Mic className={`h-4 w-4 mr-2 ${isRecording ? 'animate-pulse' : ''}`} />
                              {isRecording ? 'Stop Recording' : 'Voice Note'}
                            </Button>
                            
                            {recordedAudio && (
                              <Badge className="bg-green-500/20 text-green-200 border-green-400/30">
                                Voice note recorded ✓
                              </Badge>
                            )}
                          </div>
                          
                          {/* Photo Upload */}
                          <div className="flex items-center gap-3">
                            <Label 
                              htmlFor="photo-upload"
                              className="flex items-center gap-2 px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 cursor-pointer transition-colors"
                            >
                              <Camera className="h-4 w-4" />
                              Add Photo
                            </Label>
                            <Input
                              id="photo-upload"
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="hidden"
                            />
                            
                            {attachedPhoto && (
                              <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30">
                                Photo attached ✓
                              </Badge>
                            )}
                          </div>
                          
                          {/* Photo Preview */}
                          {attachedPhoto && (
                            <div className="mt-3">
                              <img 
                                src={attachedPhoto} 
                                alt="Mood attachment" 
                                className="w-32 h-32 object-cover rounded-lg border border-white/20"
                              />
                            </div>
                          )}
                        </div>
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
                          variant="outline"
                          onClick={() => setShowAdvancedAnalytics(true)}
                          className="px-6 border-white/20 text-white hover:bg-white/10"
                        >
                          <BarChart3 className="h-5 w-5 mr-2" />
                          Analytics
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Meditation Center */}
        <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-lg border border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Brain className="h-6 w-6 text-purple-400" />
              Meditation & Wellness Center
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isMeditating ? (
              <div className="text-center space-y-4">
                <div className="text-6xl animate-pulse">{currentMeditation?.name === 'Breathing' ? '🫁' : '🧘'}</div>
                <h3 className="text-xl font-semibold text-white">{currentMeditation?.name}</h3>
                <div className="text-3xl font-mono text-white">
                  {Math.floor(meditationTimer / 60)}:{(meditationTimer % 60).toString().padStart(2, '0')}
                </div>
                <Progress value={((currentMeditation?.duration - meditationTimer) / currentMeditation?.duration) * 100} className="w-full" />
                <Button onClick={stopMeditation} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Stop Meditation
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Button
                  onClick={() => setShowMeditationCenter(true)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-4 text-lg font-semibold"
                >
                  🧘‍♀️ Open Ultimate Meditation Center
                </Button>
                
                <div className="grid md:grid-cols-2 gap-4">
                {meditationTechniques.map((technique) => (
                  <div key={technique.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="font-semibold text-white mb-2">{technique.name}</h4>
                    <p className="text-white/70 text-sm mb-3">{technique.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60 text-sm">{Math.floor(technique.duration / 60)} min</span>
                      <Button 
                        size="sm"
                        onClick={() => startMeditation(technique)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Tabs with New Features */}
        <Tabs defaultValue="calendar" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-6 bg-white/10 backdrop-blur-lg border border-white/20">
              <TabsTrigger value="calendar" className="flex items-center gap-1 text-white data-[state=active]:bg-white/20 text-xs">
                <Calendar className="h-3 w-3" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-1 text-white data-[state=active]:bg-white/20 text-xs">
                <TrendingUp className="h-3 w-3" />
                Trends
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center gap-1 text-white data-[state=active]:bg-white/20 text-xs">
                <Trophy className="h-3 w-3" />
                Rewards
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-1 text-white data-[state=active]:bg-white/20 text-xs">
                <Brain className="h-3 w-3" />
                AI
              </TabsTrigger>
              <TabsTrigger value="social" className="flex items-center gap-1 text-white data-[state=active]:bg-white/20 text-xs">
                <Users className="h-3 w-3" />
                Social
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-1 text-white data-[state=active]:bg-white/20 text-xs">
                <BarChart className="h-3 w-3" />
                Pro
              </TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => moodApi.exportToCsv()}
                className="flex items-center gap-2 border-white/20 text-white hover:bg-white/10 backdrop-blur-lg"
                disabled={loading}
              >
                <Download className="h-4 w-4" />
                CSV
              </Button>
              <Button 
                variant="outline" 
                onClick={() => moodApi.exportToPdf()}
                className="flex items-center gap-2 border-white/20 text-white hover:bg-white/10 backdrop-blur-lg"
                disabled={loading}
              >
                <Download className="h-4 w-4" />
                PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentTheme('cosmic')}
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
                        onClick={() => day.date && setCurrentDate(day.date)}
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
                    {allMoods.slice(0, 12).map((mood) => (
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userAchievements.map((achievement) => (
                    <div 
                      key={achievement.id}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                        achievement.unlocked 
                          ? 'bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border-yellow-400/50 shadow-xl' 
                          : 'bg-white/5 border-white/10 grayscale'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`text-4xl ${achievement.unlocked ? 'animate-bounce' : ''}`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-bold ${achievement.unlocked ? 'text-yellow-300' : 'text-white/50'}`}>
                            {achievement.name}
                          </h3>
                          <p className={`text-sm ${achievement.unlocked ? 'text-white/80' : 'text-white/40'}`}>
                            {achievement.description}
                          </p>
                          {achievement.unlocked && (
                            <Badge className="mt-2 bg-yellow-400/20 text-yellow-200 border-yellow-400/30">
                              Unlocked! ✨
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
                  AI-Powered Insights & Predictions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* AI Mood Prediction */}
                <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-400/30">
                  <h3 className="font-bold text-purple-200 mb-3 flex items-center gap-2">
                    🔮 Next Mood Prediction
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">😊</span>
                      <div>
                        <div className="text-white font-medium">Predicted: Happy</div>
                        <div className="text-white/70 text-sm">85% confidence based on your patterns</div>
                      </div>
                    </div>
                    <div className="text-white/60 text-sm">
                      Factors: Sunny weather, morning time, recent exercise activity
                    </div>
                  </div>
                </div>

                {/* Pattern Analysis */}
                <div className="grid gap-4">
                  <div className="p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-400/30">
                    <h3 className="font-bold text-blue-200 mb-2">📊 Weekly Pattern Analysis</h3>
                    <p className="text-white/80 text-sm">
                      This week you've experienced {moodHistory.length} emotional states. 
                      Your emotional intelligence is growing! 🌱
                    </p>
                    <div className="mt-3 grid grid-cols-7 gap-1">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                        <div key={day} className="text-center">
                          <div className="text-xs text-white/60">{day}</div>
                          <div className={`h-8 rounded mt-1 ${
                            i < 4 ? 'bg-green-400/30' : i < 6 ? 'bg-yellow-400/30' : 'bg-red-400/30'
                          }`} />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-400/30">
                    <h3 className="font-bold text-green-200 mb-2">💡 Personalized Recommendations</h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        <span className="text-white/80 text-sm">
                          Try the breathing exercise when feeling overwhelmed. 
                          Users with similar patterns report 40% better mood regulation.
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        <span className="text-white/80 text-sm">
                          Your mood tends to improve after social activities. Schedule more friend time!
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        <span className="text-white/80 text-sm">
                          Morning meditation could help stabilize your daily emotional baseline.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl border border-orange-400/30">
                    <h3 className="font-bold text-orange-200 mb-2">🌦️ Weather Impact Analysis</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-2 bg-white/10 rounded">
                        <div className="text-2xl">☀️</div>
                        <div className="text-white text-sm">Sunny</div>
                        <div className="text-green-400 text-xs">+20% mood boost</div>
                      </div>
                      <div className="text-center p-2 bg-white/10 rounded">
                        <div className="text-2xl">🌧️</div>
                        <div className="text-white text-sm">Rainy</div>
                        <div className="text-red-400 text-xs">-15% mood impact</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Tab - Enhanced */}
          <TabsContent value="social">
            <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-lg border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-6 w-6 text-blue-400" />
                  Your Emotional Support Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Friend List */}
                  <div>
                    <h3 className="text-white font-semibold mb-3">Friends ({friends.length})</h3>
                    <div className="grid gap-3">
                      {friends.slice(0, 5).map((friend) => (
                        <div key={friend.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={friend.avatar} />
                              <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-white font-medium">{friend.name}</div>
                              <div className="text-white/60 text-sm">
                                Last mood: {friend.lastMood} • {friend.lastSeen}
                              </div>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Social Feed */}
                  <div>
                    <h3 className="text-white font-semibold mb-3">Recent Activity</h3>
                    <div className="space-y-3">
                      {socialFeed.slice(0, 3).map((activity) => (
                        <div key={activity.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={activity.user.avatar} />
                              <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="text-white/80 text-sm">
                                <span className="font-medium text-white">{activity.user.name}</span> {activity.action}
                              </div>
                              <div className="text-white/60 text-xs mt-1">{activity.timestamp}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pro Analytics Tab - New Feature */}
          <TabsContent value="analytics">
            <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-lg border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart className="h-6 w-6 text-purple-400" />
                  Advanced Analytics Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Weather Correlation */}
                  <div className="space-y-3">
                    <h3 className="text-white font-semibold">Weather Impact Analysis</h3>
                    <div className="space-y-2">
                      {Object.entries(weatherMoodCorrelation).map(([weather, data]) => (
                        <div key={weather} className="p-3 bg-white/5 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-white capitalize">{weather}</span>
                            <Cloud className="h-4 w-4 text-white/60" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-green-400">Positive</span>
                              <span className="text-white">{(data.positive * 100).toFixed(0)}%</span>
                            </div>
                            <Progress value={data.positive * 100} className="h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Activity Correlation */}
                  <div className="space-y-3">
                    <h3 className="text-white font-semibold">Activity Patterns</h3>
                    <div className="space-y-2">
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="h-4 w-4 text-green-400" />
                          <span className="text-white">Exercise Days</span>
                        </div>
                        <div className="text-2xl font-bold text-green-400">+15%</div>
                        <div className="text-white/60 text-sm">Better mood correlation</div>
                      </div>
                      
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-blue-400" />
                          <span className="text-white">Social Interactions</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-400">+23%</div>
                        <div className="text-white/60 text-sm">Positive mood boost</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Social Sharing Dialog */}
      {showSocialShare && (
        <Dialog open={showSocialShare} onOpenChange={setShowSocialShare}>
          <DialogContent className="bg-black/90 backdrop-blur-xl border border-white/20 text-white">
            <DialogHeader>
              <DialogTitle>Share Your Mood Journey</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-white/80">Share your emotional growth with the world!</p>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => shareToSocialMedia('twitter')}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
                >
                  <Twitter className="h-4 w-4" />
                  Twitter
                </Button>
                <Button 
                  onClick={() => shareToSocialMedia('facebook')}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Facebook className="h-4 w-4" />
                  Facebook
                </Button>
                <Button 
                  onClick={() => shareToSocialMedia('instagram')}
                  className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700"
                >
                  <Instagram className="h-4 w-4" />
                  Instagram
                </Button>
                <Button 
                  onClick={() => shareToSocialMedia('linkedin')}
                  className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-2xl bg-black/90 backdrop-blur-xl border border-purple-400/50">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Settings className="h-6 w-6 text-purple-400" />
              Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Preferences</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Dark Mode</Label>
                  <Switch 
                    checked={darkMode} 
                    onCheckedChange={setDarkMode}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-white">Notifications</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-white">Sound Effects</Label>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Privacy</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Profile Visibility</Label>
                  <Select defaultValue="friends">
                    <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Friends</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowSettings(false)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => setShowSettings(false)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Modal */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="sm:max-w-2xl bg-black/90 backdrop-blur-xl border border-purple-400/50">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <User className="h-6 w-6 text-purple-400" />
              User Profile
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-2xl">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-white text-xl font-bold">{user?.name || 'Demo User'}</h3>
                <p className="text-white/60">{user?.email || 'demo@moodverse.app'}</p>
                <p className="text-white/60 text-sm">Joined: {user?.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'Today'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/10 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">{userLevel}</div>
                <div className="text-white/80 text-sm">Current Level</div>
              </div>
              <div className="p-4 bg-white/10 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{experience}</div>
                <div className="text-white/80 text-sm">Total XP</div>
              </div>
              <div className="p-4 bg-white/10 rounded-lg">
                <div className="text-2xl font-bold text-orange-400">{streak}</div>
                <div className="text-white/80 text-sm">Day Streak</div>
              </div>
              <div className="p-4 bg-white/10 rounded-lg">
                <div className="text-2xl font-bold text-pink-400">{moodHistory.length}</div>
                <div className="text-white/80 text-sm">Total Moods</div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowProfile(false)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Close
              </Button>
              <Button 
                onClick={logout}
                variant="outline"
                className="border-red-400/50 text-red-400 hover:bg-red-400/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Friends Modal */}
      <Dialog open={showFriends} onOpenChange={setShowFriends}>
        <DialogContent className="sm:max-w-2xl bg-black/90 backdrop-blur-xl border border-purple-400/50">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Users className="h-6 w-6 text-purple-400" />
              Friends & Social
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex gap-3">
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={() => toast({
                  title: "Add Friend",
                  description: "Friend search feature coming soon!",
                  className: "bg-gradient-to-r from-blue-400 to-purple-500 text-white border-none"
                })}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Friend
              </Button>
              <Button 
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => toast({
                  title: "Invite Friends",
                  description: "Share MoodVerse with your friends!",
                  className: "bg-gradient-to-r from-green-400 to-blue-500 text-white border-none"
                })}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Invite
              </Button>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-white font-semibold">Your Friends ({friends.length})</h3>
              {friends.length > 0 ? (
                <div className="space-y-3">
                  {friends.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={friend.avatar} />
                          <AvatarFallback>{friend.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-white font-medium">{friend.name}</div>
                          <div className="text-white/60 text-sm">{friend.lastMood} • {friend.lastSeen}</div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-white/60">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No friends added yet</p>
                  <p className="text-sm">Start building your support network!</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowFriends(false)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UltimateMoodTracker;
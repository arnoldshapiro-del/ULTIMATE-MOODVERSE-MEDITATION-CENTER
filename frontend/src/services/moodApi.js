import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

class UltimateMoodApiService {
  constructor() {
    this.userId = 'demo_user'; // In real app, this would come from auth context
  }

  // Enhanced mood entry creation
  async createMoodEntry(moodData) {
    try {
      const response = await axios.post(`${API}/moods`, {
        date: moodData.date,
        mood_id: moodData.mood.id,
        note: moodData.note,
        intensity: moodData.intensity || 3,
        voice_note_url: moodData.voiceNote ? 'demo-voice-url' : null,
        photo_url: moodData.photo ? 'demo-photo-url' : null,
        weather: moodData.weather,
        location: moodData.location,
        activity_data: moodData.activityData,
        sleep_data: moodData.sleepData,
        tags: moodData.tags || [],
        is_private: moodData.isPrivate || false,
        timestamp: moodData.timestamp
      }, {
        params: { user_id: this.userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating mood entry:', error);
      throw new Error(error.response?.data?.detail || 'Failed to save mood entry');
    }
  }

  // Get comprehensive mood entries
  async getMoodEntries(startDate = null, endDate = null, limit = 100) {
    try {
      const params = new URLSearchParams();
      params.append('user_id', this.userId);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (limit) params.append('limit', limit.toString());

      const response = await axios.get(`${API}/moods?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching mood entries:', error);
      throw new Error('Failed to load mood entries');
    }
  }

  // Get comprehensive mood statistics
  async getMoodStats() {
    try {
      const response = await axios.get(`${API}/moods/stats`, {
        params: { user_id: this.userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching mood stats:', error);
      throw new Error('Failed to load mood statistics');
    }
  }

  // Friends management
  async getFriends() {
    try {
      const response = await axios.get(`${API}/friends`, {
        params: { user_id: this.userId }
      });
      
      // Mock friends data for demo
      return [
        {
          id: 'friend_1',
          name: 'Alex Johnson',
          email: 'alex@example.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
          status: 'accepted',
          lastMood: '😊 Happy',
          lastSeen: '2 hours ago',
          sharedStreak: 5
        },
        {
          id: 'friend_2',
          name: 'Sarah Chen',
          email: 'sarah@example.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
          status: 'accepted',
          lastMood: '🧘 Calm',
          lastSeen: '1 day ago',
          sharedStreak: 12
        },
        {
          id: 'friend_3',
          name: 'Mike Rodriguez',
          email: 'mike@example.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
          status: 'accepted',
          lastMood: '🤗 Excited',
          lastSeen: '3 hours ago',
          sharedStreak: 8
        }
      ];
    } catch (error) {
      console.error('Error fetching friends:', error);
      return [];
    }
  }

  async sendFriendRequest(targetUserId) {
    try {
      const response = await axios.post(`${API}/friends/request`, null, {
        params: { 
          target_user_id: targetUserId,
          user_id: this.userId
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw new Error('Failed to send friend request');
    }
  }

  // Achievements
  async getAchievements() {
    try {
      const response = await axios.get(`${API}/achievements`, {
        params: { user_id: this.userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      
      // Mock achievements for demo
      return [
        { id: 'first_entry', name: 'First Step', description: 'Record your first mood', icon: '🌟', unlocked: true },
        { id: 'week_streak', name: 'Week Warrior', description: '7 days in a row', icon: '🔥', unlocked: false },
        { id: 'mood_explorer', name: 'Mood Explorer', description: 'Try 8 different moods', icon: '🌈', unlocked: false },
        { id: 'social_butterfly', name: 'Social Butterfly', description: 'Add 5 friends', icon: '🦋', unlocked: false },
        { id: 'zen_master', name: 'Zen Master', description: 'Complete 10 meditation sessions', icon: '🧘', unlocked: false }
      ];
    }
  }

  // Custom moods
  async createCustomMood(moodData) {
    try {
      const response = await axios.post(`${API}/moods/custom`, moodData, {
        params: { user_id: this.userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating custom mood:', error);
      throw new Error('Failed to create custom mood');
    }
  }

  async getCustomMoods() {
    try {
      const response = await axios.get(`${API}/moods/custom`, {
        params: { user_id: this.userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching custom moods:', error);
      return [];
    }
  }

  // Meditation sessions
  async createMeditationSession(sessionData) {
    try {
      const response = await axios.post(`${API}/meditation/session`, sessionData, {
        params: { user_id: this.userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating meditation session:', error);
      throw new Error('Failed to record meditation session');
    }
  }

  async getMeditationSessions() {
    try {
      const response = await axios.get(`${API}/meditation/sessions`, {
        params: { user_id: this.userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching meditation sessions:', error);
      return [];
    }
  }

  // Notifications
  async getNotifications(limit = 50) {
    try {
      const response = await axios.get(`${API}/notifications`, {
        params: { 
          user_id: this.userId,
          limit: limit
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      
      // Mock notifications for demo
      return [
        {
          id: '1',
          type: 'achievement',
          title: '🎉 Achievement Unlocked!',
          body: "You've earned: First Step",
          read: false,
          priority: 'high',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          type: 'daily_reminder',
          title: 'Daily Mood Check 🌟',
          body: 'How are you feeling today?',
          read: true,
          priority: 'normal',
          timestamp: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          type: 'friend_activity',
          title: 'Sarah shared a mood',
          body: 'Sarah is feeling calm today',
          read: false,
          priority: 'low',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        }
      ];
    }
  }

  async markNotificationRead(notificationId) {
    try {
      await axios.put(`${API}/notifications/${notificationId}/read`);
      return true;
    } catch (error) {
      console.error('Error marking notification read:', error);
      return false;
    }
  }

  // Social feed
  async getSocialFeed(limit = 20) {
    try {
      const response = await axios.get(`${API}/social/feed`, {
        params: { 
          user_id: this.userId,
          limit: limit
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching social feed:', error);
      
      // Mock social feed for demo
      return [
        {
          id: '1',
          user: { name: 'Alex Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex' },
          action: 'recorded a happy mood 😊',
          timestamp: '2 hours ago'
        },
        {
          id: '2',
          user: { name: 'Sarah Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah' },
          action: 'completed a meditation session 🧘',
          timestamp: '5 hours ago'
        },
        {
          id: '3',
          user: { name: 'Mike Rodriguez', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike' },
          action: 'unlocked the Week Warrior achievement 🔥',
          timestamp: '1 day ago'
        }
      ];
    }
  }

  // File uploads
  async uploadPhoto(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API}/upload/photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.url;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw new Error('Failed to upload photo');
    }
  }

  async uploadVoiceNote(audioBlob) {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'voice-note.wav');
      
      const response = await axios.post(`${API}/upload/voice`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.url;
    } catch (error) {
      console.error('Error uploading voice note:', error);
      throw new Error('Failed to upload voice note');
    }
  }

  // Enhanced exports
  async exportToCsv(startDate = null, endDate = null) {
    try {
      const params = new URLSearchParams();
      params.append('user_id', this.userId);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await axios.get(`${API}/moods/export/csv?${params.toString()}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `moodverse-ultimate-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw new Error('Failed to export CSV');
    }
  }

  async exportToPdf() {
    try {
      const entries = await this.getMoodEntries();
      const stats = await this.getMoodStats();
      
      const content = `
🌟 MoodVerse Ultimate Report 🌟

Generated on: ${new Date().toLocaleDateString()}

📊 OVERVIEW
Total Entries: ${stats.total_entries}
Current Streak: ${stats.current_streak} days
Longest Streak: ${stats.longest_streak} days
Most Common Mood: ${stats.most_common_mood}
Weekly Average Intensity: ${stats.weekly_average_intensity}/5
Monthly Average Intensity: ${stats.monthly_average_intensity}/5

📈 MOOD DISTRIBUTION
Positive: ${stats.mood_distribution?.positive || 0} entries
Neutral: ${stats.mood_distribution?.neutral || 0} entries  
Negative: ${stats.mood_distribution?.negative || 0} entries

🌦️ WEATHER CORRELATION
${Object.entries(stats.weather_correlation || {}).map(([weather, data]) => 
  `${weather}: ${JSON.stringify(data)}`
).join('\n')}

🏃‍♀️ ACTIVITY CORRELATION
${Object.entries(stats.activity_correlation || {}).map(([activity, data]) => 
  `${activity}: Avg intensity ${data.avg_intensity?.toFixed(1) || 'N/A'} (${data.count || 0} entries)`
).join('\n')}

📝 RECENT ENTRIES (Top 20):
${entries.slice(0, 20).map(entry => 
  `${entry.date} - ${entry.mood.label} ${entry.mood.emoji} (Intensity: ${entry.intensity}/5)
  ${entry.note ? 'Note: ' + entry.note : 'No note'}
  ${entry.weather ? 'Weather: ' + entry.weather.condition : ''}
  ${entry.tags?.length ? 'Tags: ' + entry.tags.join(', ') : ''}`
).join('\n\n')}

🤖 AI INSIGHTS & RECOMMENDATIONS:
${stats.recommendations?.join('\n• ') || 'Keep tracking your moods for personalized insights!'}

📞 CRISIS SUPPORT RESOURCES:
• National Suicide Prevention Lifeline: 988
• Crisis Text Line: Text HOME to 741741
• SAMHSA Helpline: 1-800-662-4357

Generated by MoodVerse Ultimate - Your Complete Emotional Intelligence Platform
      `.trim();
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `moodverse-ultimate-report-${new Date().toISOString().split('T')[0]}.txt`;
      link.click();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error exporting PDF:', error);
      throw new Error('Failed to export PDF');
    }
  }

  // Weekly reports
  async getWeeklyReport() {
    try {
      const response = await axios.get(`${API}/reports/weekly`, {
        params: { user_id: this.userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching weekly report:', error);
      throw new Error('Failed to load weekly report');
    }
  }

  // Advanced analytics
  async getMoodTrends(days = 30) {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const entries = await this.getMoodEntries(startDate, endDate);
      
      const trends = {
        averageIntensity: entries.length > 0 ? 
          entries.reduce((sum, entry) => sum + (entry.intensity || 3), 0) / entries.length : 0,
        moodFrequency: {},
        weeklyPattern: {},
        hourlyPattern: {},
        weatherCorrelation: {},
        activityCorrelation: {}
      };
      
      entries.forEach(entry => {
        const mood = entry.mood.label;
        trends.moodFrequency[mood] = (trends.moodFrequency[mood] || 0) + 1;
        
        const dayOfWeek = new Date(entry.date).getDay();
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
        trends.weeklyPattern[dayName] = (trends.weeklyPattern[dayName] || 0) + 1;
        
        if (entry.timestamp) {
          const hour = new Date(entry.timestamp).getHours();
          trends.hourlyPattern[hour] = (trends.hourlyPattern[hour] || 0) + 1;
        }
        
        if (entry.weather?.condition) {
          const weather = entry.weather.condition;
          if (!trends.weatherCorrelation[weather]) {
            trends.weatherCorrelation[weather] = { count: 0, avgIntensity: 0, intensities: [] };
          }
          trends.weatherCorrelation[weather].count++;
          trends.weatherCorrelation[weather].intensities.push(entry.intensity || 3);
        }
        
        entry.tags?.forEach(tag => {
          if (!trends.activityCorrelation[tag]) {
            trends.activityCorrelation[tag] = { count: 0, avgIntensity: 0, intensities: [] };
          }
          trends.activityCorrelation[tag].count++;
          trends.activityCorrelation[tag].intensities.push(entry.intensity || 3);
        });
      });
      
      // Calculate averages
      Object.keys(trends.weatherCorrelation).forEach(weather => {
        const intensities = trends.weatherCorrelation[weather].intensities;
        trends.weatherCorrelation[weather].avgIntensity = intensities.reduce((a, b) => a + b, 0) / intensities.length;
      });
      
      Object.keys(trends.activityCorrelation).forEach(activity => {
        const intensities = trends.activityCorrelation[activity].intensities;
        trends.activityCorrelation[activity].avgIntensity = intensities.reduce((a, b) => a + b, 0) / intensities.length;
      });
      
      return trends;
    } catch (error) {
      console.error('Error fetching mood trends:', error);
      throw new Error('Failed to load mood trends');
    }
  }

  // Crisis support detection
  async checkCrisisKeywords(text) {
    const crisisKeywords = [
      'suicide', 'kill myself', 'end my life', 'want to die', 'suicidal',
      'hurt myself', 'self harm', 'cutting', 'worthless', 'hopeless',
      'no point', 'give up', 'can\'t go on', 'better off dead', 'end it all'
    ];
    
    const textLower = text.toLowerCase();
    return crisisKeywords.some(keyword => textLower.includes(keyword));
  }

  // AI-powered mood prediction
  async predictMood(contextData) {
    try {
      // Mock AI prediction based on context
      const { weather, activity, timeOfDay, recentMoods } = contextData;
      
      let prediction = {
        mood: 'content',
        confidence: 0.7,
        factors: []
      };
      
      // Weather influence
      if (weather === 'sunny') {
        prediction.mood = 'happy';
        prediction.confidence += 0.1;
        prediction.factors.push('Sunny weather typically boosts your mood');
      }
      
      // Activity influence
      if (activity === 'exercise') {
        prediction.mood = 'excited';
        prediction.confidence += 0.15;
        prediction.factors.push('Exercise sessions usually make you feel energized');
      }
      
      // Time of day
      const hour = new Date().getHours();
      if (hour >= 6 && hour <= 10) {
        prediction.factors.push('Morning hours are typically positive for you');
      }
      
      return prediction;
    } catch (error) {
      console.error('Error predicting mood:', error);
      return { mood: 'content', confidence: 0.5, factors: [] };
    }
  }

  // Breathing session recording
  async recordBreathingSession(sessionData) {
    try {
      // Mock breathing session recording
      const session = {
        id: Date.now().toString(),
        technique: sessionData.technique || '4-7-8',
        duration: sessionData.duration || 240,
        completed: sessionData.completed || false,
        timestamp: new Date().toISOString()
      };
      
      // Store in local storage for demo
      const sessions = JSON.parse(localStorage.getItem('breathing_sessions') || '[]');
      sessions.push(session);
      localStorage.setItem('breathing_sessions', JSON.stringify(sessions));
      
      return { success: true, session, experience: 50 };
    } catch (error) {
      console.error('Error recording breathing session:', error);
      throw new Error('Failed to record breathing session');
    }
  }
}

export const moodApi = new UltimateMoodApiService();
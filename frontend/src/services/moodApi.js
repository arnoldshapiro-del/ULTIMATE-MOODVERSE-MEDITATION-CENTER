import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

class EnhancedMoodApiService {
  // Create or update mood entry with intensity
  async createMoodEntry(moodData) {
    try {
      const response = await axios.post(`${API}/moods`, {
        date: moodData.date,
        mood_id: moodData.mood.id,
        note: moodData.note,
        intensity: moodData.intensity || 3,
        timestamp: moodData.timestamp
      });
      return response.data;
    } catch (error) {
      console.error('Error creating mood entry:', error);
      throw new Error(error.response?.data?.detail || 'Failed to save mood entry');
    }
  }

  // Get all mood entries
  async getMoodEntries(startDate = null, endDate = null, limit = 100) {
    try {
      const params = new URLSearchParams();
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

  // Get mood entry by ID
  async getMoodEntry(id) {
    try {
      const response = await axios.get(`${API}/moods/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching mood entry:', error);
      throw new Error('Failed to load mood entry');
    }
  }

  // Update mood entry
  async updateMoodEntry(id, updateData) {
    try {
      const payload = {};
      if (updateData.mood_id) payload.mood_id = updateData.mood_id;
      if (updateData.note !== undefined) payload.note = updateData.note;
      if (updateData.intensity) payload.intensity = updateData.intensity;

      const response = await axios.put(`${API}/moods/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('Error updating mood entry:', error);
      throw new Error(error.response?.data?.detail || 'Failed to update mood entry');
    }
  }

  // Delete mood entry
  async deleteMoodEntry(id) {
    try {
      await axios.delete(`${API}/moods/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting mood entry:', error);
      throw new Error('Failed to delete mood entry');
    }
  }

  // Export to CSV with enhanced data
  async exportToCsv(startDate = null, endDate = null) {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await axios.get(`${API}/moods/export/csv?${params.toString()}`, {
        responseType: 'blob'
      });

      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `moodverse-export-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw new Error('Failed to export CSV');
    }
  }

  // Get enhanced mood statistics
  async getMoodStats() {
    try {
      const response = await axios.get(`${API}/moods/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching mood stats:', error);
      throw new Error('Failed to load mood statistics');
    }
  }

  // Get AI-powered insights
  async getMoodInsights() {
    try {
      const response = await axios.get(`${API}/moods/insights`);
      return response.data;
    } catch (error) {
      console.error('Error fetching mood insights:', error);
      throw new Error('Failed to load AI insights');
    }
  }

  // Get user achievements
  async getAchievements() {
    try {
      const response = await axios.get(`${API}/achievements`);
      return response.data;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      throw new Error('Failed to load achievements');
    }
  }

  // Get mood for specific date
  async getMoodByDate(date) {
    try {
      const entries = await this.getMoodEntries(date, date, 1);
      return entries.length > 0 ? entries[0] : null;
    } catch (error) {
      console.error('Error fetching mood by date:', error);
      return null;
    }
  }

  // Enhanced PDF export with more data
  async exportToPdf() {
    try {
      const entries = await this.getMoodEntries();
      const stats = await this.getMoodStats();
      
      const content = `
🌟 MoodVerse Report 🌟

Generated on: ${new Date().toLocaleDateString()}
Total Entries: ${stats.total_entries}
Current Streak: ${stats.current_streak} days
Most Common Mood: ${stats.most_common_mood}
Weekly Average Intensity: ${stats.weekly_average_intensity}/5

📊 Mood Distribution:
Positive: ${stats.mood_distribution?.positive || 0} entries
Neutral: ${stats.mood_distribution?.neutral || 0} entries  
Negative: ${stats.mood_distribution?.negative || 0} entries

📝 Recent Entries:
${entries.slice(0, 20).map(entry => 
  `${entry.date} - ${entry.mood.label} ${entry.mood.emoji} (Intensity: ${entry.intensity}/5)\n${entry.note ? 'Note: ' + entry.note : 'No note'}`
).join('\n\n')}

💡 AI Recommendations:
${stats.recommendations?.join('\n') || 'Keep tracking your moods for personalized insights!'}
      `.trim();
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `moodverse-report-${new Date().toISOString().split('T')[0]}.txt`;
      link.click();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error exporting PDF:', error);
      throw new Error('Failed to export PDF');
    }
  }

  // Simulate breathing session tracking
  async recordBreathingSession(duration = 60) {
    try {
      // In a real app, you might want to store this data
      console.log(`Breathing session completed: ${duration} seconds`);
      return { success: true, duration, experience: 50 };
    } catch (error) {
      console.error('Error recording breathing session:', error);
      throw new Error('Failed to record breathing session');
    }
  }

  // Get mood trends analysis
  async getMoodTrends(days = 30) {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const entries = await this.getMoodEntries(startDate, endDate);
      
      // Analyze trends
      const trends = {
        averageIntensity: entries.length > 0 ? 
          entries.reduce((sum, entry) => sum + (entry.intensity || 3), 0) / entries.length : 0,
        moodFrequency: {},
        weeklyPattern: {}
      };
      
      entries.forEach(entry => {
        const mood = entry.mood.label;
        trends.moodFrequency[mood] = (trends.moodFrequency[mood] || 0) + 1;
        
        const dayOfWeek = new Date(entry.date).getDay();
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
        trends.weeklyPattern[dayName] = (trends.weeklyPattern[dayName] || 0) + 1;
      });
      
      return trends;
    } catch (error) {
      console.error('Error fetching mood trends:', error);
      throw new Error('Failed to load mood trends');
    }
  }
}

export const moodApi = new EnhancedMoodApiService();
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

class MoodApiService {
  // Create or update mood entry
  async createMoodEntry(moodData) {
    try {
      const response = await axios.post(`${API}/moods`, {
        date: moodData.date,
        mood_id: moodData.mood.id,
        note: moodData.note,
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

  // Export to CSV
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
      link.download = `mood-tracker-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw new Error('Failed to export CSV');
    }
  }

  // Get mood statistics
  async getMoodStats() {
    try {
      const response = await axios.get(`${API}/moods/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching mood stats:', error);
      throw new Error('Failed to load mood statistics');
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

  // Mock PDF export (placeholder)
  async exportToPdf() {
    try {
      // For now, we'll create a simple text file
      // In a real implementation, you'd call a PDF generation endpoint
      const entries = await this.getMoodEntries();
      
      const content = `Mood Tracker Report\n\nGenerated on: ${new Date().toLocaleDateString()}\n\n` +
        entries.map(entry => 
          `${entry.date} - ${entry.mood.label} ${entry.mood.emoji}\n${entry.note ? 'Note: ' + entry.note : 'No note'}\n`
        ).join('\n');
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mood-tracker-report-${new Date().toISOString().split('T')[0]}.txt`;
      link.click();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error exporting PDF:', error);
      throw new Error('Failed to export PDF');
    }
  }
}

export const moodApi = new MoodApiService();
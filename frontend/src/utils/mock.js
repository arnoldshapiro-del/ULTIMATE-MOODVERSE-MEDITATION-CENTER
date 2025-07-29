// Mock data and utilities for mood tracker

const moods = [
  { id: 'happy', emoji: '😊', label: 'Happy', color: 'bg-yellow-100 border-yellow-300' },
  { id: 'sad', emoji: '😢', label: 'Sad', color: 'bg-blue-100 border-blue-300' },
  { id: 'anxious', emoji: '😰', label: 'Anxious', color: 'bg-purple-100 border-purple-300' },
  { id: 'excited', emoji: '🤗', label: 'Excited', color: 'bg-orange-100 border-orange-300' },
  { id: 'calm', emoji: '😌', label: 'Calm', color: 'bg-green-100 border-green-300' },
  { id: 'angry', emoji: '😠', label: 'Angry', color: 'bg-red-100 border-red-300' },
  { id: 'irritable', emoji: '😤', label: 'Irritable', color: 'bg-pink-100 border-pink-300' },
  { id: 'mad', emoji: '😡', label: 'Mad', color: 'bg-red-100 border-red-400' }
];

// Generate sample mood history
const generateMockData = () => {
  const history = [];
  const today = new Date();
  
  // Generate data for the last 14 days
  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    // Only add entries for some days (not every day)
    if (Math.random() > 0.3) {
      const randomMood = moods[Math.floor(Math.random() * moods.length)];
      const notes = [
        "Had a great day at work!",
        "Feeling overwhelmed with tasks",
        "Beautiful weather lifted my spirits",
        "Stressed about upcoming deadline",
        "Enjoyed quality time with family",
        "Workout made me feel energized",
        "Feeling grateful for small moments",
        ""
      ];
      
      history.push({
        id: `mock-${i}`,
        date: dateString,
        mood: randomMood,
        note: notes[Math.floor(Math.random() * notes.length)],
        timestamp: date.toISOString()
      });
    }
  }
  
  return history.sort((a, b) => new Date(b.date) - new Date(a.date));
};

let mockHistory = generateMockData();

export const mockData = {
  getMoodHistory: () => {
    return [...mockHistory];
  },

  addMoodEntry: (entry) => {
    // Remove any existing entry for the same date
    mockHistory = mockHistory.filter(item => item.date !== entry.date);
    // Add new entry
    mockHistory.unshift(entry);
    // Sort by date descending
    mockHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    return [...mockHistory];
  },

  getMoodByDate: (date) => {
    return mockHistory.find(entry => entry.date === date);
  },

  exportToCSV: (data) => {
    const csvContent = [
      ['Date', 'Mood', 'Emoji', 'Note'],
      ...data.map(entry => [
        entry.date,
        entry.mood.label,
        entry.mood.emoji,
        entry.note || ''
      ])
    ];
    
    const csvString = csvContent.map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mood-tracker-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  },

  exportToPDF: (data) => {
    // Mock PDF export - in real implementation, you'd use a library like jsPDF
    const content = `Mood Tracker Report\n\nGenerated on: ${new Date().toLocaleDateString()}\n\n` +
      data.map(entry => 
        `${entry.date} - ${entry.mood.label} ${entry.mood.emoji}\n${entry.note ? 'Note: ' + entry.note : 'No note'}\n`
      ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mood-tracker-report-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  },

  getStats: () => {
    const moodCounts = {};
    mockHistory.forEach(entry => {
      moodCounts[entry.mood.label] = (moodCounts[entry.mood.label] || 0) + 1;
    });
    
    return {
      totalEntries: mockHistory.length,
      moodCounts,
      mostCommonMood: Object.keys(moodCounts).reduce((a, b) => 
        moodCounts[a] > moodCounts[b] ? a : b
      ),
      streak: calculateStreak()
    };
  }
};

const calculateStreak = () => {
  if (mockHistory.length === 0) return 0;
  
  const today = new Date().toISOString().split('T')[0];
  const sortedHistory = [...mockHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  let streak = 0;
  let currentDate = new Date(today);
  
  for (const entry of sortedHistory) {
    const entryDate = currentDate.toISOString().split('T')[0];
    if (entry.date === entryDate) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
};
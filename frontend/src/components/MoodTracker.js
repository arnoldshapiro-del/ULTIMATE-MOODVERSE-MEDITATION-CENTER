import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Download, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useToast } from '../hooks/use-toast';
import { mockData } from '../utils/mock';

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

const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [moodHistory, setMoodHistory] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddMood, setShowAddMood] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load mock data
    setMoodHistory(mockData.getMoodHistory());
  }, []);

  const handleMoodSubmit = () => {
    if (!selectedMood) return;

    const newEntry = {
      id: Date.now().toString(),
      date: currentDate,
      mood: selectedMood,
      note: note.trim(),
      timestamp: new Date().toISOString()
    };

    // Update mock data
    const updatedHistory = mockData.addMoodEntry(newEntry);
    setMoodHistory(updatedHistory);

    // Reset form
    setSelectedMood(null);
    setNote('');
    setShowAddMood(false);

    toast({
      title: "Mood recorded!",
      description: `Your ${selectedMood.label.toLowerCase()} mood has been saved.`
    });
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
        dayName: new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
      };
    });
  };

  const exportData = (format) => {
    if (format === 'csv') {
      mockData.exportToCSV(moodHistory);
      toast({ title: "CSV Export", description: "Mood data exported to CSV file" });
    } else {
      mockData.exportToPDF(moodHistory);
      toast({ title: "PDF Export", description: "Mood data exported to PDF file" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Mood Tracker</h1>
          <p className="text-gray-600">Track your daily emotions and discover patterns</p>
        </div>

        {/* Quick Add Mood */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              How are you feeling today?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={showAddMood} onOpenChange={setShowAddMood}>
              <DialogTrigger asChild>
                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                  Record Today's Mood
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>How are you feeling?</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    {moods.map((mood) => (
                      <button
                        key={mood.id}
                        onClick={() => setSelectedMood(mood)}
                        className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                          selectedMood?.id === mood.id 
                            ? mood.color + ' ring-2 ring-slate-400' 
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl">{mood.emoji}</div>
                        <div className="text-xs text-gray-700">{mood.label}</div>
                      </button>
                    ))}
                  </div>
                  
                  {selectedMood && (
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Add a note about your mood (optional)"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="resize-none"
                        rows={3}
                      />
                      <Button onClick={handleMoodSubmit} className="w-full bg-slate-900 hover:bg-slate-800">
                        Save Mood
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Mood History Tabs */}
        <Tabs defaultValue="calendar" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-2 bg-white border shadow-sm">
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendar View
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Trends
              </TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => exportData('csv')}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button 
                variant="outline" 
                onClick={() => exportData('pdf')}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>

          <TabsContent value="calendar">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Monthly Mood Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Calendar Header */}
                  <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-500">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="p-2">{day}</div>
                    ))}
                  </div>
                  
                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-2">
                    {generateCalendarDays().map((day, index) => (
                      <div
                        key={index}
                        className={`
                          aspect-square flex flex-col items-center justify-center p-2 rounded-lg border-2
                          ${day.date ? 'cursor-pointer hover:bg-gray-50' : ''} 
                          ${day.mood ? day.mood.color : 'bg-white border-gray-200'}
                        `}
                      >
                        {day.date && (
                          <>
                            <div className="text-sm font-medium">{day.day}</div>
                            {day.mood && (
                              <div className="text-lg">{day.mood.emoji}</div>
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

          <TabsContent value="trends">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>7-Day Mood Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Trend Graph */}
                  <div className="h-64 flex items-end justify-between gap-2 p-4 bg-gray-50 rounded-lg">
                    {getMoodTrendData().map((day, index) => (
                      <div key={index} className="flex flex-col items-center flex-1 max-w-16">
                        <div className="text-xs text-gray-500 mb-2">{day.dayName}</div>
                        <div 
                          className={`
                            w-full rounded-t-lg flex items-end justify-center pb-2 transition-all
                            ${day.mood ? day.mood.color : 'bg-gray-200 border-gray-300'}
                          `}
                          style={{ 
                            height: day.mood ? '120px' : '20px',
                            minHeight: '20px'
                          }}
                        >
                          {day.mood && (
                            <div className="text-2xl">{day.mood.emoji}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mood Legend */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {moods.map((mood) => (
                      <div key={mood.id} className="flex items-center gap-2 p-2 rounded-lg bg-white border">
                        <span className="text-lg">{mood.emoji}</span>
                        <span className="text-sm text-gray-700">{mood.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Entries */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Recent Mood Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {moodHistory.slice(0, 5).map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">{entry.mood.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary">{entry.mood.label}</Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                    </div>
                    {entry.note && (
                      <p className="text-sm text-gray-700">{entry.note}</p>
                    )}
                  </div>
                </div>
              ))}
              {moodHistory.length === 0 && (
                <p className="text-center text-gray-500 py-4">No mood entries yet. Start tracking today!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MoodTracker;
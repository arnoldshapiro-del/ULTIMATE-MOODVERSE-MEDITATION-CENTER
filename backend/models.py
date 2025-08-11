from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
import uuid

class MoodData(BaseModel):
    id: str
    emoji: str
    label: str
    color: str
    particles: Optional[str] = None
    intensity: Optional[int] = 3
    category: Optional[str] = "neutral"

class MoodEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = "default"  # For future multi-user support
    date: str  # YYYY-MM-DD format
    mood_id: str  # "happy", "sad", etc.
    mood: Optional[MoodData] = None  # Enriched mood data
    note: str = ""
    intensity: int = 3  # 1-5 scale
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class MoodEntryCreate(BaseModel):
    date: str
    mood_id: str
    note: str = ""
    intensity: int = 3
    timestamp: Optional[datetime] = None

class MoodEntryUpdate(BaseModel):
    mood_id: Optional[str] = None
    note: Optional[str] = None
    intensity: Optional[int] = None

class MoodStats(BaseModel):
    total_entries: int
    mood_counts: dict
    most_common_mood: str
    current_streak: int
    weekly_average_intensity: float
    mood_distribution: dict
    recommendations: List[str]

class Achievement(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    unlocked: bool = False
    unlock_criteria: dict

# Enhanced mood reference data with all features
MOODS = {
    'euphoric': {
        'emoji': '🤩', 'label': 'Euphoric', 
        'color': 'bg-gradient-to-br from-yellow-200 to-orange-300 border-orange-400',
        'particles': 'gold', 'intensity': 5, 'category': 'positive'
    },
    'happy': {
        'emoji': '😊', 'label': 'Happy', 
        'color': 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-300',
        'particles': 'yellow', 'intensity': 4, 'category': 'positive'
    },
    'excited': {
        'emoji': '🤗', 'label': 'Excited', 
        'color': 'bg-gradient-to-br from-orange-100 to-pink-200 border-orange-300',
        'particles': 'orange', 'intensity': 4, 'category': 'positive'
    },
    'grateful': {
        'emoji': '🙏', 'label': 'Grateful', 
        'color': 'bg-gradient-to-br from-purple-100 to-pink-200 border-purple-300',
        'particles': 'purple', 'intensity': 4, 'category': 'positive'
    },
    'calm': {
        'emoji': '😌', 'label': 'Calm', 
        'color': 'bg-gradient-to-br from-green-100 to-blue-100 border-green-300',
        'particles': 'green', 'intensity': 3, 'category': 'neutral'
    },
    'content': {
        'emoji': '😊', 'label': 'Content', 
        'color': 'bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-300',
        'particles': 'blue', 'intensity': 3, 'category': 'neutral'
    },
    'tired': {
        'emoji': '😴', 'label': 'Tired', 
        'color': 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300',
        'particles': 'gray', 'intensity': 2, 'category': 'neutral'
    },
    'anxious': {
        'emoji': '😰', 'label': 'Anxious', 
        'color': 'bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300',
        'particles': 'purple', 'intensity': 2, 'category': 'negative'
    },
    'sad': {
        'emoji': '😢', 'label': 'Sad', 
        'color': 'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300',
        'particles': 'blue', 'intensity': 2, 'category': 'negative'
    },
    'angry': {
        'emoji': '😠', 'label': 'Angry', 
        'color': 'bg-gradient-to-br from-red-100 to-red-200 border-red-300',
        'particles': 'red', 'intensity': 2, 'category': 'negative'
    },
    'frustrated': {
        'emoji': '😤', 'label': 'Frustrated', 
        'color': 'bg-gradient-to-br from-orange-100 to-red-100 border-orange-300',
        'particles': 'orange', 'intensity': 2, 'category': 'negative'
    },
    'overwhelmed': {
        'emoji': '😵', 'label': 'Overwhelmed', 
        'color': 'bg-gradient-to-br from-red-100 to-purple-100 border-red-300',
        'particles': 'red', 'intensity': 1, 'category': 'negative'
    }
}

# Achievement definitions
ACHIEVEMENTS = [
    {
        'id': 'first_entry',
        'name': 'First Step',
        'description': 'Record your first mood',
        'icon': '🌟',
        'unlock_criteria': {'entries_count': 1}
    },
    {
        'id': 'week_streak',
        'name': 'Week Warrior',
        'description': '7 days in a row',
        'icon': '🔥',
        'unlock_criteria': {'streak_days': 7}
    },
    {
        'id': 'month_streak',
        'name': 'Monthly Master',
        'description': '30 days in a row',
        'icon': '👑',
        'unlock_criteria': {'streak_days': 30}
    },
    {
        'id': 'mood_explorer',
        'name': 'Mood Explorer',
        'description': 'Try 5 different moods',
        'icon': '🌈',
        'unlock_criteria': {'unique_moods': 5}
    },
    {
        'id': 'gratitude_guru',
        'name': 'Gratitude Guru',
        'description': 'Record 10 grateful moods',
        'icon': '🙏',
        'unlock_criteria': {'grateful_count': 10}
    },
    {
        'id': 'zen_master',
        'name': 'Zen Master',
        'description': 'Complete 5 breathing sessions',
        'icon': '🧘',
        'unlock_criteria': {'breathing_sessions': 5}
    },
    {
        'id': 'consistency_champion',
        'name': 'Consistency Champion',
        'description': 'Log moods for 50 days',
        'icon': '⚡',
        'unlock_criteria': {'total_days': 50}
    },
    {
        'id': 'emotional_intelligence',
        'name': 'Emotional Intelligence Master',
        'description': 'Use all 12 mood types',
        'icon': '🧠',
        'unlock_criteria': {'all_moods_used': True}
    }
]
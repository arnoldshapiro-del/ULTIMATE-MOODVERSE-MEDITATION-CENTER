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
    isCustom: Optional[bool] = False

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    avatar: Optional[str] = None
    join_date: datetime = Field(default_factory=datetime.utcnow)
    preferences: Dict[str, Any] = Field(default_factory=dict)
    stats: Dict[str, Any] = Field(default_factory=dict)
    friends: List[str] = Field(default_factory=list)
    is_active: bool = True

class MoodEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    date: str  # YYYY-MM-DD format
    mood_id: str
    mood: Optional[MoodData] = None  # Enriched mood data
    note: str = ""
    intensity: int = 3  # 1-5 scale
    voice_note_url: Optional[str] = None
    photo_url: Optional[str] = None
    weather: Optional[Dict[str, Any]] = None
    location: Optional[Dict[str, Any]] = None
    activity_data: Optional[Dict[str, Any]] = None
    sleep_data: Optional[Dict[str, Any]] = None
    tags: List[str] = Field(default_factory=list)
    is_private: bool = False
    shared_with: List[str] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class MoodEntryCreate(BaseModel):
    date: str
    mood_id: str
    note: str = ""
    intensity: int = 3
    voice_note_url: Optional[str] = None
    photo_url: Optional[str] = None
    weather: Optional[Dict[str, Any]] = None
    location: Optional[Dict[str, Any]] = None
    activity_data: Optional[Dict[str, Any]] = None
    sleep_data: Optional[Dict[str, Any]] = None
    tags: List[str] = Field(default_factory=list)
    is_private: bool = False
    timestamp: Optional[datetime] = None

class MoodEntryUpdate(BaseModel):
    mood_id: Optional[str] = None
    note: Optional[str] = None
    intensity: Optional[int] = None
    voice_note_url: Optional[str] = None
    photo_url: Optional[str] = None
    tags: Optional[List[str]] = None
    is_private: Optional[bool] = None

class MoodStats(BaseModel):
    total_entries: int
    mood_counts: dict
    most_common_mood: str
    current_streak: int
    longest_streak: int
    weekly_average_intensity: float
    monthly_average_intensity: float
    mood_distribution: dict
    weather_correlation: dict
    activity_correlation: dict
    recommendations: List[str]
    insights: List[str]
    goals_progress: Dict[str, Any]

class Achievement(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    category: str
    unlock_criteria: dict
    unlocked: bool = False
    unlock_date: Optional[datetime] = None
    rarity: str = "common"  # common, rare, epic, legendary

class Friend(BaseModel):
    id: str
    name: str
    email: str
    avatar: Optional[str] = None
    status: str = "pending"  # pending, accepted, blocked
    connection_date: Optional[datetime] = None
    last_mood: Optional[str] = None
    last_seen: Optional[str] = None
    shared_streak: int = 0

class SocialFeedItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: str  # mood_entry, achievement, milestone, etc.
    content: Dict[str, Any]
    privacy_level: str = "friends"  # public, friends, private
    likes: int = 0
    comments: List[Dict[str, Any]] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class Notification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: str  # achievement, friend_request, daily_reminder, etc.
    title: str
    body: str
    data: Optional[Dict[str, Any]] = None
    read: bool = False
    priority: str = "normal"  # low, normal, high, urgent
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class CustomMood(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    emoji: str
    label: str
    color: str
    particles: str = "blue"
    intensity: int = 3
    category: str = "neutral"
    usage_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MeditationSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    technique: str
    duration: int  # in seconds
    completed: bool = False
    completion_percentage: float = 0.0
    mood_before: Optional[str] = None
    mood_after: Optional[str] = None
    notes: str = ""
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class WeeklyReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    week_start: str  # YYYY-MM-DD
    week_end: str    # YYYY-MM-DD
    stats: Dict[str, Any]
    insights: List[str]
    recommendations: List[str]
    generated_at: datetime = Field(default_factory=datetime.utcnow)

# Enhanced mood reference data with all 16 moods
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
    'loved': {
        'emoji': '🥰', 'label': 'Loved', 
        'color': 'bg-gradient-to-br from-pink-100 to-red-200 border-pink-300',
        'particles': 'pink', 'intensity': 4, 'category': 'positive'
    },
    'proud': {
        'emoji': '😤', 'label': 'Proud', 
        'color': 'bg-gradient-to-br from-indigo-100 to-purple-200 border-indigo-300',
        'particles': 'indigo', 'intensity': 4, 'category': 'positive'
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
    'confused': {
        'emoji': '🤔', 'label': 'Confused', 
        'color': 'bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-300',
        'particles': 'yellow', 'intensity': 2, 'category': 'neutral'
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
    },
    'lonely': {
        'emoji': '😔', 'label': 'Lonely', 
        'color': 'bg-gradient-to-br from-gray-100 to-blue-100 border-gray-300',
        'particles': 'gray', 'intensity': 2, 'category': 'negative'
    }
}

# Enhanced Achievement definitions
ACHIEVEMENTS = [
    {
        'id': 'first_entry',
        'name': 'First Step',
        'description': 'Record your first mood',
        'icon': '🌟',
        'category': 'milestone',
        'unlock_criteria': {'entries_count': 1},
        'rarity': 'common'
    },
    {
        'id': 'week_streak',
        'name': 'Week Warrior',
        'description': '7 days in a row',
        'icon': '🔥',
        'category': 'streak',
        'unlock_criteria': {'streak_days': 7},
        'rarity': 'common'
    },
    {
        'id': 'month_streak',
        'name': 'Monthly Master',
        'description': '30 days in a row',
        'icon': '👑',
        'category': 'streak',
        'unlock_criteria': {'streak_days': 30},
        'rarity': 'rare'
    },
    {
        'id': 'mood_explorer',
        'name': 'Mood Explorer',
        'description': 'Try 8 different moods',
        'icon': '🌈',
        'category': 'exploration',
        'unlock_criteria': {'unique_moods': 8},
        'rarity': 'common'
    },
    {
        'id': 'gratitude_guru',
        'name': 'Gratitude Guru',
        'description': 'Record 20 grateful moods',
        'icon': '🙏',
        'category': 'emotion',
        'unlock_criteria': {'grateful_count': 20},
        'rarity': 'rare'
    },
    {
        'id': 'zen_master',
        'name': 'Zen Master',
        'description': 'Complete 10 meditation sessions',
        'icon': '🧘',
        'category': 'wellness',
        'unlock_criteria': {'meditation_sessions': 10},
        'rarity': 'rare'
    },
    {
        'id': 'social_butterfly',
        'name': 'Social Butterfly',
        'description': 'Add 5 friends',
        'icon': '🦋',
        'category': 'social',
        'unlock_criteria': {'friends_count': 5},
        'rarity': 'common'
    },
    {
        'id': 'voice_artist',
        'name': 'Voice Artist',
        'description': 'Record 10 voice notes',
        'icon': '🎤',
        'category': 'expression',
        'unlock_criteria': {'voice_notes': 10},
        'rarity': 'common'
    },
    {
        'id': 'photographer',
        'name': 'Mood Photographer',
        'description': 'Attach 15 photos',
        'icon': '📸',
        'category': 'expression',
        'unlock_criteria': {'photos_attached': 15},
        'rarity': 'common'
    },
    {
        'id': 'consistency_champion',
        'name': 'Consistency Champion',
        'description': 'Log moods for 100 days',
        'icon': '⚡',
        'category': 'milestone',
        'unlock_criteria': {'total_days': 100},
        'rarity': 'epic'
    },
    {
        'id': 'emotional_intelligence',
        'name': 'EQ Master',
        'description': 'Use all 16 mood types',
        'icon': '🧠',
        'category': 'mastery',
        'unlock_criteria': {'all_moods_used': True},
        'rarity': 'epic'
    },
    {
        'id': 'community_leader',
        'name': 'Community Leader',
        'description': 'Help 10 friends',
        'icon': '👑',
        'category': 'social',
        'unlock_criteria': {'friends_helped': 10},
        'rarity': 'rare'
    },
    {
        'id': 'data_scientist',
        'name': 'Data Scientist',
        'description': 'Export data 5 times',
        'icon': '📊',
        'category': 'analytics',
        'unlock_criteria': {'exports_count': 5},
        'rarity': 'common'
    },
    {
        'id': 'weather_tracker',
        'name': 'Weather Tracker',
        'description': 'Log moods in 4 different weather conditions',
        'icon': '🌦️',
        'category': 'correlation',
        'unlock_criteria': {'weather_conditions': 4},
        'rarity': 'rare'
    },
    {
        'id': 'midnight_warrior',
        'name': 'Midnight Warrior',
        'description': 'Log mood after midnight',
        'icon': '🌙',
        'category': 'special',
        'unlock_criteria': {'midnight_entries': 1},
        'rarity': 'rare'
    },
    {
        'id': 'legend',
        'name': 'MoodVerse Legend',
        'description': 'Achieve 365 day streak',
        'icon': '🏆',
        'category': 'legendary',
        'unlock_criteria': {'streak_days': 365},
        'rarity': 'legendary'
    }
]

# Crisis support keywords for detection
CRISIS_KEYWORDS = [
    'suicide', 'kill myself', 'end my life', 'want to die', 'suicidal',
    'hurt myself', 'self harm', 'cutting', 'worthless', 'hopeless',
    'no point', 'give up', 'can\'t go on', 'better off dead', 'end it all'
]

# Weather conditions mapping
WEATHER_CONDITIONS = {
    'sunny': {'mood_boost': 0.2, 'energy_boost': 0.3},
    'cloudy': {'mood_boost': 0.0, 'energy_boost': 0.0},
    'rainy': {'mood_boost': -0.1, 'energy_boost': -0.1},
    'stormy': {'mood_boost': -0.2, 'energy_boost': -0.2},
    'snowy': {'mood_boost': 0.1, 'energy_boost': -0.1},
    'foggy': {'mood_boost': -0.1, 'energy_boost': -0.2}
}

# Activity impact on mood
ACTIVITY_IMPACT = {
    'exercise': {'mood_boost': 0.3, 'energy_boost': 0.4},
    'social': {'mood_boost': 0.2, 'energy_boost': 0.1},
    'creative': {'mood_boost': 0.2, 'energy_boost': 0.0},
    'work': {'mood_boost': -0.1, 'energy_boost': -0.2},
    'relaxation': {'mood_boost': 0.1, 'energy_boost': -0.1},
    'learning': {'mood_boost': 0.1, 'energy_boost': 0.0}
}
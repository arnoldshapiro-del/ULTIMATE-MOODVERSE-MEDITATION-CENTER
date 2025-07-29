from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
import uuid

class MoodData(BaseModel):
    id: str
    emoji: str
    label: str
    color: str

class MoodEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = "default"  # For future multi-user support
    date: str  # YYYY-MM-DD format
    mood_id: str  # "happy", "sad", etc.
    mood: Optional[MoodData] = None  # Enriched mood data
    note: str = ""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class MoodEntryCreate(BaseModel):
    date: str
    mood_id: str
    note: str = ""
    timestamp: Optional[datetime] = None

class MoodEntryUpdate(BaseModel):
    mood_id: Optional[str] = None
    note: Optional[str] = None

class MoodStats(BaseModel):
    total_entries: int
    mood_counts: dict
    most_common_mood: str
    current_streak: int

# Mood reference data
MOODS = {
    'happy': {'emoji': '😊', 'label': 'Happy', 'color': 'bg-yellow-100 border-yellow-300'},
    'sad': {'emoji': '😢', 'label': 'Sad', 'color': 'bg-blue-100 border-blue-300'},
    'anxious': {'emoji': '😰', 'label': 'Anxious', 'color': 'bg-purple-100 border-purple-300'},
    'excited': {'emoji': '🤗', 'label': 'Excited', 'color': 'bg-orange-100 border-orange-300'},
    'calm': {'emoji': '😌', 'label': 'Calm', 'color': 'bg-green-100 border-green-300'},
    'angry': {'emoji': '😠', 'label': 'Angry', 'color': 'bg-red-100 border-red-300'},
    'irritable': {'emoji': '😤', 'label': 'Irritable', 'color': 'bg-pink-100 border-pink-300'},
    'mad': {'emoji': '😡', 'label': 'Mad', 'color': 'bg-red-100 border-red-400'}
}
from fastapi import FastAPI, APIRouter, HTTPException, Response
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timedelta
import csv
import io
import statistics

from models import (
    MoodEntry, MoodEntryCreate, MoodEntryUpdate, MoodStats, MoodData, 
    Achievement, MOODS, ACHIEVEMENTS
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="MoodVerse API", description="Enhanced Mood Tracking with AI Insights")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

def enrich_mood_entry(entry_dict):
    """Add mood details to mood entry"""
    mood_id = entry_dict['mood_id']
    if mood_id in MOODS:
        entry_dict['mood'] = MoodData(
            id=mood_id,
            **MOODS[mood_id]
        )
    else:
        # Fallback for unknown mood_id
        entry_dict['mood'] = MoodData(
            id=mood_id,
            emoji='❓',
            label=mood_id.title(),
            color='bg-gray-100 border-gray-300',
            particles='gray',
            intensity=3,
            category='neutral'
        )
    return entry_dict

# Helper function to calculate advanced streak
async def calculate_current_streak():
    """Calculate current consecutive days streak with improved logic"""
    today = datetime.now().strftime('%Y-%m-%d')
    streak = 0
    current_date = datetime.now()
    
    while True:
        date_str = current_date.strftime('%Y-%m-%d')
        entry = await db.mood_entries.find_one({'date': date_str})
        
        if entry:
            streak += 1
            current_date -= timedelta(days=1)
        else:
            # If today has no entry, don't count streak
            if date_str == today and streak == 0:
                break
            # If yesterday has no entry, streak is broken
            elif streak > 0:
                break
            else:
                current_date -= timedelta(days=1)
                continue
            
        # Limit to reasonable streak calculation
        if streak > 365:
            break
    
    return streak

async def get_ai_insights(entries):
    """Generate AI-powered insights from mood data"""
    if not entries:
        return []
    
    insights = []
    
    # Analyze mood patterns
    positive_moods = [e for e in entries if MOODS.get(e['mood_id'], {}).get('category') == 'positive']
    negative_moods = [e for e in entries if MOODS.get(e['mood_id'], {}).get('category') == 'negative']
    
    positive_ratio = len(positive_moods) / len(entries) if entries else 0
    
    if positive_ratio > 0.7:
        insights.append("🌟 You're maintaining excellent emotional well-being! Your positive mindset is inspiring.")
    elif positive_ratio < 0.3:
        insights.append("💙 Consider incorporating more self-care activities. Remember, it's okay to seek support.")
    
    # Weekly pattern analysis
    recent_entries = entries[:7]  # Last 7 days
    if len(recent_entries) >= 5:
        avg_intensity = statistics.mean([e.get('intensity', 3) for e in recent_entries])
        if avg_intensity > 4:
            insights.append("⚡ Your emotional intensity has been high lately. Great energy!")
        elif avg_intensity < 2:
            insights.append("🌱 Your emotions seem gentle recently. Focus on activities that bring you joy.")
    
    # Gratitude detection
    grateful_entries = [e for e in entries if e['mood_id'] == 'grateful']
    if len(grateful_entries) > 5:
        insights.append("🙏 Your practice of gratitude is beautiful and contributes to your emotional resilience.")
    
    return insights[:3]  # Return top 3 insights

async def check_achievements(user_entries):
    """Check and return unlocked achievements"""
    unlocked = []
    
    # First entry
    if len(user_entries) >= 1:
        unlocked.append('first_entry')
    
    # Streak achievements
    streak = await calculate_current_streak()
    if streak >= 7:
        unlocked.append('week_streak')
    if streak >= 30:
        unlocked.append('month_streak')
    
    # Mood explorer
    unique_moods = set(entry['mood_id'] for entry in user_entries)
    if len(unique_moods) >= 5:
        unlocked.append('mood_explorer')
    
    # Gratitude guru
    grateful_count = len([e for e in user_entries if e['mood_id'] == 'grateful'])
    if grateful_count >= 10:
        unlocked.append('gratitude_guru')
    
    # Consistency champion
    unique_dates = set(entry['date'] for entry in user_entries)
    if len(unique_dates) >= 50:
        unlocked.append('consistency_champion')
    
    # Emotional intelligence
    if len(unique_moods) >= 12:
        unlocked.append('emotional_intelligence')
    
    return unlocked

@api_router.get("/")
async def root():
    return {"message": "Welcome to MoodVerse API - Your Emotional Intelligence Companion"}

@api_router.post("/moods", response_model=MoodEntry)
async def create_mood_entry(mood_data: MoodEntryCreate):
    """Create or update mood entry for a specific date"""
    # Validate mood_id
    if mood_data.mood_id not in MOODS:
        raise HTTPException(status_code=400, detail="Invalid mood_id")
    
    # Validate intensity
    if not 1 <= mood_data.intensity <= 5:
        raise HTTPException(status_code=400, detail="Intensity must be between 1 and 5")
    
    # Check if entry exists for this date
    existing_entry = await db.mood_entries.find_one({'date': mood_data.date})
    
    if existing_entry:
        # Update existing entry
        update_data = {
            'mood_id': mood_data.mood_id,
            'note': mood_data.note,
            'intensity': mood_data.intensity,
            'updated_at': datetime.utcnow()
        }
        if mood_data.timestamp:
            update_data['timestamp'] = mood_data.timestamp
            
        await db.mood_entries.update_one(
            {'date': mood_data.date},
            {'$set': update_data}
        )
        
        # Get updated entry
        updated_entry = await db.mood_entries.find_one({'date': mood_data.date})
        return MoodEntry(**enrich_mood_entry(updated_entry))
    else:
        # Create new entry
        mood_entry_dict = mood_data.dict()
        if not mood_entry_dict['timestamp']:
            mood_entry_dict['timestamp'] = datetime.utcnow()
            
        mood_entry = MoodEntry(**mood_entry_dict)
        entry_dict = mood_entry.dict()
        
        await db.mood_entries.insert_one(entry_dict)
        return MoodEntry(**enrich_mood_entry(entry_dict))

@api_router.get("/moods", response_model=List[MoodEntry])
async def get_mood_entries(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = 100
):
    """Get mood entries with optional date filtering"""
    query = {}
    
    if start_date or end_date:
        date_query = {}
        if start_date:
            date_query['$gte'] = start_date
        if end_date:
            date_query['$lte'] = end_date
        query['date'] = date_query
    
    # Get entries sorted by date descending
    cursor = db.mood_entries.find(query).sort('date', -1).limit(limit)
    entries = await cursor.to_list(length=limit)
    
    # Enrich with mood details and return as MoodEntry objects
    enriched_entries = []
    for entry in entries:
        enriched_entry = enrich_mood_entry(entry)
        enriched_entries.append(MoodEntry(**enriched_entry))
    
    return enriched_entries

@api_router.get("/moods/stats", response_model=MoodStats)
async def get_mood_stats():
    """Get enhanced mood statistics with AI insights"""
    # Get all entries
    cursor = db.mood_entries.find({})
    entries = await cursor.to_list(length=None)
    
    if not entries:
        return MoodStats(
            total_entries=0,
            mood_counts={},
            most_common_mood="",
            current_streak=0,
            weekly_average_intensity=0.0,
            mood_distribution={},
            recommendations=["Start your emotional journey by recording your first mood! 🌟"]
        )
    
    # Calculate mood counts
    mood_counts = {}
    mood_distribution = {'positive': 0, 'neutral': 0, 'negative': 0}
    total_intensity = 0
    
    for entry in entries:
        mood_label = MOODS.get(entry['mood_id'], {}).get('label', entry['mood_id'])
        mood_counts[mood_label] = mood_counts.get(mood_label, 0) + 1
        
        # Mood distribution
        category = MOODS.get(entry['mood_id'], {}).get('category', 'neutral')
        mood_distribution[category] += 1
        
        # Total intensity for average
        total_intensity += entry.get('intensity', 3)
    
    # Find most common mood
    most_common_mood = max(mood_counts.items(), key=lambda x: x[1])[0] if mood_counts else ""
    
    # Calculate current streak
    current_streak = await calculate_current_streak()
    
    # Calculate weekly average intensity
    recent_entries = entries[:7]  # Last 7 days
    weekly_average_intensity = statistics.mean([e.get('intensity', 3) for e in recent_entries]) if recent_entries else 0.0
    
    # Get AI insights
    ai_insights = await get_ai_insights(entries)
    
    return MoodStats(
        total_entries=len(entries),
        mood_counts=mood_counts,
        most_common_mood=most_common_mood,
        current_streak=current_streak,
        weekly_average_intensity=round(weekly_average_intensity, 1),
        mood_distribution=mood_distribution,
        recommendations=ai_insights
    )

@api_router.get("/achievements")
async def get_user_achievements():
    """Get user achievements with unlock status"""
    # Get all entries for achievement calculation
    cursor = db.mood_entries.find({})
    entries = await cursor.to_list(length=None)
    
    unlocked_achievements = await check_achievements(entries)
    
    achievements_with_status = []
    for achievement in ACHIEVEMENTS:
        achievement_copy = achievement.copy()
        achievement_copy['unlocked'] = achievement['id'] in unlocked_achievements
        achievements_with_status.append(Achievement(**achievement_copy))
    
    return achievements_with_status

@api_router.get("/moods/insights")
async def get_mood_insights():
    """Get AI-powered mood insights and recommendations"""
    cursor = db.mood_entries.find({}).sort('date', -1).limit(30)  # Last 30 days
    entries = await cursor.to_list(length=30)
    
    insights = await get_ai_insights(entries)
    
    return {
        "insights": insights,
        "period": "last_30_days",
        "total_analyzed": len(entries)
    }

@api_router.get("/moods/{mood_id}")
async def get_mood_entry(mood_id: str):
    """Get specific mood entry by ID"""
    entry = await db.mood_entries.find_one({'id': mood_id})
    if not entry:
        raise HTTPException(status_code=404, detail="Mood entry not found")
    
    return MoodEntry(**enrich_mood_entry(entry))

@api_router.put("/moods/{mood_id}", response_model=MoodEntry)
async def update_mood_entry(mood_id: str, update_data: MoodEntryUpdate):
    """Update existing mood entry"""
    entry = await db.mood_entries.find_one({'id': mood_id})
    if not entry:
        raise HTTPException(status_code=404, detail="Mood entry not found")
    
    # Validate mood_id if provided
    if update_data.mood_id and update_data.mood_id not in MOODS:
        raise HTTPException(status_code=400, detail="Invalid mood_id")
    
    # Validate intensity if provided
    if update_data.intensity and not 1 <= update_data.intensity <= 5:
        raise HTTPException(status_code=400, detail="Intensity must be between 1 and 5")
    
    # Prepare update data
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    update_dict['updated_at'] = datetime.utcnow()
    
    await db.mood_entries.update_one(
        {'id': mood_id},
        {'$set': update_dict}
    )
    
    # Get updated entry
    updated_entry = await db.mood_entries.find_one({'id': mood_id})
    return MoodEntry(**enrich_mood_entry(updated_entry))

@api_router.delete("/moods/{mood_id}")
async def delete_mood_entry(mood_id: str):
    """Delete mood entry"""
    result = await db.mood_entries.delete_one({'id': mood_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Mood entry not found")
    
    return Response(status_code=204)

@api_router.get("/moods/export/csv")
async def export_moods_csv(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Export mood entries as enhanced CSV with intensity and categories"""
    # Get mood entries
    query = {}
    if start_date or end_date:
        date_query = {}
        if start_date:
            date_query['$gte'] = start_date
        if end_date:
            date_query['$lte'] = end_date
        query['date'] = date_query
    
    cursor = db.mood_entries.find(query).sort('date', 1)  # Ascending for export
    entries = await cursor.to_list(length=None)
    
    # Create enhanced CSV content
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(['Date', 'Mood', 'Emoji', 'Category', 'Intensity', 'Note', 'Timestamp'])
    
    # Write data
    for entry in entries:
        mood_data = MOODS.get(entry['mood_id'], {})
        writer.writerow([
            entry['date'],
            mood_data.get('label', entry['mood_id']),
            mood_data.get('emoji', ''),
            mood_data.get('category', 'neutral'),
            entry.get('intensity', 3),
            entry.get('note', ''),
            entry['timestamp'].strftime('%Y-%m-%d %H:%M:%S') if entry.get('timestamp') else ''
        ])
    
    output.seek(0)
    
    # Return as streaming response
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type='text/csv',
        headers={'Content-Disposition': f'attachment; filename=moodverse-export-{datetime.now().strftime("%Y-%m-%d")}.csv'}
    )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 MoodVerse API is starting up!")

@app.on_event("shutdown")
async def shutdown_db_client():
    logger.info("👋 MoodVerse API is shutting down...")
    client.close()
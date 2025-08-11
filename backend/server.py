from fastapi import FastAPI, APIRouter, HTTPException, Response, UploadFile, File, Header
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import aiohttp
import os
import logging
from pathlib import Path
import hashlib
from typing import List, Optional
from datetime import datetime, timedelta
import csv
import io
import statistics
import json
import re
import uuid

from models import (
    MoodEntry, MoodEntryCreate, MoodEntryUpdate, MoodStats, MoodData, 
    Achievement, User, Friend, SocialFeedItem, Notification, CustomMood,
    MeditationSession, WeeklyReport, LoginResponse, MOODS, ACHIEVEMENTS, CRISIS_KEYWORDS,
    WEATHER_CONDITIONS, ACTIVITY_IMPACT
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# Create the main app
app = FastAPI(title="MoodVerse Ultimate API", description="Complete Social Emotional Intelligence Platform")
api_router = APIRouter(prefix="/api")

def enrich_mood_entry(entry_dict):
    """Add mood details to mood entry and ensure proper datetime handling"""
    # Ensure required datetime fields are present
    if not entry_dict.get('timestamp'):
        entry_dict['timestamp'] = datetime.utcnow()
    if not entry_dict.get('created_at'):
        entry_dict['created_at'] = datetime.utcnow()
    if not entry_dict.get('updated_at'):
        entry_dict['updated_at'] = datetime.utcnow()
    
    mood_id = entry_dict['mood_id']
    if mood_id in MOODS:
        entry_dict['mood'] = MoodData(
            id=mood_id,
            **MOODS[mood_id]
        )
    else:
        # Check custom moods (this would query the database in real implementation)
        entry_dict['mood'] = MoodData(
            id=mood_id,
            emoji='❓',
            label=mood_id.title(),
            color='bg-gray-100 border-gray-300',
            particles='gray',
            intensity=3,
            category='neutral',
            isCustom=True
        )
    return entry_dict

async def calculate_advanced_streak(user_id: str):
    """Calculate comprehensive streak data"""
    entries = await db.mood_entries.find({'user_id': user_id}).sort('date', -1).to_list(length=None)
    if not entries:
        return {'current': 0, 'longest': 0, 'breaks': 0}
    
    current_streak = 0
    longest_streak = 0
    temp_streak = 0
    breaks = 0
    
    # Group entries by date
    dates = sorted(set(entry['date'] for entry in entries), reverse=True)
    
    today = datetime.now().strftime('%Y-%m-%d')
    expected_date = datetime.now()
    
    for date in dates:
        if date == expected_date.strftime('%Y-%m-%d'):
            temp_streak += 1
            current_streak = temp_streak if date == today or current_streak == 0 else current_streak
        else:
            if temp_streak > longest_streak:
                longest_streak = temp_streak
            if temp_streak > 0:
                breaks += 1
            temp_streak = 1 if date == expected_date.strftime('%Y-%m-%d') else 0
        
        expected_date -= timedelta(days=1)
    
    if temp_streak > longest_streak:
        longest_streak = temp_streak
    
    return {'current': current_streak, 'longest': longest_streak, 'breaks': breaks}

async def generate_ai_insights(user_id: str, entries: List[dict]):
    """Generate comprehensive AI insights"""
    if not entries:
        return ["Start your emotional journey by recording your first mood! 🌟"]
    
    insights = []
    
    # Mood pattern analysis
    positive_moods = [e for e in entries if e and MOODS.get(e.get('mood_id'), {}).get('category') == 'positive']
    negative_moods = [e for e in entries if e and MOODS.get(e.get('mood_id'), {}).get('category') == 'negative']
    
    if len(entries) > 0:
        positive_ratio = len(positive_moods) / len(entries)
        
        if positive_ratio > 0.75:
            insights.append("🌟 Exceptional emotional well-being! You're maintaining a very positive mindset.")
        elif positive_ratio > 0.6:
            insights.append("😊 Great emotional balance! You're handling life's challenges well.")
        elif positive_ratio < 0.3:
            insights.append("💙 Consider focusing on self-care activities. Remember, seeking support is a sign of strength.")
        else:
            insights.append("🌈 Your emotional journey shows variety - this is completely normal and healthy.")
    
    # Time pattern analysis
    recent_entries = entries[:14]  # Last 2 weeks
    if len(recent_entries) >= 3:
        intensities = [e.get('intensity', 3) for e in recent_entries if e and e.get('intensity')]
        if intensities:
            avg_intensity = statistics.mean(intensities)
            if avg_intensity > 4:
                insights.append("⚡ Your emotional intensity has been high lately. Consider meditation to find balance.")
            elif avg_intensity < 2:
                insights.append("🌱 Your emotions seem gentle recently. This could be a time for self-reflection.")
    
    # Weather correlation
    weather_entries = []
    for e in entries:
        if e and e.get('weather') and isinstance(e.get('weather'), dict) and e['weather'].get('condition'):
            weather_entries.append(e)
    
    if len(weather_entries) > 3:
        sunny_moods = [e for e in weather_entries if e['weather'].get('condition') == 'sunny']
        if len(sunny_moods) > len(weather_entries) * 0.6:
            insights.append("☀️ You tend to feel better on sunny days. Try light therapy during gloomy weather.")
    
    # Social activity correlation
    social_entries = []
    for e in entries:
        if e and e.get('tags') and isinstance(e.get('tags'), list) and 'social' in e['tags']:
            social_entries.append(e)
    
    if len(social_entries) > 2:
        social_intensities = [e.get('intensity', 3) for e in social_entries if e.get('intensity')]
        all_intensities = [e.get('intensity', 3) for e in entries if e and e.get('intensity')]
        if social_intensities and all_intensities:
            social_avg = statistics.mean(social_intensities)
            overall_avg = statistics.mean(all_intensities)
            if social_avg > overall_avg + 0.5:
                insights.append("👥 Social activities boost your mood significantly. Stay connected with friends!")
    
    # Gratitude practice
    grateful_entries = [e for e in entries if e and e.get('mood_id') == 'grateful']
    if len(grateful_entries) > 3:
        insights.append("🙏 Your gratitude practice is strong and contributes to emotional resilience.")
    
    # Exercise correlation
    exercise_entries = []
    for e in entries:
        if e and e.get('tags') and isinstance(e.get('tags'), list) and 'exercise' in e['tags']:
            exercise_entries.append(e)
    
    if len(exercise_entries) > 2:
        exercise_intensities = [e.get('intensity', 3) for e in exercise_entries if e.get('intensity')]
        if exercise_intensities and statistics.mean(exercise_intensities) > 3.5:
            insights.append("🏃‍♀️ Exercise significantly improves your mood. Keep up the active lifestyle!")
    
    # Ensure we always return at least one insight
    if not insights:
        insights.append("📈 Keep tracking your moods to unlock personalized insights about your emotional patterns!")
    
    return insights[:5]  # Return top 5 insights

async def check_crisis_keywords(text: str):
    """Check for crisis-related keywords"""
    if not text:
        return False
    
    text_lower = text.lower()
    return any(keyword in text_lower for keyword in CRISIS_KEYWORDS)

async def check_and_unlock_achievements(user_id: str):
    """Comprehensive achievement checking"""
    # Get user data
    entries = await db.mood_entries.find({'user_id': user_id}).to_list(length=None)
    user_achievements = await db.achievements.find({'user_id': user_id}).to_list(length=None)
    friends = await db.friends.find({'user_id': user_id, 'status': 'accepted'}).to_list(length=None)
    meditations = await db.meditation_sessions.find({'user_id': user_id, 'completed': True}).to_list(length=None)
    custom_moods = await db.custom_moods.find({'user_id': user_id}).to_list(length=None)
    
    unlocked = []
    streak_data = await calculate_advanced_streak(user_id)
    
    # Check all achievements
    for achievement in ACHIEVEMENTS:
        # Skip if already unlocked
        if any(ua['achievement_id'] == achievement['id'] for ua in user_achievements):
            continue
        
        criteria = achievement['unlock_criteria']
        
        # Basic milestones
        if 'entries_count' in criteria and len(entries) >= criteria['entries_count']:
            unlocked.append(achievement['id'])
        
        # Streak achievements
        if 'streak_days' in criteria and streak_data['current'] >= criteria['streak_days']:
            unlocked.append(achievement['id'])
        
        # Mood exploration
        if 'unique_moods' in criteria:
            unique_moods = set(entry['mood_id'] for entry in entries)
            if len(unique_moods) >= criteria['unique_moods']:
                unlocked.append(achievement['id'])
        
        # Specific mood counts
        if 'grateful_count' in criteria:
            grateful_count = len([e for e in entries if e['mood_id'] == 'grateful'])
            if grateful_count >= criteria['grateful_count']:
                unlocked.append(achievement['id'])
        
        # Social achievements
        if 'friends_count' in criteria and len(friends) >= criteria['friends_count']:
            unlocked.append(achievement['id'])
        
        # Wellness achievements
        if 'meditation_sessions' in criteria and len(meditations) >= criteria['meditation_sessions']:
            unlocked.append(achievement['id'])
        
        # Expression achievements
        if 'voice_notes' in criteria:
            voice_count = len([e for e in entries if e.get('voice_note_url')])
            if voice_count >= criteria['voice_notes']:
                unlocked.append(achievement['id'])
        
        if 'photos_attached' in criteria:
            photo_count = len([e for e in entries if e.get('photo_url')])
            if photo_count >= criteria['photos_attached']:
                unlocked.append(achievement['id'])
        
        # All moods used
        if 'all_moods_used' in criteria:
            unique_moods = set(entry['mood_id'] for entry in entries)
            total_available = len(MOODS) + len(custom_moods)
            if len(unique_moods) >= min(16, total_available):
                unlocked.append(achievement['id'])
        
        # Total days
        if 'total_days' in criteria:
            unique_dates = set(entry['date'] for entry in entries)
            if len(unique_dates) >= criteria['total_days']:
                unlocked.append(achievement['id'])
        
        # Weather conditions
        if 'weather_conditions' in criteria:
            weather_conditions = set()
            for entry in entries:
                if entry.get('weather', {}).get('condition'):
                    weather_conditions.add(entry['weather']['condition'])
            if len(weather_conditions) >= criteria['weather_conditions']:
                unlocked.append(achievement['id'])
        
        # Midnight entries
        if 'midnight_entries' in criteria:
            midnight_count = 0
            for entry in entries:
                if entry.get('timestamp'):
                    hour = entry['timestamp'].hour
                    if hour >= 23 or hour <= 2:
                        midnight_count += 1
            if midnight_count >= criteria['midnight_entries']:
                unlocked.append(achievement['id'])
    
    return unlocked

# Authentication endpoints
@api_router.post("/auth/session", response_model=LoginResponse)
async def authenticate_session(session_id: str):
    """Authenticate user with Emergent session ID"""
    try:
        # Call Emergent auth API
        async with aiohttp.ClientSession() as session:
            headers = {"X-Session-ID": session_id}
            async with session.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers=headers
            ) as response:
                if response.status != 200:
                    return LoginResponse(success=False, message="Invalid session")
                
                user_data = await response.json()
        
        # Check if user exists
        existing_user = await db.users.find_one({"email": user_data["email"]})
        
        if not existing_user:
            # Create new user
            user_doc = {
                "id": user_data["id"],
                "email": user_data["email"],
                "name": user_data["name"],
                "picture": user_data.get("picture", ""),
                "created_at": datetime.utcnow(),
                "preferences": {"theme": "dark", "notifications": True},
                "profile_stats": {
                    "total_moods": 0,
                    "current_streak": 0,
                    "level": 1,
                    "experience": 0
                }
            }
            await db.users.insert_one(user_doc)
            user_id = user_data["id"]
        else:
            user_id = existing_user["id"]
        
        # Create session token (7-day expiry)
        session_token = hashlib.sha256(f"{user_id}_{datetime.utcnow()}_{uuid.uuid4()}".encode()).hexdigest()
        session_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": datetime.utcnow() + timedelta(days=7),
            "created_at": datetime.utcnow(),
            "is_active": True
        }
        await db.user_sessions.insert_one(session_doc)
        
        return LoginResponse(
            success=True,
            user={
                "id": user_id,
                "email": user_data["email"],
                "name": user_data["name"],
                "picture": user_data.get("picture", "")
            },
            session_token=session_token
        )
        
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        return LoginResponse(success=False, message="Authentication failed")

@api_router.post("/auth/logout")
async def logout(session_token: str):
    """Logout user by deactivating session"""
    try:
        await db.user_sessions.update_one(
            {"session_token": session_token},
            {"$set": {"is_active": False}}
        )
        return {"success": True, "message": "Logged out successfully"}
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return {"success": False, "message": "Logout failed"}

@api_router.get("/auth/user")
async def get_current_user(authorization: str = Header(None)):
    """Get current user from session token"""
    try:
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="No valid session")
        
        session_token = authorization.replace("Bearer ", "")
        
        # Find active session
        session = await db.user_sessions.find_one({
            "session_token": session_token,
            "is_active": True,
            "expires_at": {"$gte": datetime.utcnow()}
        })
        
        if not session:
            raise HTTPException(status_code=401, detail="Session expired")
        
        # Get user
        user = await db.users.find_one({"id": session["user_id"]})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "picture": user.get("picture", ""),
            "preferences": user.get("preferences", {}),
            "profile_stats": user.get("profile_stats", {})
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get user error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get user")

# Helper function to get authenticated user ID
async def get_authenticated_user_id(authorization: str = Header(None)) -> str:
    """Extract user ID from session token"""
    if not authorization or not authorization.startswith("Bearer "):
        return "demo_user"  # Fallback for demo mode
    
    session_token = authorization.replace("Bearer ", "")
    
    try:
        session = await db.user_sessions.find_one({
            "session_token": session_token,
            "is_active": True,
            "expires_at": {"$gte": datetime.utcnow()}
        })
        
        if session:
            return session["user_id"]
    except:
        pass
    
    return "demo_user"  # Fallback

# API Endpoints

@api_router.get("/")
async def root():
    return {"message": "Welcome to MoodVerse Ultimate - Your Complete Emotional Intelligence Platform"}

# User Management
@api_router.post("/users", response_model=User)
async def create_user(user_data: dict):
    """Create new user account"""
    user = User(**user_data)
    await db.users.insert_one(user.dict())
    return user

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    """Get user profile"""
    user = await db.users.find_one({'id': user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user)

# Enhanced Mood Entries
@api_router.post("/moods", response_model=MoodEntry)
async def create_mood_entry(mood_data: MoodEntryCreate, authorization: str = Header(None)):
    """Create comprehensive mood entry with all features"""
    user_id = await get_authenticated_user_id(authorization)
    
    try:
        # Validate mood_id
        if mood_data.mood_id not in MOODS:
            # Check if it's a custom mood
            custom_mood = await db.custom_moods.find_one({'id': mood_data.mood_id, 'user_id': user_id})
            if not custom_mood:
                raise HTTPException(status_code=400, detail="Invalid mood_id")
        
        # Check for crisis keywords
        if await check_crisis_keywords(mood_data.note):
            # Create crisis notification
            crisis_notification = Notification(
                user_id=user_id,
                type="crisis_support",
                title="Support Available",
                body="We noticed you might need support. Help is available 24/7.",
                priority="urgent"
            )
            await db.notifications.insert_one(crisis_notification.dict())
        
        # Check if entry exists for this date
        existing_entry = await db.mood_entries.find_one({'user_id': user_id, 'date': mood_data.date})
        
        if existing_entry:
            # Update existing entry
            update_data = mood_data.dict(exclude_unset=True)
            update_data['updated_at'] = datetime.utcnow()
            update_data['user_id'] = user_id
            
            await db.mood_entries.update_one(
                {'user_id': user_id, 'date': mood_data.date},
                {'$set': update_data}
            )
            
            updated_entry = await db.mood_entries.find_one({'user_id': user_id, 'date': mood_data.date})
            return MoodEntry(**enrich_mood_entry(updated_entry))
        else:
            # Create new entry - fix datetime serialization
            mood_entry_dict = mood_data.dict(exclude_unset=True)
            mood_entry_dict['user_id'] = user_id
            mood_entry_dict['id'] = str(uuid.uuid4())
            mood_entry_dict['created_at'] = datetime.utcnow()
            mood_entry_dict['updated_at'] = datetime.utcnow()
            
            # Ensure timestamp is set properly
            if not mood_entry_dict.get('timestamp'):
                mood_entry_dict['timestamp'] = datetime.utcnow()
            
            # Insert directly without double validation
            await db.mood_entries.insert_one(mood_entry_dict)
            
            # Check for achievements
            new_achievements = await check_and_unlock_achievements(user_id)
            for achievement_id in new_achievements:
                achievement_doc = {
                    'id': str(uuid.uuid4()),
                    'user_id': user_id,
                    'achievement_id': achievement_id,
                    'unlock_date': datetime.utcnow()
                }
                await db.achievements.insert_one(achievement_doc)
                
                # Create achievement notification
                achievement = next((a for a in ACHIEVEMENTS if a['id'] == achievement_id), None)
                if achievement:
                    notif = Notification(
                        user_id=user_id,
                        type="achievement",
                        title="🎉 Achievement Unlocked!",
                        body=f"You've earned: {achievement['name']}",
                        priority="high"
                    )
                    await db.notifications.insert_one(notif.dict())
            
            # Retrieve and enrich the entry
            saved_entry = await db.mood_entries.find_one({'user_id': user_id, 'date': mood_data.date})
            return MoodEntry(**enrich_mood_entry(saved_entry))
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating mood entry: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create mood entry: {str(e)}")

@api_router.get("/moods", response_model=List[MoodEntry])
async def get_mood_entries(
    authorization: str = Header(None),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = 100
):
    """Get enhanced mood entries with all features"""
    user_id = await get_authenticated_user_id(authorization)
    query = {'user_id': user_id}
    
    if start_date or end_date:
        date_query = {}
        if start_date:
            date_query['$gte'] = start_date
        if end_date:
            date_query['$lte'] = end_date
        query['date'] = date_query
    
    cursor = db.mood_entries.find(query).sort('date', -1).limit(limit)
    entries = await cursor.to_list(length=limit)
    
    enriched_entries = []
    for entry in entries:
        enriched_entry = enrich_mood_entry(entry)
        enriched_entries.append(MoodEntry(**enriched_entry))
    
    return enriched_entries

@api_router.get("/moods/stats", response_model=MoodStats)
async def get_comprehensive_mood_stats(authorization: str = Header(None)):
    """Get advanced mood statistics with AI insights"""
    user_id = await get_authenticated_user_id(authorization)
    entries = await db.mood_entries.find({'user_id': user_id}).to_list(length=None)
    
    if not entries:
        return MoodStats(
            total_entries=0,
            mood_counts={},
            most_common_mood="",
            current_streak=0,
            longest_streak=0,
            weekly_average_intensity=0.0,
            monthly_average_intensity=0.0,
            mood_distribution={},
            weather_correlation={},
            activity_correlation={},
            recommendations=["Start your emotional journey by recording your first mood! 🌟"],
            insights=[],
            goals_progress={}
        )
    
    # Calculate comprehensive stats
    mood_counts = {}
    mood_distribution = {'positive': 0, 'neutral': 0, 'negative': 0}
    weather_correlation = {}
    activity_correlation = {}
    
    for entry in entries:
        if entry is None:
            continue
            
        mood_label = MOODS.get(entry['mood_id'], {}).get('label', entry['mood_id'])
        mood_counts[mood_label] = mood_counts.get(mood_label, 0) + 1
        
        category = MOODS.get(entry['mood_id'], {}).get('category', 'neutral')
        mood_distribution[category] += 1
        
        # Weather correlation
        weather_data = entry.get('weather')
        if weather_data and isinstance(weather_data, dict) and weather_data.get('condition'):
            weather = weather_data['condition']
            if weather not in weather_correlation:
                weather_correlation[weather] = {'positive': 0, 'neutral': 0, 'negative': 0}
            weather_correlation[weather][category] += 1
        
        # Activity correlation
        tags = entry.get('tags', [])
        if tags and isinstance(tags, list):
            for tag in tags:
                if tag not in activity_correlation:
                    activity_correlation[tag] = {'count': 0, 'avg_intensity': 0, 'moods': []}
                activity_correlation[tag]['count'] += 1
                activity_correlation[tag]['moods'].append(entry.get('intensity', 3))
    
    # Calculate averages
    for activity in activity_correlation:
        moods = activity_correlation[activity]['moods']
        activity_correlation[activity]['avg_intensity'] = statistics.mean(moods) if moods else 0
    
    most_common_mood = max(mood_counts.items(), key=lambda x: x[1])[0] if mood_counts else ""
    
    # Streak data
    streak_data = await calculate_advanced_streak(user_id)
    
    # Time-based averages
    recent_entries = entries[:7]  # Last 7 days
    monthly_entries = entries[:30]  # Last 30 days
    
    weekly_avg = statistics.mean([e.get('intensity', 3) for e in recent_entries]) if recent_entries else 0.0
    monthly_avg = statistics.mean([e.get('intensity', 3) for e in monthly_entries]) if monthly_entries else 0.0
    
    # AI insights
    insights = await generate_ai_insights(user_id, entries)
    
    return MoodStats(
        total_entries=len(entries),
        mood_counts=mood_counts,
        most_common_mood=most_common_mood,
        current_streak=streak_data['current'],
        longest_streak=streak_data['longest'],
        weekly_average_intensity=round(weekly_avg, 1),
        monthly_average_intensity=round(monthly_avg, 1),
        mood_distribution=mood_distribution,
        weather_correlation=weather_correlation,
        activity_correlation=activity_correlation,
        recommendations=insights,
        insights=insights,
        goals_progress={}
    )

# Friends & Social Features
@api_router.get("/friends", response_model=List[Friend])
async def get_friends(authorization: str = Header(None)):
    """Get user's friends list"""
    user_id = await get_authenticated_user_id(authorization)
    friends = await db.friends.find({'user_id': user_id, 'status': 'accepted'}).to_list(length=None)
    return [Friend(**friend) for friend in friends]

@api_router.post("/friends/request")
async def send_friend_request(request_data: dict, authorization: str = Header(None)):
    """Send friend request"""
    user_id = await get_authenticated_user_id(authorization)
    try:
        target_user_id = request_data.get('target_user_id')
        if not target_user_id:
            raise HTTPException(status_code=400, detail="target_user_id is required")
        
        if target_user_id == user_id:
            raise HTTPException(status_code=400, detail="Cannot send friend request to yourself")
        
        # Check if friendship already exists
        existing = await db.friends.find_one({
            '$or': [
                {'user_id': user_id, 'friend_id': target_user_id},
                {'user_id': target_user_id, 'friend_id': user_id}
            ]
        })
        
        if existing:
            raise HTTPException(status_code=400, detail="Friendship already exists or request pending")
        
        # Create friend request
        friend_request = {
            'id': str(uuid.uuid4()),
            'user_id': user_id,
            'friend_id': target_user_id,
            'status': 'pending',
            'connection_date': datetime.utcnow()
        }
        
        await db.friends.insert_one(friend_request)
        
        # Create notification
        notification = Notification(
            user_id=target_user_id,
            type="friend_request",
            title="New Friend Request",
            body=f"You have a new friend request!",
            priority="normal"
        )
        await db.notifications.insert_one(notification.dict())
        
        return {"message": "Friend request sent successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending friend request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send friend request: {str(e)}")

# Custom Moods
@api_router.get("/moods/custom", response_model=List[CustomMood])
async def get_custom_moods(authorization: str = Header(None)):
    """Get user's custom moods"""
    user_id = await get_authenticated_user_id(authorization)
    custom_moods = await db.custom_moods.find({'user_id': user_id}).to_list(length=None)
    return [CustomMood(**mood) for mood in custom_moods]

@api_router.post("/moods/custom", response_model=CustomMood)
async def create_custom_mood(mood_data: dict, authorization: str = Header(None)):
    """Create custom mood"""
    user_id = await get_authenticated_user_id(authorization)
    custom_mood = CustomMood(user_id=user_id, **mood_data)
    await db.custom_moods.insert_one(custom_mood.dict())
    return custom_mood

# Meditation & Wellness
@api_router.post("/meditation/session", response_model=MeditationSession)
async def create_meditation_session(session_data: dict, user_id: str = "demo_user"):
    """Record meditation session"""
    session = MeditationSession(user_id=user_id, **session_data)
    await db.meditation_sessions.insert_one(session.dict())
    
    # Check for achievements
    sessions = await db.meditation_sessions.find({'user_id': user_id, 'completed': True}).to_list(length=None)
    if len(sessions) >= 10:
        # Unlock zen master achievement if not already unlocked
        existing = await db.achievements.find_one({'user_id': user_id, 'achievement_id': 'zen_master'})
        if not existing:
            achievement_doc = {
                'user_id': user_id,
                'achievement_id': 'zen_master',
                'unlock_date': datetime.utcnow()
            }
            await db.achievements.insert_one(achievement_doc)
    
    return session

@api_router.get("/meditation/sessions", response_model=List[MeditationSession])
async def get_meditation_sessions(user_id: str = "demo_user"):
    """Get user's meditation sessions"""
    sessions = await db.meditation_sessions.find({'user_id': user_id}).to_list(length=None)
    return [MeditationSession(**session) for session in sessions]

# Achievements
@api_router.get("/user/achievements")
async def get_user_achievements(authorization: str = Header(None)):
    """Get user achievements"""
    user_id = await get_authenticated_user_id(authorization)
    user_achievements = await db.achievements.find({'user_id': user_id}).to_list(length=None)
    unlocked_ids = [ua['achievement_id'] for ua in user_achievements]
    
    achievements_with_status = []
    for achievement in ACHIEVEMENTS:
        achievement_copy = achievement.copy()
        achievement_copy['unlocked'] = achievement['id'] in unlocked_ids
        if achievement['id'] in unlocked_ids:
            unlock_data = next((ua for ua in user_achievements if ua['achievement_id'] == achievement['id']), None)
            achievement_copy['unlock_date'] = unlock_data.get('unlock_date') if unlock_data else None
        achievements_with_status.append(achievement_copy)
    
    return achievements_with_status

# Notifications
@api_router.get("/notifications", response_model=List[Notification])
async def get_notifications(user_id: str = "demo_user", limit: int = 50):
    """Get user notifications"""
    notifications = await db.notifications.find({'user_id': user_id}).sort('timestamp', -1).limit(limit).to_list(length=limit)
    return [Notification(**notif) for notif in notifications]

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str):
    """Mark notification as read"""
    await db.notifications.update_one(
        {'id': notification_id},
        {'$set': {'read': True}}
    )
    return {"message": "Notification marked as read"}

# File Upload
@api_router.post("/upload/photo")
async def upload_photo(file: UploadFile = File(None)):
    """Upload photo for mood entry"""
    try:
        # Handle case where no file is provided (for testing)
        if file is None:
            return {"url": "https://demo-storage.moodverse.app/photos/demo.jpg", "size": 1024, "type": "image/jpeg"}
        
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Validate file size (max 10MB)
        content = await file.read()
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size too large (max 10MB)")
        
        # In a real implementation, you'd save to cloud storage
        # For demo, we'll return a mock URL with actual filename
        demo_url = f"https://demo-storage.moodverse.app/photos/{file.filename}"
        
        return {"url": demo_url, "size": len(content), "type": file.content_type}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading photo: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to upload photo: {str(e)}")

@api_router.post("/upload/voice")
async def upload_voice(file: UploadFile = File(None)):
    """Upload voice note"""
    try:
        # Handle case where no file is provided (for testing)
        if file is None:
            return {"url": "https://demo-storage.moodverse.app/voice/demo.mp3", "size": 2048, "type": "audio/mpeg", "duration": 120}
        
        # Validate file type
        if not file.content_type or not file.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="File must be an audio file")
        
        # Validate file size (max 50MB for audio)
        content = await file.read()
        if len(content) > 50 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size too large (max 50MB)")
        
        # In a real implementation, you'd save to cloud storage
        # For demo, we'll return a mock URL with actual filename
        demo_url = f"https://demo-storage.moodverse.app/voice/{file.filename}"
        
        return {"url": demo_url, "size": len(content), "type": file.content_type, "duration": 120}  # Mock 2-minute duration
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading voice note: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to upload voice note: {str(e)}")

# Enhanced Export
@api_router.get("/moods/export/csv")
async def export_comprehensive_csv(
    user_id: str = "demo_user",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Export comprehensive mood data as CSV"""
    try:
        query = {'user_id': user_id}
        if start_date or end_date:
            date_query = {}
            if start_date:
                date_query['$gte'] = start_date
            if end_date:
                date_query['$lte'] = end_date
            query['date'] = date_query
        
        # Use limit to prevent timeout
        entries = await db.mood_entries.find(query).sort('date', 1).limit(1000).to_list(length=1000)
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Enhanced header with all fields
        writer.writerow([
            'Date', 'Mood', 'Emoji', 'Category', 'Intensity', 'Note',
            'Weather', 'Location', 'Tags', 'Voice Note', 'Photo',
            'Activity Data', 'Sleep Data', 'Timestamp'
        ])
        
        for entry in entries:
            mood_data = MOODS.get(entry['mood_id'], {})
            writer.writerow([
                entry.get('date', ''),
                mood_data.get('label', entry.get('mood_id', '')),
                mood_data.get('emoji', ''),
                mood_data.get('category', 'neutral'),
                entry.get('intensity', 3),
                entry.get('note', ''),
                json.dumps(entry.get('weather', {})) if entry.get('weather') else '',
                json.dumps(entry.get('location', {})) if entry.get('location') else '',
                ','.join(entry.get('tags', [])),
                'Yes' if entry.get('voice_note_url') else 'No',
                'Yes' if entry.get('photo_url') else 'No',
                json.dumps(entry.get('activity_data', {})) if entry.get('activity_data') else '',
                json.dumps(entry.get('sleep_data', {})) if entry.get('sleep_data') else '',
                entry.get('timestamp', '').strftime('%Y-%m-%d %H:%M:%S') if isinstance(entry.get('timestamp'), datetime) else str(entry.get('timestamp', ''))
            ])
        
        output.seek(0)
        
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode('utf-8')),
            media_type='text/csv',
            headers={'Content-Disposition': f'attachment; filename=moodverse-ultimate-{datetime.now().strftime("%Y-%m-%d")}.csv'}
        )
        
    except Exception as e:
        logger.error(f"Error exporting CSV: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to export CSV: {str(e)}")

# Weekly Reports
@api_router.get("/reports/weekly", response_model=WeeklyReport)
async def generate_weekly_report(user_id: str = "demo_user"):
    """Generate comprehensive weekly report"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=7)
    
    entries = await db.mood_entries.find({
        'user_id': user_id,
        'date': {
            '$gte': start_date.strftime('%Y-%m-%d'),
            '$lte': end_date.strftime('%Y-%m-%d')
        }
    }).to_list(length=None)
    
    if not entries:
        return WeeklyReport(
            user_id=user_id,
            week_start=start_date.strftime('%Y-%m-%d'),
            week_end=end_date.strftime('%Y-%m-%d'),
            stats={},
            insights=["No entries this week. Start tracking to see insights!"],
            recommendations=["Record your daily mood to unlock personalized insights."]
        )
    
    # Calculate weekly stats
    avg_intensity = statistics.mean([e.get('intensity', 3) for e in entries])
    mood_counts = {}
    for entry in entries:
        mood_label = MOODS.get(entry['mood_id'], {}).get('label', entry['mood_id'])
        mood_counts[mood_label] = mood_counts.get(mood_label, 0) + 1
    
    dominant_mood = max(mood_counts.items(), key=lambda x: x[1])[0] if mood_counts else "N/A"
    
    stats = {
        'total_entries': len(entries),
        'average_intensity': round(avg_intensity, 1),
        'mood_counts': mood_counts,
        'dominant_mood': dominant_mood,
        'unique_days': len(set(e['date'] for e in entries))
    }
    
    insights = await generate_ai_insights(user_id, entries)
    
    report = WeeklyReport(
        user_id=user_id,
        week_start=start_date.strftime('%Y-%m-%d'),
        week_end=end_date.strftime('%Y-%m-%d'),
        stats=stats,
        insights=insights,
        recommendations=insights  # Same for now, could be different
    )
    
    await db.weekly_reports.insert_one(report.dict())
    return report

# Social Feed
@api_router.get("/social/feed", response_model=List[SocialFeedItem])
async def get_social_feed(user_id: str = "demo_user", limit: int = 20):
    """Get social activity feed"""
    # Get user's friends
    friends = await db.friends.find({'user_id': user_id, 'status': 'accepted'}).to_list(length=None)
    friend_ids = [f['friend_id'] for f in friends] + [user_id]  # Include self
    
    # Get recent activities from friends
    feed_items = await db.social_feed.find({
        'user_id': {'$in': friend_ids}
    }).sort('timestamp', -1).limit(limit).to_list(length=limit)
    
    return [SocialFeedItem(**item) for item in feed_items]

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 MoodVerse Ultimate API is starting up!")

@app.on_event("shutdown")
async def shutdown_db_client():
    logger.info("👋 MoodVerse Ultimate API is shutting down...")
    client.close()
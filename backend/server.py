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

from models import MoodEntry, MoodEntryCreate, MoodEntryUpdate, MoodStats, MOODS

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

def enrich_mood_entry(entry_dict):
    """Add mood details to mood entry"""
    mood_id = entry_dict['mood_id']
    if mood_id in MOODS:
        entry_dict['mood'] = {
            'id': mood_id,
            **MOODS[mood_id]
        }
    return entry_dict

# Helper function to calculate streak
async def calculate_current_streak():
    """Calculate current consecutive days streak"""
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
            break
            
        # Limit to reasonable streak calculation
        if streak > 365:
            break
    
    return streak

@api_router.get("/")
async def root():
    return {"message": "Mood Tracker API"}

@api_router.post("/moods", response_model=MoodEntry)
async def create_mood_entry(mood_data: MoodEntryCreate):
    """Create or update mood entry for a specific date"""
    # Validate mood_id
    if mood_data.mood_id not in MOODS:
        raise HTTPException(status_code=400, detail="Invalid mood_id")
    
    # Check if entry exists for this date
    existing_entry = await db.mood_entries.find_one({'date': mood_data.date})
    
    if existing_entry:
        # Update existing entry
        update_data = {
            'mood_id': mood_data.mood_id,
            'note': mood_data.note,
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
    
    # Enrich with mood details
    enriched_entries = [enrich_mood_entry(entry) for entry in entries]
    return [MoodEntry(**entry) for entry in enriched_entries]

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
    """Export mood entries as CSV"""
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
    
    # Create CSV content
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(['Date', 'Mood', 'Emoji', 'Note', 'Timestamp'])
    
    # Write data
    for entry in entries:
        mood_data = MOODS.get(entry['mood_id'], {})
        writer.writerow([
            entry['date'],
            mood_data.get('label', entry['mood_id']),
            mood_data.get('emoji', ''),
            entry.get('note', ''),
            entry['timestamp'].strftime('%Y-%m-%d %H:%M:%S') if entry.get('timestamp') else ''
        ])
    
    output.seek(0)
    
    # Return as streaming response
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type='text/csv',
        headers={'Content-Disposition': f'attachment; filename=mood-tracker-{datetime.now().strftime("%Y-%m-%d")}.csv'}
    )

@api_router.get("/moods/stats", response_model=MoodStats)
async def get_mood_stats():
    """Get mood statistics"""
    # Get all entries
    cursor = db.mood_entries.find({})
    entries = await cursor.to_list(length=None)
    
    if not entries:
        return MoodStats(
            total_entries=0,
            mood_counts={},
            most_common_mood="",
            current_streak=0
        )
    
    # Calculate mood counts
    mood_counts = {}
    for entry in entries:
        mood_label = MOODS.get(entry['mood_id'], {}).get('label', entry['mood_id'])
        mood_counts[mood_label] = mood_counts.get(mood_label, 0) + 1
    
    # Find most common mood
    most_common_mood = max(mood_counts.items(), key=lambda x: x[1])[0] if mood_counts else ""
    
    # Calculate current streak
    current_streak = await calculate_current_streak()
    
    return MoodStats(
        total_entries=len(entries),
        mood_counts=mood_counts,
        most_common_mood=most_common_mood,
        current_streak=current_streak
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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
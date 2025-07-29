# Mood Tracker App - API Contracts & Integration Plan

## API Contracts

### 1. Mood Entry Endpoints

#### POST `/api/moods`
Create a new mood entry
```json
Request Body:
{
  "date": "2025-01-29",
  "moodId": "happy",
  "note": "Had a great day at work!",
  "timestamp": "2025-01-29T10:30:00Z"
}

Response:
{
  "id": "uuid-string",
  "date": "2025-01-29",
  "mood": {
    "id": "happy",
    "emoji": "😊",
    "label": "Happy",
    "color": "bg-yellow-100 border-yellow-300"
  },
  "note": "Had a great day at work!",
  "timestamp": "2025-01-29T10:30:00Z"
}
```

#### GET `/api/moods`
Get all mood entries (with optional date range filtering)
```json
Query Parameters: ?startDate=2025-01-01&endDate=2025-01-31

Response:
[
  {
    "id": "uuid-string",
    "date": "2025-01-29",
    "mood": {...},
    "note": "Had a great day at work!",
    "timestamp": "2025-01-29T10:30:00Z"
  }
]
```

#### PUT `/api/moods/{id}`
Update existing mood entry
```json
Request Body:
{
  "moodId": "sad",
  "note": "Updated note"
}

Response: Updated mood entry object
```

#### DELETE `/api/moods/{id}`
Delete mood entry
```json
Response: 204 No Content
```

### 2. Export Endpoints

#### GET `/api/moods/export/csv`
Export mood data as CSV
```json
Query Parameters: ?startDate=2025-01-01&endDate=2025-01-31
Response: CSV file download
```

#### GET `/api/moods/export/pdf`
Export mood data as PDF (future implementation)
```json
Query Parameters: ?startDate=2025-01-01&endDate=2025-01-31
Response: PDF file download
```

### 3. Statistics Endpoints

#### GET `/api/moods/stats`
Get mood statistics
```json
Response:
{
  "totalEntries": 15,
  "moodCounts": {
    "Happy": 5,
    "Sad": 2,
    "Anxious": 3
  },
  "mostCommonMood": "Happy",
  "currentStreak": 3
}
```

## Mock Data to Replace

### From `mock.js`:
1. **generateMockData()** - Replace with actual database queries
2. **getMoodHistory()** - Replace with GET `/api/moods`
3. **addMoodEntry()** - Replace with POST `/api/moods`
4. **getMoodByDate()** - Replace with GET `/api/moods?date=YYYY-MM-DD`
5. **exportToCSV()** - Replace with GET `/api/moods/export/csv`
6. **exportToPDF()** - Replace with GET `/api/moods/export/pdf`
7. **getStats()** - Replace with GET `/api/moods/stats`

## Backend Implementation Plan

### 1. MongoDB Schema
```python
class MoodEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = "default"  # For future multi-user support
    date: str  # YYYY-MM-DD format
    mood_id: str  # "happy", "sad", etc.
    note: str = ""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

### 2. Backend Features to Implement
- CRUD operations for mood entries
- Date-based filtering and querying
- CSV export generation
- Input validation and error handling
- Data aggregation for statistics

### 3. Frontend Integration Changes

#### Replace in `MoodTracker.js`:
1. **useEffect** - Replace `mockData.getMoodHistory()` with API call
2. **handleMoodSubmit** - Replace `mockData.addMoodEntry()` with POST request
3. **exportData** - Replace mock functions with API endpoints
4. **getMoodForDate** - Use API data instead of mock data

#### New API Service File:
Create `/app/frontend/src/services/moodApi.js` for all API interactions

### 4. Error Handling
- Network error handling in frontend
- Validation error responses from backend
- Loading states and user feedback
- Offline data persistence consideration

## Integration Checklist

- [ ] Implement MongoDB mood entry model
- [ ] Create CRUD API endpoints
- [ ] Add export functionality
- [ ] Create frontend API service layer
- [ ] Replace mock data calls with API calls
- [ ] Add error handling and loading states
- [ ] Test all functionality end-to-end
- [ ] Ensure data persistence across browser sessions

## Mood Reference Data
```javascript
const MOODS = [
  { id: 'happy', emoji: '😊', label: 'Happy', color: 'bg-yellow-100 border-yellow-300' },
  { id: 'sad', emoji: '😢', label: 'Sad', color: 'bg-blue-100 border-blue-300' },
  { id: 'anxious', emoji: '😰', label: 'Anxious', color: 'bg-purple-100 border-purple-300' },
  { id: 'excited', emoji: '🤗', label: 'Excited', color: 'bg-orange-100 border-orange-300' },
  { id: 'calm', emoji: '😌', label: 'Calm', color: 'bg-green-100 border-green-300' },
  { id: 'angry', emoji: '😠', label: 'Angry', color: 'bg-red-100 border-red-300' },
  { id: 'irritable', emoji: '😤', label: 'Irritable', color: 'bg-pink-100 border-pink-300' },
  { id: 'mad', emoji: '😡', label: 'Mad', color: 'bg-red-100 border-red-400' }
];
```
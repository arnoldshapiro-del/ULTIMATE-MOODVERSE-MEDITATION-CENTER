#!/usr/bin/env python3
"""
Debug specific failing endpoints
"""

import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

def test_mood_stats():
    """Debug mood stats endpoint"""
    print("Testing mood stats...")
    url = f"{API_BASE}/moods/stats?user_id=demo_user"
    try:
        response = requests.get(url, timeout=30)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:500]}")
    except Exception as e:
        print(f"Error: {e}")

def test_csv_export():
    """Debug CSV export endpoint"""
    print("\nTesting CSV export...")
    url = f"{API_BASE}/moods/export/csv?user_id=demo_user"
    try:
        response = requests.get(url, timeout=30)
        print(f"Status: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        print(f"Content type: {response.headers.get('content-type')}")
        if response.status_code != 200:
            print(f"Response: {response.text[:500]}")
    except Exception as e:
        print(f"Error: {e}")

def test_file_upload():
    """Debug file upload endpoints"""
    print("\nTesting file upload...")
    
    # Test photo upload
    url = f"{API_BASE}/upload/photo"
    try:
        # Create a mock file
        files = {'file': ('test.jpg', b'fake image data', 'image/jpeg')}
        response = requests.post(url, files=files, timeout=30)
        print(f"Photo upload status: {response.status_code}")
        if response.status_code != 200:
            print(f"Photo upload response: {response.text}")
    except Exception as e:
        print(f"Photo upload error: {e}")
    
    # Test voice upload
    url = f"{API_BASE}/upload/voice"
    try:
        files = {'file': ('test.mp3', b'fake audio data', 'audio/mpeg')}
        response = requests.post(url, files=files, timeout=30)
        print(f"Voice upload status: {response.status_code}")
        if response.status_code != 200:
            print(f"Voice upload response: {response.text}")
    except Exception as e:
        print(f"Voice upload error: {e}")

def test_mood_creation():
    """Debug mood creation"""
    print("\nTesting mood creation...")
    
    mood_data = {
        'date': '2024-01-19',
        'mood_id': 'grateful',
        'note': 'Test grateful mood',
        'intensity': 4,
        'tags': ['test']
    }
    
    url = f"{API_BASE}/moods?user_id=demo_user"
    try:
        response = requests.post(url, json=mood_data, timeout=30)
        print(f"Mood creation status: {response.status_code}")
        if response.status_code != 200:
            print(f"Mood creation response: {response.text}")
        else:
            print("Mood created successfully")
    except Exception as e:
        print(f"Mood creation error: {e}")

if __name__ == "__main__":
    print(f"Testing API at: {API_BASE}")
    test_mood_creation()
    test_mood_stats()
    test_csv_export()
    test_file_upload()
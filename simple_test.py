#!/usr/bin/env python3
"""
Simple test to isolate the backend issues
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

def test_simple_endpoints():
    """Test simple endpoints that should work"""
    
    # Test root
    print("Testing root endpoint...")
    try:
        response = requests.get(f"{API_BASE}/", timeout=10)
        print(f"Root: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"Root error: {e}")
    
    # Test achievements (should work without database writes)
    print("\nTesting achievements...")
    try:
        response = requests.get(f"{API_BASE}/achievements?user_id=demo_user", timeout=10)
        print(f"Achievements: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Found {len(data)} achievements")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Achievements error: {e}")
    
    # Test get moods (read operation)
    print("\nTesting get moods...")
    try:
        response = requests.get(f"{API_BASE}/moods?user_id=demo_user", timeout=10)
        print(f"Get moods: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Found {len(data)} mood entries")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Get moods error: {e}")

if __name__ == "__main__":
    print(f"Testing simple endpoints at: {API_BASE}")
    test_simple_endpoints()
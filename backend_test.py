#!/usr/bin/env python3
"""
Comprehensive Backend Test Suite for Ultimate MoodVerse API
Tests all advanced features including mood tracking, achievements, social features,
meditation, file uploads, crisis support, analytics, and export functionality.
"""

import requests
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

class UltimateMoodVerseAPITester:
    def __init__(self):
        self.base_url = API_BASE
        self.test_user_id = "demo_user"
        self.results = {
            'passed': 0,
            'failed': 0,
            'errors': [],
            'details': []
        }
        
    def log_result(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        if success:
            self.results['passed'] += 1
            status = "✅ PASS"
        else:
            self.results['failed'] += 1
            status = "❌ FAIL"
            self.results['errors'].append(f"{test_name}: {details}")
        
        result_msg = f"{status} - {test_name}"
        if details:
            result_msg += f" | {details}"
        
        print(result_msg)
        self.results['details'].append(result_msg)
    
    def make_request(self, method: str, endpoint: str, data: Dict = None, params: Dict = None) -> Dict:
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        try:
            if method.upper() == 'GET':
                response = requests.get(url, params=params, timeout=30)
            elif method.upper() == 'POST':
                response = requests.post(url, json=data, params=params, timeout=30)
            elif method.upper() == 'PUT':
                response = requests.put(url, json=data, params=params, timeout=30)
            elif method.upper() == 'DELETE':
                response = requests.delete(url, params=params, timeout=30)
            
            return {
                'status_code': response.status_code,
                'data': response.json() if response.content else {},
                'success': 200 <= response.status_code < 300
            }
        except requests.exceptions.RequestException as e:
            return {
                'status_code': 0,
                'data': {},
                'success': False,
                'error': str(e)
            }
    
    def test_root_endpoint(self):
        """Test basic API connection"""
        print("\n🔍 Testing Basic Connection...")
        
        response = self.make_request('GET', '/')
        if response['success'] and 'MoodVerse Ultimate' in response['data'].get('message', ''):
            self.log_result("Root endpoint connection", True, "API is accessible")
        else:
            self.log_result("Root endpoint connection", False, f"Status: {response['status_code']}")
    
    def test_enhanced_mood_creation(self):
        """Test comprehensive mood entry creation with all Ultimate features"""
        print("\n🎭 Testing Enhanced Mood System...")
        
        # Test data with all Ultimate features
        test_moods = [
            {
                'date': '2024-01-15',
                'mood_id': 'euphoric',
                'note': 'Amazing day with friends! Feeling incredibly grateful for life.',
                'intensity': 5,
                'weather': {
                    'condition': 'sunny',
                    'temperature': 75,
                    'humidity': 45
                },
                'location': {
                    'city': 'San Francisco',
                    'country': 'USA',
                    'coordinates': {'lat': 37.7749, 'lng': -122.4194}
                },
                'tags': ['social', 'exercise', 'gratitude'],
                'activity_data': {
                    'exercise_minutes': 45,
                    'social_interactions': 5,
                    'productivity_score': 8
                },
                'sleep_data': {
                    'hours': 8.5,
                    'quality': 'excellent',
                    'bedtime': '22:30'
                },
                'voice_note_url': 'https://demo-storage.com/voice/note1.mp3',
                'photo_url': 'https://demo-storage.com/photos/mood1.jpg'
            },
            {
                'date': '2024-01-16',
                'mood_id': 'anxious',
                'note': 'Work stress is getting to me. Need to find better coping strategies.',
                'intensity': 2,
                'weather': {
                    'condition': 'rainy',
                    'temperature': 55,
                    'humidity': 85
                },
                'tags': ['work', 'stress'],
                'activity_data': {
                    'work_hours': 10,
                    'break_minutes': 15
                }
            },
            {
                'date': '2024-01-17',
                'mood_id': 'grateful',
                'note': 'Meditation session helped me find peace. Grateful for mindfulness practices.',
                'intensity': 4,
                'tags': ['meditation', 'gratitude', 'mindfulness'],
                'activity_data': {
                    'meditation_minutes': 20
                }
            }
        ]
        
        created_moods = []
        for mood_data in test_moods:
            response = self.make_request('POST', '/moods', mood_data, {'user_id': self.test_user_id})
            
            if response['success']:
                mood_entry = response['data']
                created_moods.append(mood_entry)
                
                # Verify all fields are present
                required_fields = ['id', 'user_id', 'date', 'mood_id', 'mood', 'note', 'intensity']
                missing_fields = [field for field in required_fields if field not in mood_entry]
                
                if not missing_fields:
                    self.log_result(f"Create mood entry ({mood_data['mood_id']})", True, 
                                  f"All fields present, intensity: {mood_entry['intensity']}")
                else:
                    self.log_result(f"Create mood entry ({mood_data['mood_id']})", False, 
                                  f"Missing fields: {missing_fields}")
            else:
                self.log_result(f"Create mood entry ({mood_data['mood_id']})", False, 
                              f"Status: {response['status_code']}")
        
        return created_moods
    
    def test_crisis_keyword_detection(self):
        """Test crisis keyword detection and notification system"""
        print("\n🚨 Testing Crisis Support System...")
        
        crisis_mood = {
            'date': '2024-01-18',
            'mood_id': 'overwhelmed',
            'note': 'I feel hopeless and like I can\'t go on anymore. Everything seems pointless.',
            'intensity': 1,
            'tags': ['crisis', 'support_needed']
        }
        
        response = self.make_request('POST', '/moods', crisis_mood, {'user_id': self.test_user_id})
        
        if response['success']:
            self.log_result("Crisis keyword detection", True, "Mood entry created with crisis keywords")
            
            # Check if crisis notification was created
            time.sleep(1)  # Allow time for notification creation
            notif_response = self.make_request('GET', '/notifications', params={'user_id': self.test_user_id})
            
            if notif_response['success']:
                notifications = notif_response['data']
                crisis_notifications = [n for n in notifications if n.get('type') == 'crisis_support']
                
                if crisis_notifications:
                    self.log_result("Crisis notification creation", True, 
                                  f"Found {len(crisis_notifications)} crisis notifications")
                else:
                    self.log_result("Crisis notification creation", False, "No crisis notifications found")
            else:
                self.log_result("Crisis notification check", False, "Failed to retrieve notifications")
        else:
            self.log_result("Crisis keyword detection", False, f"Status: {response['status_code']}")
    
    def test_user_management(self):
        """Test user creation and profile management"""
        print("\n👤 Testing User Management...")
        
        user_data = {
            'name': 'Ultimate Test User',
            'email': 'test@moodverse.com',
            'avatar': 'https://demo-storage.com/avatars/test.jpg',
            'preferences': {
                'theme': 'dark',
                'notifications': True,
                'privacy_level': 'friends'
            }
        }
        
        response = self.make_request('POST', '/users', user_data)
        
        if response['success']:
            user = response['data']
            user_id = user['id']
            self.log_result("Create user", True, f"User ID: {user_id}")
            
            # Test get user
            get_response = self.make_request('GET', f'/users/{user_id}')
            if get_response['success']:
                retrieved_user = get_response['data']
                if retrieved_user['email'] == user_data['email']:
                    self.log_result("Retrieve user", True, "User data matches")
                else:
                    self.log_result("Retrieve user", False, "User data mismatch")
            else:
                self.log_result("Retrieve user", False, f"Status: {get_response['status_code']}")
        else:
            self.log_result("Create user", False, f"Status: {response['status_code']}")
    
    def test_achievement_system(self):
        """Test achievement checking and unlocking logic"""
        print("\n🏆 Testing Achievement System...")
        
        # Get current achievements
        response = self.make_request('GET', '/achievements', params={'user_id': self.test_user_id})
        
        if response['success']:
            achievements = response['data']
            unlocked_achievements = [a for a in achievements if a.get('unlocked', False)]
            
            self.log_result("Get achievements", True, 
                          f"Total: {len(achievements)}, Unlocked: {len(unlocked_achievements)}")
            
            # Check for expected achievements based on our test data
            expected_achievements = ['first_entry', 'mood_explorer']
            found_expected = []
            
            for achievement in unlocked_achievements:
                if achievement['id'] in expected_achievements:
                    found_expected.append(achievement['id'])
            
            if found_expected:
                self.log_result("Achievement unlocking", True, 
                              f"Found expected achievements: {found_expected}")
            else:
                self.log_result("Achievement unlocking", False, "No expected achievements unlocked")
        else:
            self.log_result("Get achievements", False, f"Status: {response['status_code']}")
    
    def test_social_features(self):
        """Test friend requests and social feed functionality"""
        print("\n👥 Testing Social Features...")
        
        # Test friend request
        response = self.make_request('POST', '/friends/request', 
                                   params={'target_user_id': 'friend_user_123', 'user_id': self.test_user_id})
        
        if response['success']:
            self.log_result("Send friend request", True, "Friend request sent successfully")
        else:
            self.log_result("Send friend request", False, f"Status: {response['status_code']}")
        
        # Test get friends
        friends_response = self.make_request('GET', '/friends', params={'user_id': self.test_user_id})
        
        if friends_response['success']:
            friends = friends_response['data']
            self.log_result("Get friends list", True, f"Found {len(friends)} friends")
        else:
            self.log_result("Get friends list", False, f"Status: {friends_response['status_code']}")
        
        # Test social feed
        feed_response = self.make_request('GET', '/social/feed', params={'user_id': self.test_user_id})
        
        if feed_response['success']:
            feed_items = feed_response['data']
            self.log_result("Get social feed", True, f"Found {len(feed_items)} feed items")
        else:
            self.log_result("Get social feed", False, f"Status: {feed_response['status_code']}")
    
    def test_advanced_analytics(self):
        """Test mood stats with AI insights, weather correlation, activity correlation"""
        print("\n📊 Testing Advanced Analytics...")
        
        response = self.make_request('GET', '/moods/stats', params={'user_id': self.test_user_id})
        
        if response['success']:
            stats = response['data']
            
            # Check required fields
            required_fields = [
                'total_entries', 'mood_counts', 'current_streak', 'longest_streak',
                'weather_correlation', 'activity_correlation', 'insights', 'recommendations'
            ]
            
            missing_fields = [field for field in required_fields if field not in stats]
            
            if not missing_fields:
                self.log_result("Comprehensive mood stats", True, 
                              f"Entries: {stats['total_entries']}, Streak: {stats['current_streak']}")
                
                # Test AI insights
                if stats.get('insights') and len(stats['insights']) > 0:
                    self.log_result("AI insights generation", True, 
                                  f"Generated {len(stats['insights'])} insights")
                else:
                    self.log_result("AI insights generation", False, "No insights generated")
                
                # Test weather correlation
                if stats.get('weather_correlation'):
                    self.log_result("Weather correlation analysis", True, 
                                  f"Analyzed {len(stats['weather_correlation'])} weather conditions")
                else:
                    self.log_result("Weather correlation analysis", False, "No weather correlation data")
                
                # Test activity correlation
                if stats.get('activity_correlation'):
                    self.log_result("Activity correlation analysis", True, 
                                  f"Analyzed {len(stats['activity_correlation'])} activities")
                else:
                    self.log_result("Activity correlation analysis", False, "No activity correlation data")
            else:
                self.log_result("Comprehensive mood stats", False, f"Missing fields: {missing_fields}")
        else:
            self.log_result("Comprehensive mood stats", False, f"Status: {response['status_code']}")
    
    def test_custom_moods(self):
        """Test custom mood creation and retrieval"""
        print("\n🎨 Testing Custom Mood System...")
        
        custom_mood_data = {
            'emoji': '🌟',
            'label': 'Inspired',
            'color': 'bg-gradient-to-br from-purple-200 to-pink-300 border-purple-400',
            'particles': 'purple',
            'intensity': 4,
            'category': 'positive'
        }
        
        response = self.make_request('POST', '/moods/custom', custom_mood_data, 
                                   {'user_id': self.test_user_id})
        
        if response['success']:
            custom_mood = response['data']
            self.log_result("Create custom mood", True, f"Created: {custom_mood['label']}")
            
            # Test get custom moods
            get_response = self.make_request('GET', '/moods/custom', 
                                           params={'user_id': self.test_user_id})
            
            if get_response['success']:
                custom_moods = get_response['data']
                self.log_result("Get custom moods", True, f"Found {len(custom_moods)} custom moods")
            else:
                self.log_result("Get custom moods", False, f"Status: {get_response['status_code']}")
        else:
            self.log_result("Create custom mood", False, f"Status: {response['status_code']}")
    
    def test_meditation_system(self):
        """Test meditation session recording"""
        print("\n🧘 Testing Meditation System...")
        
        meditation_sessions = [
            {
                'technique': 'mindfulness',
                'duration': 600,  # 10 minutes
                'completed': True,
                'completion_percentage': 100.0,
                'mood_before': 'anxious',
                'mood_after': 'calm',
                'notes': 'Great session, felt much more centered afterwards'
            },
            {
                'technique': 'breathing',
                'duration': 300,  # 5 minutes
                'completed': True,
                'completion_percentage': 100.0,
                'mood_before': 'stressed',
                'mood_after': 'relaxed'
            }
        ]
        
        created_sessions = []
        for session_data in meditation_sessions:
            response = self.make_request('POST', '/meditation/session', session_data, 
                                       {'user_id': self.test_user_id})
            
            if response['success']:
                session = response['data']
                created_sessions.append(session)
                self.log_result(f"Create meditation session ({session_data['technique']})", True, 
                              f"Duration: {session_data['duration']}s")
            else:
                self.log_result(f"Create meditation session ({session_data['technique']})", False, 
                              f"Status: {response['status_code']}")
        
        # Test get meditation sessions
        get_response = self.make_request('GET', '/meditation/sessions', 
                                       params={'user_id': self.test_user_id})
        
        if get_response['success']:
            sessions = get_response['data']
            self.log_result("Get meditation sessions", True, f"Found {len(sessions)} sessions")
        else:
            self.log_result("Get meditation sessions", False, f"Status: {get_response['status_code']}")
    
    def test_file_upload_endpoints(self):
        """Test photo/voice file upload endpoints"""
        print("\n📁 Testing File Upload System...")
        
        # Test photo upload (mock)
        photo_response = self.make_request('POST', '/upload/photo')
        
        if photo_response['success'] and 'url' in photo_response['data']:
            self.log_result("Photo upload endpoint", True, "Returns mock URL")
        else:
            self.log_result("Photo upload endpoint", False, f"Status: {photo_response['status_code']}")
        
        # Test voice upload (mock)
        voice_response = self.make_request('POST', '/upload/voice')
        
        if voice_response['success'] and 'url' in voice_response['data']:
            self.log_result("Voice upload endpoint", True, "Returns mock URL")
        else:
            self.log_result("Voice upload endpoint", False, f"Status: {voice_response['status_code']}")
    
    def test_notification_system(self):
        """Test notification creation and management"""
        print("\n🔔 Testing Notification System...")
        
        # Get notifications
        response = self.make_request('GET', '/notifications', params={'user_id': self.test_user_id})
        
        if response['success']:
            notifications = response['data']
            self.log_result("Get notifications", True, f"Found {len(notifications)} notifications")
            
            # Test mark as read if notifications exist
            if notifications:
                notification_id = notifications[0]['id']
                read_response = self.make_request('PUT', f'/notifications/{notification_id}/read')
                
                if read_response['success']:
                    self.log_result("Mark notification as read", True, "Notification marked as read")
                else:
                    self.log_result("Mark notification as read", False, 
                                  f"Status: {read_response['status_code']}")
        else:
            self.log_result("Get notifications", False, f"Status: {response['status_code']}")
    
    def test_weekly_reports(self):
        """Test comprehensive report generation"""
        print("\n📈 Testing Weekly Report Generation...")
        
        response = self.make_request('GET', '/reports/weekly', params={'user_id': self.test_user_id})
        
        if response['success']:
            report = response['data']
            
            required_fields = ['user_id', 'week_start', 'week_end', 'stats', 'insights', 'recommendations']
            missing_fields = [field for field in required_fields if field not in report]
            
            if not missing_fields:
                stats = report.get('stats', {})
                self.log_result("Generate weekly report", True, 
                              f"Entries: {stats.get('total_entries', 0)}, "
                              f"Insights: {len(report.get('insights', []))}")
            else:
                self.log_result("Generate weekly report", False, f"Missing fields: {missing_fields}")
        else:
            self.log_result("Generate weekly report", False, f"Status: {response['status_code']}")
    
    def test_csv_export(self):
        """Test CSV export with all Ultimate fields"""
        print("\n📊 Testing CSV Export Functionality...")
        
        response = self.make_request('GET', '/moods/export/csv', params={'user_id': self.test_user_id})
        
        if response['status_code'] == 200:
            # For CSV export, we expect a different content type
            self.log_result("CSV export functionality", True, "Export endpoint accessible")
        else:
            self.log_result("CSV export functionality", False, f"Status: {response['status_code']}")
    
    def test_mood_retrieval(self):
        """Test mood entry retrieval with filters"""
        print("\n📋 Testing Mood Retrieval...")
        
        # Test get all moods
        response = self.make_request('GET', '/moods', params={'user_id': self.test_user_id})
        
        if response['success']:
            moods = response['data']
            self.log_result("Get all mood entries", True, f"Retrieved {len(moods)} entries")
            
            # Test date range filtering
            start_date = '2024-01-15'
            end_date = '2024-01-17'
            
            filtered_response = self.make_request('GET', '/moods', params={
                'user_id': self.test_user_id,
                'start_date': start_date,
                'end_date': end_date
            })
            
            if filtered_response['success']:
                filtered_moods = filtered_response['data']
                self.log_result("Date range filtering", True, 
                              f"Retrieved {len(filtered_moods)} entries for date range")
            else:
                self.log_result("Date range filtering", False, 
                              f"Status: {filtered_response['status_code']}")
        else:
            self.log_result("Get all mood entries", False, f"Status: {response['status_code']}")
    
    def run_comprehensive_tests(self):
        """Run all Ultimate MoodVerse backend tests"""
        print("🚀 Starting Ultimate MoodVerse Backend API Tests")
        print(f"🔗 Testing API at: {self.base_url}")
        print("=" * 60)
        
        # Core functionality tests
        self.test_root_endpoint()
        self.test_user_management()
        self.test_enhanced_mood_creation()
        self.test_mood_retrieval()
        
        # Advanced features
        self.test_crisis_keyword_detection()
        self.test_achievement_system()
        self.test_advanced_analytics()
        self.test_custom_moods()
        self.test_meditation_system()
        
        # Social and communication features
        self.test_social_features()
        self.test_notification_system()
        
        # File and export features
        self.test_file_upload_endpoints()
        self.test_csv_export()
        self.test_weekly_reports()
        
        # Print final results
        print("\n" + "=" * 60)
        print("🏁 ULTIMATE MOODVERSE BACKEND TEST RESULTS")
        print("=" * 60)
        print(f"✅ PASSED: {self.results['passed']}")
        print(f"❌ FAILED: {self.results['failed']}")
        print(f"📊 SUCCESS RATE: {(self.results['passed'] / (self.results['passed'] + self.results['failed']) * 100):.1f}%")
        
        if self.results['errors']:
            print(f"\n🚨 CRITICAL ISSUES FOUND:")
            for error in self.results['errors']:
                print(f"   • {error}")
        
        return self.results

def main():
    """Main test execution"""
    tester = UltimateMoodVerseAPITester()
    results = tester.run_comprehensive_tests()
    
    # Return appropriate exit code
    if results['failed'] > 0:
        exit(1)
    else:
        exit(0)

if __name__ == "__main__":
    main()
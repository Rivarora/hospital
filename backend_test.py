import requests
import sys
import json
from datetime import datetime
import time

class HealthSyncAPITester:
    def __init__(self, base_url="https://medivault.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.test_user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_details = response.json()
                    error_msg += f" - {error_details}"
                except:
                    error_msg += f" - {response.text[:200]}"
                
                self.log_test(name, False, error_msg)
                return False, {}

        except requests.exceptions.Timeout:
            self.log_test(name, False, "Request timeout (30s)")
            return False, {}
        except requests.exceptions.ConnectionError:
            self.log_test(name, False, "Connection error - server may be down")
            return False, {}
        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test basic health endpoint"""
        return self.run_test("Health Check", "GET", "health", 200)

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root Endpoint", "GET", "", 200)

    def test_create_user(self):
        """Test user creation"""
        test_user_data = {
            "name": f"Test User {datetime.now().strftime('%H%M%S')}",
            "email": f"test{datetime.now().strftime('%H%M%S')}@healthsync.com",
            "age": 30
        }
        
        success, response = self.run_test(
            "Create User",
            "POST",
            "users",
            200,
            data=test_user_data
        )
        
        if success and 'id' in response:
            self.test_user_id = response['id']
            print(f"   Created user with ID: {self.test_user_id}")
            return True, response
        return False, {}

    def test_get_user(self):
        """Test getting user by ID"""
        if not self.test_user_id:
            self.log_test("Get User", False, "No test user ID available")
            return False, {}
        
        return self.run_test(
            "Get User",
            "GET",
            f"users/{self.test_user_id}",
            200
        )

    def test_get_all_users(self):
        """Test getting all users"""
        return self.run_test("Get All Users", "GET", "users", 200)

    def test_upload_medical_record(self):
        """Test medical record upload with AI analysis"""
        if not self.test_user_id:
            self.log_test("Upload Medical Record", False, "No test user ID available")
            return False, {}

        medical_record_data = {
            "user_id": self.test_user_id,
            "filename": "test_blood_work.pdf",
            "content": "Blood Test Results:\nHemoglobin: 14.2 g/dL (Normal)\nWhite Blood Cell Count: 7,500/μL (Normal)\nPlatelet Count: 250,000/μL (Normal)\nGlucose: 95 mg/dL (Normal)\nCholesterol: 180 mg/dL (Normal)\nPatient appears healthy with all values within normal ranges."
        }
        
        print("   Note: This test includes AI analysis which may take 10-15 seconds...")
        success, response = self.run_test(
            "Upload Medical Record",
            "POST",
            "medical-records",
            200,
            data=medical_record_data
        )
        
        if success:
            print(f"   AI Summary: {response.get('ai_summary', 'N/A')[:100]}...")
            print(f"   Risk Assessment: {response.get('risk_assessment', 'N/A')[:100]}...")
        
        return success, response

    def test_get_medical_records(self):
        """Test getting user's medical records"""
        if not self.test_user_id:
            self.log_test("Get Medical Records", False, "No test user ID available")
            return False, {}
        
        return self.run_test(
            "Get Medical Records",
            "GET",
            f"medical-records/{self.test_user_id}",
            200
        )

    def test_log_habits(self):
        """Test habit logging with token rewards"""
        if not self.test_user_id:
            self.log_test("Log Habits", False, "No test user ID available")
            return False, {}

        habit_data = {
            "user_id": self.test_user_id,
            "sleep_hours": 8.0,
            "exercise_minutes": 45,
            "water_glasses": 10,
            "mood_rating": 4,
            "notes": "Feeling great today! Had a good workout and stayed hydrated."
        }
        
        success, response = self.run_test(
            "Log Habits",
            "POST",
            "habits",
            200,
            data=habit_data
        )
        
        if success:
            print(f"   Tokens earned: {response.get('tokens_earned', 0)}")
        
        return success, response

    def test_get_habits(self):
        """Test getting user's habits"""
        if not self.test_user_id:
            self.log_test("Get Habits", False, "No test user ID available")
            return False, {}
        
        return self.run_test(
            "Get Habits",
            "GET",
            f"habits/{self.test_user_id}",
            200
        )

    def test_generate_paperwork(self):
        """Test smart paperwork generation"""
        if not self.test_user_id:
            self.log_test("Generate Paperwork", False, "No test user ID available")
            return False, {}

        paperwork_data = {
            "user_id": self.test_user_id,
            "form_type": "admission",
            "hospital_name": "City General Hospital",
            "doctor_name": "Dr. Sarah Johnson"
        }
        
        print("   Note: This test includes AI paperwork generation which may take 10-15 seconds...")
        success, response = self.run_test(
            "Generate Paperwork",
            "POST",
            "paperwork",
            200,
            data=paperwork_data
        )
        
        if success:
            print(f"   Generated form type: {response.get('form_type', 'N/A')}")
            print(f"   Content preview: {response.get('content', 'N/A')[:100]}...")
        
        return success, response

    def test_get_tokens(self):
        """Test getting user's token information"""
        if not self.test_user_id:
            self.log_test("Get Tokens", False, "No test user ID available")
            return False, {}
        
        success, response = self.run_test(
            "Get Tokens",
            "GET",
            f"tokens/{self.test_user_id}",
            200
        )
        
        if success:
            print(f"   Current tokens: {response.get('current_tokens', 0)}")
            print(f"   Transaction history: {len(response.get('transaction_history', []))} entries")
        
        return success, response

    def test_get_dashboard(self):
        """Test dashboard data endpoint"""
        if not self.test_user_id:
            self.log_test("Get Dashboard", False, "No test user ID available")
            return False, {}
        
        success, response = self.run_test(
            "Get Dashboard",
            "GET",
            f"dashboard/{self.test_user_id}",
            200
        )
        
        if success:
            print(f"   Recent records: {len(response.get('recent_records', []))}")
            print(f"   Recent habits: {len(response.get('recent_habits', []))}")
            print(f"   Total tokens earned: {response.get('tokens_earned_total', 0)}")
        
        return success, response

    def run_comprehensive_test(self):
        """Run all tests in sequence"""
        print("🚀 Starting HealthSync API Comprehensive Testing")
        print("=" * 60)
        
        # Basic connectivity tests
        print("\n📡 CONNECTIVITY TESTS")
        self.test_health_check()
        self.test_root_endpoint()
        
        # User management tests
        print("\n👤 USER MANAGEMENT TESTS")
        user_created, _ = self.test_create_user()
        if user_created:
            self.test_get_user()
            self.test_get_all_users()
        else:
            print("⚠️  Skipping user-dependent tests due to user creation failure")
            return self.generate_report()
        
        # Medical records tests
        print("\n🏥 MEDICAL RECORDS TESTS")
        self.test_upload_medical_record()
        time.sleep(2)  # Brief pause between AI calls
        self.test_get_medical_records()
        
        # Habit tracking tests
        print("\n💪 HABIT TRACKING TESTS")
        self.test_log_habits()
        self.test_get_habits()
        
        # Smart paperwork tests
        print("\n📋 SMART PAPERWORK TESTS")
        time.sleep(2)  # Brief pause between AI calls
        self.test_generate_paperwork()
        
        # Token system tests
        print("\n🪙 TOKEN SYSTEM TESTS")
        self.test_get_tokens()
        
        # Dashboard tests
        print("\n📊 DASHBOARD TESTS")
        self.test_get_dashboard()
        
        return self.generate_report()

    def generate_report(self):
        """Generate final test report"""
        print("\n" + "=" * 60)
        print("📊 FINAL TEST REPORT")
        print("=" * 60)
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        
        print(f"Total Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if self.tests_run - self.tests_passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   • {result['test']}: {result['details']}")
        
        print("\n✅ PASSED TESTS:")
        for result in self.test_results:
            if result['success']:
                print(f"   • {result['test']}")
        
        # Save detailed results to file
        with open('/app/backend_test_results.json', 'w') as f:
            json.dump({
                'summary': {
                    'total_tests': self.tests_run,
                    'passed_tests': self.tests_passed,
                    'failed_tests': self.tests_run - self.tests_passed,
                    'success_rate': success_rate,
                    'test_user_id': self.test_user_id
                },
                'detailed_results': self.test_results,
                'timestamp': datetime.now().isoformat()
            }, f, indent=2)
        
        print(f"\n📄 Detailed results saved to: /app/backend_test_results.json")
        
        return success_rate >= 80  # Consider 80%+ success rate as passing

def main():
    print("🏥 HealthSync API Testing Suite")
    print("Testing against: https://medivault.preview.emergentagent.com")
    print("=" * 60)
    
    tester = HealthSyncAPITester()
    success = tester.run_comprehensive_test()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
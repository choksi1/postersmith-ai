import requests
import sys
import json
import time
from datetime import datetime

class PosterSmithAPITester:
    def __init__(self, base_url="https://instant-wall-art.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.admin_token = None
        self.user_id = None
        self.admin_id = None
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
            "name": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        
        # Default headers
        request_headers = {'Content-Type': 'application/json'}
        if headers:
            request_headers.update(headers)
        
        if self.token and 'Authorization' not in request_headers:
            request_headers['Authorization'] = f'Bearer {self.token}'

        try:
            print(f"\n🔍 Testing {name}...")
            print(f"   {method} {url}")
            
            if method == 'GET':
                response = requests.get(url, headers=request_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=request_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=request_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=request_headers, timeout=30)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True, f"Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                try:
                    error_detail = response.json().get('detail', 'Unknown error')
                except:
                    error_detail = response.text or f"HTTP {response.status_code}"
                
                self.log_test(name, False, f"Expected {expected_status}, got {response.status_code} - {error_detail}")
                return False, {}

        except requests.exceptions.RequestException as e:
            self.log_test(name, False, f"Request failed: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test basic health endpoint"""
        return self.run_test("Health Check", "GET", "", 200)

    def test_api_root(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_register_first_user(self):
        """Test user registration - first user should become admin"""
        user_data = {
            "email": f"admin_{int(time.time())}@postersmith.com",
            "password": "AdminPass123!",
            "name": "Test Admin User"
        }
        
        success, response = self.run_test(
            "Register First User (Admin)", 
            "POST", 
            "auth/register", 
            200, 
            data=user_data
        )
        
        if success and 'token' in response and 'user' in response:
            self.admin_token = response['token']
            self.admin_id = response['user']['id']
            # Verify user got admin role
            if response['user']['role'] == 'admin':
                print(f"   ✓ First user correctly assigned admin role")
                return True
            else:
                print(f"   ✗ First user got role '{response['user']['role']}' instead of 'admin'")
                return False
        return success

    def test_register_second_user(self):
        """Test second user registration - should be creator"""
        user_data = {
            "email": f"creator_{int(time.time())}@postersmith.com", 
            "password": "CreatorPass123!",
            "name": "Test Creator User"
        }
        
        success, response = self.run_test(
            "Register Second User (Creator)",
            "POST",
            "auth/register", 
            200,
            data=user_data
        )
        
        if success and 'token' in response and 'user' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            # Verify user got creator role
            if response['user']['role'] == 'creator':
                print(f"   ✓ Second user correctly assigned creator role")
                return True
            else:
                print(f"   ✗ Second user got role '{response['user']['role']}' instead of 'creator'")
                return False
        return success

    def test_login_admin(self):
        """Test admin login"""
        # We'll use a simple test since we don't know the exact admin credentials
        # This will test the login endpoint structure
        login_data = {
            "email": "test@invalid.com",
            "password": "invalidpass"
        }
        
        success, response = self.run_test(
            "Login (Invalid Credentials)",
            "POST",
            "auth/login",
            401,  # Should fail with 401
            data=login_data
        )
        return success

    def test_auth_me(self):
        """Test get current user endpoint"""
        if not self.token:
            print("❌ Auth Me - SKIPPED: No token available")
            return False
            
        return self.run_test("Get Current User", "GET", "auth/me", 200)[0]

    def test_protected_route_without_auth(self):
        """Test that protected routes require authentication"""
        # Temporarily remove token
        temp_token = self.token
        self.token = None
        
        success, _ = self.run_test(
            "Protected Route (No Auth)",
            "GET", 
            "posters",
            401,
            headers={}  # No auth header
        )
        
        # Restore token
        self.token = temp_token
        return success

    def test_generate_poster(self):
        """Test poster generation API"""
        if not self.token:
            print("❌ Generate Poster - SKIPPED: No token available")
            return False, None
            
        poster_data = {
            "prompt": "A beautiful sunset over mountains",
            "style_preset": "minimalist"
        }
        
        print(f"🎨 Generating poster (this may take 30-60 seconds)...")
        success, response = self.run_test(
            "Generate Poster",
            "POST",
            "generate-poster", 
            200,
            data=poster_data
        )
        
        if success and 'id' in response:
            return success, response['id']
        return success, None

    def test_get_posters(self):
        """Test get user's posters"""
        if not self.token:
            print("❌ Get Posters - SKIPPED: No token available")
            return False
            
        return self.run_test("Get User Posters", "GET", "posters", 200)[0]

    def test_admin_stats(self):
        """Test admin stats endpoint"""
        if not self.admin_token:
            print("❌ Admin Stats - SKIPPED: No admin token available")
            return False
            
        # Use admin token
        temp_token = self.token
        self.token = self.admin_token
        
        success, response = self.run_test("Admin Stats", "GET", "admin/stats", 200)
        
        if success:
            expected_keys = ['total_users', 'total_posters', 'completed_posters', 'failed_posters']
            for key in expected_keys:
                if key not in response:
                    print(f"   ✗ Missing key '{key}' in stats response")
                    success = False
            if success:
                print(f"   ✓ Stats: {response}")
        
        # Restore original token
        self.token = temp_token
        return success

    def test_admin_get_users(self):
        """Test admin get all users endpoint"""
        if not self.admin_token:
            print("❌ Admin Get Users - SKIPPED: No admin token available")
            return False
            
        # Use admin token
        temp_token = self.token
        self.token = self.admin_token
        
        success, response = self.run_test("Admin Get All Users", "GET", "admin/users", 200)
        
        if success and isinstance(response, list):
            print(f"   ✓ Found {len(response)} users")
        
        # Restore original token
        self.token = temp_token
        return success

    def test_admin_update_user_role(self):
        """Test admin update user role"""
        if not self.admin_token or not self.user_id:
            print("❌ Admin Update User Role - SKIPPED: No admin token or user ID available")
            return False
            
        # Use admin token
        temp_token = self.token
        self.token = self.admin_token
        
        update_data = {"role": "creator"}  # Should already be creator, but testing the endpoint
        
        success, response = self.run_test(
            "Admin Update User Role",
            "PUT",
            f"admin/users/{self.user_id}",
            200,
            data=update_data
        )
        
        # Restore original token
        self.token = temp_token
        return success

    def test_creator_cannot_access_admin(self):
        """Test that creator users cannot access admin endpoints"""
        if not self.token:
            print("❌ Creator Admin Access - SKIPPED: No creator token available")
            return False
            
        return self.run_test(
            "Creator Cannot Access Admin Stats",
            "GET",
            "admin/stats",
            403  # Should be forbidden
        )[0]

    def test_listing_endpoints(self, poster_id):
        """Test listing-related endpoints"""
        print("\n📋 Testing Listing Endpoints...")
        
        if not poster_id:
            self.log_test("Listing Tests Skipped", False, "No poster ID available")
            return
        
        # Test GET /api/listings - Get all user's listings
        success, response = self.run_test(
            "Get All Listings",
            "GET",
            "listings",
            200
        )
        
        # Test POST /api/listings/generate - Generate listing for a poster
        success, response = self.run_test(
            "Generate Listing",
            "POST",
            "listings/generate",
            200,
            {"poster_id": poster_id}
        )
        
        if success:
            # Verify listing response structure
            required_fields = ['id', 'poster_id', 'title', 'description', 'tags', 'created_at']
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                self.log_test("Listing Response Structure", False, f"Missing fields: {missing_fields}")
            else:
                self.log_test("Listing Response Structure", True)
                print(f"   Generated Title: {response['title'][:50]}...")
                print(f"   Tags Count: {len(response.get('tags', []))}")
            
            # Test GET /api/listings/{poster_id} - Get specific listing
            self.run_test(
                "Get Specific Listing",
                "GET",
                f"listings/{poster_id}",
                200
            )
            
            # Test PUT /api/listings/{poster_id} - Update listing
            update_data = {
                "title": "Updated Test Title - Digital Wall Art",
                "description": "Updated description for testing purposes.",
                "tags": ["test", "updated", "wall art", "digital"]
            }
            
            self.run_test(
                "Update Listing",
                "PUT",
                f"listings/{poster_id}",
                200,
                update_data
            )
            
        # Test error cases
        self.run_test(
            "Generate Listing - Invalid Poster ID",
            "POST",
            "listings/generate",
            404,
            {"poster_id": "invalid-poster-id"}
        )
        
        self.run_test(
            "Get Listing - Non-existent",
            "GET",
            "listings/non-existent-id",
            404
        )

def main():
    print("🚀 Starting PosterSmith AI Backend API Tests")
    print("=" * 60)
    
    tester = PosterSmithAPITester()
    
    # Basic connectivity tests
    tester.test_health_check()
    tester.test_api_root()
    
    # Auth tests
    tester.test_register_first_user()
    tester.test_register_second_user()
    tester.test_login_admin()
    tester.test_auth_me()
    
    # Protected route tests
    tester.test_protected_route_without_auth()
    
    # Poster tests
    poster_generated, poster_id = tester.test_generate_poster()
    tester.test_get_posters()
    
    # Admin tests
    tester.test_admin_stats()
    tester.test_admin_get_users()
    tester.test_admin_update_user_role()
    tester.test_creator_cannot_access_admin()
    
    # Listing tests
    tester.test_listing_endpoints(poster_id if poster_generated else None)
    
    # Print summary
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    # Save detailed results
    results = {
        "summary": {
            "tests_run": tester.tests_run,
            "tests_passed": tester.tests_passed,
            "success_rate": tester.tests_passed/tester.tests_run*100,
            "timestamp": datetime.now().isoformat()
        },
        "detailed_results": tester.test_results
    }
    
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"📄 Detailed results saved to /app/backend_test_results.json")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
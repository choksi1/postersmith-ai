import requests
import sys
import json
from datetime import datetime

class ListingTester:
    def __init__(self):
        self.base_url = "https://instant-wall-art.preview.emergentagent.com/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.results = []

    def log_result(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name}")
        else:
            print(f"❌ {test_name} - {details}")
        
        self.results.append({
            "test": test_name,
            "success": success,
            "details": details
        })

    def login(self):
        """Login with admin credentials"""
        print("🔐 Logging in as admin...")
        
        response = requests.post(f"{self.base_url}/auth/login", json={
            "email": "admin@postersmith.com",
            "password": "Admin123!"
        })
        
        if response.status_code == 200:
            data = response.json()
            self.token = data.get('token')
            user = data.get('user', {})
            print(f"   Logged in as: {user.get('name')} ({user.get('role')})")
            self.log_result("Admin Login", True)
            return True
        else:
            print(f"   Login failed: {response.status_code} - {response.text}")
            self.log_result("Admin Login", False, f"Status {response.status_code}")
            return False

    def get_headers(self):
        """Get request headers"""
        return {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.token}' if self.token else ''
        }

    def test_get_posters(self):
        """Get existing posters"""
        print("\n🖼️ Getting existing posters...")
        
        response = requests.get(f"{self.base_url}/posters", headers=self.get_headers())
        
        if response.status_code == 200:
            posters = response.json()
            completed_posters = [p for p in posters if p.get('status') == 'completed']
            failed_posters = [p for p in posters if p.get('status') == 'failed']
            
            print(f"   Total posters: {len(posters)}")
            print(f"   Completed: {len(completed_posters)}")
            print(f"   Failed: {len(failed_posters)}")
            
            self.completed_poster = completed_posters[0] if completed_posters else None
            self.failed_poster = failed_posters[0] if failed_posters else None
            
            if self.completed_poster:
                print(f"   Test poster ID: {self.completed_poster['id']}")
                print(f"   Test poster prompt: {self.completed_poster['prompt'][:50]}...")
            
            self.log_result("Get Posters", True)
            return len(posters) > 0
        else:
            self.log_result("Get Posters", False, f"Status {response.status_code}")
            return False

    def test_get_all_listings(self):
        """Test GET /api/listings"""
        print("\n📋 Testing GET /api/listings...")
        
        response = requests.get(f"{self.base_url}/listings", headers=self.get_headers())
        
        if response.status_code == 200:
            listings = response.json()
            print(f"   Found {len(listings)} existing listings")
            
            if listings:
                first_listing = listings[0]
                print(f"   Sample listing ID: {first_listing.get('id')}")
                print(f"   Sample listing title: {first_listing.get('title', '')[:50]}...")
                print(f"   Sample listing tags: {len(first_listing.get('tags', []))}")
            
            self.existing_listings = {l['poster_id']: l for l in listings}
            self.log_result("GET /api/listings", True)
            return True
        else:
            print(f"   Error: {response.status_code} - {response.text}")
            self.log_result("GET /api/listings", False, f"Status {response.status_code}")
            return False

    def test_generate_listing(self):
        """Test POST /api/listings/generate"""
        print("\n✨ Testing POST /api/listings/generate...")
        
        if not hasattr(self, 'completed_poster') or not self.completed_poster:
            self.log_result("Generate Listing", False, "No completed poster available")
            return
        
        poster_id = self.completed_poster['id']
        
        # Check if listing already exists
        if poster_id in getattr(self, 'existing_listings', {}):
            print(f"   Listing already exists for poster {poster_id}")
            print("   Testing regeneration (should return existing listing)...")
        
        response = requests.post(
            f"{self.base_url}/listings/generate",
            json={"poster_id": poster_id},
            headers=self.get_headers()
        )
        
        if response.status_code == 200:
            listing = response.json()
            
            # Validate response structure
            required_fields = ['id', 'poster_id', 'title', 'description', 'tags', 'created_at']
            missing_fields = [f for f in required_fields if f not in listing]
            
            if missing_fields:
                self.log_result("Generate Listing Response Structure", False, f"Missing: {missing_fields}")
            else:
                self.log_result("Generate Listing Response Structure", True)
            
            print(f"   Generated listing ID: {listing.get('id')}")
            print(f"   Title: {listing.get('title', '')[:60]}...")
            print(f"   Description length: {len(listing.get('description', ''))}")
            print(f"   Tags count: {len(listing.get('tags', []))}")
            print(f"   Tags: {listing.get('tags', [])[:5]}...")
            
            # Store for later tests
            self.test_listing_id = listing.get('id')
            self.test_poster_id = poster_id
            
            self.log_result("Generate Listing", True)
        else:
            print(f"   Error: {response.status_code} - {response.text}")
            self.log_result("Generate Listing", False, f"Status {response.status_code}")

    def test_get_specific_listing(self):
        """Test GET /api/listings/{poster_id}"""
        print("\n🔍 Testing GET /api/listings/{poster_id}...")
        
        if not hasattr(self, 'test_poster_id'):
            self.log_result("Get Specific Listing", False, "No test poster ID available")
            return
        
        response = requests.get(
            f"{self.base_url}/listings/{self.test_poster_id}",
            headers=self.get_headers()
        )
        
        if response.status_code == 200:
            listing = response.json()
            print(f"   Retrieved listing: {listing.get('title', '')[:50]}...")
            self.log_result("Get Specific Listing", True)
        else:
            print(f"   Error: {response.status_code} - {response.text}")
            self.log_result("Get Specific Listing", False, f"Status {response.status_code}")

    def test_update_listing(self):
        """Test PUT /api/listings/{poster_id}"""
        print("\n✏️ Testing PUT /api/listings/{poster_id}...")
        
        if not hasattr(self, 'test_poster_id'):
            self.log_result("Update Listing", False, "No test poster ID available")
            return
        
        update_data = {
            "title": "UPDATED: Test Digital Wall Art Poster - Printable Download",
            "description": "UPDATED: This is a test update of the listing description. Amazing digital wall art perfect for home decor.",
            "tags": ["updated", "test", "wall art", "digital download", "printable", "home decor"]
        }
        
        response = requests.put(
            f"{self.base_url}/listings/{self.test_poster_id}",
            json=update_data,
            headers=self.get_headers()
        )
        
        if response.status_code == 200:
            listing = response.json()
            
            # Verify the update worked
            if listing.get('title') == update_data['title']:
                print("   Title update verified ✓")
                self.log_result("Update Listing", True)
            else:
                print("   Title update failed ✗")
                self.log_result("Update Listing", False, "Title not updated correctly")
            
            print(f"   Updated title: {listing.get('title', '')[:50]}...")
            print(f"   Updated tags: {listing.get('tags', [])}")
        else:
            print(f"   Error: {response.status_code} - {response.text}")
            self.log_result("Update Listing", False, f"Status {response.status_code}")

    def test_error_cases(self):
        """Test error handling"""
        print("\n🔧 Testing Error Cases...")
        
        # Test generate with invalid poster ID
        response = requests.post(
            f"{self.base_url}/listings/generate",
            json={"poster_id": "invalid-poster-id"},
            headers=self.get_headers()
        )
        
        if response.status_code == 404:
            self.log_result("Generate with Invalid Poster ID (404 expected)", True)
        else:
            self.log_result("Generate with Invalid Poster ID (404 expected)", False, f"Got {response.status_code}")
        
        # Test get non-existent listing
        response = requests.get(
            f"{self.base_url}/listings/non-existent-poster-id",
            headers=self.get_headers()
        )
        
        if response.status_code == 404:
            self.log_result("Get Non-existent Listing (404 expected)", True)
        else:
            self.log_result("Get Non-existent Listing (404 expected)", False, f"Got {response.status_code}")

        # Test generate with failed poster
        if hasattr(self, 'failed_poster') and self.failed_poster:
            response = requests.post(
                f"{self.base_url}/listings/generate",
                json={"poster_id": self.failed_poster['id']},
                headers=self.get_headers()
            )
            
            if response.status_code == 400:
                self.log_result("Generate with Failed Poster (400 expected)", True)
                print(f"   Error message: {response.json().get('detail', 'No detail')}")
            else:
                self.log_result("Generate with Failed Poster (400 expected)", False, f"Got {response.status_code}")

    def run_all_tests(self):
        """Run all listing tests"""
        print("🚀 Testing PosterSmith AI Manage Listings Feature")
        print("=" * 60)
        
        # Login first
        if not self.login():
            print("❌ Cannot continue without authentication")
            return False
        
        # Get existing poster data
        if not self.test_get_posters():
            print("❌ Cannot continue without poster data")
            return False
        
        # Test listing endpoints
        self.test_get_all_listings()
        self.test_generate_listing()
        self.test_get_specific_listing()
        self.test_update_listing()
        self.test_error_cases()
        
        # Print results
        print("\n" + "=" * 60)
        print(f"📊 Listing Tests: {self.tests_passed}/{self.tests_run} passed")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        failed_tests = [r for r in self.results if not r['success']]
        if failed_tests:
            print("\n❌ Failed Tests:")
            for test in failed_tests:
                print(f"   - {test['test']}: {test['details']}")
        
        return len(failed_tests) == 0

def main():
    tester = ListingTester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
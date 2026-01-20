#!/usr/bin/env python3
"""
Test script to demonstrate rate limiting functionality
Run this script to test that rate limits are working properly.
"""

import requests
import time
import json

# Flask app URL (adjust if running on different port)
BASE_URL = "http://localhost:5000"

def test_rate_limiting():
    """Test rate limiting on candidate search endpoint"""

    print("🧪 Testing Rate Limiting on Flask Application")
    print("=" * 50)

    # Test endpoint with 20 requests per minute limit
    endpoint = "/candidate/search-candidates"
    params = {"q": "test", "field": "firstName"}

    print(f"Testing endpoint: {endpoint}")
    print("Rate limit: 20 requests per minute"
    print("Making 25 requests to trigger rate limiting...")
    print()

    success_count = 0
    rate_limited_count = 0

    for i in range(25):
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", params=params, timeout=5)

            if response.status_code == 200:
                success_count += 1
                print(f"✅ Request {i+1:2d}: SUCCESS (Status: {response.status_code})")
            elif response.status_code == 429:
                rate_limited_count += 1
                print(f"🚫 Request {i+1:2d}: RATE LIMITED (Status: {response.status_code})")
                # Try to get the retry-after header
                retry_after = response.headers.get('Retry-After', 'Unknown')
                print(f"   Retry after: {retry_after} seconds")
            else:
                print(f"❓ Request {i+1:2d}: UNEXPECTED (Status: {response.status_code})")

        except requests.exceptions.RequestException as e:
            print(f"❌ Request {i+1:2d}: CONNECTION ERROR - {e}")

        # Small delay between requests
        time.sleep(0.1)

    print()
    print("=" * 50)
    print("📊 RATE LIMITING TEST RESULTS:")
    print(f"   ✅ Successful requests: {success_count}")
    print(f"   🚫 Rate limited requests: {rate_limited_count}")
    print(f"   📈 Success rate: {(success_count/25)*100:.1f}%")

    if rate_limited_count > 0:
        print("🎉 RATE LIMITING IS WORKING! Some requests were properly blocked.")
    else:
        print("⚠️  No rate limiting detected. Check if Flask app is running with rate limits enabled.")

    print()
    print("💡 To reset rate limits, restart the Flask application.")
    print("🔧 For production, consider using Redis for persistent rate limit storage.")

def test_global_limits():
    """Test global rate limits"""
    print("\n🌐 Testing Global Rate Limits (200/day, 50/hour)")
    print("Global limits apply to all endpoints not specifically limited.")

    endpoint = "/api/health"  # Health check endpoint

    print(f"Testing endpoint: {endpoint}")
    print("Making 55 requests (should hit 50/hour limit)...")

    success_count = 0
    rate_limited_count = 0

    for i in range(55):
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=5)

            if response.status_code == 200:
                success_count += 1
            elif response.status_code == 429:
                rate_limited_count += 1
                if rate_limited_count == 1:  # Only print once
                    print(f"🚫 Request {i+1:2d}: RATE LIMITED (Global limit reached)")

        except requests.exceptions.RequestException:
            pass

        time.sleep(0.05)  # Very short delay

    print(f"   ✅ Successful: {success_count}")
    print(f"   🚫 Rate limited: {rate_limited_count}")

if __name__ == "__main__":
    print("🚀 Rate Limiting Test Script")
    print("Make sure your Flask app is running on http://localhost:5000")
    print()

    try:
        # Test specific endpoint rate limiting
        test_rate_limiting()

        # Test global rate limits
        test_global_limits()

    except KeyboardInterrupt:
        print("\n\n👋 Test interrupted by user")
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        print("💡 Make sure your Flask app is running: python app.py")
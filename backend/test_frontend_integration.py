#!/usr/bin/env python3
"""
Test script to verify B2B customer dropdown functionality
"""

import requests
import json

def test_b2b_customer_api():
    """Test the B2B customer API endpoints"""
    base_url = "http://localhost:5000"

    print("=" * 60)
    print(" TESTING B2B CUSTOMER API ENDPOINTS")
    print("=" * 60)

    try:
        # Test B2B customers endpoint
        print("\n[TEST] Testing /get-b2b-customers endpoint...")
        response = requests.get(f"{base_url}/get-b2b-customers")

        if response.status_code == 200:
            data = response.json()
            print("✅ B2B customers endpoint working")
            print(f"   Status: {response.status_code}")
            print(f"   Customers found: {len(data.get('data', []))}")

            if data.get('data'):
                print("   Sample customers:")
                for i, customer in enumerate(data['data'][:3]):  # Show first 3
                    print(f"     {i+1}. {customer.get('company_name', 'N/A')} (ID: {customer.get('id', 'N/A')})")
        else:
            print(f"❌ B2B customers endpoint failed: {response.status_code}")
            print(f"   Response: {response.text}")

        # Test individual customer endpoint
        print("\n[TEST] Testing /get-b2b-customer/1 endpoint...")
        response = requests.get(f"{base_url}/get-b2b-customer/1")

        if response.status_code == 200:
            data = response.json()
            print("✅ Individual customer endpoint working")
            customer = data.get('data', {})
            print(f"   Customer: {customer.get('company_name', 'N/A')}")
            print(f"   GST: {customer.get('gst_number', 'N/A')}")
            print(f"   Email: {customer.get('email', 'N/A')}")
        else:
            print(f"❌ Individual customer endpoint failed: {response.status_code}")

        print("\n" + "=" * 60)
        print(" API TESTING COMPLETED")
        print("=" * 60)
        print("\nIf the API is working, the frontend dropdown should populate.")
        print("Check the browser console for any JavaScript errors.")
        print("\nFrontend URL: http://localhost:3000 (if React is running)")

    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Flask server")
        print("   Make sure Flask server is running on http://localhost:5000")
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    test_b2b_customer_api()
#!/usr/bin/env python3
"""
Test script for consolidated candidate data storage
Tests the save-candidate-data endpoint with ocr_data and certificate_selections
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:5000"

def test_consolidated_candidate_data():
    """Test saving candidate data with OCR and certificate selections"""
    print("🧪 Testing Consolidated Candidate Data Storage")
    print("=" * 60)

    # Sample candidate data with all required fields
    candidate_data = {
        "firstName": "Test",
        "lastName": "Candidate",
        "passport": "TC123456",
        "dob": "1990-01-01",
        "nationality": "Test",
        "address": "123 Test Street",
        "cdcNo": "CDC123456",
        "indosNo": "IND123456",
        "email": "test@example.com",
        "phone": "1234567890",
        "companyName": "Test Company",
        "vendorName": "Test Vendor",
        "paymentStatus": "PAID",
        "rollNo": "TC001",
        "session_id": "test-session-123",
        "timestamp": datetime.now().isoformat(),

        # Additional fields for consolidation
        "ocr_data": {
            "passport_ocr": {
                "name": "Test Candidate",
                "passport_number": "TC123456",
                "date_of_birth": "1990-01-01",
                "nationality": "Test",
                "extracted_at": datetime.now().isoformat()
            },
            "certificate_ocr": {
                "cdc_number": "CDC123456",
                "indos_number": "IND123456",
                "valid_until": "2025-12-31"
            }
        },
    }

    print("📤 Sending candidate data with OCR and certificate selections...")

    try:
        response = requests.post(
            f"{BASE_URL}/candidate/save-candidate-data",
            json=candidate_data,
            headers={'Content-Type': 'application/json'}
        )

        print(f"📡 Response status: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print("✅ Candidate data saved successfully!")
            print(f"   📁 Candidate folder: {result.get('candidate_folder')}")
            print(f"   🗂️  Database inserted: {result.get('database_inserted')}")
            print(f"   🖼️  Files count: {result.get('files_count')}")

            if result.get('database_inserted'):
                print(f"   🆔 Record ID: {result.get('record_id')}")

            # Verify data was stored correctly
            print("\n🔍 Verifying stored data...")

            # Get the candidate data back
            verify_response = requests.get(f"{BASE_URL}/candidate/get-all-candidates")
            if verify_response.status_code == 200:
                verify_result = verify_response.json()
                candidates = verify_result.get('data', [])

                # Find our test candidate
                test_candidate = None
                for candidate in candidates:
                    if candidate.get('candidate_name') == "Test_Candidate_TC123456":
                        test_candidate = candidate
                        break

                if test_candidate:
                    print("✅ Test candidate found in database")
                    json_data = test_candidate.get('candidate_data', {})

                    # Check OCR data
                    if json_data.get('ocr_data'):
                        print("✅ OCR data stored correctly")
                    else:
                        print("❌ OCR data missing")


                    # Check session_id
                    if json_data.get('session_id') == "test-session-123":
                        print("✅ Session ID stored correctly")
                    else:
                        print("❌ Session ID missing or incorrect")

                    print("🎉 All data consolidation tests passed!")
                    return True
                else:
                    print("❌ Test candidate not found in database")
                    return False
            else:
                print("❌ Failed to retrieve candidates for verification")
                return False
        else:
            print(f"❌ Failed to save candidate data: {response.status_code}")
            print(f"   Response: {response.text}")
            return False

    except Exception as e:
        print(f"❌ Error during test: {e}")
        return False

if __name__ == "__main__":
    success = test_consolidated_candidate_data()
    if success:
        print("\n🎯 CONSOLIDATED CANDIDATE DATA TEST PASSED!")
    else:
        print("\n❌ CONSOLIDATED CANDIDATE DATA TEST FAILED!")
        exit(1)
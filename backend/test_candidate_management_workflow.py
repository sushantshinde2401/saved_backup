#!/usr/bin/env python3
"""
Test script for candidate management workflow
Tests the complete workflow: upload images to temp storage, then save candidate data atomically
"""

import requests
import json
import os
from datetime import datetime

BASE_URL = "http://localhost:5000"

def create_test_image():
    """Create a simple test image file"""
    from PIL import Image
    import io

    # Create a simple test image
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    return img_bytes

def test_candidate_management_workflow():
    """Test the complete candidate management workflow"""
    print("🧪 Testing Candidate Management Workflow")
    print("=" * 60)

    # Step 1: Upload images (temporary storage)
    print("\n📤 Step 1: Uploading images to temporary storage...")

    # Create test image files
    test_images = {}
    image_names = ['photo', 'signature', 'passport_front_img', 'passport_back_img']

    for name in image_names:
        test_images[name] = create_test_image()

    # Prepare form data for upload
    form_data = {}
    files = {}

    for name in image_names:
        files[name] = (f'{name}.jpg', test_images[name], 'image/jpeg')

    try:
        response = requests.post(
            f"{BASE_URL}/upload-images",
            files=files
        )

        print(f"📡 Upload response status: {response.status_code}")

        if response.status_code == 200:
            upload_result = response.json()
            print("✅ Images uploaded to temporary storage!")
            print(f"   📋 Session ID: {upload_result.get('session_id')}")
            print(f"   📁 Files processed: {upload_result.get('files_processed')}")

            session_id = upload_result.get('session_id')
            if not session_id:
                print("❌ No session ID returned")
                return False
        else:
            print(f"❌ Upload failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False

    except Exception as e:
        print(f"❌ Upload error: {e}")
        return False

    # Step 2: Save candidate data with atomic transaction
    print("\n📤 Step 2: Saving candidate data atomically...")

    # Generate unique test data
    import time
    unique_id = str(int(time.time()))[-6:]  # Last 6 digits of timestamp

    candidate_data = {
        "firstName": "Test",
        "lastName": "Candidate",
        "passport": f"TC{unique_id}",
        "dob": "1990-01-01",
        "nationality": "Test",
        "address": "123 Test Street",
        "cdcNo": f"CDC{unique_id}",
        "indosNo": f"IND{unique_id}",
        "email": f"test{unique_id}@example.com",
        "phone": "1234567890",
        "companyName": "Test Company",
        "vendorName": "Test Vendor",
        "paymentStatus": "PAID",
        "rollNo": f"TC{unique_id}",
        "session_id": session_id,
        "ocr_data": {
            "passport_front": {
                "name": "Test Candidate",
                "passport_no": f"TC{unique_id}",
                "date_of_birth": "1990-01-01"
            },
            "passport_back": {
                "address": "123 Test Street"
            },
            "cdc": {
                "cdc_no": f"CDC{unique_id}",
                "indos_no": f"IND{unique_id}"
            }
        },
    }

    try:
        response = requests.post(
            f"{BASE_URL}/candidate/save-candidate-data",
            json=candidate_data,
            headers={'Content-Type': 'application/json'}
        )

        print(f"📡 Save response status: {response.status_code}")

        if response.status_code == 200:
            save_result = response.json()
            print("✅ Candidate data saved atomically!")
            print(f"   🆔 Record ID: {save_result.get('record_id')}")
            print(f"   📁 Files count: {save_result.get('files_count')}")
            print(f"   🗂️  Storage type: {save_result.get('storage_type')}")

            record_id = save_result.get('record_id')
            if not record_id:
                print("❌ No record ID returned")
                return False
        else:
            print(f"❌ Save failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False

    except Exception as e:
        print(f"❌ Save error: {e}")
        return False

    # Step 3: Verify data was stored correctly
    print("\n🔍 Step 3: Verifying stored data...")

    try:
        # Get all candidates
        response = requests.get(f"{BASE_URL}/candidate/get-all-candidates")
        if response.status_code == 200:
            result = response.json()
            candidates = result.get('data', [])

            # Find our test candidate
            test_candidate = None
            for candidate in candidates:
                if candidate.get('candidate_name') == "Test_Candidate_TC123456":
                    test_candidate = candidate
                    break

            if test_candidate:
                print("✅ Test candidate found in database")
                print(f"   📋 Session ID: {test_candidate.get('session_id')}")
                print(f"   🖼️  Images count: {len(test_candidate.get('files', []))}")

                # Check that images are accessible
                if test_candidate.get('files'):
                    print("✅ Images linked correctly")

                    # Try to access first image
                    first_image = test_candidate['files'][0]
                    image_response = requests.get(
                        f"{BASE_URL}/candidate/image/{record_id}/1"
                    )
                    if image_response.status_code == 200:
                        print("✅ Image retrieval working")
                    else:
                        print("❌ Image retrieval failed")
                        return False
                else:
                    print("❌ No images found")
                    return False

                # Check JSON data
                json_data = test_candidate.get('candidate_data', {})
                if json_data.get('ocr_data'):
                    print("✅ OCR data stored correctly")
                else:
                    print("❌ OCR data missing")


                print("🎉 All workflow tests passed!")
                return True
            else:
                print("❌ Test candidate not found in database")
                return False
        else:
            print("❌ Failed to retrieve candidates for verification")
            return False

    except Exception as e:
        print(f"❌ Verification error: {e}")
        return False

if __name__ == "__main__":
    success = test_candidate_management_workflow()
    if success:
        print("\n🎯 CANDIDATE MANAGEMENT WORKFLOW TEST PASSED!")
    else:
        print("\n❌ CANDIDATE MANAGEMENT WORKFLOW TEST FAILED!")
        exit(1)
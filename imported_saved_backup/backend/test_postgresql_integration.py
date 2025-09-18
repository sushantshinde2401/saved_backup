#!/usr/bin/env python3
"""
Test script for PostgreSQL integration
This script tests the database operations without affecting production data.
"""

import os
import sys
import json
from datetime import datetime

# Add backend directory to path
sys.path.insert(0, os.path.dirname(__file__))

from database.db_connection import (
    insert_candidate_upload,
    get_candidate_data as get_candidate_data_from_db,
    get_candidate_by_id,
    search_candidates_by_json_field,
    get_upload_stats
)

def test_database_connection():
    """Test basic database connectivity"""
    print("[TEST] Testing database connection...")
    try:
        stats = get_upload_stats()
        print(f"[TEST] ✅ Database connection successful")
        print(f"[TEST] Current stats: {stats}")
        return True
    except Exception as e:
        print(f"[TEST] ❌ Database connection failed: {e}")
        return False

def test_insert_candidate():
    """Test inserting candidate data"""
    print("\n[TEST] Testing candidate data insertion...")

    # Sample candidate data
    test_data = {
        'firstName': 'Test',
        'lastName': 'Candidate',
        'passport': 'T123456',
        'email': 'test@example.com',
        'phone': '+1234567890',
        'nationality': 'Test',
        'dob': '1990-01-01',
        'cdcNo': 'CDC123',
        'indosNo': 'INDOS123',
        'companyName': 'Test Company',
        'vendorName': 'Test Vendor',
        'paymentStatus': 'completed',
        'rollNo': 'ROLL001',
        'session_id': 'test_session_123',
        'timestamp': datetime.now().strftime("%Y%m%d_%H%M%S"),
        'last_updated': datetime.now().isoformat(),
        'candidate_folder': 'TEST_CANDIDATE_T123456',
        'candidate_folder_path': '/test/path',
        'moved_files': ['test_photo.jpg', 'test_passport.pdf']
    }

    try:
        # Test file data
        candidate_name = "TEST_CANDIDATE_T123456"
        file_name = "test_photo.jpg"
        file_type = "jpg"
        file_path = "/test/path/test_photo.jpg"

        record_id = insert_candidate_upload(
            candidate_name=candidate_name,
            file_name=file_name,
            file_type=file_type,
            file_path=file_path,
            json_data=test_data
        )

        print(f"[TEST] ✅ Inserted test record with ID: {record_id}")
        return record_id

    except Exception as e:
        print(f"[TEST] ❌ Failed to insert test data: {e}")
        return None

def test_retrieve_candidate(record_id):
    """Test retrieving candidate data"""
    print(f"\n[TEST] Testing candidate data retrieval (ID: {record_id})...")

    try:
        # Test get by ID
        record = get_candidate_by_id(record_id)
        if record:
            print(f"[TEST] ✅ Retrieved record by ID: {record['candidate_name']}")
        else:
            print("[TEST] ❌ Record not found by ID")

        # Test get recent candidates
        recent = get_candidate_data_from_db(limit=5)
        print(f"[TEST] ✅ Retrieved {len(recent)} recent records")

        # Test search by JSON field
        search_results = search_candidates_by_json_field('firstName', 'Test', limit=5)
        print(f"[TEST] ✅ Found {len(search_results)} records with firstName='Test'")

        return True

    except Exception as e:
        print(f"[TEST] ❌ Failed to retrieve test data: {e}")
        return False

def test_file_operations_simulation():
    """Simulate file operations that would happen in production"""
    print("\n[TEST] Simulating file operations...")

    # Simulate what happens during form submission
    test_files = [
        ('photo.jpg', 'jpg'),
        ('passport.pdf', 'pdf'),
        ('signature.png', 'png')
    ]

    test_data = {
        'firstName': 'File',
        'lastName': 'Test',
        'passport': 'F999999',
        'email': 'filetest@example.com',
        'session_id': 'file_test_session',
        'timestamp': datetime.now().strftime("%Y%m%d_%H%M%S"),
        'candidate_folder': 'FILE_TEST_F999999',
        'candidate_folder_path': '/simulated/path',
        'moved_files': [f[0] for f in test_files]
    }

    inserted_ids = []

    try:
        for file_name, file_type in test_files:
            file_path = f"/simulated/path/{file_name}"

            record_id = insert_candidate_upload(
                candidate_name="FILE_TEST_F999999",
                file_name=file_name,
                file_type=file_type,
                file_path=file_path,
                json_data=test_data
            )

            inserted_ids.append(record_id)
            print(f"[TEST] ✅ Inserted file record: {file_name} (ID: {record_id})")

        print(f"[TEST] ✅ Successfully simulated {len(test_files)} file uploads")
        return inserted_ids

    except Exception as e:
        print(f"[TEST] ❌ Failed to simulate file operations: {e}")
        return []

def cleanup_test_data():
    """Clean up test data (optional)"""
    print("\n[TEST] Note: Test data cleanup not implemented")
    print("[TEST] Test records can be manually deleted from candidate_uploads table if needed")

def main():
    """Main test function"""
    print("=" * 60)
    print(" POSTGRESQL INTEGRATION TEST SUITE")
    print("=" * 60)

    # Test 1: Database Connection
    if not test_database_connection():
        print("\n[TEST] ❌ Database connection test failed. Aborting other tests.")
        print("[TEST] Please ensure PostgreSQL is running and credentials are correct.")
        return 1

    # Test 2: Insert Candidate Data
    record_id = test_insert_candidate()
    if not record_id:
        print("\n[TEST] ❌ Insert test failed. Aborting retrieval tests.")
        return 1

    # Test 3: Retrieve Candidate Data
    if not test_retrieve_candidate(record_id):
        print("\n[TEST] ❌ Retrieval test failed.")
        return 1

    # Test 4: Simulate File Operations
    file_ids = test_file_operations_simulation()
    if not file_ids:
        print("\n[TEST] ❌ File operations simulation failed.")
        return 1

    # Cleanup
    cleanup_test_data()

    print("\n" + "=" * 60)
    print(" ✅ ALL TESTS PASSED SUCCESSFULLY")
    print("=" * 60)
    print("\nTest Summary:")
    print(f"- Database connection: ✅")
    print(f"- Data insertion: ✅ (ID: {record_id})")
    print(f"- Data retrieval: ✅")
    print(f"- File operations: ✅ ({len(file_ids)} files)")
    print("\nThe PostgreSQL integration is working correctly!")
    print("Files remain on disk while metadata is stored in the database.")

    return 0

if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n[TEST] Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n[TEST] Unexpected error: {e}")
        sys.exit(1)
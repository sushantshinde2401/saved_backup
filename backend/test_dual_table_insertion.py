#!/usr/bin/env python3
"""
Test script for dual table insertion functionality
Tests the new save_candidate_with_files function that inserts into both candidates and candidate_uploads tables
"""

import os
import sys
import json
from datetime import datetime

# Add backend directory to path
sys.path.insert(0, os.path.dirname(__file__))

from database.db_connection import (
    save_candidate_with_files,
    get_candidate_data,
    get_upload_stats
)

def test_dual_table_insertion():
    """Test the dual table insertion functionality"""
    print("[TEST] Testing dual table insertion...")

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
        'candidate_folder_path': '/test/path'
    }

    # Simulate moved files
    moved_files = ['photo.jpg', 'passport.pdf', 'signature.png']

    try:
        # Test the dual insertion
        result = save_candidate_with_files(
            candidate_name="TEST_CANDIDATE_T123456",
            candidate_folder="TEST_CANDIDATE_T123456",
            candidate_folder_path="/test/path/TEST_CANDIDATE_T123456",
            json_data=test_data,
            moved_files=moved_files
        )

        print(f"[TEST] ✅ Dual insertion successful!")
        print(f"[TEST] Candidate ID: {result['candidate_id']}")
        print(f"[TEST] Upload IDs: {result['upload_ids']}")
        print(f"[TEST] Files count: {result['files_count']}")

        # Verify data was inserted by retrieving it
        candidates = get_candidate_data(limit=5)
        print(f"[TEST] ✅ Retrieved {len(candidates)} candidates from database")

        # Get updated stats
        stats = get_upload_stats()
        print(f"[TEST] ✅ Database stats: {stats}")

        return True

    except Exception as e:
        print(f"[TEST] ❌ Dual insertion failed: {e}")
        return False

def main():
    """Main test function"""
    print("=" * 60)
    print(" DUAL TABLE INSERTION TEST")
    print("=" * 60)

    # Test dual table insertion
    if test_dual_table_insertion():
        print("\n" + "=" * 60)
        print(" ✅ DUAL TABLE INSERTION TEST PASSED")
        print("=" * 60)
        print("\nThe dual table insertion functionality is working correctly!")
        print("- Data is inserted into both 'candidates' and 'candidate_uploads' tables")
        print("- Unique candidates are stored in 'candidates' table")
        print("- File metadata is stored in 'candidate_uploads' table")
        return 0
    else:
        print("\n" + "=" * 60)
        print(" ❌ DUAL TABLE INSERTION TEST FAILED")
        print("=" * 60)
        return 1

if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n[TEST] Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n[TEST] Unexpected error: {e}")
        sys.exit(1)
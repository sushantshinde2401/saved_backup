#!/usr/bin/env python3
"""
Script to migrate existing JSON files to database storage
"""
import os
import json
from database.db_connection import execute_query

def migrate_current_candidate():
    """Migrate current_candidate_for_certificate.json to database"""
    print("🔄 Migrating current candidate data...")

    json_path = "uploads/json/current_candidate_for_certificate.json"
    if not os.path.exists(json_path):
        print("⚠️  Current candidate JSON file not found, skipping...")
        return False

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            candidate_data = json.load(f)

        # First, unset any existing current candidate
        execute_query("""
            UPDATE candidate_uploads
            SET is_current_candidate = FALSE
            WHERE is_current_candidate = TRUE
        """, fetch=False)

        # Insert new current candidate
        result = execute_query("""
            INSERT INTO candidate_uploads (
                candidate_name, file_name, file_type, file_path, json_data, is_current_candidate, last_updated
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            candidate_data.get('passport', 'unknown'),
            'candidate_data.json',  # Placeholder filename
            'json',  # File type
            'database_storage',  # Placeholder file path
            json.dumps(candidate_data),
            True,
            candidate_data.get('last_updated', None)
        ))

        if result:
            print(f"✅ Migrated current candidate: {candidate_data.get('firstName')} {candidate_data.get('lastName')}")
            return True
        else:
            print("❌ Failed to insert current candidate")
            return False

    except Exception as e:
        print(f"❌ Error migrating current candidate: {e}")
        return False

def migrate_ocr_data():
    """Migrate structured_passport_data_*.json files to database"""
    print("🔄 Migrating OCR data files...")

    json_folder = "uploads/json"
    migrated_count = 0
    error_count = 0

    for filename in os.listdir(json_folder):
        if filename.startswith("structured_passport_data_") and filename.endswith(".json"):
            try:
                file_path = os.path.join(json_folder, filename)
                with open(file_path, 'r', encoding='utf-8') as f:
                    ocr_data = json.load(f)

                session_id = ocr_data.get('session_id')
                if session_id:
                    result = execute_query("""
                        INSERT INTO candidate_uploads (
                            candidate_name, file_name, file_type, file_path, session_id, ocr_data, last_updated
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                        RETURNING id
                    """, (
                        f"session_{session_id}",
                        f"structured_passport_data_{session_id}.json",  # Original filename
                        'json',  # File type
                        'database_storage',  # Placeholder file path
                        session_id,
                        json.dumps(ocr_data),
                        ocr_data.get('last_updated')
                    ))

                    if result:
                        migrated_count += 1
                        print(f"✅ Migrated OCR data for session: {session_id}")
                    else:
                        error_count += 1
                        print(f"❌ Failed to migrate OCR data for session: {session_id}")

            except Exception as e:
                error_count += 1
                print(f"❌ Error migrating {filename}: {e}")

    print(f"📊 OCR migration complete: {migrated_count} successful, {error_count} errors")
    return migrated_count > 0

def migrate_certificate_selections():
    """Migrate certificate_selections_for_receipt.json to database"""
    print("🔄 Migrating certificate selections...")

    json_path = "uploads/json/certificate_selections_for_receipt.json"
    if not os.path.exists(json_path):
        print("⚠️  Certificate selections JSON file not found, skipping...")
        return False

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            selections_data = json.load(f)

        # First, unset any existing certificate selections
        execute_query("""
            UPDATE candidate_uploads
            SET is_certificate_selection = FALSE
            WHERE is_certificate_selection = TRUE
        """, fetch=False)

        # Insert certificate selections
        result = execute_query("""
            INSERT INTO candidate_uploads (
                candidate_name, file_name, file_type, file_path, certificate_selections, is_certificate_selection, last_updated
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            "certificate_selections",
            "certificate_selections_for_receipt.json",  # Original filename
            'json',  # File type
            'database_storage',  # Placeholder file path
            json.dumps(selections_data),
            True,
            None
        ))

        if result:
            print("✅ Migrated certificate selections")
            return True
        else:
            print("❌ Failed to insert certificate selections")
            return False

    except Exception as e:
        print(f"❌ Error migrating certificate selections: {e}")
        return False

def verify_migration():
    """Verify that migration was successful"""
    print("🔍 Verifying migration...")

    try:
        # Check current candidate
        result = execute_query("""
            SELECT COUNT(*) as count FROM candidate_uploads
            WHERE is_current_candidate = TRUE
        """)
        current_count = result[0]['count'] if result else 0
        print(f"✅ Current candidates in DB: {current_count}")

        # Check OCR data
        result = execute_query("""
            SELECT COUNT(*) as count FROM candidate_uploads
            WHERE ocr_data IS NOT NULL
        """)
        ocr_count = result[0]['count'] if result else 0
        print(f"✅ OCR records in DB: {ocr_count}")

        # Check certificate selections
        result = execute_query("""
            SELECT COUNT(*) as count FROM candidate_uploads
            WHERE is_certificate_selection = TRUE
        """)
        cert_count = result[0]['count'] if result else 0
        print(f"✅ Certificate selection records in DB: {cert_count}")

        return True

    except Exception as e:
        print(f"❌ Error verifying migration: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting JSON to Database Migration...")

    success_count = 0
    total_steps = 4

    # Step 1: Migrate current candidate
    if migrate_current_candidate():
        success_count += 1

    # Step 2: Migrate OCR data
    if migrate_ocr_data():
        success_count += 1

    # Step 3: Migrate certificate selections
    if migrate_certificate_selections():
        success_count += 1

    # Step 4: Verify migration
    if verify_migration():
        success_count += 1

    print(f"\n🎯 Migration Summary:")
    print(f"   Steps completed: {success_count}/{total_steps}")
    print(f"   Success rate: {(success_count/total_steps*100):.1f}%")
    if success_count == total_steps:
        print("🎉 Migration completed successfully!")
        print("💡 You can now safely remove the JSON files from backend/uploads/json/")
    else:
        print("⚠️  Migration completed with some issues. Please check the output above.")
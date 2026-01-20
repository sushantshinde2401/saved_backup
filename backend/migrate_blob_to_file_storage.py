"""
Migration script to move existing BLOB data from candidate_uploads.file_data to file storage
"""

import os
import sys
from database.db_connection import execute_query
from config import Config

def migrate_blob_to_file_storage():
    """
    Migrate existing BLOB data to file storage
    """
    print("[MIGRATION] Starting BLOB to file storage migration...")

    # Mapping from image_type to fixed filename
    image_type_to_filename = {
        'photo': 'photo.png',
        'signature': 'signature.png',
        'passport_front': 'passport_front.jpg',
        'passport_back': 'passport_back.jpg',
        'cdc': 'cdc.jpg',
        'coc': 'coc.jpg',
        'payment': 'payment.jpg',
        'marksheet': 'marksheet.pdf'
    }

    try:
        # Get all records with file_data that don't have file_path yet
        query = """
            SELECT id, candidate_id, file_data, image_type, file_type, candidate_name
            FROM candidate_uploads
            WHERE file_data IS NOT NULL
            AND (file_path IS NULL OR file_path = '')
            ORDER BY candidate_id, upload_time
        """

        results = execute_query(query)
        if not results:
            print("[MIGRATION] No BLOB data found to migrate")
            return True

        print(f"[MIGRATION] Found {len(results)} records to migrate")

        migrated_count = 0
        error_count = 0

        for row in results:
            try:
                record_id = row['id']
                candidate_id = row['candidate_id']
                file_data = row['file_data']
                image_type = row['image_type']
                file_type = row['file_type'] or 'bin'
                candidate_name = row['candidate_name']

                # Determine fixed filename
                fixed_filename = image_type_to_filename.get(image_type, f"{image_type or 'unknown'}.{file_type}")

                # Create candidate folder path
                candidate_folder = f"CANDIDATE_{candidate_id}"
                candidate_dir = os.path.join(Config.BASE_STORAGE_PATH, candidate_folder)

                # Ensure candidate directory exists
                os.makedirs(candidate_dir, exist_ok=True)

                # Full file path
                file_path = os.path.join(candidate_dir, fixed_filename)

                # Check if file already exists (avoid overwriting)
                if os.path.exists(file_path):
                    print(f"[MIGRATION] File already exists: {file_path}, skipping record {record_id}")
                    continue

                # Save file to disk
                with open(file_path, 'wb') as f:
                    f.write(file_data)

                # Relative path for database
                relative_path = f"{candidate_folder}/{fixed_filename}"

                # Update database record
                update_query = """
                    UPDATE candidate_uploads
                    SET file_path = %s
                    WHERE id = %s
                """
                execute_query(update_query, (relative_path, record_id), fetch=False)

                migrated_count += 1
                print(f"[MIGRATION] ✅ Migrated record {record_id} for candidate {candidate_id}: {relative_path}")

            except Exception as e:
                error_count += 1
                print(f"[MIGRATION] ❌ Error migrating record {row['id']}: {e}")
                continue

        print(f"[MIGRATION] Migration completed: {migrated_count} migrated, {error_count} errors")
        return error_count == 0

    except Exception as e:
        print(f"[MIGRATION] ❌ Migration failed: {e}")
        return False

def validate_migration():
    """
    Validate that all file_path records have corresponding files
    """
    print("[VALIDATION] Validating migration...")

    try:
        # Get all records with file_path
        query = """
            SELECT id, candidate_id, file_path
            FROM candidate_uploads
            WHERE file_path IS NOT NULL AND file_path != ''
        """

        results = execute_query(query)
        if not results:
            print("[VALIDATION] No file_path records found")
            return True

        valid_count = 0
        missing_count = 0

        for row in results:
            file_path = row['file_path']
            full_path = os.path.join(Config.BASE_STORAGE_PATH, file_path)

            if os.path.exists(full_path):
                valid_count += 1
            else:
                missing_count += 1
                print(f"[VALIDATION] ❌ Missing file: {full_path} for record {row['id']}")

        print(f"[VALIDATION] Validation completed: {valid_count} valid, {missing_count} missing")
        return missing_count == 0

    except Exception as e:
        print(f"[VALIDATION] ❌ Validation failed: {e}")
        return False

def main():
    """Main migration function"""
    print("[MIGRATION] BLOB to File Storage Migration Script")
    print("=" * 50)

    # Run migration
    migration_success = migrate_blob_to_file_storage()

    if migration_success:
        print("[MIGRATION] ✅ Migration completed successfully")

        # Validate
        validation_success = validate_migration()
        if validation_success:
            print("[MIGRATION] ✅ Validation passed - all files are present")
            print("[MIGRATION] You can now safely drop the file_data column if desired")
            print("[MIGRATION] ALTER TABLE candidate_uploads DROP COLUMN file_data;")
        else:
            print("[MIGRATION] ⚠️  Validation failed - some files are missing")
            print("[MIGRATION] Please check the errors above and re-run migration")
            sys.exit(1)
    else:
        print("[MIGRATION] ❌ Migration failed")
        sys.exit(1)

if __name__ == "__main__":
    main()
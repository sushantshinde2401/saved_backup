"""
Migration script to move existing BLOB data from invoice_images.image_data to file storage
"""

import os
import sys
from database.db_connection import execute_query
from config import Config

def migrate_invoice_images_blob_to_file():
    """
    Migrate existing BLOB data to file storage
    """
    print("[MIGRATION] Starting invoice images BLOB to file storage migration...")

    # Mapping from voucher_type to fixed filename
    voucher_type_to_filename = {
        'Sales': 'SALES_INVOICE.pdf',
        'Receipt': 'RECEIPT.pdf',
        'Adjustment': 'ADJUSTMENT.pdf'
    }

    try:
        # Get all records with image_data that don't have file_path yet
        query = """
            SELECT id, invoice_no, image_data, voucher_type, file_name
            FROM invoice_images
            WHERE image_data IS NOT NULL
            AND (file_path IS NULL OR file_path = '')
            ORDER BY invoice_no, generated_at
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
                invoice_no = row['invoice_no']
                image_data = row['image_data']
                voucher_type = row['voucher_type'] or 'Sales'
                file_name = row['file_name']

                # Determine fixed filename based on voucher_type
                fixed_filename = voucher_type_to_filename.get(voucher_type, f"{voucher_type or 'UNKNOWN'}_INVOICE.pdf")

                # Create invoice folder path
                invoice_folder = f"INVOICE_{invoice_no}"
                invoice_dir = os.path.join(Config.INVOICE_STORAGE_PATH, invoice_folder)

                # Ensure invoice directory exists
                os.makedirs(invoice_dir, exist_ok=True)

                # Full file path
                file_path = os.path.join(invoice_dir, fixed_filename)

                # Check if file already exists (avoid overwriting)
                if os.path.exists(file_path):
                    print(f"[MIGRATION] File already exists: {file_path}, skipping record {record_id}")
                    continue

                # Save file to disk
                with open(file_path, 'wb') as f:
                    f.write(image_data)

                # Relative path for database
                relative_path = f"{invoice_folder}/{fixed_filename}"

                # Update database record
                update_query = """
                    UPDATE invoice_images
                    SET file_path = %s
                    WHERE id = %s
                """
                execute_query(update_query, (relative_path, record_id), fetch=False)

                migrated_count += 1
                print(f"[MIGRATION] ✅ Migrated record {record_id} for invoice {invoice_no}: {relative_path}")

            except Exception as e:
                error_count += 1
                print(f"[MIGRATION] ❌ Error migrating record {row['id']}: {e}")
                continue

        print(f"[MIGRATION] Migration completed: {migrated_count} migrated, {error_count} errors")
        return error_count == 0

    except Exception as e:
        print(f"[MIGRATION] ❌ Migration failed: {e}")
        return False

def validate_invoice_migration():
    """
    Validate that all file_path records have corresponding files
    """
    print("[VALIDATION] Validating invoice migration...")

    try:
        # Get all records with file_path
        query = """
            SELECT id, invoice_no, file_path
            FROM invoice_images
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
            full_path = os.path.join(Config.INVOICE_STORAGE_PATH, file_path)

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
    print("[MIGRATION] Invoice Images BLOB to File Storage Migration Script")
    print("=" * 60)

    # Run migration
    migration_success = migrate_invoice_images_blob_to_file()

    if migration_success:
        print("[MIGRATION] ✅ Migration completed successfully")

        # Validate
        validation_success = validate_invoice_migration()
        if validation_success:
            print("[MIGRATION] ✅ Validation passed - all files are present")
            print("[MIGRATION] You can now safely drop the image_data column if desired")
            print("[MIGRATION] ALTER TABLE invoice_images DROP COLUMN image_data;")
        else:
            print("[MIGRATION] ⚠️  Validation failed - some files are missing")
            print("[MIGRATION] Please check the errors above and re-run migration")
            sys.exit(1)
    else:
        print("[MIGRATION] ❌ Migration failed")
        sys.exit(1)

if __name__ == "__main__":
    main()
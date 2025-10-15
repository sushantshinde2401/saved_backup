#!/usr/bin/env python3
"""
Complete migration script to consolidate all candidate data from candidate_uploads to candidates table
"""
import json
from database.db_connection import execute_query

def migrate_all_candidate_data():
    """Migrate all candidate data and images from candidate_uploads to consolidated candidates table"""

    print("🚀 Starting complete candidate data consolidation migration...")

    try:
        # Get all unique candidate_names from candidate_uploads that have file data
        query_candidates = """
            SELECT DISTINCT candidate_name
            FROM candidate_uploads
            WHERE file_data IS NOT NULL OR json_data IS NOT NULL
            ORDER BY candidate_name
        """

        candidates = execute_query(query_candidates)
        print(f"📋 Found {len(candidates)} unique candidates to migrate")

        migrated_count = 0
        skipped_count = 0

        for candidate in candidates:
            candidate_name = candidate['candidate_name']
            print(f"🔄 Processing candidate: {candidate_name}")

            # Get all records for this candidate (including metadata records)
            query_all_records = """
                SELECT
                    id, candidate_name, file_name, file_type, file_path, upload_time, json_data,
                    file_data, file_size, mime_type, session_id, ocr_data, certificate_selections,
                    is_current_candidate, is_certificate_selection, last_updated,
                    candidate_folder, candidate_folder_path, created_at
                FROM candidate_uploads
                WHERE candidate_name = %s
                ORDER BY upload_time ASC
            """

            records = execute_query(query_all_records, (candidate_name,))

            if not records:
                print(f"⚠️  No records found for {candidate_name}, skipping")
                skipped_count += 1
                continue

            # Separate data: find the main candidate record (with json_data) and image records
            main_record = None
            image_records = []

            for record in records:
                if record['json_data'] and not record['file_data']:
                    # This is likely the main candidate record
                    main_record = record
                elif record['file_data']:
                    # This is an image record
                    image_records.append(record)

            # If no main record found, use the first record with json_data
            if not main_record:
                for record in records:
                    if record['json_data']:
                        main_record = record
                        break

            # If still no main record, create one from the first record
            if not main_record:
                main_record = records[0]

            # Prepare consolidated data
            json_data = main_record['json_data'] or {}
            session_id = main_record['session_id']
            ocr_data = main_record['ocr_data']
            certificate_selections = main_record['certificate_selections']
            candidate_folder = main_record['candidate_folder']
            candidate_folder_path = main_record['candidate_folder_path']
            is_current_candidate = main_record['is_current_candidate'] or False
            is_certificate_selection = main_record['is_certificate_selection'] or False

            # Prepare image data (up to 6 images)
            image_data = {}
            image_names = {}
            image_types = {}

            for i, record in enumerate(image_records[:6]):
                image_num = i + 1
                image_data[f'image{image_num}'] = record['file_data']
                image_names[f'image{image_num}_name'] = record['file_name']
                image_types[f'image{image_num}_type'] = record['file_type']

                print(f"  📸 Image {image_num}: {record['file_name']} ({record['file_size']} bytes)")

            # Check if candidate already exists in candidates table
            check_query = "SELECT id FROM candidates WHERE candidate_name = %s"
            existing = execute_query(check_query, (candidate_name,))

            if existing:
                # Update existing candidate
                update_query = """
                    UPDATE candidates
                    SET candidate_folder = %s,
                        candidate_folder_path = %s,
                        json_data = %s,
                        session_id = %s,
                        ocr_data = %s,
                        certificate_selections = %s,
                        is_current_candidate = %s,
                        is_certificate_selection = %s,
                        image1 = %s, image1_name = %s, image1_type = %s,
                        image2 = %s, image2_name = %s, image2_type = %s,
                        image3 = %s, image3_name = %s, image3_type = %s,
                        image4 = %s, image4_name = %s, image4_type = %s,
                        image5 = %s, image5_name = %s, image5_type = %s,
                        image6 = %s, image6_name = %s, image6_type = %s,
                        last_updated = CURRENT_TIMESTAMP
                    WHERE candidate_name = %s
                """

                params = (
                    candidate_folder, candidate_folder_path, json.dumps(json_data),
                    session_id, json.dumps(ocr_data) if ocr_data else None,
                    json.dumps(certificate_selections) if certificate_selections else None,
                    is_current_candidate, is_certificate_selection,
                    image_data.get('image1'), image_names.get('image1_name'), image_types.get('image1_type'),
                    image_data.get('image2'), image_names.get('image2_name'), image_types.get('image2_type'),
                    image_data.get('image3'), image_names.get('image3_name'), image_types.get('image3_type'),
                    image_data.get('image4'), image_names.get('image4_name'), image_types.get('image4_type'),
                    image_data.get('image5'), image_names.get('image5_name'), image_types.get('image5_type'),
                    image_data.get('image6'), image_names.get('image6_name'), image_types.get('image6_type'),
                    candidate_name
                )

                execute_query(update_query, params, fetch=False)
                print(f"✅ Updated existing candidate: {candidate_name}")

            else:
                # Insert new candidate
                insert_query = """
                    INSERT INTO candidates (
                        candidate_name, candidate_folder, candidate_folder_path, json_data,
                        session_id, ocr_data, certificate_selections,
                        is_current_candidate, is_certificate_selection,
                        image1, image1_name, image1_type,
                        image2, image2_name, image2_type,
                        image3, image3_name, image3_type,
                        image4, image4_name, image4_type,
                        image5, image5_name, image5_type,
                        image6, image6_name, image6_type,
                        created_at, last_updated
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                """

                params = (
                    candidate_name, candidate_folder, candidate_folder_path, json.dumps(json_data),
                    session_id, json.dumps(ocr_data) if ocr_data else None,
                    json.dumps(certificate_selections) if certificate_selections else None,
                    is_current_candidate, is_certificate_selection,
                    image_data.get('image1'), image_names.get('image1_name'), image_types.get('image1_type'),
                    image_data.get('image2'), image_names.get('image2_name'), image_types.get('image2_type'),
                    image_data.get('image3'), image_names.get('image3_name'), image_types.get('image3_type'),
                    image_data.get('image4'), image_names.get('image4_name'), image_types.get('image4_type'),
                    image_data.get('image5'), image_names.get('image5_name'), image_types.get('image5_type'),
                    image_data.get('image6'), image_names.get('image6_name'), image_types.get('image6_type'),
                    main_record['created_at'] if main_record['created_at'] else None
                )

                execute_query(insert_query, params, fetch=False)
                print(f"✅ Inserted new candidate: {candidate_name}")

            migrated_count += 1

        print("\n📊 Migration Summary:")
        print(f"✅ Successfully migrated: {migrated_count} candidates")
        print(f"⚠️  Skipped: {skipped_count} candidates")
        print("🎉 Complete consolidation migration completed successfully!")

        # Optional: Mark migration as complete (you can add a migration tracking table)
        print("\n📝 Note: You can now safely remove or archive the candidate_uploads table")
        print("   after verifying that all data has been successfully migrated.")

        return True

    except Exception as e:
        print(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    if migrate_all_candidate_data():
        print("🎉 All candidate data has been successfully consolidated!")
    else:
        print("❌ Migration failed!")
        exit(1)
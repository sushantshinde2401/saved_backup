#!/usr/bin/env python3
"""
Script to migrate existing candidate data from candidate_uploads to consolidated candidates table
"""
import json
from database.db_connection import execute_query

def migrate_candidates():
    """Migrate candidate data and images to consolidated candidates table"""

    print("🚀 Starting candidate data consolidation migration...")

    try:
        # Get all unique candidate_names from candidate_uploads
        query_candidates = """
            SELECT DISTINCT candidate_name
            FROM candidate_uploads
            WHERE file_data IS NOT NULL
            ORDER BY candidate_name
        """

        candidates = execute_query(query_candidates)
        print(f"📋 Found {len(candidates)} unique candidates to migrate")

        migrated_count = 0
        skipped_count = 0

        for candidate in candidates:
            candidate_name = candidate['candidate_name']
            print(f"🔄 Processing candidate: {candidate_name}")

            # Get all files for this candidate
            query_files = """
                SELECT id, file_name, file_type, file_data, mime_type, json_data,
                       candidate_folder, candidate_folder_path
                FROM candidate_uploads
                WHERE candidate_name = %s AND file_data IS NOT NULL
                ORDER BY upload_time ASC
            """

            files = execute_query(query_files, (candidate_name,))

            if not files:
                print(f"⚠️  No files found for {candidate_name}, skipping")
                skipped_count += 1
                continue

            # Prepare image data (up to 6 images)
            image_data = {}
            image_names = {}
            image_types = {}

            for i, file in enumerate(files[:6]):  # Limit to 6 images
                image_num = i + 1
                image_data[f'image{image_num}'] = file['file_data']
                image_names[f'image{image_num}_name'] = file['file_name']
                image_types[f'image{image_num}_type'] = file['file_type']

            # Use json_data from the first file (should be consistent)
            json_data = files[0]['json_data'] or {}
            candidate_folder = files[0]['candidate_folder']
            candidate_folder_path = files[0]['candidate_folder_path']

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
                        image1 = %s, image1_name = %s, image1_type = %s,
                        image2 = %s, image2_name = %s, image2_type = %s,
                        image3 = %s, image3_name = %s, image3_type = %s,
                        image4 = %s, image4_name = %s, image4_type = %s,
                        image5 = %s, image5_name = %s, image5_type = %s,
                        image6 = %s, image6_name = %s, image6_type = %s
                    WHERE candidate_name = %s
                """

                params = (
                    candidate_folder, candidate_folder_path, json.dumps(json_data),
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
                        image1, image1_name, image1_type,
                        image2, image2_name, image2_type,
                        image3, image3_name, image3_type,
                        image4, image4_name, image4_type,
                        image5, image5_name, image5_type,
                        image6, image6_name, image6_type
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """

                params = (
                    candidate_name, candidate_folder, candidate_folder_path, json.dumps(json_data),
                    image_data.get('image1'), image_names.get('image1_name'), image_types.get('image1_type'),
                    image_data.get('image2'), image_names.get('image2_name'), image_types.get('image2_type'),
                    image_data.get('image3'), image_names.get('image3_name'), image_types.get('image3_type'),
                    image_data.get('image4'), image_names.get('image4_name'), image_types.get('image4_type'),
                    image_data.get('image5'), image_names.get('image5_name'), image_types.get('image5_type'),
                    image_data.get('image6'), image_names.get('image6_name'), image_types.get('image6_type')
                )

                execute_query(insert_query, params, fetch=False)
                print(f"✅ Inserted new candidate: {candidate_name}")

            migrated_count += 1

        print("\n📊 Migration Summary:")
        print(f"✅ Successfully migrated: {migrated_count} candidates")
        print(f"⚠️  Skipped: {skipped_count} candidates")
        print("🎉 Migration completed successfully!")

        return True

    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

if __name__ == "__main__":
    if migrate_candidates():
        print("🎉 All candidate data has been consolidated!")
    else:
        print("❌ Migration failed!")
        exit(1)
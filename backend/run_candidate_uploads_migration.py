#!/usr/bin/env python3
"""
Script to execute SQL migration files for candidate_uploads table
"""
import os
import sys
from database.db_connection import execute_query

def execute_sql_file(file_path):
    """Execute SQL commands from a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            sql_content = f.read()

        # Execute the entire file content as one statement
        print(f"Executing SQL file: {os.path.basename(file_path)}...")
        execute_query(sql_content, fetch=False)

        print(f"✅ Successfully executed {file_path}")
        return True

    except Exception as e:
        print(f"❌ Failed to execute {file_path}: {e}")
        return False

def main():
    """Main function to execute migration SQL files"""
    sql_files = [
        'add_candidate_id_to_candidate_uploads.sql',
        'migrate_candidate_uploads_candidate_id.sql',
        'add_foreign_key_candidate_uploads.sql',
        'drop_session_id_from_candidate_uploads.sql'
    ]

    success_count = 0

    for sql_file in sql_files:
        file_path = os.path.join(os.path.dirname(__file__), sql_file)
        if os.path.exists(file_path):
            print(f"\n📄 Executing {sql_file}...")
            if execute_sql_file(file_path):
                success_count += 1
        else:
            print(f"❌ File not found: {file_path}")

    print(f"\n🎉 Migration complete: {success_count}/{len(sql_files)} files executed successfully")

    if success_count == len(sql_files):
        print("✅ All candidate_uploads migrations have been applied!")
    else:
        print("⚠️  Some migrations failed to execute. Check the output above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
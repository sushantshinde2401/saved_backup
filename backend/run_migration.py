#!/usr/bin/env python3
"""
Script to execute the BLOB storage migration
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

if __name__ == "__main__":
    migration_file = "migrate_to_blob_storage.sql"
    file_path = os.path.join(os.path.dirname(__file__), migration_file)

    if os.path.exists(file_path):
        print(f"🚀 Starting BLOB storage migration...")
        if execute_sql_file(file_path):
            print("🎉 BLOB storage migration completed successfully!")
        else:
            print("❌ Migration failed!")
            sys.exit(1)
    else:
        print(f"❌ Migration file not found: {file_path}")
        sys.exit(1)
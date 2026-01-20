#!/usr/bin/env python3
"""
Script to add mime_type and file_size columns to candidate_uploads table
"""

import psycopg2
from config import Config

def run_sql_file():
    """Execute the SQL file to add missing columns"""
    try:
        # Connect to database
        conn = psycopg2.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            database=Config.DB_NAME,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD
        )

        cursor = conn.cursor()

        # Read and execute SQL file
        with open('add_mime_type_and_file_size_to_candidate_uploads.sql', 'r') as f:
            sql = f.read()

        print("Executing SQL to add mime_type and file_size columns...")
        cursor.execute(sql)
        conn.commit()

        print("✅ Successfully added mime_type and file_size columns to candidate_uploads table")

    except Exception as e:
        print(f"❌ Error: {e}")
        if 'conn' in locals():
            conn.rollback()
        raise
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    run_sql_file()
#!/usr/bin/env python3
"""
Script to execute the candidates table schema consolidation
"""
import os
from database.db_connection import execute_query

def execute_sql_file(file_path):
    """Execute SQL commands from a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            sql_content = f.read()

        print(f"Executing SQL file: {os.path.basename(file_path)}...")
        execute_query(sql_content, fetch=False)

        print("✅ Successfully executed schema consolidation")
        return True

    except Exception as e:
        print(f"❌ Failed to execute schema consolidation: {e}")
        return False

if __name__ == "__main__":
    file_path = os.path.join(os.path.dirname(__file__), "consolidate_candidates_schema.sql")

    if os.path.exists(file_path):
        print("🚀 Starting candidates table schema consolidation...")
        if execute_sql_file(file_path):
            print("🎉 Schema consolidation completed successfully!")
        else:
            print("❌ Schema consolidation failed!")
            exit(1)
    else:
        print(f"❌ SQL file not found: {file_path}")
        exit(1)
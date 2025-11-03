#!/usr/bin/env python3
"""
Script to execute the add status column to certificate_selections table SQL file
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
    """Main function to execute the add status column SQL"""
    sql_file = 'add_status_column_to_certificate_selections.sql'
    file_path = os.path.join(os.path.dirname(__file__), sql_file)

    if os.path.exists(file_path):
        print(f"\n📄 Executing {sql_file}...")
        if execute_sql_file(file_path):
            print("✅ Status column added to certificate_selections table successfully!")
        else:
            print("❌ Failed to add status column to certificate_selections table.")
            sys.exit(1)
    else:
        print(f"❌ File not found: {file_path}")
        sys.exit(1)

if __name__ == "__main__":
    main()
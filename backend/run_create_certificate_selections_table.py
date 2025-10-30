#!/usr/bin/env python3
"""
Script to execute the certificate_selections table creation SQL file
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
    """Main function to execute the certificate_selections table creation"""
    sql_file = 'create_certificate_selections_table.sql'
    file_path = os.path.join(os.path.dirname(__file__), sql_file)

    if os.path.exists(file_path):
        print(f"\n📄 Executing {sql_file}...")
        if execute_sql_file(file_path):
            print("✅ certificate_selections table created successfully!")
        else:
            print("❌ Failed to create certificate_selections table.")
            sys.exit(1)
    else:
        print(f"❌ File not found: {file_path}")
        sys.exit(1)

if __name__ == "__main__":
    main()
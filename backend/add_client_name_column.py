#!/usr/bin/env python3
"""
Script to add client_name column to certificate_selections table
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.db_connection import execute_query

def add_client_name_column():
    """Add client_name column to certificate_selections table"""
    try:
        # Add the column if it doesn't exist
        alter_query = '''
        ALTER TABLE certificate_selections ADD COLUMN IF NOT EXISTS client_name VARCHAR(255);
        '''
        execute_query(alter_query, fetch=False)
        print("✅ Successfully added client_name column to certificate_selections table")

        # Add comment for documentation
        comment_query = '''
        COMMENT ON COLUMN certificate_selections.client_name IS 'Client name extracted from candidate json_data';
        '''
        execute_query(comment_query, fetch=False)
        print("✅ Successfully added comment to client_name column")

        return True

    except Exception as e:
        print(f"❌ Failed to add client_name column: {e}")
        return False

if __name__ == "__main__":
    if add_client_name_column():
        print("🎉 client_name column addition completed successfully!")
    else:
        print("❌ Failed to add client_name column!")
        exit(1)
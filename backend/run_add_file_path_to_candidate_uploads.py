"""
Script to execute the add file_path column to candidate_uploads table SQL file
"""

import os
import sys
from execute_sql_files import execute_sql_file

def main():
    """Main function to execute the add file_path column SQL"""
    sql_file = 'add_file_path_to_candidate_uploads.sql'
    file_path = os.path.join(os.path.dirname(__file__), sql_file)

    if execute_sql_file(file_path):
        print("✅ File path column added to candidate_uploads table successfully!")
    else:
        print("❌ Failed to add file path column to candidate_uploads table.")
        sys.exit(1)

if __name__ == "__main__":
    main()
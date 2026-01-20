"""
Script to execute the add updated_at column to legacy_certificates table SQL file
"""

import os
import sys
from execute_sql_files import execute_sql_file

def main():
    """Main function to execute the add updated_at column SQL"""
    sql_file = 'add_updated_at_to_legacy_certificates.sql'
    file_path = os.path.join(os.path.dirname(__file__), sql_file)

    if execute_sql_file(file_path):
        print("✅ Updated_at column added to legacy_certificates table successfully!")
    else:
        print("❌ Failed to add updated_at column to legacy_certificates table.")
        sys.exit(1)

if __name__ == "__main__":
    main()
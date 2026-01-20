"""
Script to execute the add expiry_date column to certificate_selections table SQL file
"""

import os
import sys
from execute_sql_files import execute_sql_file

def main():
    """Main function to execute the add expiry_date column SQL"""
    sql_file = 'add_expiry_date_column_to_certificate_selections.sql'
    file_path = os.path.join(os.path.dirname(__file__), sql_file)

    if execute_sql_file(file_path):
        print("✅ Expiry date column added to certificate_selections table successfully!")
    else:
        print("❌ Failed to add expiry date column to certificate_selections table.")
        sys.exit(1)

if __name__ == "__main__":
    main()
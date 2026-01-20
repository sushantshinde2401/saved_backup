"""
Script to execute the alter certificate_selections image columns SQL file
"""

import os
import sys
from execute_sql_files import execute_sql_file

def main():
    """Main function to execute the alter image columns SQL"""
    sql_file = 'alter_certificate_selections_image_columns.sql'
    file_path = os.path.join(os.path.dirname(__file__), sql_file)

    if execute_sql_file(file_path):
        print("✅ Certificate selections image columns altered successfully!")
    else:
        print("❌ Failed to alter certificate selections image columns.")
        sys.exit(1)

if __name__ == "__main__":
    main()
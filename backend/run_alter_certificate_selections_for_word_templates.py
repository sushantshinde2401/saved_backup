"""
Script to execute the alter certificate_selections for word templates SQL file
"""

import os
import sys
from execute_sql_files import execute_sql_file

def main():
    """Main function to execute the alter for word templates SQL"""
    sql_file = 'alter_certificate_selections_for_word_templates.sql'
    file_path = os.path.join(os.path.dirname(__file__), sql_file)

    if execute_sql_file(file_path):
        print("✅ Certificate selections altered for word templates successfully!")
    else:
        print("❌ Failed to alter certificate selections for word templates.")
        sys.exit(1)

if __name__ == "__main__":
    main()
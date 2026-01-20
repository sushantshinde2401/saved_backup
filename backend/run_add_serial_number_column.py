#!/usr/bin/env python3
"""
Script to add serial_number column to certificate_selections table
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from database import execute_query

def add_serial_number_column():
    """Add serial_number column to certificate_selections table"""
    try:
        # Read the SQL file
        sql_file = os.path.join(os.path.dirname(__file__), 'add_serial_number_column_to_certificate_selections.sql')

        with open(sql_file, 'r') as f:
            sql_content = f.read()

        # Execute the SQL
        execute_query(sql_content, fetch=False)

        print("Successfully added serial_number column to certificate_selections table")

    except Exception as e:
        print(f"Error adding serial_number column: {e}")
        sys.exit(1)

if __name__ == "__main__":
    add_serial_number_column()
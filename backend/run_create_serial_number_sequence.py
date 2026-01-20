#!/usr/bin/env python3
"""
Script to create sequence for certificate serial numbers
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from database import execute_query

def create_serial_sequence():
    """Create sequence for certificate serial numbers"""
    try:
        # Read the SQL file
        sql_file = os.path.join(os.path.dirname(__file__), 'create_serial_number_sequence.sql')

        with open(sql_file, 'r') as f:
            sql_content = f.read()

        # Execute the SQL
        execute_query(sql_content, fetch=False)

        print("Successfully created certificate_serial_seq sequence")

    except Exception as e:
        print(f"Error creating serial number sequence: {e}")
        sys.exit(1)

if __name__ == "__main__":
    create_serial_sequence()
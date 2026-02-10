#!/usr/bin/env python3
"""
Script to execute ALTER scripts for certificate cascade deletion refactor
"""

import os
import sys
from database.db_connection import execute_query

def execute_sql_file(file_path):
    """Execute SQL commands from a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            sql_content = f.read()

        print(f"Executing SQL file: {os.path.basename(file_path)}...")
        execute_query(sql_content, fetch=False)

        print(f"✅ Successfully executed {file_path}")
        return True

    except Exception as e:
        print(f"❌ Failed to execute {file_path}: {e}")
        return False

def main():
    """Execute all certificate cascade ALTER scripts"""
    alter_scripts = [
        'alter_receiptinvoicedata_add_certificate_id.sql',
        'alter_invoice_images_add_certificate_id.sql',
        'alter_clientledger_add_certificate_id.sql',
        'alter_masterdatabasetable_add_certificate_id.sql'
    ]

    success_count = 0

    for script in alter_scripts:
        script_path = os.path.join(os.path.dirname(__file__), script)
        if os.path.exists(script_path):
            if execute_sql_file(script_path):
                success_count += 1
        else:
            print(f"❌ Script not found: {script_path}")

    print(f"\n📊 Execution Summary: {success_count}/{len(alter_scripts)} scripts executed successfully")

    if success_count == len(alter_scripts):
        print("🎉 All ALTER scripts executed successfully!")
        print("The certificate_id columns have been added to all child tables with ON DELETE CASCADE foreign keys.")
    else:
        print("⚠️  Some scripts failed. Please check the errors above.")

if __name__ == "__main__":
    main()
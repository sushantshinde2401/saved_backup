#!/usr/bin/env python3
"""
Script to execute SQL files for creating database tables
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
    """Main function to execute all SQL files"""
    sql_files = [
        'create_receipt_invoice_tables.sql',
        'create_receipt_amount_received_table.sql',
        'create_payment_entry_table.sql',
        'create_company_ledger_table.sql'
    ]

    success_count = 0

    for sql_file in sql_files:
        file_path = os.path.join(os.path.dirname(__file__), sql_file)
        if os.path.exists(file_path):
            print(f"\n📄 Executing {sql_file}...")
            if execute_sql_file(file_path):
                success_count += 1
        else:
            print(f"❌ File not found: {file_path}")

    print(f"\n🎉 Execution complete: {success_count}/{len(sql_files)} files executed successfully")

    if success_count == len(sql_files):
        print("✅ All database tables have been created!")
    else:
        print("⚠️  Some files failed to execute. Check the output above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
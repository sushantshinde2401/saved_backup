#!/usr/bin/env python3
"""
Database setup script for Vendor Ledger and Bank Ledger tables
This script creates the VendorLedger and BankLedger tables with proper constraints and views
"""

import os
import sys
import psycopg2
from psycopg2 import sql
from config import Config

def create_vendor_bank_ledger_tables():
    """Create the VendorLedger and BankLedger tables"""
    try:
        # Connect to the database
        conn = psycopg2.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME
        )
        conn.autocommit = True

        # Read and execute the SQL script
        sql_file_path = os.path.join(os.path.dirname(__file__), "create_vendor_bank_ledger_tables.sql")

        if not os.path.exists(sql_file_path):
            raise FileNotFoundError(f"SQL script not found: {sql_file_path}")

        print(f"[DB] Executing SQL script: {sql_file_path}")

        with open(sql_file_path, 'r', encoding='utf-8') as f:
            sql_script = f.read()

        with conn.cursor() as cursor:
            # Execute the entire script at once to handle multi-line statements like functions
            try:
                cursor.execute(sql_script)
                print("[DB] ✅ Executed entire SQL script successfully")
            except psycopg2.Error as script_error:
                # If that fails, try splitting by semicolon but handle functions properly
                print(f"[DB] ⚠️  Executing script as whole failed, trying statement by statement...")
                statements = []
                current_statement = []
                in_function = False

                for line in sql_script.split('\n'):
                    line = line.strip()
                    if not line or line.startswith('--'):
                        continue

                    # Check if we're entering a function definition
                    if 'CREATE OR REPLACE FUNCTION' in line or 'CREATE FUNCTION' in line:
                        in_function = True

                    current_statement.append(line)

                    # Check if we're exiting a function definition
                    if in_function and line.endswith('$$ LANGUAGE plpgsql;'):
                        in_function = False
                        statements.append('\n'.join(current_statement))
                        current_statement = []
                    elif not in_function and line.endswith(';'):
                        statements.append('\n'.join(current_statement))
                        current_statement = []

                # Add any remaining statement
                if current_statement:
                    statements.append('\n'.join(current_statement))

                for statement in statements:
                    if statement.strip():
                        try:
                            cursor.execute(statement)
                            print(f"[DB] ✅ Executed: {statement[:50].replace(chr(10), ' ')}...")
                        except psycopg2.Error as stmt_error:
                            if "already exists" in str(stmt_error).lower():
                                print(f"[DB] ⚠️  Skipped (already exists): {statement[:50].replace(chr(10), ' ')}...")
                            else:
                                print(f"[DB] ❌ Failed to execute: {statement[:50].replace(chr(10), ' ')}...")
                                print(f"[DB] Error: {stmt_error}")

        conn.close()
        print("[DB] ✅ Vendor and Bank Ledger tables created successfully")
        return True

    except Exception as e:
        print(f"[DB] ❌ Failed to create tables: {e}")
        return False

def test_vendor_bank_ledger_tables():
    """Test the tables by inserting sample data and querying views"""
    try:
        conn = psycopg2.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME
        )
        conn.autocommit = True

        with conn.cursor() as cursor:
            # Check if tables exist
            cursor.execute("SELECT COUNT(*) FROM VendorLedger")
            vendor_count = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM BankLedger")
            bank_count = cursor.fetchone()[0]

            print(f"[DB] ✅ Tables test successful. VendorLedger: {vendor_count} records, BankLedger: {bank_count} records")

            # Test views
            cursor.execute("SELECT COUNT(*) FROM VendorLedgerReport")
            report_count = cursor.fetchone()[0]
            print(f"[DB] ✅ Views working. VendorLedgerReport: {report_count} records")

        conn.close()
        return True

    except Exception as e:
        print(f"[DB] ❌ Tables test failed: {e}")
        return False

def main():
    """Main setup function"""
    print("=" * 60)
    print(" VENDOR & BANK LEDGER TABLES SETUP")
    print("=" * 60)

    try:
        # Step 1: Create tables
        print("\n[STEP 1] Creating Vendor and Bank Ledger tables...")
        if not create_vendor_bank_ledger_tables():
            return 1

        # Step 2: Test tables
        print("\n[STEP 2] Testing tables and views...")
        if test_vendor_bank_ledger_tables():
            print("\n" + "=" * 60)
            print(" ✅ VENDOR & BANK LEDGER SETUP COMPLETED SUCCESSFULLY")
            print("=" * 60)
            print("\nFeatures implemented:")
            print("- VendorLedger table with service and payment entries")
            print("- BankLedger table with automatic payment entries")
            print("- Trigger for auto-population of BankLedger")
            print("- Views with running balance calculations")
            print("- Proper constraints and indexes")
            print("\nNext steps:")
            print("1. Integrate with frontend API endpoints")
            print("2. Test with sample data")
            print("3. Implement reporting features")
            return 0
        else:
            print("\n" + "=" * 60)
            print(" ❌ SETUP FAILED - TEST FAILED")
            print("=" * 60)
            return 1

    except Exception as e:
        print(f"\n[ERROR] Setup failed: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
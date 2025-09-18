#!/usr/bin/env python3
"""
Database setup script for company details table
This script creates the company_details table and inserts the provided data.
"""

import os
import sys
import psycopg2
from psycopg2 import sql
from config import Config

def run_sql_script(script_path):
    """Execute the SQL script to create table and insert data"""
    try:
        # Connect to our target database
        conn = psycopg2.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME
        )
        conn.autocommit = True

        if not os.path.exists(script_path):
            raise FileNotFoundError(f"SQL script not found: {script_path}")

        print(f"[DB] Executing SQL script: {script_path}")

        with open(script_path, 'r', encoding='utf-8') as f:
            sql_script = f.read()

        with conn.cursor() as cursor:
            # Split script into individual statements and execute
            statements = [stmt.strip() for stmt in sql_script.split(';') if stmt.strip()]

            for statement in statements:
                if statement:
                    try:
                        cursor.execute(statement)
                        print(f"[DB] ✅ Executed: {statement[:50]}...")
                    except psycopg2.Error as stmt_error:
                        # Check if it's an "already exists" error, which is OK
                        if "already exists" in str(stmt_error).lower():
                            print(f"[DB] ⚠️  Skipped (already exists): {statement[:50]}...")
                        else:
                            print(f"[DB] ❌ Failed to execute: {statement[:50]}...")
                            print(f"[DB] Error: {stmt_error}")

        conn.close()
        print("[DB] ✅ SQL script executed successfully")

    except Exception as e:
        print(f"[DB] ❌ Failed to execute SQL script: {e}")
        raise

def test_company_details_table():
    """Test the company_details table and verify data"""
    try:
        conn = psycopg2.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME
        )

        with conn.cursor() as cursor:
            # Test basic query
            cursor.execute("SELECT COUNT(*) FROM company_details")
            count = cursor.fetchone()[0]
            print(f"[DB] ✅ Company details table accessible. Current records: {count}")

            # Show sample data
            cursor.execute("""
                SELECT company_name, account_number, bank_name
                FROM company_details
                ORDER BY company_name
                LIMIT 5
            """)
            rows = cursor.fetchall()

            if rows:
                print("[DB] Sample company data:")
                for row in rows:
                    print(f"  - {row[0]}: {row[1]} ({row[2]})")

        conn.close()
        return True

    except Exception as e:
        print(f"[DB] ❌ Company details table test failed: {e}")
        return False

def main():
    """Main setup function"""
    print("=" * 60)
    print(" COMPANY DETAILS DATABASE SETUP")
    print("=" * 60)

    try:
        # Step 1: Create table
        print("\n[STEP 1] Creating company_details table...")
        table_script = os.path.join(os.path.dirname(__file__), "create_company_details_table.sql")
        run_sql_script(table_script)

        # Step 2: Insert data
        print("\n[STEP 2] Inserting company data...")
        data_script = os.path.join(os.path.dirname(__file__), "insert_company_details.sql")
        run_sql_script(data_script)

        # Step 3: Test table
        print("\n[STEP 3] Testing company_details table...")
        if test_company_details_table():
            print("\n" + "=" * 60)
            print(" ✅ COMPANY DETAILS SETUP COMPLETED SUCCESSFULLY")
            print("=" * 60)
            print("\nNext steps:")
            print("1. Update your API endpoints to use the company_details table")
            print("2. Test the frontend integration")
            return 0
        else:
            print("\n" + "=" * 60)
            print(" ❌ COMPANY DETAILS SETUP FAILED - TABLE TEST FAILED")
            print("=" * 60)
            return 1

    except Exception as e:
        print(f"\n[ERROR] Company details setup failed: {e}")
        print("\nTroubleshooting:")
        print("1. Ensure PostgreSQL is running")
        print("2. Check database credentials in config.py or .env file")
        print("3. Verify user has permissions to create tables")
        return 1

if __name__ == "__main__":
    sys.exit(main())
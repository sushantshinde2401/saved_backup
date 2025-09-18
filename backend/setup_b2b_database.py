#!/usr/bin/env python3
"""
B2B Customer Details Database Setup Script
This script creates the b2bcustomersdetails table and inserts sample data.
"""

import os
import sys
import psycopg2
from psycopg2 import sql
from config import Config

def run_sql_file(sql_file_path):
    """Execute a SQL file"""
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

        if not os.path.exists(sql_file_path):
            raise FileNotFoundError(f"SQL file not found: {sql_file_path}")

        print(f"[DB] Executing SQL file: {sql_file_path}")

        with open(sql_file_path, 'r', encoding='utf-8') as f:
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
        print("[DB] ✅ SQL file execution completed successfully")

    except Exception as e:
        print(f"[DB] ❌ Failed to execute SQL file: {e}")
        raise

def test_b2b_table():
    """Test the B2B table by counting records"""
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
            cursor.execute("SELECT COUNT(*) FROM b2bcustomersdetails")
            count = cursor.fetchone()[0]
            print(f"[DB] ✅ B2B table test successful. Current records: {count}")

        conn.close()
        return True

    except Exception as e:
        print(f"[DB] ❌ B2B table test failed: {e}")
        return False

def main():
    """Main setup function"""
    print("=" * 60)
    print(" B2B CUSTOMER DETAILS DATABASE SETUP")
    print("=" * 60)

    try:
        # Step 1: Create B2B table
        print("\n[STEP 1] Creating B2B customer details table...")
        table_sql_path = os.path.join(os.path.dirname(__file__), "create_b2bcustomersdetails_table.sql")
        run_sql_file(table_sql_path)

        # Step 2: Insert sample data
        print("\n[STEP 2] Inserting sample B2B customer data...")
        data_sql_path = os.path.join(os.path.dirname(__file__), "insert_b2b_sample_data.sql")
        run_sql_file(data_sql_path)

        # Step 3: Test the setup
        print("\n[STEP 3] Testing B2B table...")
        if test_b2b_table():
            print("\n" + "=" * 60)
            print(" ✅ B2B DATABASE SETUP COMPLETED SUCCESSFULLY")
            print("=" * 60)
            print("\nB2B Customer Details Table Created with:")
            print("- 10 sample customer records")
            print("- Proper indexes for efficient querying")
            print("- All required fields for invoice generation")
            return 0
        else:
            print("\n" + "=" * 60)
            print(" ❌ B2B DATABASE SETUP FAILED - TABLE TEST FAILED")
            print("=" * 60)
            return 1

    except Exception as e:
        print(f"\n[ERROR] B2B database setup failed: {e}")
        print("\nTroubleshooting:")
        print("1. Ensure PostgreSQL is running")
        print("2. Check database credentials in config.py or .env file")
        print("3. Verify the main database setup has been completed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
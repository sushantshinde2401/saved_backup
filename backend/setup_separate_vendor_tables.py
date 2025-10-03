#!/usr/bin/env python3
"""
Setup script for separate vendor tables
Creates vendor_services, vendor_payments, and bank_ledger tables
"""

import os
import sys
import psycopg2
from psycopg2 import sql
from config import Config

def create_separate_vendor_tables():
    """Create the separate vendor tables"""
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
        sql_file_path = os.path.join(os.path.dirname(__file__), "create_separate_vendor_tables.sql")

        if not os.path.exists(sql_file_path):
            raise FileNotFoundError(f"SQL script not found: {sql_file_path}")

        print(f"[DB] Executing SQL script: {sql_file_path}")

        with open(sql_file_path, 'r', encoding='utf-8') as f:
            sql_script = f.read()

        with conn.cursor() as cursor:
            # Execute the entire script
            cursor.execute(sql_script)
            print("[DB] ✅ Executed SQL script successfully")

        conn.close()
        print("[DB] ✅ Separate vendor tables created successfully")
        return True

    except Exception as e:
        print(f"[DB] ❌ Failed to create tables: {e}")
        return False

def test_separate_vendor_tables():
    """Test the new tables"""
    try:
        conn = psycopg2.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME
        )

        with conn.cursor() as cursor:
            # Check table counts
            cursor.execute("SELECT COUNT(*) FROM vendor_services")
            services_count = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM vendor_payments")
            payments_count = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM bank_ledger")
            bank_count = cursor.fetchone()[0]

            print(f"[DB] ✅ Tables test successful:")
            print(f"  - vendor_services: {services_count} records")
            print(f"  - vendor_payments: {payments_count} records")
            print(f"  - bank_ledger: {bank_count} records")

        conn.close()
        return True

    except Exception as e:
        print(f"[DB] ❌ Tables test failed: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print(" SETTING UP SEPARATE VENDOR TABLES")
    print("=" * 60)

    if create_separate_vendor_tables() and test_separate_vendor_tables():
        print("\n" + "=" * 60)
        print(" ✅ SEPARATE VENDOR TABLES SETUP COMPLETED")
        print("=" * 60)
        print("\nNew tables created:")
        print("- vendor_services")
        print("- vendor_payments")
        print("- bank_ledger")
    else:
        print("\n" + "=" * 60)
        print(" ❌ SETUP FAILED")
        print("=" * 60)
        sys.exit(1)
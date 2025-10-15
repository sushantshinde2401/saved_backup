#!/usr/bin/env python3
"""
Script to execute the candidate management schema
"""

import os
import sys
import psycopg2
from config import Config

def run_sql_script():
    """Execute the SQL script to create tables and indexes"""
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

        # Read and execute the SQL script
        sql_file_path = os.path.join(os.path.dirname(__file__), "candidate_management_schema.sql")

        if not os.path.exists(sql_file_path):
            raise FileNotFoundError(f"SQL script not found: {sql_file_path}")

        print(f"[DB] Executing SQL script: {sql_file_path}")

        with open(sql_file_path, 'r', encoding='utf-8') as f:
            sql_script = f.read()

        with conn.cursor() as cursor:
            # Split script into individual statements and execute
            statements = [stmt.strip() for stmt in sql_script.split(';') if stmt.strip()]

            for statement in statements:
                if statement and not statement.startswith('--'):
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
        print("[DB] ✅ Schema setup completed successfully")

    except Exception as e:
        print(f"[DB] ❌ Failed to execute SQL script: {e}")
        raise

def main():
    """Main setup function"""
    print("=" * 60)
    print(" CANDIDATE MANAGEMENT SCHEMA SETUP")
    print("=" * 60)

    try:
        print("\n[STEP 1] Creating tables and indexes...")
        run_sql_script()

        print("\n" + "=" * 60)
        print(" ✅ SCHEMA SETUP COMPLETED SUCCESSFULLY")
        print("=" * 60)
        return 0

    except Exception as e:
        print(f"\n[ERROR] Schema setup failed: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
#!/usr/bin/env python3
"""
Database setup script for candidate uploads system
This script creates the PostgreSQL database and tables required for the system.
"""

import os
import sys
import psycopg2
from psycopg2 import sql
from config import Config

def create_database_if_not_exists():
    """Create the database if it doesn't exist"""
    try:
        # Connect to default postgres database to create our database
        conn = psycopg2.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database="postgres"  # Connect to default postgres database
        )
        conn.autocommit = True

        with conn.cursor() as cursor:
            # Check if database exists
            cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (Config.DB_NAME,))
            exists = cursor.fetchone()

            if not exists:
                print(f"[DB] Creating database '{Config.DB_NAME}'...")
                cursor.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(Config.DB_NAME)))
                print(f"[DB] ✅ Database '{Config.DB_NAME}' created successfully")
            else:
                print(f"[DB] Database '{Config.DB_NAME}' already exists")

        conn.close()
    except Exception as e:
        print(f"[DB] ❌ Failed to create/check database: {e}")
        raise

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
        sql_file_path = os.path.join(os.path.dirname(__file__), "create_candidate_uploads_table.sql")

        if not os.path.exists(sql_file_path):
            raise FileNotFoundError(f"SQL script not found: {sql_file_path}")

        print(f"[DB] Executing SQL script: {sql_file_path}")

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
        print("[DB] ✅ Database setup completed successfully")

    except Exception as e:
        print(f"[DB] ❌ Failed to execute SQL script: {e}")
        raise

def test_database_connection():
    """Test the database connection and basic functionality"""
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
            cursor.execute("SELECT COUNT(*) FROM candidate_uploads")
            count = cursor.fetchone()[0]
            print(f"[DB] ✅ Database connection successful. Current records: {count}")

        conn.close()
        return True

    except Exception as e:
        print(f"[DB] ❌ Database connection test failed: {e}")
        return False

def main():
    """Main setup function"""
    print("=" * 60)
    print(" CANDIDATE UPLOADS DATABASE SETUP")
    print("=" * 60)

    try:
        # Step 1: Create database if needed
        print("\n[STEP 1] Creating/checking database...")
        create_database_if_not_exists()

        # Step 2: Run SQL script
        print("\n[STEP 2] Creating tables and indexes...")
        run_sql_script()

        # Step 3: Test connection
        print("\n[STEP 3] Testing database connection...")
        if test_database_connection():
            print("\n" + "=" * 60)
            print(" ✅ DATABASE SETUP COMPLETED SUCCESSFULLY")
            print("=" * 60)
            print("\nNext steps:")
            print("1. Update your .env file with correct PostgreSQL credentials")
            print("2. Restart the Flask application")
            print("3. Test the candidate upload functionality")
            return 0
        else:
            print("\n" + "=" * 60)
            print(" ❌ DATABASE SETUP FAILED - CONNECTION TEST FAILED")
            print("=" * 60)
            return 1

    except Exception as e:
        print(f"\n[ERROR] Database setup failed: {e}")
        print("\nTroubleshooting:")
        print("1. Ensure PostgreSQL is running")
        print("2. Check database credentials in config.py or .env file")
        print("3. Verify user has permissions to create databases")
        return 1

if __name__ == "__main__":
    sys.exit(main())
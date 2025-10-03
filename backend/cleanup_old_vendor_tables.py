#!/usr/bin/env python3
"""
Cleanup script to remove old vendor ledger tables and views
"""

import os
import sys
import psycopg2
from psycopg2 import sql
from config import Config

def cleanup_old_vendor_tables():
    """Drop old vendor ledger tables and views"""
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

        with conn.cursor() as cursor:
            # Drop old views first (they depend on tables)
            old_views = [
                'vendorledgerreport',
                'bankledgerreport'
            ]

            for view in old_views:
                try:
                    cursor.execute(f"DROP VIEW IF EXISTS {view}")
                    print(f"[DB] ✅ Dropped old view: {view}")
                except psycopg2.Error as e:
                    print(f"[DB] ⚠️  Could not drop view {view}: {e}")

            # Drop old tables
            old_tables = [
                'vendorledger',
                'bankledger'
            ]

            for table in old_tables:
                try:
                    cursor.execute(f"DROP TABLE IF EXISTS {table} CASCADE")
                    print(f"[DB] ✅ Dropped old table: {table}")
                except psycopg2.Error as e:
                    print(f"[DB] ⚠️  Could not drop table {table}: {e}")

        conn.close()
        print("[DB] ✅ Old vendor ledger tables cleanup completed")
        return True

    except Exception as e:
        print(f"[DB] ❌ Failed to cleanup old tables: {e}")
        return False

def verify_cleanup():
    """Verify that old tables are gone and new ones remain"""
    try:
        conn = psycopg2.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME
        )

        with conn.cursor() as cursor:
            # Check for old tables
            cursor.execute("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name IN ('vendorledger', 'bankledger', 'vendorledgerreport', 'bankledgerreport')
            """)

            old_tables = cursor.fetchall()
            if old_tables:
                print(f"[DB] ❌ Old tables still exist: {[row[0] for row in old_tables]}")
                return False
            else:
                print("[DB] ✅ No old vendor ledger tables found")

            # Check for new tables
            cursor.execute("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name IN ('vendor_services', 'vendor_payments', 'bank_ledger')
                ORDER BY table_name
            """)

            new_tables = cursor.fetchall()
            if len(new_tables) == 3:
                print(f"[DB] ✅ New tables confirmed: {[row[0] for row in new_tables]}")
                return True
            else:
                print(f"[DB] ⚠️  Expected 3 new tables, found {len(new_tables)}: {[row[0] for row in new_tables]}")
                return False

        conn.close()

    except Exception as e:
        print(f"[DB] ❌ Verification failed: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print(" CLEANUP OLD VENDOR LEDGER TABLES")
    print("=" * 60)

    if cleanup_old_vendor_tables() and verify_cleanup():
        print("\n" + "=" * 60)
        print(" ✅ OLD VENDOR LEDGER TABLES CLEANUP COMPLETED")
        print("=" * 60)
        print("\nRemoved:")
        print("- vendorledger (old table)")
        print("- bankledger (old table)")
        print("- vendorledgerreport (old view)")
        print("- bankledgerreport (old view)")
        print("\nKept:")
        print("- vendor_services (new table)")
        print("- vendor_payments (new table)")
        print("- bank_ledger (new table)")
    else:
        print("\n" + "=" * 60)
        print(" ❌ CLEANUP FAILED")
        print("=" * 60)
        sys.exit(1)
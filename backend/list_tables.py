#!/usr/bin/env python3
"""
Script to list all tables in the database
"""
from database.db_connection import execute_query

def list_all_tables():
    """List all tables in the public schema"""
    try:
        query = """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """
        result = execute_query(query)
        if result:
            print("📋 Tables in the database:")
            for row in result:
                print(f"  - {row['table_name']}")
        else:
            print("❌ No tables found in the database")
    except Exception as e:
        print(f"❌ Error listing tables: {e}")

def main():
    """Main function"""
    print("🔍 Listing all tables in the database...\n")
    list_all_tables()

if __name__ == "__main__":
    main()
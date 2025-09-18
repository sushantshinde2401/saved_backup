#!/usr/bin/env python3
"""
Script to check the structure of a specific table
"""
from database.db_connection import execute_query

def check_table_structure(table_name):
    """Check the structure of a table"""
    try:
        query = """
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = %s
            ORDER BY ordinal_position;
        """
        results = execute_query(query, (table_name,))

        if results:
            print(f"📋 Structure of table '{table_name}':")
            for row in results:
                nullable = "NULL" if row['is_nullable'] == 'YES' else "NOT NULL"
                default = f" DEFAULT {row['column_default']}" if row['column_default'] else ""
                print(f"  - {row['column_name']}: {row['data_type']} {nullable}{default}")
        else:
            print(f"❌ Table '{table_name}' not found or no columns")

    except Exception as e:
        print(f"❌ Error checking table structure: {e}")

def main():
    """Main function"""
    import sys
    if len(sys.argv) > 1:
        table_name = sys.argv[1]
    else:
        table_name = "receiptamountreceived"  # Default table

    print(f"🔍 Checking structure of table: {table_name}\n")
    check_table_structure(table_name)

if __name__ == "__main__":
    main()
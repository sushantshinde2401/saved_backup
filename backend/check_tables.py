#!/usr/bin/env python3
"""
Script to check if the database tables exist
"""
from database.db_connection import execute_query

def check_table_exists(table_name):
    """Check if a table exists in the database"""
    try:
        query = """
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = %s
            );
        """
        result = execute_query(query, (table_name,))
        exists = result[0]['exists'] if result else False
        status = "✅ EXISTS" if exists else "❌ MISSING"
        print(f"{table_name}: {status}")
        return exists
    except Exception as e:
        print(f"❌ Error checking {table_name}: {e}")
        return False

def main():
    """Check all tables"""
    tables_to_check = [
        'candidates',  # Should already exist
        'ReceiptInvoiceData',
        'ReceiptAmountReceived',
        'PaymentEntry',
        'CompanyLedger'
    ]

    print("🔍 Checking database tables...\n")

    existing_count = 0
    for table in tables_to_check:
        if check_table_exists(table):
            existing_count += 1

    print(f"\n📊 Summary: {existing_count}/{len(tables_to_check)} tables exist in the database")

    if existing_count == len(tables_to_check):
        print("✅ All required tables are present in the database!")
    else:
        print("⚠️  Some tables are missing. Check the output above.")

if __name__ == "__main__":
    main()
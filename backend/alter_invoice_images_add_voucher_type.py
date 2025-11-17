"""
Script to add voucher_type column to invoice_images table.

This script adds a voucher_type column to distinguish between Sales, Receipt, and Adjustment invoices.
"""

import logging
from database.db_connection import execute_query

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def add_voucher_type_column():
    """Add voucher_type column to invoice_images table."""

    # Check if column already exists
    check_column_query = """
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'invoice_images' AND column_name = 'voucher_type'
    """

    try:
        result = execute_query(check_column_query)
        if result and len(result) > 0:
            logger.info("✅ voucher_type column already exists in invoice_images table")
            return True

        # Add voucher_type column
        alter_table_query = """
            ALTER TABLE invoice_images
            ADD COLUMN voucher_type VARCHAR(50) DEFAULT 'Sales'
        """

        logger.info("📋 Adding voucher_type column to invoice_images table...")
        execute_query(alter_table_query, fetch=False)
        logger.info("✅ voucher_type column added successfully")

        # Create index on voucher_type for better performance
        create_index_query = """
            CREATE INDEX IF NOT EXISTS idx_invoice_images_voucher_type
            ON invoice_images(voucher_type)
        """

        logger.info("🔍 Creating index on voucher_type...")
        execute_query(create_index_query, fetch=False)
        logger.info("✅ Index on voucher_type created successfully")

        # Update existing records to have 'Sales' as default
        update_existing_query = """
            UPDATE invoice_images
            SET voucher_type = 'Sales'
            WHERE voucher_type IS NULL
        """

        logger.info("📝 Updating existing records with default voucher_type...")
        execute_query(update_existing_query, fetch=False)
        logger.info("✅ Existing records updated successfully")

        # Verify the changes
        verify_query = """
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'invoice_images'
            ORDER BY ordinal_position
        """

        columns = execute_query(verify_query)
        if columns:
            logger.info("📋 Updated table structure:")
            for col in columns:
                nullable = "NULL" if col['is_nullable'] == 'YES' else "NOT NULL"
                default_val = f" DEFAULT {col['column_default']}" if col['column_default'] else ""
                logger.info(f"  - {col['column_name']}: {col['data_type']} {nullable}{default_val}")

        # Check voucher_type distribution
        count_query = """
            SELECT voucher_type, COUNT(*) as count
            FROM invoice_images
            GROUP BY voucher_type
        """
        counts = execute_query(count_query)
        if counts:
            logger.info("📊 Voucher type distribution:")
            for row in counts:
                logger.info(f"  - {row['voucher_type'] or 'NULL'}: {row['count']} records")

        return True

    except Exception as e:
        logger.error(f"❌ Failed to add voucher_type column: {e}")
        return False

def main():
    """Main function to execute the column addition."""
    logger.info("🚀 Starting voucher_type column addition process")

    if add_voucher_type_column():
        logger.info("✅ voucher_type column addition process completed successfully!")
        logger.info("")
        logger.info("📋 Summary:")
        logger.info("  - Added voucher_type column to invoice_images table")
        logger.info("  - Created index for better query performance")
        logger.info("  - Set default value 'Sales' for existing records")
        logger.info("  - Supports values: 'Sales', 'Receipt', 'Adjustment'")
        return True
    else:
        logger.error("❌ Column addition failed")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
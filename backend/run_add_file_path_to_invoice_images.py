"""
Script to add file_path column to invoice_images table.
"""

import logging
from database.db_connection import execute_query

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def add_file_path_column():
    """Add file_path column to invoice_images table."""

    # Check if column already exists
    check_column_query = """
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'invoice_images' AND column_name = 'file_path'
    """

    try:
        result = execute_query(check_column_query)
        if result and len(result) > 0:
            logger.info("✅ file_path column already exists in invoice_images table")
            return True

        # Add file_path column
        alter_table_query = """
            ALTER TABLE invoice_images
            ADD COLUMN file_path VARCHAR(500) DEFAULT ''
        """

        logger.info("📋 Adding file_path column to invoice_images table...")
        execute_query(alter_table_query, fetch=False)
        logger.info("✅ file_path column added successfully")

        # Create index on file_path for better performance
        create_index_query = """
            CREATE INDEX IF NOT EXISTS idx_invoice_images_file_path
            ON invoice_images(file_path)
        """

        logger.info("🔍 Creating index on file_path...")
        execute_query(create_index_query, fetch=False)
        logger.info("✅ Index on file_path created successfully")

        # Update existing records to have empty file_path
        update_existing_query = """
            UPDATE invoice_images
            SET file_path = ''
            WHERE file_path IS NULL
        """

        logger.info("📝 Updating existing records with default file_path...")
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

        return True

    except Exception as e:
        logger.error(f"❌ Failed to add file_path column: {e}")
        return False

def main():
    """Main function to execute the column addition."""
    logger.info("🚀 Starting file_path column addition process")

    if add_file_path_column():
        logger.info("✅ file_path column addition process completed successfully!")
        logger.info("")
        logger.info("📋 Summary:")
        logger.info("  - Added file_path column to invoice_images table")
        logger.info("  - Created index for better query performance")
        logger.info("  - Set default value '' for existing records")
        logger.info("  - Ready for file storage migration")
        return True
    else:
        logger.error("❌ Column addition failed")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
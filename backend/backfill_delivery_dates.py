"""
Script to backfill NULL delivery_date values in receiptinvoicedata table.

This script updates existing records where delivery_date is NULL by setting it to the invoice_date.
This ensures data consistency for the Master_Database_Table_A population script.

Usage:
    python backfill_delivery_dates.py

Requirements:
    - PostgreSQL database connection configured in config.py
    - Existing receiptinvoicedata table with some NULL delivery_date values
"""

import logging
from database.db_connection import execute_query

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def backfill_delivery_dates():
    """Update NULL delivery_date values with invoice_date."""

    # First, check how many NULL delivery_date records exist
    check_query = """
    SELECT COUNT(*) as null_count
    FROM receiptinvoicedata
    WHERE delivery_date IS NULL;
    """

    try:
        result = execute_query(check_query)
        if result:
            null_count = result[0]['null_count']
            logger.info(f"Found {null_count} records with NULL delivery_date")

            if null_count == 0:
                logger.info("No NULL delivery_date records found. Nothing to backfill.")
                return True

        # Update NULL delivery_date values with invoice_date
        update_query = """
        UPDATE receiptinvoicedata
        SET delivery_date = invoice_date
        WHERE delivery_date IS NULL;
        """

        execute_query(update_query, fetch=False)
        logger.info(f"Successfully backfilled {null_count} NULL delivery_date records with invoice_date")

        # Verify the update
        verify_query = """
        SELECT COUNT(*) as null_count_after
        FROM receiptinvoicedata
        WHERE delivery_date IS NULL;
        """

        result_after = execute_query(verify_query)
        if result_after:
            null_count_after = result_after[0]['null_count_after']
            logger.info(f"Remaining NULL delivery_date records: {null_count_after}")

        return True

    except Exception as e:
        logger.error(f"❌ Failed to backfill delivery dates: {e}")
        return False

def main():
    """Main function to execute the backfill process."""
    logger.info("🚀 Starting delivery_date backfill process")

    if not backfill_delivery_dates():
        logger.error("❌ Delivery date backfill failed.")
        return False

    logger.info("✅ Delivery date backfill process completed successfully")
    return True

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
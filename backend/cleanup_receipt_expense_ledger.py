#!/usr/bin/env python3
"""
Script to clean up existing receipt entries from expense_ledger table
and move them to bank_ledger table to comply with the new data flow.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.db_connection import execute_query
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def cleanup_receipt_expense_entries():
    """Move existing receipt entries from expense_ledger to bank_ledger"""

    try:
        # Find all receipt entries in expense_ledger
        query = """
            SELECT id, transaction_id, company, vendor_name, amount, expense_date, particulars, company_id
            FROM expense_ledger
            WHERE account_type = 'bank' AND expense_type = 'Receipt' AND credit > 0
        """

        receipt_entries = execute_query(query)

        if not receipt_entries:
            logger.info("No receipt entries found in expense_ledger to clean up")
            return

        logger.info(f"Found {len(receipt_entries)} receipt entries to move")

        moved_count = 0

        for entry in receipt_entries:
            try:
                # Insert into bank_ledger
                insert_query = """
                    INSERT INTO bank_ledger (
                        payment_date, transaction_id, vendor_id, company_id, vendor_name,
                        amount, remark, transaction_type
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """

                execute_query(insert_query, (
                    entry['expense_date'],  # payment_date
                    entry['transaction_id'],  # transaction_id
                    None,  # vendor_id (NULL for receipts)
                    entry['company_id'],  # company_id
                    entry['vendor_name'],  # vendor_name (customer name)
                    entry['amount'],  # amount
                    entry['particulars'],  # remark
                    'receipt'  # transaction_type
                ), fetch=False)

                # Delete from expense_ledger
                delete_query = "DELETE FROM expense_ledger WHERE id = %s"
                execute_query(delete_query, (entry['id'],), fetch=False)

                moved_count += 1
                logger.info(f"Moved receipt entry ID {entry['id']} for transaction {entry['transaction_id']}")

            except Exception as e:
                logger.error(f"Failed to move receipt entry ID {entry['id']}: {e}")
                continue

        logger.info(f"Successfully moved {moved_count} receipt entries from expense_ledger to bank_ledger")

    except Exception as e:
        logger.error(f"Failed to cleanup receipt expense entries: {e}")
        raise

if __name__ == "__main__":
    cleanup_receipt_expense_entries()
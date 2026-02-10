#!/usr/bin/env python3
"""
Script to backfill certificate_id values in child tables for proper cascade deletion
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.db_connection import execute_query
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def backfill_receipt_invoice_certificate_ids():
    """Backfill certificate_id in ReceiptInvoiceData table"""
    try:
        logger.info("🔄 Backfilling certificate_id in ReceiptInvoiceData...")

        # Get all receipt invoice records that have selected_courses
        query = """
            SELECT invoice_no, candidate_id, selected_courses
            FROM ReceiptInvoiceData
            WHERE selected_courses IS NOT NULL
            AND selected_courses != '[]'
            AND certificate_id IS NULL
        """
        receipts = execute_query(query, fetch=True)

        if not receipts:
            logger.info("✅ No ReceiptInvoiceData records need backfilling")
            return

        updated_count = 0
        for receipt in receipts:
            invoice_no = receipt['invoice_no']
            candidate_id = receipt['candidate_id']
            selected_courses = receipt['selected_courses']

            try:
                # Parse selected_courses JSON
                if isinstance(selected_courses, str):
                    courses = json.loads(selected_courses)
                else:
                    courses = selected_courses

                if not isinstance(courses, list) or len(courses) == 0:
                    continue

                # For simplicity, use the first certificate's ID
                # In a more complex scenario, you might need to handle multiple certificates
                first_course = courses[0]
                if isinstance(first_course, dict) and 'certificate_name' in first_course:
                    certificate_name = first_course['certificate_name']

                    # Find the certificate_selections record
                    cert_query = """
                        SELECT id FROM certificate_selections
                        WHERE candidate_id = %s AND certificate_name = %s
                        LIMIT 1
                    """
                    cert_result = execute_query(cert_query, (candidate_id, certificate_name), fetch=True)

                    if cert_result:
                        certificate_id = cert_result[0]['id']

                        # Update the receipt invoice record
                        update_query = """
                            UPDATE ReceiptInvoiceData
                            SET certificate_id = %s
                            WHERE invoice_no = %s
                        """
                        execute_query(update_query, (certificate_id, invoice_no), fetch=False)
                        updated_count += 1
                        logger.info(f"✅ Updated ReceiptInvoiceData {invoice_no} with certificate_id {certificate_id}")

            except (json.JSONDecodeError, KeyError, TypeError) as e:
                logger.warning(f"⚠️ Failed to process receipt {invoice_no}: {e}")
                continue

        logger.info(f"✅ Backfilled {updated_count} ReceiptInvoiceData records")

    except Exception as e:
        logger.error(f"❌ Failed to backfill ReceiptInvoiceData: {e}")

def backfill_invoice_images_certificate_ids():
    """Backfill certificate_id in invoice_images table"""
    try:
        logger.info("🔄 Backfilling certificate_id in invoice_images...")

        # Match through invoice_no to ReceiptInvoiceData
        query = """
            SELECT ii.id, ii.invoice_no
            FROM invoice_images ii
            WHERE ii.certificate_id IS NULL
        """
        images = execute_query(query, fetch=True)

        if not images:
            logger.info("✅ No invoice_images records need backfilling")
            return

        updated_count = 0
        for image in images:
            image_id = image['id']
            invoice_no = image['invoice_no']

            # Try to find a matching certificate through receipt invoice data
            if invoice_no:
                receipt_query = """
                    SELECT certificate_id FROM ReceiptInvoiceData
                    WHERE invoice_no = %s AND certificate_id IS NOT NULL
                    LIMIT 1
                """
                receipt_result = execute_query(receipt_query, (invoice_no,), fetch=True)

                if receipt_result and receipt_result[0]['certificate_id']:
                    certificate_id = receipt_result[0]['certificate_id']

                    update_query = """
                        UPDATE invoice_images
                        SET certificate_id = %s
                        WHERE id = %s
                    """
                    execute_query(update_query, (certificate_id, image_id), fetch=False)
                    updated_count += 1
                    logger.info(f"✅ Updated invoice_images {image_id} with certificate_id {certificate_id}")

        logger.info(f"✅ Backfilled {updated_count} invoice_images records")

    except Exception as e:
        logger.error(f"❌ Failed to backfill invoice_images: {e}")

def backfill_client_ledger_certificate_ids():
    """Backfill certificate_id in ClientLedger table"""
    try:
        logger.info("🔄 Backfilling certificate_id in ClientLedger...")

        # Match through voucher_no to ReceiptInvoiceData
        query = """
            SELECT cl.id, cl.voucher_no
            FROM ClientLedger cl
            WHERE cl.certificate_id IS NULL
        """
        ledger_entries = execute_query(query, fetch=True)

        if not ledger_entries:
            logger.info("✅ No ClientLedger records need backfilling")
            return

        updated_count = 0
        for entry in ledger_entries:
            entry_id = entry['id']
            voucher_no = entry['voucher_no']

            # Try to match through receipt invoice data
            if voucher_no:
                receipt_query = """
                    SELECT certificate_id FROM ReceiptInvoiceData
                    WHERE invoice_no = %s AND certificate_id IS NOT NULL
                    LIMIT 1
                """
                receipt_result = execute_query(receipt_query, (voucher_no,), fetch=True)

                if receipt_result and receipt_result[0]['certificate_id']:
                    certificate_id = receipt_result[0]['certificate_id']

                    update_query = """
                        UPDATE ClientLedger
                        SET certificate_id = %s
                        WHERE id = %s
                    """
                    execute_query(update_query, (certificate_id, entry_id), fetch=False)
                    updated_count += 1
                    logger.info(f"✅ Updated ClientLedger {entry_id} with certificate_id {certificate_id}")

        logger.info(f"✅ Backfilled {updated_count} ClientLedger records")

    except Exception as e:
        logger.error(f"❌ Failed to backfill ClientLedger: {e}")

def backfill_master_database_certificate_ids():
    """Backfill certificate_id in Master_Database_Table_A table"""
    try:
        logger.info("🔄 Backfilling certificate_id in Master_Database_Table_A...")

        # Match through candidate_id and certificate_name to certificate_selections
        query = """
            SELECT m.id, m.candidate_id, m.certificate_name
            FROM Master_Database_Table_A m
            WHERE m.certificate_id IS NULL AND m.candidate_id IS NOT NULL AND m.certificate_name IS NOT NULL
        """
        master_records = execute_query(query, fetch=True)

        if not master_records:
            logger.info("✅ No Master_Database_Table_A records need backfilling")
            return

        updated_count = 0
        for record in master_records:
            record_id = record['id']
            candidate_id = record['candidate_id']
            certificate_name = record['certificate_name']

            # Find the certificate_selections record
            cert_query = """
                SELECT id FROM certificate_selections
                WHERE candidate_id = %s AND certificate_name = %s
                LIMIT 1
            """
            cert_result = execute_query(cert_query, (candidate_id, certificate_name), fetch=True)

            if cert_result:
                certificate_id = cert_result[0]['id']

                update_query = """
                    UPDATE Master_Database_Table_A
                    SET certificate_id = %s
                    WHERE id = %s
                """
                execute_query(update_query, (certificate_id, record_id), fetch=False)
                updated_count += 1
                logger.info(f"✅ Updated Master_Database_Table_A {record_id} with certificate_id {certificate_id}")

        logger.info(f"✅ Backfilled {updated_count} Master_Database_Table_A records")

    except Exception as e:
        logger.error(f"❌ Failed to backfill Master_Database_Table_A: {e}")

def main():
    """Run all backfill operations"""
    logger.info("🚀 Starting certificate_id backfill process...")

    backfill_receipt_invoice_certificate_ids()
    backfill_invoice_images_certificate_ids()
    backfill_client_ledger_certificate_ids()
    backfill_master_database_certificate_ids()

    logger.info("🎉 Certificate_id backfill process completed!")

if __name__ == "__main__":
    main()
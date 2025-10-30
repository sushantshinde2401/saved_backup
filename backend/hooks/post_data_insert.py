"""
Post-insert hooks for automatic Master_Database_Table_A updates

This module provides hooks that can be called after data insertion
to automatically update the Master_Database_Table_A table.

Usage in other modules:
    from hooks.post_data_insert import update_master_table_after_insert

    # After inserting into certificate_selections
    update_master_table_after_insert('certificate_selections', candidate_id)

    # After inserting into receiptinvoicedata
    update_master_table_after_insert('receiptinvoicedata', candidate_id)
"""

import logging
from database.db_connection import execute_query

logger = logging.getLogger(__name__)

def update_master_table_after_insert(table_name, candidate_id, invoice_no=None):
    """
    Update Master_Database_Table_A after inserting data into source tables.

    Args:
        table_name (str): Name of the table that was updated ('candidates', 'certificate_selections', or 'receiptinvoicedata')
        candidate_id (int): The candidate_id that was inserted/updated
        invoice_no (str): The invoice number (required for receiptinvoicedata updates)
    """
    try:
        logger.info(f"🔄 Updating Master_Database_Table_A after {table_name} insert for candidate_id: {candidate_id}")

        # Insert or update the master table record for this candidate
        insert_query = """
        INSERT INTO Master_Database_Table_A (
            creation_date,
            client_name,
            client_id,
            candidate_id,
            candidate_name,
            nationality,
            passport,
            cdcNo,
            indosNo,
            certificate_name,
            certificate_id,
            companyName,
            person_in_charge,
            delivery_note,
            delivery_date,
            terms_of_delivery,
            invoice_no
        )
        SELECT
            MIN(cs.creation_date)::DATE,
            cs.client_name,
            UPPER(LEFT(COALESCE(cs.client_name, 'UNK'), 3)) AS client_id,
            cs.candidate_id,
            cs.candidate_name,
            COALESCE(c.json_data->>'nationality', 'Unknown') AS nationality,
            COALESCE(c.json_data->>'passport', 'N/A') AS passport,
            COALESCE(c.json_data->>'cdcNo', 'N/A') AS cdcNo,
            COALESCE(c.json_data->>'indosNo', 'N/A') AS indosNo,
            COALESCE(
                string_agg(DISTINCT cs.certificate_name, ', ' ORDER BY cs.certificate_name),
                'N/A'
            ) AS certificate_name,
            COALESCE(
                string_agg(DISTINCT UPPER(LEFT(cs.certificate_name, 3)), ', ' ORDER BY UPPER(LEFT(cs.certificate_name, 3))),
                'N/A'
            ) AS certificate_id,
            COALESCE(c.json_data->>'companyName', 'N/A') AS companyName,
            COALESCE(c.json_data->>'personInCharge', 'N/A') AS person_in_charge,
            COALESCE(rid.delivery_note, 'N/A') AS delivery_note,
            COALESCE(rid.delivery_date, MIN(cs.creation_date)) AS delivery_date,
            COALESCE(rid.terms_of_delivery, 'N/A') AS terms_of_delivery,
            COALESCE(rid.invoice_no, 'N/A') AS invoice_no
        FROM certificate_selections cs
        JOIN candidates c ON cs.candidate_id = c.id
        LEFT JOIN receiptinvoicedata rid ON cs.candidate_id = rid.candidate_id
        WHERE cs.candidate_id = %s
        GROUP BY cs.candidate_id, cs.candidate_name, cs.client_name, c.json_data,
                 rid.delivery_note, rid.delivery_date, rid.terms_of_delivery, rid.invoice_no
        ON CONFLICT (candidate_id) DO UPDATE SET
            creation_date = EXCLUDED.creation_date,
            client_name = EXCLUDED.client_name,
            client_id = EXCLUDED.client_id,
            candidate_name = EXCLUDED.candidate_name,
            nationality = EXCLUDED.nationality,
            passport = EXCLUDED.passport,
            cdcNo = EXCLUDED.cdcNo,
            indosNo = EXCLUDED.indosNo,
            certificate_name = EXCLUDED.certificate_name,
            certificate_id = EXCLUDED.certificate_id,
            companyName = EXCLUDED.companyName,
            person_in_charge = EXCLUDED.person_in_charge,
            delivery_note = EXCLUDED.delivery_note,
            delivery_date = EXCLUDED.delivery_date,
            terms_of_delivery = EXCLUDED.terms_of_delivery,
            invoice_no = EXCLUDED.invoice_no;
        """

        execute_query(insert_query, (candidate_id,), fetch=False)
        logger.info(f"✅ Master_Database_Table_A updated for candidate_id: {candidate_id}")

        return True

    except Exception as e:
        logger.error(f"❌ Failed to update Master_Database_Table_A after {table_name} insert: {e}")
        return False

def update_master_table_after_candidate_insert(candidate_id):
    """
    Specialized hook for candidate insertions.
    This should be called after a new candidate is inserted.
    """
    return update_master_table_after_insert('candidates', candidate_id)

def update_master_table_after_certificate_insert(candidate_id):
    """
    Specialized hook for certificate selection insertions.
    This should be called after certificate data is saved.
    """
    return update_master_table_after_insert('certificate_selections', candidate_id)

def update_master_table_after_receipt_insert(candidate_id, invoice_no):
    """
    Specialized hook for receipt/invoice insertions.
    This should be called after receipt data is saved.
    """
    return update_master_table_after_insert('receiptinvoicedata', candidate_id, invoice_no)
"""
Automatic Master Database Table A Updater

This script implements automatic updates to Master_Database_Table_A whenever
new data is inserted into the source tables (certificate_selections, receiptinvoicedata, candidates).

It can be run as:
1. A scheduled job (cron/windows task scheduler)
2. A database trigger (if supported)
3. A background service

Usage:
    python auto_update_master_table.py

Or for continuous monitoring:
    python auto_update_master_table.py --watch
"""

import logging
import time
import argparse
from datetime import datetime, timedelta
from database.db_connection import execute_query

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class MasterTableUpdater:
    def __init__(self):
        self.last_update_check = datetime.now()
        self.update_interval = 60  # Check every 60 seconds by default

    def check_for_new_data(self):
        """Check if there's new data in source tables since last update."""
        try:
            # Check certificate_selections for new records
            cs_query = """
                SELECT COUNT(*) as new_count
                FROM certificate_selections
                WHERE creation_date > %s
            """
            cs_result = execute_query(cs_query, (self.last_update_check,))
            new_cs_count = cs_result[0]['new_count'] if cs_result else 0

            # Check receiptinvoicedata for new records
            rid_query = """
                SELECT COUNT(*) as new_count
                FROM receiptinvoicedata
                WHERE created_at > %s
            """
            rid_result = execute_query(rid_query, (self.last_update_check,))
            new_rid_count = rid_result[0]['new_count'] if rid_result else 0

            # Check candidates for new records
            cand_query = """
                SELECT COUNT(*) as new_count
                FROM candidates
                WHERE created_at > %s
            """
            cand_result = execute_query(cand_query, (self.last_update_check,))
            new_cand_count = cand_result[0]['new_count'] if cand_result else 0

            total_new = new_cs_count + new_rid_count + new_cand_count

            if total_new > 0:
                logger.info(f"📊 Found {total_new} new records: {new_cs_count} cert selections, {new_rid_count} receipts, {new_cand_count} candidates")
                return True
            else:
                logger.debug("✅ No new data found")
                return False

        except Exception as e:
            logger.error(f"❌ Error checking for new data: {e}")
            return False

    def update_master_table(self):
        """Update the master table with new data."""
        try:
            logger.info("🔄 Updating Master_Database_Table_A...")

            # Run the populate script logic
            populate_query = """
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
                cs.creation_date::DATE,
                cs.client_name,
                UPPER(LEFT(COALESCE(cs.client_name, 'UNK'), 3)) AS client_id,
                cs.candidate_id,
                cs.candidate_name,
                COALESCE(c.json_data->>'nationality', 'Unknown') AS nationality,
                COALESCE(c.json_data->>'passport', 'N/A') AS passport,
                COALESCE(c.json_data->>'cdcNo', 'N/A') AS cdcNo,
                COALESCE(c.json_data->>'indosNo', 'N/A') AS indosNo,
                'N/A' AS certificate_name,
                'N/A' AS certificate_id,
                COALESCE(c.json_data->>'companyName', 'N/A') AS companyName,
                COALESCE(c.json_data->>'personInCharge', 'N/A') AS person_in_charge,
                COALESCE(rid.delivery_note, 'N/A') AS delivery_note,
                COALESCE(rid.delivery_date, cs.creation_date) AS delivery_date,
                COALESCE(rid.terms_of_delivery, 'N/A') AS terms_of_delivery,
                COALESCE(rid.invoice_no, 'N/A') AS invoice_no
            FROM certificate_selections cs
            JOIN candidates c ON cs.candidate_id = c.id
            LEFT JOIN receiptinvoicedata rid ON cs.candidate_id = rid.candidate_id
            WHERE cs.candidate_id IS NOT NULL
              AND c.id IS NOT NULL
              AND cs.creation_date > %s
            GROUP BY cs.creation_date, cs.client_name, cs.candidate_id, cs.candidate_name,
                     c.json_data, rid.delivery_note, rid.delivery_date, rid.terms_of_delivery,
                     rid.invoice_no
            ON CONFLICT (candidate_id, invoice_no) DO NOTHING;
            """

            # Execute with the last update check timestamp
            execute_query(populate_query, (self.last_update_check,), fetch=False)

            # Get updated count
            count_query = "SELECT COUNT(*) as count FROM Master_Database_Table_A;"
            result = execute_query(count_query)
            if result:
                count = result[0]['count']
                logger.info(f"✅ Master_Database_Table_A updated successfully. Total records: {count}")

            self.last_update_check = datetime.now()
            return True

        except Exception as e:
            logger.error(f"❌ Failed to update Master_Database_Table_A: {e}")
            return False

    def run_once(self):
        """Run a single update check and update if needed."""
        logger.info("🔍 Checking for new data to update Master_Database_Table_A...")

        if self.check_for_new_data():
            return self.update_master_table()
        else:
            logger.info("✅ No updates needed")
            return True

    def watch_mode(self, interval=None):
        """Run in continuous watch mode."""
        if interval:
            self.update_interval = interval

        logger.info(f"👀 Starting watch mode - checking every {self.update_interval} seconds")
        logger.info("Press Ctrl+C to stop")

        try:
            while True:
                self.run_once()
                time.sleep(self.update_interval)
        except KeyboardInterrupt:
            logger.info("🛑 Watch mode stopped by user")
        except Exception as e:
            logger.error(f"❌ Watch mode error: {e}")

def main():
    parser = argparse.ArgumentParser(description='Auto-update Master Database Table A')
    parser.add_argument('--watch', action='store_true', help='Run in continuous watch mode')
    parser.add_argument('--interval', type=int, default=60, help='Check interval in seconds (default: 60)')

    args = parser.parse_args()

    updater = MasterTableUpdater()

    if args.watch:
        updater.watch_mode(args.interval)
    else:
        success = updater.run_once()
        exit(0 if success else 1)

if __name__ == "__main__":
    main()
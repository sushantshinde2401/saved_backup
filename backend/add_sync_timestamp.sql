-- Add sync timestamp columns to track changes for real-time synchronization
ALTER TABLE ClientLedger ADD COLUMN IF NOT EXISTS last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE ClientLedger ADD COLUMN IF NOT EXISTS sync_version INTEGER DEFAULT 1;

-- Create index for efficient sync queries
CREATE INDEX IF NOT EXISTS idx_company_ledger_last_sync ON ClientLedger(last_sync);
CREATE INDEX IF NOT EXISTS idx_company_ledger_sync_version ON ClientLedger(sync_version);

-- Update existing records
UPDATE ClientLedger SET last_sync = updated_at WHERE last_sync IS NULL;
UPDATE ClientLedger SET sync_version = 1 WHERE sync_version IS NULL;

COMMENT ON COLUMN ClientLedger.last_sync IS 'Timestamp for real-time synchronization';
COMMENT ON COLUMN ClientLedger.sync_version IS 'Version number for conflict resolution';
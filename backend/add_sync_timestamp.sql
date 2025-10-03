-- Add sync timestamp columns to track changes for real-time synchronization
ALTER TABLE CompanyLedger ADD COLUMN IF NOT EXISTS last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE CompanyLedger ADD COLUMN IF NOT EXISTS sync_version INTEGER DEFAULT 1;

-- Create index for efficient sync queries
CREATE INDEX IF NOT EXISTS idx_company_ledger_last_sync ON CompanyLedger(last_sync);
CREATE INDEX IF NOT EXISTS idx_company_ledger_sync_version ON CompanyLedger(sync_version);

-- Update existing records
UPDATE CompanyLedger SET last_sync = updated_at WHERE last_sync IS NULL;
UPDATE CompanyLedger SET sync_version = 1 WHERE sync_version IS NULL;

COMMENT ON COLUMN CompanyLedger.last_sync IS 'Timestamp for real-time synchronization';
COMMENT ON COLUMN CompanyLedger.sync_version IS 'Version number for conflict resolution';
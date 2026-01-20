-- Add updated_at column to legacy_certificates table
ALTER TABLE legacy_certificates
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add comment for documentation
COMMENT ON COLUMN legacy_certificates.updated_at IS 'Timestamp when the record was last updated';
-- Script to create legacy_certificates table in PostgreSQL
-- This script is idempotent and can be run multiple times safely

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS legacy_certificates (
    id SERIAL PRIMARY KEY,
    candidate_name VARCHAR(255) NOT NULL,
    passport VARCHAR(50) NOT NULL,
    certificate_name VARCHAR(255),
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_legacy_certificates_candidate_name ON legacy_certificates(candidate_name);
CREATE INDEX IF NOT EXISTS idx_legacy_certificates_passport ON legacy_certificates(passport);
CREATE INDEX IF NOT EXISTS idx_legacy_certificates_certificate_number ON legacy_certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_legacy_certificates_created_at ON legacy_certificates(created_at);

-- Add check constraints for date validation
ALTER TABLE legacy_certificates DROP CONSTRAINT IF EXISTS chk_dates_valid;
ALTER TABLE legacy_certificates ADD CONSTRAINT chk_dates_valid
    CHECK (start_date <= end_date AND issue_date <= expiry_date);

-- Add comments for documentation
COMMENT ON TABLE legacy_certificates IS 'Stores legacy certificate records for manual insertion/update';
COMMENT ON COLUMN legacy_certificates.candidate_name IS 'Name of the candidate';
COMMENT ON COLUMN legacy_certificates.passport IS 'Passport number of the candidate';
COMMENT ON COLUMN legacy_certificates.certificate_name IS 'Name of the certificate';
COMMENT ON COLUMN legacy_certificates.certificate_number IS 'Unique certificate number identifier';
COMMENT ON COLUMN legacy_certificates.start_date IS 'Certificate validity start date';
COMMENT ON COLUMN legacy_certificates.end_date IS 'Certificate validity end date';
COMMENT ON COLUMN legacy_certificates.issue_date IS 'Certificate issue date';
COMMENT ON COLUMN legacy_certificates.expiry_date IS 'Certificate expiry date';
COMMENT ON COLUMN legacy_certificates.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN legacy_certificates.updated_at IS 'Timestamp when the record was last updated';

-- Grant permissions (adjust as needed for your user)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON legacy_certificates TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE legacy_certificates_id_seq TO your_app_user;

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'legacy_certificates table created successfully with indexes and constraints';
    RAISE NOTICE 'Table structure:';
    RAISE NOTICE '- id: SERIAL PRIMARY KEY';
    RAISE NOTICE '- candidate_name: VARCHAR(255) NOT NULL';
    RAISE NOTICE '- passport: VARCHAR(50) NOT NULL';
    RAISE NOTICE '- certificate_name: VARCHAR(255)';
    RAISE NOTICE '- certificate_number: VARCHAR(100) UNIQUE NOT NULL';
    RAISE NOTICE '- start_date: DATE NOT NULL';
    RAISE NOTICE '- end_date: DATE NOT NULL';
    RAISE NOTICE '- issue_date: DATE NOT NULL';
    RAISE NOTICE '- expiry_date: DATE NOT NULL';
    RAISE NOTICE '- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP';
    RAISE NOTICE '- updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP';
    RAISE NOTICE '';
    RAISE NOTICE 'Constraints:';
    RAISE NOTICE '- chk_dates_valid: Ensures start_date <= end_date and issue_date <= expiry_date';
    RAISE NOTICE '';
    RAISE NOTICE 'Indexes created:';
    RAISE NOTICE '- idx_legacy_certificates_candidate_name';
    RAISE NOTICE '- idx_legacy_certificates_passport';
    RAISE NOTICE '- idx_legacy_certificates_certificate_number';
    RAISE NOTICE '- idx_legacy_certificates_created_at';
END $$;
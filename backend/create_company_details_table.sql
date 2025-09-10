-- Script to create company_details table in PostgreSQL
-- This script is idempotent and can be run multiple times safely

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS company_details (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    company_address TEXT NOT NULL,
    company_gst_number VARCHAR(50),
    bank_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(100) NOT NULL UNIQUE,
    branch VARCHAR(255) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    swift_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_company_details_account_number ON company_details(account_number);
CREATE INDEX IF NOT EXISTS idx_company_details_company_name ON company_details(company_name);
CREATE INDEX IF NOT EXISTS idx_company_details_ifsc_code ON company_details(ifsc_code);

-- Add comments for documentation
COMMENT ON TABLE company_details IS 'Stores company details including bank information for payment processing';
COMMENT ON COLUMN company_details.company_name IS 'Full legal name of the company';
COMMENT ON COLUMN company_details.company_address IS 'Complete address of the company';
COMMENT ON COLUMN company_details.company_gst_number IS 'GST registration number of the company';
COMMENT ON COLUMN company_details.bank_name IS 'Name of the bank where the account is held';
COMMENT ON COLUMN company_details.account_number IS 'Bank account number (unique identifier)';
COMMENT ON COLUMN company_details.branch IS 'Bank branch name and location';
COMMENT ON COLUMN company_details.ifsc_code IS 'Indian Financial System Code for the bank branch';
COMMENT ON COLUMN company_details.swift_code IS 'SWIFT/BIC code for international transactions';

-- Grant permissions (adjust as needed for your user)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON company_details TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE company_details_id_seq TO your_app_user;

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'company_details table created successfully with indexes and constraints';
    RAISE NOTICE 'Table structure:';
    RAISE NOTICE '- id: SERIAL PRIMARY KEY';
    RAISE NOTICE '- company_name: VARCHAR(255) NOT NULL';
    RAISE NOTICE '- company_address: TEXT NOT NULL';
    RAISE NOTICE '- company_gst_number: VARCHAR(50)';
    RAISE NOTICE '- bank_name: VARCHAR(255) NOT NULL';
    RAISE NOTICE '- account_number: VARCHAR(100) NOT NULL UNIQUE';
    RAISE NOTICE '- branch: VARCHAR(255) NOT NULL';
    RAISE NOTICE '- ifsc_code: VARCHAR(20) NOT NULL';
    RAISE NOTICE '- swift_code: VARCHAR(20)';
    RAISE NOTICE '- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP';
    RAISE NOTICE '- updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP';
    RAISE NOTICE '';
    RAISE NOTICE 'Indexes created:';
    RAISE NOTICE '- idx_company_details_account_number';
    RAISE NOTICE '- idx_company_details_company_name';
    RAISE NOTICE '- idx_company_details_ifsc_code';
END $$;
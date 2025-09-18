-- Script to create b2bcustomersdetails table in PostgreSQL
-- This script is idempotent and can be run multiple times safely

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS b2bcustomersdetails (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidates(candidate_id),
    company_name VARCHAR(255) NOT NULL,
    gst_number VARCHAR(50),
    contact_person VARCHAR(100),
    phone_number VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    state_code VARCHAR(10),
    pincode VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_b2b_company_name ON b2bcustomersdetails(company_name);
CREATE INDEX IF NOT EXISTS idx_b2b_gst_number ON b2bcustomersdetails(gst_number);
CREATE INDEX IF NOT EXISTS idx_b2b_email ON b2bcustomersdetails(email);
CREATE INDEX IF NOT EXISTS idx_b2b_candidate_id ON b2bcustomersdetails(candidate_id);
CREATE INDEX IF NOT EXISTS idx_b2b_created_at ON b2bcustomersdetails(created_at);

-- Add comments for documentation
COMMENT ON TABLE b2bcustomersdetails IS 'Stores B2B customer details for invoice generation';
COMMENT ON COLUMN b2bcustomersdetails.company_name IS 'Name of the B2B customer company';
COMMENT ON COLUMN b2bcustomersdetails.gst_number IS 'GST number of the company';
COMMENT ON COLUMN b2bcustomersdetails.contact_person IS 'Primary contact person name';
COMMENT ON COLUMN b2bcustomersdetails.phone_number IS 'Contact phone number';
COMMENT ON COLUMN b2bcustomersdetails.email IS 'Contact email address';
COMMENT ON COLUMN b2bcustomersdetails.address IS 'Complete address of the company';
COMMENT ON COLUMN b2bcustomersdetails.city IS 'City of the company';
COMMENT ON COLUMN b2bcustomersdetails.state IS 'State of the company';
COMMENT ON COLUMN b2bcustomersdetails.state_code IS 'State code for GST purposes';
COMMENT ON COLUMN b2bcustomersdetails.pincode IS 'PIN code of the location';
COMMENT ON COLUMN b2bcustomersdetails.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN b2bcustomersdetails.updated_at IS 'Timestamp when the record was last updated';

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'b2bcustomersdetails table created successfully with indexes and constraints';
    RAISE NOTICE 'Table structure:';
    RAISE NOTICE '- id: SERIAL PRIMARY KEY';
    RAISE NOTICE '- company_name: VARCHAR(255) NOT NULL';
    RAISE NOTICE '- gst_number: VARCHAR(50)';
    RAISE NOTICE '- contact_person: VARCHAR(100)';
    RAISE NOTICE '- phone_number: VARCHAR(20)';
    RAISE NOTICE '- email: VARCHAR(255)';
    RAISE NOTICE '- address: TEXT';
    RAISE NOTICE '- city: VARCHAR(100)';
    RAISE NOTICE '- state: VARCHAR(100)';
    RAISE NOTICE '- state_code: VARCHAR(10)';
    RAISE NOTICE '- pincode: VARCHAR(10)';
    RAISE NOTICE '- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP';
    RAISE NOTICE '- updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP';
    RAISE NOTICE '';
    RAISE NOTICE 'Indexes created:';
    RAISE NOTICE '- idx_b2b_company_name';
    RAISE NOTICE '- idx_b2b_gst_number';
    RAISE NOTICE '- idx_b2b_email';
    RAISE NOTICE '- idx_b2b_created_at';
END $$;
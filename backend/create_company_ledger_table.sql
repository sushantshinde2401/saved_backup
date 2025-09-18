-- Script to create CompanyLedger table in PostgreSQL
-- This script is idempotent and can be run multiple times safely

-- Create CompanyLedger table
CREATE TABLE IF NOT EXISTS CompanyLedger (
    ledger_id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidates(id),
    debit DECIMAL(10,2),
    credit DECIMAL(10,2),
    balance DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_company_ledger_candidate_id ON CompanyLedger(candidate_id);
CREATE INDEX IF NOT EXISTS idx_company_ledger_created_at ON CompanyLedger(created_at);

-- Add comments for documentation
COMMENT ON TABLE CompanyLedger IS 'Stores company ledger entries for financial tracking';
COMMENT ON COLUMN CompanyLedger.ledger_id IS 'Primary key for ledger entries';
COMMENT ON COLUMN CompanyLedger.candidate_id IS 'Foreign key reference to candidates table';
COMMENT ON COLUMN CompanyLedger.debit IS 'Debit amount';
COMMENT ON COLUMN CompanyLedger.credit IS 'Credit amount';
COMMENT ON COLUMN CompanyLedger.balance IS 'Current balance';

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'CompanyLedger table created successfully';
    RAISE NOTICE '';
    RAISE NOTICE 'CompanyLedger table structure:';
    RAISE NOTICE '- ledger_id: SERIAL PRIMARY KEY';
    RAISE NOTICE '- candidate_id: INTEGER REFERENCES candidates(id)';
    RAISE NOTICE '- debit: DECIMAL(10,2)';
    RAISE NOTICE '- credit: DECIMAL(10,2)';
    RAISE NOTICE '- balance: DECIMAL(10,2)';
    RAISE NOTICE '- created_at: TIMESTAMP';
    RAISE NOTICE '';
    RAISE NOTICE 'Indexes created for efficient querying';
END $$;
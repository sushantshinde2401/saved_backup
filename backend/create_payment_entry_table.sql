-- Script to create PaymentEntry table in PostgreSQL
-- This script is idempotent and can be run multiple times safely

-- Create PaymentEntry table
CREATE TABLE IF NOT EXISTS PaymentEntry (
    payment_entry_id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidates(id),
    payment_date DATE,
    payment_mode VARCHAR(100),
    amount DECIMAL(10,2),
    receipt_reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_payment_entry_candidate_id ON PaymentEntry(candidate_id);
CREATE INDEX IF NOT EXISTS idx_payment_entry_payment_date ON PaymentEntry(payment_date);
CREATE INDEX IF NOT EXISTS idx_payment_entry_receipt_reference ON PaymentEntry(receipt_reference);

-- Add comments for documentation
COMMENT ON TABLE PaymentEntry IS 'Stores payment entry data';
COMMENT ON COLUMN PaymentEntry.payment_entry_id IS 'Primary key for payment entries';
COMMENT ON COLUMN PaymentEntry.candidate_id IS 'Foreign key reference to candidates table';
COMMENT ON COLUMN PaymentEntry.payment_date IS 'Date of payment';
COMMENT ON COLUMN PaymentEntry.payment_mode IS 'Mode of payment (e.g., cash, check)';
COMMENT ON COLUMN PaymentEntry.amount IS 'Payment amount';
COMMENT ON COLUMN PaymentEntry.receipt_reference IS 'Reference to receipt';

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'PaymentEntry table created successfully';
    RAISE NOTICE '';
    RAISE NOTICE 'PaymentEntry table structure:';
    RAISE NOTICE '- payment_entry_id: SERIAL PRIMARY KEY';
    RAISE NOTICE '- candidate_id: INTEGER REFERENCES candidates(id)';
    RAISE NOTICE '- payment_date: DATE';
    RAISE NOTICE '- payment_mode: VARCHAR(100)';
    RAISE NOTICE '- amount: DECIMAL(10,2)';
    RAISE NOTICE '- receipt_reference: VARCHAR(100)';
    RAISE NOTICE '- created_at: TIMESTAMP';
    RAISE NOTICE '';
    RAISE NOTICE 'Indexes created for efficient querying';
END $$;
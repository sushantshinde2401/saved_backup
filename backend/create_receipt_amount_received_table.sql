-- Script to create ReceiptAmountReceived table in PostgreSQL
-- This script is idempotent and can be run multiple times safely

-- Drop obsolete columns and indexes from existing table if they exist
DROP INDEX IF EXISTS idx_receipt_amount_received_candidate_id;
DROP INDEX IF EXISTS idx_receipt_amount_received_invoice_reference;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'receiptamountreceived') THEN
        ALTER TABLE ReceiptAmountReceived DROP COLUMN IF EXISTS candidate_id;
        ALTER TABLE ReceiptAmountReceived DROP COLUMN IF EXISTS invoice_reference;
    END IF;
END $$;

-- Create ReceiptAmountReceived table (for step 6 data)
CREATE TABLE IF NOT EXISTS ReceiptAmountReceived (
    receipt_amount_id SERIAL PRIMARY KEY,
    account_no VARCHAR(100),
    company_name VARCHAR(255),
    amount_received DECIMAL(10,2),
    payment_type VARCHAR(50),
    transaction_date DATE,
    tds_percentage DECIMAL(6,2),
    gst DECIMAL(10,2),
    customer_name VARCHAR(255),
    transaction_id VARCHAR(100),
    on_account_of VARCHAR(255),
    remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add new columns if they don't exist (for backward compatibility)
ALTER TABLE ReceiptAmountReceived ADD COLUMN IF NOT EXISTS account_no VARCHAR(100);
ALTER TABLE ReceiptAmountReceived ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
ALTER TABLE ReceiptAmountReceived ADD COLUMN IF NOT EXISTS tds_percentage DECIMAL(6,2);
ALTER TABLE ReceiptAmountReceived ADD COLUMN IF NOT EXISTS gst DECIMAL(10,2);
ALTER TABLE ReceiptAmountReceived ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE ReceiptAmountReceived ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100);
ALTER TABLE ReceiptAmountReceived ADD COLUMN IF NOT EXISTS on_account_of VARCHAR(255);

-- Update column types if necessary
ALTER TABLE ReceiptAmountReceived ALTER COLUMN tds_percentage TYPE DECIMAL(6,2);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_receipt_amount_received_transaction_date ON ReceiptAmountReceived(transaction_date);
CREATE INDEX IF NOT EXISTS idx_receipt_amount_received_payment_type ON ReceiptAmountReceived(payment_type);

-- Add comments for documentation
COMMENT ON TABLE ReceiptAmountReceived IS 'Stores receipt/payment data from NewStepper step 6';
COMMENT ON COLUMN ReceiptAmountReceived.receipt_amount_id IS 'Auto-generated primary key';
COMMENT ON COLUMN ReceiptAmountReceived.account_no IS 'Account number for the transaction';
COMMENT ON COLUMN ReceiptAmountReceived.company_name IS 'Name of the company involved';
COMMENT ON COLUMN ReceiptAmountReceived.amount_received IS 'Actual amount received in payment';
COMMENT ON COLUMN ReceiptAmountReceived.payment_type IS 'Type of payment (e.g., cash, bank transfer)';
COMMENT ON COLUMN ReceiptAmountReceived.transaction_date IS 'Date when payment was received';
COMMENT ON COLUMN ReceiptAmountReceived.tds_percentage IS 'TDS percentage applied';
COMMENT ON COLUMN ReceiptAmountReceived.gst IS 'GST amount';
COMMENT ON COLUMN ReceiptAmountReceived.customer_name IS 'Name of the customer';
COMMENT ON COLUMN ReceiptAmountReceived.transaction_id IS 'Unique transaction identifier';
COMMENT ON COLUMN ReceiptAmountReceived.on_account_of IS 'Description of what the payment is on account of';
COMMENT ON COLUMN ReceiptAmountReceived.remark IS 'Additional remarks or notes';

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'ReceiptAmountReceived table created successfully';
    RAISE NOTICE '';
    RAISE NOTICE 'ReceiptAmountReceived table structure:';
    RAISE NOTICE '- receipt_amount_id: SERIAL PRIMARY KEY';
    RAISE NOTICE '- account_no: VARCHAR(100)';
    RAISE NOTICE '- company_name: VARCHAR(255)';
    RAISE NOTICE '- amount_received: DECIMAL(10,2)';
    RAISE NOTICE '- payment_type: VARCHAR(50)';
    RAISE NOTICE '- transaction_date: DATE';
    RAISE NOTICE '- tds_percentage: DECIMAL(6,2)';
    RAISE NOTICE '- gst: DECIMAL(10,2)';
    RAISE NOTICE '- customer_name: VARCHAR(255)';
    RAISE NOTICE '- transaction_id: VARCHAR(100)';
    RAISE NOTICE '- on_account_of: VARCHAR(255)';
    RAISE NOTICE '- remark: TEXT';
    RAISE NOTICE '- created_at: TIMESTAMP';
    RAISE NOTICE '';
    RAISE NOTICE 'Indexes created for efficient querying';
END $$;
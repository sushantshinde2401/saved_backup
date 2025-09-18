-- Script to create ReceiptAmountReceived table in PostgreSQL
-- This script is idempotent and can be run multiple times safely

-- Create ReceiptAmountReceived table (for step 6 data)
CREATE TABLE IF NOT EXISTS ReceiptAmountReceived (
    receipt_amount_id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidates(candidate_id),
    invoice_reference VARCHAR(50) REFERENCES ReceiptInvoiceData(invoice_no),
    amount_received DECIMAL(10,2),
    payment_type VARCHAR(50),
    transaction_date DATE,
    remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_receipt_amount_received_candidate_id ON ReceiptAmountReceived(candidate_id);
CREATE INDEX IF NOT EXISTS idx_receipt_amount_received_invoice_reference ON ReceiptAmountReceived(invoice_reference);
CREATE INDEX IF NOT EXISTS idx_receipt_amount_received_transaction_date ON ReceiptAmountReceived(transaction_date);
CREATE INDEX IF NOT EXISTS idx_receipt_amount_received_payment_type ON ReceiptAmountReceived(payment_type);

-- Add comments for documentation
COMMENT ON TABLE ReceiptAmountReceived IS 'Stores receipt/payment data from NewStepper step 6';
COMMENT ON COLUMN ReceiptAmountReceived.receipt_amount_id IS 'Auto-generated primary key';
COMMENT ON COLUMN ReceiptAmountReceived.candidate_id IS 'Foreign key reference to candidates table';
COMMENT ON COLUMN ReceiptAmountReceived.invoice_reference IS 'Foreign key reference to ReceiptInvoiceData.invoice_no';
COMMENT ON COLUMN ReceiptAmountReceived.amount_received IS 'Actual amount received in payment';
COMMENT ON COLUMN ReceiptAmountReceived.payment_type IS 'Type of payment (e.g., cash, bank transfer)';
COMMENT ON COLUMN ReceiptAmountReceived.transaction_date IS 'Date when payment was received';

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'ReceiptAmountReceived table created successfully';
    RAISE NOTICE '';
    RAISE NOTICE 'ReceiptAmountReceived table structure:';
    RAISE NOTICE '- receipt_amount_id: SERIAL PRIMARY KEY';
    RAISE NOTICE '- candidate_id: INTEGER REFERENCES candidates(candidate_id)';
    RAISE NOTICE '- invoice_reference: VARCHAR(50) REFERENCES ReceiptInvoiceData(invoice_no) (optional)';
    RAISE NOTICE '- amount_received: DECIMAL(10,2)';
    RAISE NOTICE '- payment_type: VARCHAR(50)';
    RAISE NOTICE '- transaction_date: DATE';
    RAISE NOTICE '- remark: TEXT';
    RAISE NOTICE '- created_at: TIMESTAMP';
    RAISE NOTICE '';
    RAISE NOTICE 'Indexes created for efficient querying';
END $$;
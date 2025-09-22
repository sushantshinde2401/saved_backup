-- Script to create ReceiptInvoiceData table in PostgreSQL
-- This script is idempotent and can be run multiple times safely

-- Create ReceiptInvoiceData table (for steps 1-4 data)
CREATE TABLE IF NOT EXISTS ReceiptInvoiceData (
    invoice_no VARCHAR(50) PRIMARY KEY,
    candidate_id INTEGER NOT NULL UNIQUE REFERENCES candidates(candidate_id),
    company_name VARCHAR(255),
    company_account_number VARCHAR(100),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    party_name VARCHAR(255),
    invoice_date DATE,
    amount DECIMAL(10,2),
    gst DECIMAL(10,2) DEFAULT 0,
    gst_applied BOOLEAN DEFAULT FALSE,
    cgst DECIMAL(10,2) DEFAULT 0,
    sgst DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2),
    selected_courses JSONB,
    delivery_note VARCHAR(100),
    dispatch_doc_no VARCHAR(100),
    delivery_date DATE,
    dispatch_through VARCHAR(100),
    destination TEXT,
    terms_of_delivery TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_receipt_invoice_data_candidate_id ON ReceiptInvoiceData(candidate_id);
CREATE INDEX IF NOT EXISTS idx_receipt_invoice_data_invoice_date ON ReceiptInvoiceData(invoice_date);
CREATE INDEX IF NOT EXISTS idx_receipt_invoice_data_company_name ON ReceiptInvoiceData(company_name);
CREATE INDEX IF NOT EXISTS idx_receipt_invoice_data_party_name ON ReceiptInvoiceData(party_name);

-- Add comments for documentation
COMMENT ON TABLE ReceiptInvoiceData IS 'Stores invoice data from NewStepper steps 1-4';
COMMENT ON COLUMN ReceiptInvoiceData.invoice_no IS 'Unique invoice number (Primary Key)';
COMMENT ON COLUMN ReceiptInvoiceData.candidate_id IS 'Foreign key reference to candidates table (one-to-one relationship)';
COMMENT ON COLUMN ReceiptInvoiceData.selected_courses IS 'JSON array of selected courses/certificates';
COMMENT ON COLUMN ReceiptInvoiceData.final_amount IS 'Final amount after GST applied';
COMMENT ON COLUMN ReceiptInvoiceData.gst_applied IS 'Boolean flag indicating if GST is applied';
COMMENT ON COLUMN ReceiptInvoiceData.cgst IS 'Central GST amount (9% of base amount)';
COMMENT ON COLUMN ReceiptInvoiceData.sgst IS 'State GST amount (9% of base amount)';

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'ReceiptInvoiceData table created successfully';
    RAISE NOTICE '';
    RAISE NOTICE 'ReceiptInvoiceData table structure:';
    RAISE NOTICE '- invoice_no: VARCHAR(50) PRIMARY KEY';
    RAISE NOTICE '- candidate_id: INTEGER NOT NULL UNIQUE REFERENCES candidates(candidate_id)';
    RAISE NOTICE '- company_name, customer_name, party_name: VARCHAR(255)';
    RAISE NOTICE '- amount, gst, cgst, sgst, final_amount: DECIMAL(10,2)';
    RAISE NOTICE '- gst_applied: BOOLEAN';
    RAISE NOTICE '- selected_courses: JSONB';
    RAISE NOTICE '- delivery_note, dispatch_doc_no, dispatch_through: VARCHAR';
    RAISE NOTICE '- destination, terms_of_delivery: TEXT';
    RAISE NOTICE '- created_at, updated_at: TIMESTAMP';
    RAISE NOTICE '';
    RAISE NOTICE 'Indexes created for efficient querying';
END $$;
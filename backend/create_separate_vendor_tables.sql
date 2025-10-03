-- Create separate tables for vendor services, payments, and bank ledger
-- This replaces the unified VendorLedger table

-- Vendor Services Table
CREATE TABLE IF NOT EXISTS vendor_services (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER NOT NULL REFERENCES vendors(id),
    company_id INTEGER REFERENCES company_details(id), -- Optional for services
    service_date DATE NOT NULL,
    particulars TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    on_account_of TEXT,
    remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor Payments Table
CREATE TABLE IF NOT EXISTS vendor_payments (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER NOT NULL REFERENCES vendors(id),
    company_id INTEGER REFERENCES company_details(id), -- Optional for payments
    payment_date DATE NOT NULL,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    on_account_of TEXT,
    remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bank Ledger Table
CREATE TABLE IF NOT EXISTS bank_ledger (
    id SERIAL PRIMARY KEY,
    payment_date DATE NOT NULL,
    transaction_id VARCHAR(100) NOT NULL,
    vendor_id INTEGER NOT NULL REFERENCES vendors(id),
    vendor_name VARCHAR(255), -- Denormalized for easier queries
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add company_id column if it doesn't exist
ALTER TABLE bank_ledger ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES company_details(id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendor_services_vendor_id ON vendor_services(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_services_service_date ON vendor_services(service_date);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_vendor_id ON vendor_payments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_payment_date ON vendor_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_transaction_id ON vendor_payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_bank_ledger_vendor_id ON bank_ledger(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bank_ledger_company_id ON bank_ledger(company_id);
CREATE INDEX IF NOT EXISTS idx_bank_ledger_payment_date ON bank_ledger(payment_date);
CREATE INDEX IF NOT EXISTS idx_bank_ledger_transaction_id ON bank_ledger(transaction_id);

-- Migration: Add company_id to existing bank_ledger records
UPDATE bank_ledger
SET company_id = vp.company_id
FROM vendor_payments vp
WHERE bank_ledger.transaction_id = vp.transaction_id
AND bank_ledger.company_id IS NULL;

-- Sample data for testing
INSERT INTO vendor_services (vendor_id, company_id, service_date, particulars, amount, on_account_of, remark)
SELECT
    v.id as vendor_id,
    1 as company_id,
    CURRENT_DATE - INTERVAL '5 days' as service_date,
    'Documentation Services' as particulars,
    10000.00 as amount,
    'Project Alpha' as on_account_of,
    'Initial service entry' as remark
FROM vendors v
WHERE v.vendor_name LIKE '%GMCG%'
LIMIT 1;

INSERT INTO vendor_payments (vendor_id, company_id, payment_date, transaction_id, amount, on_account_of, remark)
SELECT
    v.id as vendor_id,
    1 as company_id,
    CURRENT_DATE as payment_date,
    'TXN001' as transaction_id,
    8000.00 as amount,
    'Project Alpha' as on_account_of,
    'Partial payment' as remark
FROM vendors v
WHERE v.vendor_name LIKE '%GMCG%'
LIMIT 1;

-- Insert corresponding bank ledger entry
INSERT INTO bank_ledger (payment_date, transaction_id, vendor_id, company_id, vendor_name, amount, remark)
SELECT
    vp.payment_date,
    vp.transaction_id,
    vp.vendor_id,
    vp.company_id,
    v.vendor_name,
    vp.amount,
    CONCAT('Payment to ', v.vendor_name, ' - ', vp.transaction_id) as remark
FROM vendor_payments vp
JOIN vendors v ON vp.vendor_id = v.id
WHERE vp.transaction_id = 'TXN001';

COMMENT ON TABLE vendor_services IS 'Stores vendor service entries (bills/invoices)';
COMMENT ON TABLE vendor_payments IS 'Stores vendor payment entries';
COMMENT ON TABLE bank_ledger IS 'Stores bank transactions for vendor payments';
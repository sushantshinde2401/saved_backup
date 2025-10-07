-- Comprehensive Vendor Ledger and Bank Ledger Schema for Accounting Flow
-- Supports multiple companies and vendors with proper data integrity and backdated entries

-- ===========================================
-- ENUM TYPES
-- ===========================================

-- Create enum for entry types in VendorLedger
CREATE TYPE entry_type AS ENUM ('service', 'payment');

-- ===========================================
-- TABLES
-- ===========================================

-- VendorLedger Table
-- Stores both Service Entries (bills/invoices) and Payment Entries
CREATE TABLE IF NOT EXISTS VendorLedger (
    id SERIAL PRIMARY KEY,
    entry_date DATE NOT NULL,
    vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    company_id INTEGER NOT NULL REFERENCES company_details(id) ON DELETE CASCADE,
    type entry_type NOT NULL,
    particulars TEXT,
    remark TEXT,
    on_account_of TEXT,
    dr DECIMAL(15,2) CHECK (dr IS NULL OR dr > 0),
    cr DECIMAL(15,2) CHECK (cr IS NULL OR cr > 0),
    transaction_id VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints to ensure dr and cr are mutually exclusive
    CONSTRAINT vendor_ledger_amount_check CHECK (
        (type = 'service' AND dr IS NOT NULL AND cr IS NULL) OR
        (type = 'payment' AND cr IS NOT NULL AND dr IS NULL AND transaction_id IS NOT NULL)
    )
);

-- bank_ledger Table
-- Stores all bank transactions related to vendor payments
CREATE TABLE IF NOT EXISTS bank_ledger (
    id SERIAL PRIMARY KEY,
    payment_date DATE NOT NULL,
    transaction_id VARCHAR(100),
    vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
    company_id INTEGER NOT NULL REFERENCES company_details(id) ON DELETE CASCADE,
    vendor_name VARCHAR(255),
    amount DECIMAL(15,2) CHECK (amount IS NULL OR amount > 0),
    remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- For vendor payments, amount = payment amount
    CONSTRAINT bank_ledger_amount_check CHECK (amount IS NULL OR amount > 0)
);

-- ===========================================
-- INDEXES
-- ===========================================

-- Indexes for VendorLedger performance
CREATE INDEX IF NOT EXISTS idx_vendor_ledger_vendor_id ON VendorLedger(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_ledger_company_id ON VendorLedger(company_id);
CREATE INDEX IF NOT EXISTS idx_vendor_ledger_entry_date ON VendorLedger(entry_date);
CREATE INDEX IF NOT EXISTS idx_vendor_ledger_type ON VendorLedger(type);
CREATE INDEX IF NOT EXISTS idx_vendor_ledger_transaction_id ON VendorLedger(transaction_id);

-- Indexes for bank_ledger performance
CREATE INDEX IF NOT EXISTS idx_bank_ledger_company_id ON bank_ledger(company_id);
CREATE INDEX IF NOT EXISTS idx_bank_ledger_payment_date ON bank_ledger(payment_date);
CREATE INDEX IF NOT EXISTS idx_bank_ledger_transaction_id ON bank_ledger(transaction_id);

-- ===========================================
-- TRIGGERS
-- ===========================================

-- Function to auto-insert into BankLedger on VendorLedger payment insert
CREATE OR REPLACE FUNCTION auto_insert_bank_ledger()
RETURNS TRIGGER AS $$
DECLARE
    vendor_name TEXT;
BEGIN
    IF NEW.type = 'payment' THEN
        SELECT vendor_name INTO vendor_name
        FROM vendors
        WHERE id = NEW.vendor_id;

        INSERT INTO bank_ledger (
            payment_date,
            transaction_id,
            vendor_id,
            company_id,
            vendor_name,
            amount,
            remark
        ) VALUES (
            NEW.entry_date,
            NEW.transaction_id,
            NEW.vendor_id,
            NEW.company_id,
            vendor_name,
            NEW.cr,
            'Auto-inserted from vendor payment'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on VendorLedger
DROP TRIGGER IF EXISTS trigger_auto_bank_ledger ON VendorLedger;
CREATE TRIGGER trigger_auto_bank_ledger
    AFTER INSERT ON VendorLedger
    FOR EACH ROW
    EXECUTE FUNCTION auto_insert_bank_ledger();

-- ===========================================
-- VIEWS
-- ===========================================

-- VendorLedger Report View with Running Balance
-- Uses window function for accurate balance calculation with backdated entries
CREATE OR REPLACE VIEW VendorLedgerReport AS
SELECT
    vl.id,
    vl.entry_date,
    v.vendor_name,
    cd.company_name,
    vl.type,
    vl.particulars,
    vl.remark,
    vl.on_account_of,
    vl.dr,
    vl.cr,
    vl.transaction_id,
    -- Running balance calculation: SUM(dr - cr) ordered by date and id
    SUM(COALESCE(vl.dr, 0) - COALESCE(vl.cr, 0))
        OVER (
            PARTITION BY vl.vendor_id, vl.company_id
            ORDER BY vl.entry_date, vl.id
            ROWS UNBOUNDED PRECEDING
        ) AS balance
FROM VendorLedger vl
JOIN vendors v ON vl.vendor_id = v.id
JOIN company_details cd ON vl.company_id = cd.id
ORDER BY vl.vendor_id, vl.company_id, vl.entry_date, vl.id;

-- BankLedger Report View with Running Balance
CREATE OR REPLACE VIEW BankLedgerReport AS
SELECT
    bl.id,
    bl.payment_date as entry_date,
    cd.company_name,
    bl.remark as particulars,
    bl.transaction_id,
    0 as dr,
    bl.amount as cr,
    -- Running balance calculation for bank: SUM(amount) ordered by date and id
    SUM(COALESCE(bl.amount, 0))
        OVER (
            PARTITION BY bl.company_id
            ORDER BY bl.payment_date, bl.id
            ROWS UNBOUNDED PRECEDING
        ) AS balance
FROM bank_ledger bl
JOIN company_details cd ON bl.company_id = cd.id
ORDER BY bl.company_id, bl.payment_date, bl.id;

-- ===========================================
-- SAMPLE DATA AND QUERIES
-- ===========================================

-- Sample INSERT statements for the example scenario
-- Company: ABC Corp (assuming id=1)
-- Vendor: GMCG (assuming id=8 from vendors table)

-- Insert sample company if not exists
INSERT INTO company_details (company_name, company_address, bank_name, account_number, branch, ifsc_code)
VALUES ('ABC Corp', 'Mumbai, Maharashtra', 'HDFC Bank', '1234567890', 'CBD Belapur', 'HDFC0001234')
ON CONFLICT (account_number) DO NOTHING;

-- Service Entry 1: 01/09/2025 ₹10,000
INSERT INTO VendorLedger (entry_date, vendor_id, company_id, type, particulars, dr)
VALUES ('2025-09-01', 8, 1, 'service', 'Consulting Services', 10000.00);

-- Service Entry 2: 05/09/2025 ₹5,000
INSERT INTO VendorLedger (entry_date, vendor_id, company_id, type, particulars, dr)
VALUES ('2025-09-05', 8, 1, 'service', 'Training Services', 5000.00);

-- Payment Entry: 10/09/2025 ₹8,000
INSERT INTO VendorLedger (entry_date, vendor_id, company_id, type, particulars, cr, transaction_id)
VALUES ('2025-09-10', 8, 1, 'payment', 'Payment for Services', 8000.00, 'TXN12345');

-- Service Entry 3: 12/09/2025 ₹7,000
INSERT INTO VendorLedger (entry_date, vendor_id, company_id, type, particulars, dr)
VALUES ('2025-09-12', 8, 1, 'service', 'Certification Services', 7000.00);

-- Query to get VendorLedger report for specific vendor and company
-- SELECT * FROM VendorLedgerReport
-- WHERE vendor_name = 'Global Maritime Consultants Group' AND company_name = 'ABC Corp';

-- Query to get BankLedger report for specific company
-- SELECT * FROM BankLedgerReport WHERE company_name = 'ABC Corp';

-- ===========================================
-- ADDITIONAL UTILITY QUERIES
-- ===========================================

-- Get outstanding balance for a vendor
-- SELECT vendor_name, balance
-- FROM VendorLedgerReport
-- WHERE vendor_id = ? AND company_id = ?
-- ORDER BY entry_date DESC, id DESC
-- LIMIT 1;

-- Get bank balance for a company
-- SELECT company_name, balance
-- FROM BankLedgerReport
-- WHERE company_id = ?
-- ORDER BY entry_date DESC, id DESC
-- LIMIT 1;

-- Get entries within date range
-- SELECT * FROM VendorLedgerReport
-- WHERE entry_date BETWEEN '2025-09-01' AND '2025-09-30'
-- AND vendor_id = ? AND company_id = ?;

-- ===========================================
-- COMMENTS
-- ===========================================

COMMENT ON TABLE VendorLedger IS 'Stores vendor transactions including service bills and payments';
COMMENT ON TABLE bank_ledger IS 'Stores bank transactions, primarily auto-populated from vendor payments';
COMMENT ON VIEW VendorLedgerReport IS 'Vendor ledger with running balance calculation using window functions';
COMMENT ON VIEW BankLedgerReport IS 'Bank ledger with running balance calculation using window functions';
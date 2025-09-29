-- Create Company Ledger table
CREATE TABLE IF NOT EXISTS CompanyLedger (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    particulars TEXT,
    voucher_no VARCHAR(100),
    voucher_type VARCHAR(50) DEFAULT 'Sales',
    debit DECIMAL(15,2) DEFAULT 0,
    credit DECIMAL(15,2) DEFAULT 0,
    entry_type VARCHAR(50) DEFAULT 'Manual',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_company_ledger_company_name ON CompanyLedger(company_name);
CREATE INDEX IF NOT EXISTS idx_company_ledger_date ON CompanyLedger(date);
CREATE INDEX IF NOT EXISTS idx_company_ledger_voucher_no ON CompanyLedger(voucher_no);

-- Insert some sample data for testing
INSERT INTO CompanyLedger (company_name, date, particulars, voucher_no, voucher_type, debit, credit, entry_type) VALUES
('Tech Solutions India Pvt Ltd', '2025-01-15', 'Invoice payment for training services', 'INV-001', 'Sales', 150000.00, 0, 'Manual'),
('Tech Solutions India Pvt Ltd', '2025-01-20', 'Payment received', 'RCP-001', 'Receipt', 0, 150000.00, 'Manual'),
('Global Manufacturing Corp', '2025-01-10', 'Course fee payment', 'INV-002', 'Sales', 200000.00, 0, 'Manual'),
('Global Manufacturing Corp', '2025-01-25', 'Partial payment received', 'RCP-002', 'Receipt', 0, 100000.00, 'Manual');
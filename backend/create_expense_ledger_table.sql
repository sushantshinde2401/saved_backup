-- Create Expense Ledger table for expense payments
CREATE TABLE IF NOT EXISTS expense_ledger (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(100) NOT NULL,
    expense_type VARCHAR(100) NOT NULL,
    company VARCHAR(255) NOT NULL,
    vendor_name VARCHAR(255) NOT NULL,
    vendor_gst_number VARCHAR(15),
    amount DECIMAL(15,2) NOT NULL,
    expense_date DATE NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    description TEXT,
    particulars TEXT,
    debit DECIMAL(15,2) DEFAULT 0,
    credit DECIMAL(15,2) DEFAULT 0,
    account_type VARCHAR(50) NOT NULL, -- 'expense' or 'bank'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_expense_ledger_transaction_id ON expense_ledger(transaction_id);
CREATE INDEX IF NOT EXISTS idx_expense_ledger_expense_date ON expense_ledger(expense_date);
CREATE INDEX IF NOT EXISTS idx_expense_ledger_company ON expense_ledger(company);
CREATE INDEX IF NOT EXISTS idx_expense_ledger_expense_type ON expense_ledger(expense_type);
CREATE INDEX IF NOT EXISTS idx_expense_ledger_account_type ON expense_ledger(account_type);

-- Add company_id column if company_details table exists
ALTER TABLE expense_ledger ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES company_details(id);

COMMENT ON TABLE expense_ledger IS 'Stores double-entry accounting records for expense payments';
COMMENT ON COLUMN expense_ledger.account_type IS 'Type of account: expense (debit) or bank (credit)';
-- Create Opening Balance table for monthly opening balances
CREATE TABLE IF NOT EXISTS opening_balances (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),
    opening_balance DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_name, month, year)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_opening_balances_company_month_year ON opening_balances(company_name, month, year);

COMMENT ON TABLE opening_balances IS 'Stores monthly opening balances for companies';
COMMENT ON COLUMN opening_balances.opening_balance IS 'Opening balance amount for the month';
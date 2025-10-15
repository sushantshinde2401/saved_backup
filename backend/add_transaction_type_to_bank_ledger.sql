-- Add transaction_type column to bank_ledger table to distinguish receipts (debits) from payments (credits)
-- Receipts are inflows to bank (debits), payments are outflows from bank (credits)

ALTER TABLE bank_ledger ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(20) DEFAULT 'payment';

-- Update existing records: if vendor_id is NULL, it's likely a receipt, else payment
UPDATE bank_ledger SET transaction_type = 'receipt' WHERE vendor_id IS NULL;
UPDATE bank_ledger SET transaction_type = 'payment' WHERE vendor_id IS NOT NULL;

-- Add check constraint
ALTER TABLE bank_ledger ADD CONSTRAINT bank_ledger_transaction_type_check
    CHECK (transaction_type IN ('receipt', 'payment'));

-- Update the BankLedgerReport view to properly show debits and credits
CREATE OR REPLACE VIEW BankLedgerReport AS
SELECT
    bl.id,
    bl.payment_date as entry_date,
    cd.company_name,
    bl.remark as particulars,
    bl.transaction_id,
    CASE WHEN bl.transaction_type = 'receipt' THEN bl.amount ELSE 0 END as dr,
    CASE WHEN bl.transaction_type = 'payment' THEN bl.amount ELSE 0 END as cr,
    -- Running balance calculation for bank: SUM(dr - cr) ordered by date and id
    SUM(
        CASE WHEN bl.transaction_type = 'receipt' THEN bl.amount ELSE -bl.amount END
    )
        OVER (
            PARTITION BY bl.company_id
            ORDER BY bl.payment_date, bl.id
            ROWS UNBOUNDED PRECEDING
        ) AS balance
FROM bank_ledger bl
JOIN company_details cd ON bl.company_id = cd.id
ORDER BY bl.company_id, bl.payment_date, bl.id;
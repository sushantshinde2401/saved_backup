-- Make vendor_id nullable in bank_ledger table to support expense payments
-- Expense payments don't have a vendor_id since they're not vendor payments

ALTER TABLE bank_ledger ALTER COLUMN vendor_id DROP NOT NULL;

-- Update comment to reflect the new usage
COMMENT ON TABLE bank_ledger IS 'Stores bank transactions for vendor payments, expense payments, and receipt entries';
-- SQL Examples for Candidates, Invoices, and Receipts Relationships
-- This file demonstrates the relationships and CRUD operations

-- 1. Insert a new candidate and return its candidate_id
INSERT INTO candidates (candidate_name, candidate_folder, candidate_folder_path, json_data)
VALUES ('John_Doe_ABC123', 'John_Doe_ABC123', '/path/to/folder', '{"passport": "ABC123"}')
RETURNING candidate_id;

-- 2. Insert an invoice for that candidate using candidate_id
-- Assuming candidate_id from above is 1
INSERT INTO ReceiptInvoiceData (
    invoice_no, candidate_id, company_name, customer_name, amount, final_amount
) VALUES (
    'INV-001', 1, 'Angel Maritime', 'John Doe', 1000.00, 1180.00
);

-- 3. Insert a receipt entry linked to that candidate and invoice
INSERT INTO ReceiptAmountReceived (
    candidate_id, invoice_reference, amount_received, payment_type, transaction_date
) VALUES (
    1, 'INV-001', 1180.00, 'Bank Transfer', CURRENT_DATE
);

-- 4. Query all invoices and receipts for a candidate
SELECT
    c.candidate_name,
    rid.invoice_no,
    rid.amount,
    rid.final_amount,
    rid.invoice_date,
    rar.receipt_amount_id,
    rar.amount_received,
    rar.payment_type,
    rar.transaction_date
FROM candidates c
LEFT JOIN ReceiptInvoiceData rid ON c.candidate_id = rid.candidate_id
LEFT JOIN ReceiptAmountReceived rar ON c.candidate_id = rar.candidate_id
WHERE c.candidate_id = 1;

-- 5. Query candidate with their invoices and receipts (JOIN)
SELECT
    c.candidate_id,
    c.candidate_name,
    json_agg(
        json_build_object(
            'invoice_no', rid.invoice_no,
            'amount', rid.amount,
            'final_amount', rid.final_amount,
            'invoice_date', rid.invoice_date,
            'receipts', (
                SELECT json_agg(
                    json_build_object(
                        'receipt_id', rar.receipt_amount_id,
                        'amount_received', rar.amount_received,
                        'payment_type', rar.payment_type,
                        'transaction_date', rar.transaction_date
                    )
                )
                FROM ReceiptAmountReceived rar
                WHERE rar.candidate_id = c.candidate_id
                AND rar.invoice_reference = rid.invoice_no
            )
        )
    ) AS invoices_with_receipts
FROM candidates c
LEFT JOIN ReceiptInvoiceData rid ON c.candidate_id = rid.candidate_id
WHERE c.candidate_id = 1
GROUP BY c.candidate_id, c.candidate_name;
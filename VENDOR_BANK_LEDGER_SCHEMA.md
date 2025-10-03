# Vendor Ledger and Bank Ledger Database Schema

## Overview
This document describes the comprehensive database schema for Vendor Ledger and Bank Ledger with proper accounting flow, supporting multiple companies and vendors. The system handles backdated entries, ensures data integrity, and provides efficient reporting.

## Database Schema

### Tables

#### 1. VendorLedger
Stores both Service Entries (bills/invoices) and Payment Entries.

**Fields:**
- `id` (SERIAL PRIMARY KEY)
- `entry_date` (DATE NOT NULL)
- `vendor_id` (INTEGER, FK to vendors.id)
- `company_id` (INTEGER, FK to company_details.id)
- `type` (ENUM: 'service', 'payment')
- `particulars` (TEXT)
- `remark` (TEXT)
- `on_account_of` (TEXT)
- `dr` (DECIMAL(15,2)) - Debit amount for services
- `cr` (DECIMAL(15,2)) - Credit amount for payments
- `transaction_id` (VARCHAR(100) UNIQUE) - Required for payments
- `created_at`, `updated_at` (TIMESTAMP)

**Constraints:**
- `dr` and `cr` are mutually exclusive
- For service entries: `dr > 0`, `cr IS NULL`
- For payment entries: `cr > 0`, `dr IS NULL`, `transaction_id IS NOT NULL`

#### 2. BankLedger
Stores all bank transactions related to vendor payments.

**Fields:**
- `id` (SERIAL PRIMARY KEY)
- `entry_date` (DATE NOT NULL)
- `company_id` (INTEGER, FK to company_details.id)
- `particulars` (TEXT)
- `transaction_id` (VARCHAR(100), FK to VendorLedger.transaction_id)
- `dr` (DECIMAL(15,2)) - Debit from bank
- `cr` (DECIMAL(15,2)) - Credit to bank
- `created_at`, `updated_at` (TIMESTAMP)

### Views

#### 1. VendorLedgerReport
Provides vendor ledger with running balance calculation.

```sql
SELECT
    vl.*,
    v.vendor_name,
    cd.company_name,
    SUM(COALESCE(vl.dr, 0) - COALESCE(vl.cr, 0))
        OVER (PARTITION BY vl.vendor_id, vl.company_id
              ORDER BY vl.entry_date, vl.id) AS balance
FROM VendorLedger vl
JOIN vendors v ON vl.vendor_id = v.id
JOIN company_details cd ON vl.company_id = cd.id;
```

#### 2. BankLedgerReport
Provides bank ledger with running balance calculation.

```sql
SELECT
    bl.*,
    cd.company_name,
    SUM(COALESCE(bl.dr, 0) - COALESCE(bl.cr, 0))
        OVER (PARTITION BY bl.company_id
              ORDER BY bl.entry_date, bl.id) AS balance
FROM BankLedger bl
JOIN company_details cd ON bl.company_id = cd.id;
```

## System Behavior

### Automatic Bank Ledger Population
When a payment entry is inserted into VendorLedger, a corresponding entry is automatically created in BankLedger via trigger:

- `entry_date` = payment date
- `particulars` = 'Payment to Vendor ' + vendor_name
- `transaction_id` = payment transaction_id
- `dr` = payment amount (debit from bank)
- `cr` = NULL

### Running Balance Calculation
- **Not stored** in tables to support backdated entries
- Calculated using SQL window functions
- Automatically adjusts when entries are reordered by date

### Transaction Safety
- All operations use database transactions
- Foreign key constraints ensure data integrity
- Check constraints prevent invalid amount combinations

## Frontend Integration

### VendorServiceEntry Component
**Fields Mapping:**
- `dateOfService` → `entry_date`
- `particularOfService` → `particulars`
- `feesToBePaid` → `dr`
- `onAccountOf` → `on_account_of`
- `remark` → `remark`
- `companyId`, `vendorId` → `company_id`, `vendor_id`

### VendorPaymentEntry Component
**Fields Mapping:**
- `dateOfPayment` → `entry_date`
- `transactionId` → `transaction_id`
- `amount` → `cr`
- `onAccountOf` → `on_account_of`
- `remark` → `remark`
- `companyId`, `vendorId` → `company_id`, `vendor_id`

## Example Scenario

**Company:** ABC Corp
**Vendor:** GMCG

| Date | Type | Particulars | Dr | Cr | Balance |
|------|------|-------------|----|----|---------|
| 01/09/2025 | Service | Consulting Services | 10000 | - | 10000 |
| 05/09/2025 | Service | Training Services | 5000 | - | 15000 |
| 10/09/2025 | Payment | Payment for Services | - | 8000 | 7000 |
| 12/09/2025 | Service | Certification Services | 7000 | - | 14000 |

**Bank Ledger (ABC Corp):**

| Date | Particulars | Transaction ID | Dr | Cr | Balance |
|------|-------------|----------------|----|----|---------|
| 10/09/2025 | Payment to Vendor GMCG | TXN12345 | 8000 | - | -8000 |

## Indexes
- `vendor_id`, `company_id`, `entry_date` on VendorLedger
- `company_id`, `entry_date`, `transaction_id` on BankLedger

## Files Created
- `backend/create_vendor_bank_ledger_tables.sql` - Complete schema
- `backend/setup_vendor_bank_ledger.py` - Setup script

## Usage
```bash
cd backend
python setup_vendor_bank_ledger.py
```

## API Integration Points
The schema is ready for backend API endpoints to:
1. Insert service entries into VendorLedger
2. Insert payment entries into VendorLedger (triggers BankLedger)
3. Query VendorLedgerReport and BankLedgerReport for reporting
4. Support date range filtering and vendor/company filtering
# Certificate Cascade Deletion - Database Design Refactor

## Overview
This refactor establishes `certificate_selections` as the single parent entity for all related records. Deleting a certificate automatically removes all dependent records using database-level referential integrity (ON DELETE CASCADE).

## Table Relationships

### Parent Table
- **certificate_selections**
  - Primary Key: `id` (SERIAL, unique, sequential)
  - Foreign Key: `candidate_id` → `candidates(id)` (ON DELETE CASCADE)

### Child Tables (with certificate_id FK)
All child tables now include `certificate_id` as a foreign key to `certificate_selections(id)` with ON DELETE CASCADE:

1. **receiptinvoicedata**
   - FK: `certificate_id` → `certificate_selections(id)` (ON DELETE CASCADE)
   - Retains: `candidate_id`, `invoice_no` for reporting

2. **invoice_images**
   - FK: `certificate_id` → `certificate_selections(id)` (ON DELETE CASCADE)
   - Retains: `invoice_no` for reporting

3. **clientledger**
   - FK: `certificate_id` → `certificate_selections(id)` (ON DELETE CASCADE)
   - Retains: `voucher_no`, `company_name` for reporting

4. **masterdatabasetable** (Master_Database_Table_A)
   - FK: `certificate_id` → `certificate_selections(id)` (ON DELETE CASCADE)
   - Retains: `candidate_id` for reporting

## Expected Behavior

### Deletion Logic
- **Single Operation**: `DELETE FROM certificate_selections WHERE id = ?`
- **Automatic Cascade**: All related records are deleted automatically
- **No Manual Cleanup**: No need to delete child records individually

### Safety Features
- **Existence Check**: Verify certificate exists before deletion
- **Cascade Only**: Only records directly linked via `certificate_id` are affected
- **Isolation**: Other certificates of the same candidate remain unaffected
- **Reporting Fields**: `candidate_id` and `invoice_number` preserved for queries but not used in deletion logic

### Example Scenarios
1. **Complete Certificate Deletion**:
   ```
   Certificate ID: 123
   ├── ReceiptInvoiceData (invoice_no: INV-001)
   ├── Invoice Images (for INV-001)
   ├── Client Ledger entries (voucher_no: INV-001)
   └── Master Database records
   ```
   Deleting certificate 123 removes all above records.

2. **Partial Data**: If no billing records exist, deletion still succeeds.

3. **Candidate Isolation**: Deleting one certificate doesn't affect other certificates of the same candidate.

## Implementation Steps

1. Run the ALTER scripts in order:
   - `alter_receiptinvoicedata_add_certificate_id.sql`
   - `alter_invoice_images_add_certificate_id.sql`
   - `alter_clientledger_add_certificate_id.sql`
   - `alter_masterdatabasetable_add_certificate_id.sql`

2. Populate `certificate_id` in existing records (if any) based on relationships.

3. Use `safe_certificate_deletion.sql` for deletion operations.

## Migration Notes

- Existing `candidate_id` references remain for backward compatibility and reporting.
- New inserts must populate `certificate_id` appropriately.
- Consider adding database triggers or application logic to maintain `certificate_id` consistency.
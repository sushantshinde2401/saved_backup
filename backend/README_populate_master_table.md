# Master_Database_Table_A Population Script

## Overview
This document describes the implementation of the `populate_master_database_table.py` script, which creates and populates the `Master_Database_Table_A` table with consolidated data from the existing database tables.

## Purpose
The `Master_Database_Table_A` table serves as a centralized view that combines data from:
- `certificate_selections` (certificate and client information)
- `candidates` (candidate details stored in JSON format)
- `receiptinvoicedata` (invoice and delivery information)

## Table Schema
```sql
CREATE TABLE Master_Database_Table_A (
    creation_date DATE,
    client_name VARCHAR(255),
    client_id VARCHAR(10),  -- Derived: UPPER(LEFT(client_name, 3))
    candidate_id INT,
    candidate_name VARCHAR(255),
    nationality VARCHAR(100),
    passport VARCHAR(50),
    cdcNo VARCHAR(50),
    indosNo VARCHAR(50),
    certificate_name VARCHAR(255),
    certificate_id VARCHAR(10),  -- Derived: UPPER(LEFT(certificate_name, 3))
    companyName VARCHAR(255),
    person_in_charge VARCHAR(255),
    delivery_note VARCHAR(100),
    delivery_date DATE,
    terms_of_delivery VARCHAR(100),
    invoice_no VARCHAR(100),
    PRIMARY KEY (candidate_id, invoice_no)
);
```

## Data Sources and Mappings

### certificate_selections Table
- `creation_date` → `creation_date` (cast to DATE)
- `client_name` → `client_name`
- `client_name` → `client_id` (derived shortname)
- `candidate_id` → `candidate_id`
- `candidate_name` → `candidate_name`
- `certificate_name` → `certificate_name`
- `certificate_name` → `certificate_id` (derived shortname)

### candidates Table
- `json_data->>'nationality'` → `nationality`
- `json_data->>'passport'` → `passport`
- `json_data->>'cdcNo'` → `cdcNo`
- `json_data->>'indosNo'` → `indosNo`
- `json_data->>'companyName'` → `companyName`
- `json_data->>'Person In Charge'` → `person_in_charge`

### receiptinvoicedata Table
- `delivery_note` → `delivery_note`
- `delivery_date` → `delivery_date`
- `terms_of_delivery` → `terms_of_delivery`
- `invoice_no` → `invoice_no`

## Key Features

### Derived Fields
- **client_id**: First 3 uppercase characters of `client_name`
- **certificate_id**: First 3 uppercase characters of `certificate_name`

### Data Handling
- **NULL Safety**: Uses `COALESCE` to provide default values for missing data
- **JSON Extraction**: Safely extracts values from JSONB fields in `candidates.json_data`
- **Type Casting**: Ensures proper data types (e.g., DATE casting for timestamps)

### Conflict Resolution
- **Primary Key**: Composite key on `(candidate_id, invoice_no)` prevents duplicates
- **ON CONFLICT DO NOTHING**: Skips duplicate records during insertion

## Usage

### Running the Script
```bash
cd backend
python populate_master_database_table.py
```

### Expected Output
```
INFO:__main__:🚀 Starting Master_Database_Table_A population process
INFO:__main__:✅ Master_Database_Table_A table created or already exists
INFO:__main__:✅ Master_Database_Table_A populated successfully
INFO:__main__:📊 Total records in Master_Database_Table_A: 4
INFO:__main__:🔍 Sample records from Master_Database_Table_A:
INFO:__main__:  - Candidate: MANDEEP_BAMANE_F6654647 (ID: 131), Client: ABB Ship Management Pvt.Ltd (ABB), Certificate: Basic Safety Training (STCW) (BAS), Invoice: 258963
...
INFO:__main__:✅ Master_Database_Table_A population process completed
```

## Database Relationships
- **certificate_selections** ↔ **candidates**: Joined on `candidate_id = candidates.id`
- **certificate_selections** ↔ **receiptinvoicedata**: Left joined on `candidate_id`
- **Composite Primary Key**: `(candidate_id, invoice_no)` ensures uniqueness per candidate-invoice combination

## Error Handling
- **Connection Management**: Uses existing database connection pool
- **Transaction Safety**: Automatic rollback on errors
- **Logging**: Comprehensive logging for debugging and monitoring
- **Graceful Degradation**: Continues processing even with missing optional data

## Maintenance
- **Idempotent**: Can be run multiple times safely
- **Incremental Updates**: Uses `ON CONFLICT DO NOTHING` to avoid overwriting existing data
- **Verification**: Includes post-insertion verification to confirm successful population

## Dependencies
- `database.db_connection` module for database operations
- PostgreSQL database with existing tables
- Python logging module for output

## Future Enhancements
- Add command-line arguments for selective population
- Implement incremental sync for new records only
- Add data validation and cleansing options
- Support for different database backends
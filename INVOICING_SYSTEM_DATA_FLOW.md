# Invoicing System Data Flow Design

## Overview
This document outlines the data flow for the invoicing system using stepper logic. The system manages invoices and receipts for candidates, with a multi-step wizard interface for creating and managing financial records.

## Database Schema

### Existing Table: candidates
- **Primary Key**: id (SERIAL)
- **Columns**:
  - candidate_name (VARCHAR(100) UNIQUE NOT NULL)
  - candidate_folder (VARCHAR(255))
  - candidate_folder_path (VARCHAR(500))
  - json_data (JSONB)
  - created_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

### New Table: receipt_invoice_data
- **Primary Key**: invoice_no (VARCHAR(50))
- **Foreign Key**: candidate_id → candidates(id)
- **Columns**:
  - Company Details: company_name, company_account_number
  - Customer Details: customer_name, customer_phone
  - Invoice Info: party_name, invoice_date, amount, discount, gst, final_amount
  - Delivery Details: delivery_note, dispatch_doc_no, delivery_date, dispatch_through, destination, terms_of_delivery
  - created_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

### New Table: receipt_amount_received
- **Primary Key**: receipt_amount_id (SERIAL)
- **Foreign Keys**:
  - candidate_id → candidates(id)
  - invoice_reference → receipt_invoice_data(invoice_no)
- **Columns**:
  - received_amount (DECIMAL(10,2))
  - payment_type (VARCHAR(50))
  - transaction_date (DATE)
  - remark (TEXT)
  - created_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

## Relationships
- **candidates** → owns → **receipt_invoice_data** (1:N via candidate_id)
- **candidates** → owns → **receipt_amount_received** (1:N via candidate_id)
- **receipt_invoice_data** ↔ **receipt_amount_received** (1:N via invoice_reference)

## Stepper Logic Flow

The invoicing process uses a 5-step stepper wizard for creating invoices, followed by optional receipt management.

### Step 1: Candidate Selection
- **Purpose**: Select the candidate for whom the invoice is being created
- **Data Flow**:
  - Query candidates table for available candidates
  - User selects candidate by candidate_name
  - Store selected candidate_id for subsequent steps
- **Validation**: Must select a valid candidate

### Step 2: Company & Customer Details
- **Purpose**: Enter company and customer information
- **Data Flow**:
  - Input fields: company_name, company_account_number, customer_name, customer_phone
  - Data temporarily stored in form state
- **Validation**: Required fields must be filled

### Step 3: Invoice Details
- **Purpose**: Enter core invoice information including amounts and courses
- **Data Flow**:
  - Input fields: party_name, invoice_date, amount, discount, gst
  - Calculate final_amount = amount - discount + gst
- **Validation**: Amounts must be numeric, final_amount calculated automatically

### Step 4: Delivery Details
- **Purpose**: Enter delivery and dispatch information
- **Data Flow**:
  - Input fields: delivery_note, dispatch_doc_no, delivery_date, dispatch_through, destination, terms_of_delivery
  - Data temporarily stored in form state
- **Validation**: delivery_date should be valid date

### Step 5: Review & Save
- **Purpose**: Review all entered data and save the invoice
- **Data Flow**:
  - Generate unique invoice_no (e.g., INV-{timestamp}-{candidate_id})
  - Insert record into receipt_invoice_data table
  - Display success message with invoice_no
- **Validation**: All required fields from previous steps must be complete

## Receipt Management Flow

After invoice creation, users can add receipts against invoices.

### Receipt Creation Steps:
1. **Select Invoice**: Choose from existing invoices for the candidate
2. **Enter Receipt Details**: received_amount, payment_type, transaction_date, remark
3. **Save Receipt**: Insert into receipt_amount_received table

## Data Flow Diagram

```
[Candidate Selection] → [Company/Customer Details] → [Invoice Details] → [Delivery Details] → [Save Invoice]
                                                                 ↓
[Receipt Management] ← [Select Invoice] → [Receipt Details] → [Save Receipt]
```

## User Workflow

1. Navigate to Invoicing Module
2. Click "Create New Invoice"
3. Follow the 5-step stepper:
   - Step 1: Select candidate from dropdown
   - Step 2: Fill company and customer info
   - Step 3: Enter invoice amounts and select courses
   - Step 4: Add delivery information
   - Step 5: Review and confirm
4. Invoice created with unique invoice_no
5. Optionally, add receipts by selecting the invoice and entering payment details

## Implementation Notes
- Use React Stepper component for UI
- Backend API endpoints needed:
  - GET /candidates (for selection)
  - POST /invoices (create invoice)
  - GET /invoices/{candidate_id} (list invoices for candidate)
  - POST /receipts (create receipt)
- Form validation at each step
- Auto-calculation of final_amount
- Unique invoice_no generation logic
# Maritime Certificate Generation System - Technical Documentation

## Table of Contents

1. [Application Overview](#1-application-overview)
2. [System Architecture](#2-system-architecture)
3. [Technical Implementation Details](#3-technical-implementation-details)
4. [Core Modules](#4-core-modules)
5. [Database Structure](#5-database-structure)
6. [API Endpoints](#6-api-endpoints)
7. [Feature Documentation](#7-feature-documentation)
8. [Data Flow and Integration](#8-data-flow-and-integration)
9. [Certificate Generation](#9-certificate-generation)
10. [File Structure and Organization](#10-file-structure-and-organization)
11. [Configuration and Setup](#11-configuration-and-setup)
12. [Testing and Verification](#12-testing-and-verification)
13. [Recent Updates and Changes](#13-recent-updates-and-changes)

---

## 1. Application Overview

### 1.1 Purpose and Functionality

The Maritime Certificate Generation System is a comprehensive enterprise-grade web application designed to streamline the entire maritime training and certification workflow. The system integrates certificate generation, bookkeeping, invoicing, and financial management into a unified platform for maritime training centers.

**Core Functionalities:**
- **Certificate Management**: Document upload, OCR processing, and automated certificate generation for maritime safety courses
- **Bookkeeping System**: Complete financial management including invoicing, receipts, vendor payments, and ledger management
- **Invoice Generation**: Multi-step invoice creation with B2B/B2C customer support and GST compliance
- **Payment Processing**: Receipt management, expense tracking, and bank ledger integration
- **Database Management**: PostgreSQL-based data persistence with candidate, company, and financial records
- **File Organization**: Automated document management with organized storage systems

### 1.2 Target Users and Use Cases

**Primary Users:**
- **Maritime Training Centers**: Complete business management including certifications and finances
- **Training Coordinators**: Staff managing candidate applications, document processing, and course administration
- **Bookkeeping Personnel**: Finance teams handling invoicing, receipts, payments, and ledger management
- **Candidates**: Maritime professionals seeking safety training certificates
- **Verification Personnel**: Authorities validating certificate authenticity and compliance

**Use Cases:**
- End-to-end candidate certification workflow from document upload to certificate distribution
- Comprehensive financial management including GST-compliant invoicing and payment tracking
- Automated OCR-based passport data extraction and candidate profile management
- Multi-company bookkeeping with separate ledgers and financial reporting
- Integrated receipt and payment processing with bank reconciliation
- Vendor management and expense tracking for training center operations

### 1.3 System Architecture Overview

The system follows a modern microservices-inspired architecture with modular components:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend Layer (React.js)                     │
│  ┌─────────────────┬─────────────────┬─────────────────┐        │
│  │   Operations    │   Bookkeeping   │   Database      │        │
│  │   (Certificates)│   (Finance)     │   (Management)  │        │
│  └─────────────────┴─────────────────┴─────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    HTTP/REST API (Flask)
                                 │
┌─────────────────────────────────────────────────────────────────┐
│                    Backend Services                              │
│  ┌─────────────────┬─────────────────┬─────────────────┐        │
│  │   Certificate   │   Bookkeeping   │   Database      │        │
│  │   Processing    │   Services      │   Services      │        │
│  └─────────────────┴─────────────────┴─────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    PostgreSQL Database
                                 │
                    File Storage System
```

**Architecture Components:**
- **Frontend**: React.js SPA with modular routing and state management
- **Backend**: Flask REST API with blueprint-based modular services
- **Database**: PostgreSQL with structured tables for candidates, companies, and financial data
- **Storage**: Organized file system with automated document management
- **Processing**: OCR integration, PDF generation, and financial calculations
- **Integration**: Google Drive API, email services, and external payment gateways

---

## 2. System Architecture

### 2.1 High-Level Architecture

The system is built on a modular architecture with three main functional areas:

**Operations Module:**
- Certificate generation and management
- Document upload and OCR processing
- Candidate data management
- Course selection and validation

**Bookkeeping Module:**
- Invoice generation (B2B/B2C)
- Receipt and payment processing
- Vendor management
- Ledger and financial reporting
- Expense tracking

**Database Module:**
- Candidate records management
- Company and vendor data
- Financial transaction storage
- File metadata and organization

### 2.2 Technology Stack

**Frontend Technologies:**
- **React.js 18+**: Component-based UI framework with hooks
- **React Router**: Client-side routing and navigation
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation and transition library
- **React Toastify**: Notification system
- **Lucide React**: Icon library

**Backend Technologies:**
- **Flask 2.3+**: Lightweight Python web framework
- **PostgreSQL**: Primary database for structured data
- **OpenCV & Tesseract**: OCR processing for document analysis
- **Pillow**: Image manipulation and processing
- **Google Drive API**: Cloud storage integration
- **OpenAI API**: Advanced text processing (optional)

**Infrastructure:**
- **File System**: Organized directory structure for document storage
- **JSON Storage**: Configuration and session data
- **Environment Configuration**: .env-based settings management

### 2.3 Data Flow Architecture

```
User Interaction → Frontend Components → API Calls → Backend Services → Database/File System → Response → UI Update

Certificate Flow:
Upload Documents → OCR Processing → Data Extraction → Form Pre-filling → Validation → Certificate Generation → PDF Creation → Storage/Distribution

Financial Flow:
Invoice Creation → Customer Selection → Item Addition → Tax Calculation → PDF Generation → Ledger Updates → Bank Reconciliation

Data Persistence:
Frontend State → localStorage → API → Database Tables → File System → Backup/Export
```

---

## 3. Technical Implementation Details

### 3.1 Frontend Technology Stack

**Core Technologies:**
- **React.js 18+**: Component-based UI framework with modern hooks
- **React Router v6**: Client-side routing with nested routes
- **Framer Motion**: Animation and transition library for smooth UX
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **React Toastify**: Toast notification system
- **Lucide React**: Modern icon library
- **HTML5 Canvas**: Certificate rendering and PDF generation

**State Management:**
- React Hooks (useState, useEffect, useReducer) for component state
- localStorage for session persistence and form data recovery
- useReducer for complex state management (invoice generation workflow)
- URL state management for step-based navigation

**Key Frontend Modules:**
```javascript
src/
├── operations/              // Certificate generation module
│   ├── pages/
│   │   ├── certificates/    // Certificate templates (STCW, H2S, BOSIET, etc.)
│   │   ├── CoursePreview.js // Course selection interface
│   │   ├── UploadDocx.js    // Document upload with OCR
│   │   └── HomePage.jsx     // Main operations dashboard
│   └── components/          // Shared UI components
├── bookkeeping/             // Financial management module
│   ├── invoice-generation/  // Multi-step invoice creation
│   ├── payment-receipt/     // Payment processing components
│   ├── ledger-dashboard/    // Financial reporting
│   ├── periodic-ledger/     // Ledger management
│   └── ratelists-entries/   // Rate configuration
└── database/                // Data management module
    └── pages/               // Database administration
```

### 3.2 Backend Technology Stack

**Core Technologies:**
- **Flask 2.3+**: RESTful API framework with blueprint architecture
- **Python 3.8+**: Core programming language
- **PostgreSQL**: Primary database for structured data
- **OpenCV & Tesseract**: OCR processing for document analysis
- **Pillow**: Advanced image manipulation
- **Google Drive API**: Cloud storage integration
- **OpenAI API**: Enhanced text processing (optional)

**Backend Architecture:**
```python
backend/
├── app.py                    # Main Flask application with CORS
├── config.py                 # Configuration management
├── routes/                   # API blueprints
│   ├── certificate.py        # Certificate management endpoints
│   ├── candidate.py          # Candidate data management
│   ├── bookkeeping.py        # Financial operations
│   └── misc.py              # Utility endpoints
├── database/                 # Database connection and queries
│   ├── db_connection.py      # PostgreSQL connection management
│   └── routes/              # Database-specific endpoints
├── shared/                   # Shared utilities
│   ├── config.py            # Shared configuration
│   └── utils.py             # Common functions
├── ocr/                     # Document processing
│   ├── passport.py          # Passport OCR processing
│   └── preprocess.py        # Image preprocessing
└── utils/                   # Utility modules
    ├── drive.py             # Google Drive integration
    ├── file_ops.py          # File operations
    └── qr.py                # QR code generation
```

### 3.3 File Organization and Storage System

**Storage Architecture:**
The system implements a sophisticated multi-tier storage system combining database persistence with organized file storage:

```
backend/uploads/
├── temp/                           // Temporary session storage
│   └── {sessionId}/               // Individual session folders
│       ├── passport_front.jpg
│       ├── passport_back.jpg
│       ├── photo.jpg
│       └── payment_screenshot.jpg
├── images/                         // Permanent candidate storage
│   └── {firstName}_{lastName}_{passport}/  // Candidate-specific folders
│       ├── photo.jpg
│       ├── signature.png
│       ├── passport_front.jpg
│       ├── passport_back.jpg
│       ├── cdc.jpg
│       └── payment_screenshot.jpg
├── json/                          // Configuration and session data
│   ├── current_candidate_for_certificate.json  // Active candidate data
│   ├── structured_passport_data_{sessionId}.json  // OCR results
│   └── certificate_selections_for_receipt.json   // Certificate selections
└── pdfs/                          // Generated documents
    ├── certificates/              // Generated certificates
    └── invoices/                  // Generated invoices
```

**File Organization Logic:**
```python
def create_unique_candidate_folder(base_path, first_name, last_name, passport):
    """Create unique candidate folder with conflict resolution"""
    base_name = f"{first_name}_{last_name}_{passport}"
    folder_name = base_name
    counter = 1

    while os.path.exists(os.path.join(base_path, folder_name)):
        folder_name = f"{base_name}_{counter}"
        counter += 1

    folder_path = os.path.join(base_path, folder_name)
    os.makedirs(folder_path, exist_ok=True)
    return folder_path, folder_name
```

---

## 4. Core Modules

### 4.1 Operations Module (Certificate Generation)

**Functionality:**
- Document upload with drag-and-drop interface
- OCR processing for passport data extraction
- Automated form pre-filling from OCR results
- Course selection with validation
- Certificate generation with HTML5 Canvas
- PDF creation and Google Drive integration

**Key Components:**
- `UploadDocx.jsx`: Multi-file upload with progress tracking
- `CourseSelection.jsx`: Interactive course selection interface
- `DualCertificate.jsx`: STCW certificate template
- `DualCertificate2.jsx`: STSDSD certificate template
- `DualCertificate3.jsx`: H2S certificate template
- `DualCertificate4.jsx`: BOSIET certificate template

### 4.2 Bookkeeping Module (Financial Management)

**Functionality:**
- Multi-step invoice generation (B2B/B2C)
- Receipt and payment processing
- Vendor management and payments
- Ledger management with running balances
- Expense tracking and categorization
- Financial reporting and reconciliation

**Key Components:**
- `InvoiceGeneration.jsx`: 4-step invoice creation workflow
- `PaymentReceiptPage.jsx`: Payment processing dashboard
- `LedgerDashboard.jsx`: Financial reporting interface
- `RateListEntries.jsx`: Pricing configuration
- `SummaryReport.jsx`: Financial analytics

**Invoice Generation Workflow:**
```javascript
// State management for invoice creation
const initialState = {
  currentStep: 1,
  selectedInvoiceType: '',
  formData: {
    // Company details, customer info, items, etc.
  },
  particularinfoCustomers: []
};

// Step navigation with validation
const nextStep = () => {
  const errors = validateCurrentStep();
  if (errors.length === 0) {
    dispatch({ type: 'SET_CURRENT_STEP', payload: currentStep + 1 });
  }
};
```

### 4.3 Database Module (Data Management)

**Functionality:**
- Candidate records management
- Company and vendor data administration
- Financial transaction storage
- File metadata tracking
- Search and filtering capabilities

**Key Components:**
- `DatabaseDashboard.jsx`: Data management interface
- Database connection management
- CRUD operations for all entities

---

## 5. Database Structure

### 5.1 PostgreSQL Schema Overview

**Core Tables:**

**Candidates Table:**
```sql
CREATE TABLE candidates (
    id SERIAL PRIMARY KEY,
    candidate_name VARCHAR(255) UNIQUE NOT NULL,
    session_id VARCHAR(100),
    json_data JSONB,
    ocr_data JSONB,
    certificate_selections JSONB,
    is_current_candidate BOOLEAN DEFAULT FALSE,
    is_certificate_selection BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Candidate Uploads Table:**
```sql
CREATE TABLE candidate_uploads (
    id SERIAL PRIMARY KEY,
    candidate_name VARCHAR(255),
    session_id VARCHAR(100),
    file_name VARCHAR(255),
    file_type VARCHAR(50),
    file_data BYTEA,
    mime_type VARCHAR(100),
    file_size INTEGER,
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Company Details Table:**
```sql
CREATE TABLE company_details (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) UNIQUE NOT NULL,
    company_address TEXT,
    company_gst_number VARCHAR(50),
    company_state VARCHAR(100),
    bank_name VARCHAR(255),
    branch VARCHAR(255),
    ifsc_code VARCHAR(20),
    swift_code VARCHAR(20),
    account_number VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Financial Tables:**
- `b2bcustomersdetails`: B2B customer information
- `b2c_customer_details`: B2C customer information
- `ClientLedger`: Client ledger transactions
- `bank_ledger`: Bank reconciliation data
- `expense_ledger`: Expense tracking
- `vendor_payments`: Vendor payment records
- `ReceiptAmountReceived`: Receipt processing

### 5.2 Data Models

**Candidate Data Structure:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "passport": "JS123456",
  "nationality": "US",
  "dob": "1985-03-15",
  "cdcNo": "CDC789012",
  "address": "123 Maritime Street",
  "email": "john.smith@maritime.com",
  "phone": "1234567890",
  "companyName": "Ocean Shipping Ltd",
  "vendorName": "Maritime Training Center",
  "paymentStatus": "PAID",
  "candidate_folder": "John_Smith_JS123456",
  "session_id": "session-12345"
}
```

**Certificate Selection Structure:**
```json
{
  "id": "stcw_001",
  "firstName": "PRATHAM",
  "lastName": "POOJARI",
  "certificateName": "Basic Safety Training (STCW)",
  "companyName": "A SINGH",
  "amount": 0,
  "timestamp": "2025-10-16T12:30:11.809371"
}
```

---

## 7. Feature Documentation

### 7.1 Certificate Generation Workflow

**Complete Process Flow:**
1. **Document Upload**: Multi-file upload with drag-and-drop interface
2. **OCR Processing**: Automatic passport data extraction using Tesseract
3. **Form Pre-filling**: Extracted data auto-populates candidate form
4. **Data Validation**: Required field validation and format checking
5. **File Organization**: Atomic file movement to candidate-specific folders
6. **Course Selection**: Interactive course selection with validation
7. **Certificate Generation**: HTML5 Canvas-based certificate creation
8. **PDF Creation**: Base64 encoding and PDF generation
9. **Storage/Distribution**: Local storage and optional Google Drive upload

**Supported File Types:**
- Images: JPG, PNG, GIF, BMP, WebP
- Documents: PDF
- Maximum file size: 50MB per file (configurable)
- Maximum files per session: 10

**OCR Processing Pipeline:**
```python
def extract_passport_data(image_path):
    """Complete OCR processing pipeline"""
    # Load and preprocess image
    image = cv2.imread(image_path)
    processed_image = preprocess_image(image)

    # Extract text using Tesseract
    text = pytesseract.image_to_string(processed_image, lang='eng')

    # Parse structured data from text
    structured_data = parse_passport_text(text)

    # Validate extracted data
    validated_data = validate_extracted_fields(structured_data)

    return validated_data
```

### 7.2 Bookkeeping and Invoice Generation

**Invoice Creation Workflow:**
1. **Company Selection**: Choose from registered company accounts
2. **Customer Details**: B2B/B2C customer selection with auto-fill
3. **Item Specification**: Add particular information and descriptions
4. **Tax Calculation**: Automatic GST calculation (CGST/SGST)
5. **PDF Generation**: Professional invoice creation
6. **Ledger Integration**: Automatic posting to company ledgers

**Multi-Step Invoice Generation:**
```javascript
// State management for 4-step invoice process
const invoiceSteps = [
  { id: 1, title: 'Company Details', component: CompanyDetailsStep },
  { id: 2, title: 'Customer Details', component: CustomerDetailsStep },
  { id: 3, title: 'Particular Info', component: ParticularInfoStep },
  { id: 4, title: 'Invoice Types', component: InvoiceTypeStep }
];

// Step validation and navigation
const validateAndNext = () => {
  const errors = validateCurrentStep();
  if (errors.length === 0) {
    dispatch({ type: 'SET_CURRENT_STEP', payload: currentStep + 1 });
  }
};
```

### 7.3 Financial Management Features

**Ledger Management:**
- Real-time balance calculations
- Transaction categorization
- Multi-company support
- Date range filtering
- Export capabilities

**Payment Processing:**
- Receipt generation and tracking
- Vendor payment management
- Bank reconciliation
- Expense categorization
- Payment status tracking

**Reporting:**
- Company-wise financial reports
- Vendor payment summaries
- Transaction history
- GST compliance reports

### 7.4 Database Integration

**Candidate Data Management:**
- PostgreSQL-based persistent storage
- File metadata tracking
- Search and filtering capabilities
- Audit trail maintenance
- Data export functionality

**Financial Data Storage:**
- Transaction history
- Company account management
- Customer/vendor records
- Invoice and receipt tracking
- Automated backups

### 7.5 File Organization System

**Intelligent File Management:**
```python
def organize_candidate_files(candidate_data, session_id):
    """Complete file organization workflow"""
    # Create unique candidate folder
    folder_path, folder_name = create_unique_candidate_folder(
        candidate_data['firstName'],
        candidate_data['lastName'],
        candidate_data['passport']
    )

    # Move files from temp to permanent storage
    moved_files = move_files_to_candidate_folder(session_id, folder_path)

    # Update database with file locations
    update_file_metadata(candidate_data['candidate_name'], moved_files)

    # Clean up temporary session
    cleanup_temp_session(session_id)

    return folder_name, moved_files
```

**Conflict Resolution:**
- Automatic folder name collision detection
- Sequential numbering for duplicates
- Path sanitization for security
- File integrity verification

---

## 6. API Endpoints

### 6.1 Certificate Management Endpoints

#### Document Processing
**POST /upload-images**
- **Purpose**: Upload multiple images to temporary session for OCR processing
- **Request**: Multipart form data with files and session ID
- **Response**:
```json
{
  "status": "success",
  "session_id": "session-12345",
  "uploaded_files": ["photo.jpg", "passport.jpg"],
  "files_count": 2
}
```

**POST /candidate/save-candidate-data**
- **Purpose**: Save candidate form data and organize files atomically
- **Request**: JSON payload with candidate information
- **Response**:
```json
{
  "status": "success",
  "message": "Candidate data and images saved atomically",
  "candidate_name": "John_Smith_JS123456",
  "record_id": 123,
  "files_count": 6,
  "storage_type": "separate_tables"
}
```

#### Certificate Operations
**POST /certificate/save-certificate-data**
- **Purpose**: Save certificate selections for receipt processing
- **Request**: JSON with certificate details
- **Response**:
```json
{
  "status": "success",
  "message": "Certificate data saved for receipt processing",
  "data": {
    "id": "stcw_001",
    "certificateName": "Basic Safety Training (STCW)",
    "amount": 15000
  }
}
```

**GET /certificate/get-certificate-selections-for-receipt**
- **Purpose**: Retrieve certificate selections for invoicing
- **Response**: Array of certificate selections with pricing

### 6.2 Bookkeeping Endpoints

#### Company & Customer Management
**GET /bookkeeping/get-all-companies**
- **Purpose**: Retrieve all company accounts for dropdowns
- **Response**: List of companies with account details

**GET /bookkeeping/get-b2b-customers**
- **Purpose**: Get all B2B customers for invoice generation
- **Response**: Customer list with GST and contact details

**POST /bookkeeping/receipt-invoice-data**
- **Purpose**: Create receipt invoice data record
- **Request**: Invoice details with candidate and company info

#### Invoice Generation
**GET /bookkeeping/get-customer-details**
- **Purpose**: Auto-fill customer details by name
- **Query**: `name=Company Name`
- **Response**: Complete customer information

**POST /bookkeeping/receipt-amount-received**
- **Purpose**: Record payment receipt with ledger updates
- **Request**: Payment details with automatic ledger posting

#### Ledger Management
**GET /bookkeeping/company-ledger**
- **Purpose**: Get company ledger with filtering and pagination
- **Query**: `company_name=Company&start_date=2025-01-01`
- **Response**: Ledger entries with running balance

**POST /bookkeeping/upload-to-ledger**
- **Purpose**: Manual ledger entry creation
- **Request**: Transaction details with debit/credit amounts

#### Vendor Management
**GET /bookkeeping/get-all-vendors**
- **Purpose**: Retrieve vendor list for payments and services

**POST /bookkeeping/vendor-payment-entry**
- **Purpose**: Record vendor payment with bank ledger integration

**GET /bookkeeping/vendor-ledger**
- **Purpose**: Get vendor ledger with running balance

### 6.3 Database Endpoints

#### Candidate Management
**GET /candidate/get-all-candidates**
- **Purpose**: Retrieve all candidates with images from database
- **Response**: Candidate list with file metadata

**GET /candidate/search-candidates**
- **Purpose**: Search candidates by name, email, or passport
- **Query**: `q=search_term&field=firstName`

**GET /candidate/image/{candidate_id}/{image_num}**
- **Purpose**: Serve candidate images from database
- **Response**: Binary image data

#### Data Operations
**GET /candidate/get-current-candidate-for-certificate**
- **Purpose**: Get current candidate data for certificate generation
- **Response**: Latest candidate information

### 6.4 Utility Endpoints

**GET /**
- **Purpose**: Health check and system status
- **Response**: Server status and available endpoints

**POST /cleanup-expired-sessions**
- **Purpose**: Clean up old temporary session folders

**GET /list-files**
- **Purpose**: List all files in the system by category

### 6.5 Error Handling

**Standard Response Format:**
```json
{
  "status": "success|error|warning",
  "message": "Descriptive message",
  "data": {}, // Present on success
  "error": "Error message", // Present on error
  "total": 0 // Present for lists
}
```

**Common HTTP Status Codes:**
- `200 OK`: Successful operation
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate resource
- `500 Internal Server Error`: Server error

---

## 5. Data Flow and Integration

### 5.1 Complete Workflow Overview

```
1. Document Upload → 2. OCR Processing → 3. Form Completion → 
4. Data Submission → 5. Course Selection → 6. Certificate Generation → 
7. PDF Creation → 8. Drive Upload → 9. QR Code Generation
```

### 5.2 Step-by-Step Process

**Step 1: Document Upload**
```javascript
// Frontend: File upload with session management
const uploadFiles = async (files, sessionId) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  formData.append('session_id', sessionId);
  
  const response = await fetch('/upload-images', {
    method: 'POST',
    body: formData
  });
  return response.json();
};
```

**Step 2: OCR Processing**
```python
# Backend: Automatic passport data extraction
@app.route('/upload-images', methods=['POST'])
def upload_images():
    # File upload processing
    # OCR extraction
    # Data structuring
    return jsonify({"status": "success", "ocr_data": extracted_data})
```

**Step 3: Form Completion and Submission**
```javascript
// Frontend: Form submission with candidate data
const submitCandidateData = async (formData) => {
  const response = await fetch('/save-candidate-data', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(formData)
  });
  return response.json();
};
```

**Step 4: Course Selection Integration**
```javascript
// Course selection triggers certificate page navigation
const selectCourse = (courseType) => {
  localStorage.setItem('selectedCourse', courseType);
  navigate(`/certificate-${courseType.toLowerCase()}`);
};
```

**Step 5: Certificate Generation**
```javascript
// Certificate page automatically fetches current candidate data
useEffect(() => {
  fetchCurrentCandidateData();
}, []);

const fetchCurrentCandidateData = async () => {
  const response = await fetch('/get-current-candidate-for-certificate');
  const data = await response.json();
  setCandidateData(data.data);
};
```

### 5.3 Current Candidate Data System

**Single Source of Truth:**
- File: `current_candidate_for_certificate.json`
- Purpose: Contains most recently submitted candidate data
- Behavior: Overwrites with each new submission
- Access: Via `/get-current-candidate-for-certificate` endpoint

**Data Synchronization:**
```python
# Backend: Update current candidate data
def save_candidate_data():
    # Process candidate data
    # Save to current_candidate_for_certificate.json
    # Organize files into candidate folder
    return success_response
```

---

## 6. Certificate Generation

### 6.1 Canvas-Based Certificate Creation

**Technology Stack:**
- HTML5 Canvas for certificate rendering
- JavaScript for dynamic content generation
- Base64 encoding for PDF conversion

**Certificate Generation Process:**
```javascript
const generateCertificate = (candidateData) => {
  const canvas = document.getElementById('certificateCanvas');
  const ctx = canvas.getContext('2d');
  
  // Load certificate template
  const templateImage = new Image();
  templateImage.onload = () => {
    ctx.drawImage(templateImage, 0, 0);
    drawCandidateData(ctx, candidateData);
  };
  templateImage.src = certificateTemplate;
};
```

### 6.2 Field Mapping and Positioning

**Certificate Fields (5 fields displayed):**
1. **Full Name**: `firstName + lastName` at position (180, 260)
2. **Passport**: `passport` at position (340, 300)
3. **Nationality**: `nationality` at position (120, 280)
4. **Date of Birth**: `dob` at position (340, 280)
5. **CDC No.**: `cdcNo` at position (80, 320)

**Canvas Drawing Implementation:**
```javascript
const drawCandidateData = (ctx, data) => {
  const fullName = `${data.firstName} ${data.lastName}`;
  
  ctx.font = '16px Arial';
  ctx.fillStyle = '#000000';
  
  ctx.fillText(fullName, 180, 260);
  ctx.fillText(data.passport, 340, 300);
  ctx.fillText(data.nationality, 120, 280);
  ctx.fillText(data.dob, 340, 280);
  ctx.fillText(data.cdcNo, 80, 320);
};
```

### 6.3 Certificate Types and Templates

**STCW Basic Safety Training Certificate**
- File: `DualCertificate.jsx`
- Template: STCW-specific design
- Fields: Standard 5-field layout

**H2S Safety Training Certificate**
- File: `DualCertificate3.jsx`
- Template: H2S-specific design
- Fields: Standard 5-field layout

**STSDSD Verification Certificate**
- File: `DualCertificate2.jsx`
- Template: STSDSD-specific design
- Fields: Standard 5-field layout

**BOSIET Safety Training Certificate**
- File: `DualCertificate4.jsx`
- Template: BOSIET-specific design
- Fields: Standard 5-field layout

### 6.4 PDF Generation and Google Drive Integration

**PDF Creation Process:**
```javascript
const generatePDF = async (canvasElement) => {
  const imageData = canvasElement.toDataURL('image/png');
  const pdfData = await convertToPDF(imageData);
  return pdfData;
};
```

**Google Drive Upload:**
```python
# Backend: Google Drive integration
@app.route('/save-pdf', methods=['POST'])
def save_pdf():
    # Decode base64 PDF data
    # Upload to Google Drive
    # Generate shareable link
    # Return drive file information
    return jsonify({"drive_link": shareable_url})
```

---

## 7. File Structure and Organization

### 7.1 Project Directory Structure

```
VALUE_ADDED_2.0/
├── src/                           # Frontend React application
│   ├── operations/
│   │   ├── pages/
│   │   │   ├── certificates/      # Certificate generation pages
│   │   │   │   ├── DualCertificate.jsx    # STCW certificates
│   │   │   │   ├── DualCertificate2.jsx   # STSDSD certificates
│   │   │   │   ├── DualCertificate3.jsx   # H2S certificates
│   │   │   │   └── DualCertificate4.jsx   # BOSIET certificates
│   │   │   ├── CoursePreview.js   # Course selection interface
│   │   │   └── UploadDocx.js      # Document upload interface
│   │   └── components/            # Reusable UI components
│   ├── App.js                     # Main application component
│   └── index.js                   # Application entry point
├── backend/                       # Flask backend application
│   ├── app.py                     # Main Flask server
│   ├── shared/
│   │   └── utils.py              # Utility functions
│   ├── uploads/                   # File storage system
│   │   ├── temp/                 # Temporary session storage
│   │   ├── images/               # Organized candidate folders
│   │   ├── json/                 # Data storage and OCR results
│   │   └── pdfs/                 # Generated certificates
│   └── test_*.py                 # Test scripts
├── public/                        # Static assets
└── package.json                   # Node.js dependencies
```

### 7.2 File Naming Conventions

**Candidate Folders:**
- Format: `{firstName}_{lastName}_{passportNo}`
- Example: `John_Smith_JS123456`
- Conflicts: `John_Smith_JS123456_1`, `John_Smith_JS123456_2`

**Session Folders:**
- Format: `{sessionId}`
- Example: `session-1692123456789`
- Location: `backend/uploads/temp/`

**Data Files:**
- Current candidate: `current_candidate_for_certificate.json`
- OCR results: `structured_passport_data_{sessionId}.json`
- Generated PDFs: `certificate_{timestamp}.pdf`

### 7.3 Storage Locations

**Temporary Storage:**
```
backend/uploads/temp/
└── {sessionId}/
    ├── photo.jpg
    ├── signature.png
    ├── passport_front.jpg
    ├── passport_back.jpg
    ├── cdc.jpg
    ├── marksheet.pdf
    └── payment_screenshot.jpg
```

**Permanent Storage:**
```
backend/uploads/images/
└── {candidateName}_{passport}/
    ├── photo.jpg
    ├── signature.png
    ├── passport_front.jpg
    ├── passport_back.jpg
    ├── cdc.jpg
    ├── marksheet.pdf
    └── payment_screenshot.jpg
```

**Data Storage:**
```
backend/uploads/json/
├── current_candidate_for_certificate.json
└── structured_passport_data_{sessionId}.json
```

---

## 8. Configuration and Setup

### 8.1 Installation Requirements

**System Requirements:**
- Node.js 16+ for frontend development
- Python 3.8+ for backend services
- Tesseract OCR engine for document processing
- OpenCV for image processing

**Frontend Dependencies:**
```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-router-dom": "^6.0.0",
    "framer-motion": "^6.0.0",
    "tailwindcss": "^3.0.0"
  }
}
```

**Backend Dependencies:**
```python
# requirements.txt
Flask==2.3.0
opencv-python==4.8.0
pytesseract==0.3.10
Pillow==10.0.0
requests==2.31.0
numpy==1.24.0
```

### 8.2 Environment Setup Instructions

**Frontend Setup:**
```bash
# Navigate to project root
cd VALUE_ADDED_2.0

# Install dependencies
npm install

# Start development server
npm start
```

**Backend Setup:**
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Install Tesseract OCR
# Windows: Download from GitHub releases
# macOS: brew install tesseract
# Linux: sudo apt-get install tesseract-ocr

# Start Flask server
python app.py
```

### 8.3 Configuration Parameters

**Flask Configuration:**
```python
# app.py configuration
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif', 'pdf'}
```

**OCR Configuration:**
```python
# Tesseract configuration
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'  # Windows
# pytesseract.pytesseract.tesseract_cmd = '/usr/bin/tesseract'  # Linux/macOS
```

**Google Drive API Configuration:**
```python
# Google Drive integration setup
GOOGLE_DRIVE_CREDENTIALS = 'path/to/credentials.json'
DRIVE_FOLDER_ID = 'your-drive-folder-id'
```

---

## 9. Testing and Verification

### 9.1 Test Scripts and Purposes

**Integration Tests:**
- `test_course_certificate_integration.py`: Complete workflow testing
- `test_simplified_system.py`: Simplified data system verification
- `test_certificate_fields.py`: Certificate field validation

**Test Coverage:**
```python
# Example test execution
def test_complete_workflow():
    # 1. Submit candidate data
    # 2. Verify data storage
    # 3. Test course selection
    # 4. Validate certificate generation
    # 5. Check file organization
    pass
```

### 9.2 Integration Testing Procedures

**Automated Test Execution:**
```bash
# Run all integration tests
cd backend
python test_course_certificate_integration.py
python test_simplified_system.py
python test_certificate_fields.py
```

**Manual Testing Checklist:**
1. Document upload functionality
2. OCR data extraction accuracy
3. Form pre-filling from OCR results
4. Payment screenshot upload for paid candidates
5. Course selection and navigation
6. Certificate generation with correct data
7. PDF creation and download
8. Google Drive upload functionality

### 9.3 Field Validation and Error Handling

**Data Validation Rules:**
```javascript
const validateCandidateData = (data) => {
  const required = ['firstName', 'lastName', 'passport', 'nationality', 'dob', 'cdcNo'];
  const missing = required.filter(field => !data[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  return true;
};
```

**Error Handling Strategies:**
- Graceful degradation for OCR failures
- User-friendly error messages for validation failures
- Automatic retry mechanisms for network issues
- Comprehensive logging for debugging

---

## 13. Recent Updates and Changes

### 13.1 Major System Evolution: From Certificate-Only to Enterprise Solution

**Previous System (Certificate Generation Only):**
- Single-purpose certificate generation
- File-based JSON storage
- Basic document upload and OCR
- Limited scalability and reporting

**Current System (Enterprise Solution):**
- Integrated certificate generation and bookkeeping
- PostgreSQL database with structured data
- Complete financial management suite
- Multi-company support with separate ledgers
- Professional invoice generation with GST compliance

**Evolution Benefits:**
- Unified platform for maritime training centers
- Complete business workflow automation
- Financial compliance and reporting
- Scalable architecture for growth
- Professional document generation

### 13.2 Database Migration to PostgreSQL

**Migration Overview:**
- Transition from file-based JSON to relational database
- Atomic transactions for data integrity
- Concurrent access support
- Advanced querying and reporting capabilities
- Backup and recovery procedures

**Database Schema Enhancements:**
```sql
-- New tables added for enterprise functionality
CREATE TABLE company_details (...);      -- Multi-company support
CREATE TABLE b2bcustomersdetails (...);  -- B2B customer management
CREATE TABLE b2c_customer_details (...); -- B2C customer management
CREATE TABLE ClientLedger (...);        -- Financial ledger
CREATE TABLE bank_ledger (...);          -- Bank reconciliation
CREATE TABLE candidate_uploads (...);    -- File metadata storage
```

### 13.3 Bookkeeping Module Integration

**New Financial Features:**
- Multi-step invoice generation (4-step wizard)
- B2B/B2C customer management
- GST-compliant invoicing
- Real-time ledger updates
- Vendor payment processing
- Expense tracking and categorization

**Invoice Generation Workflow:**
```javascript
// Complete invoice creation process
const invoiceWorkflow = {
  step1: "Company Details",    // Account selection and auto-fill
  step2: "Customer Details",   // B2B/B2C customer selection
  step3: "Particular Info",    // Item specification
  step4: "Invoice Types"       // GST/Regular invoice selection
};
```

### 13.4 Certificate Selection for Receipt Processing

**New Certificate Selection System:**
```json
{
  "id": "stcw_001",
  "firstName": "PRATHAM",
  "lastName": "POOJARI",
  "certificateName": "Basic Safety Training (STCW)",
  "companyName": "A SINGH",
  "amount": 0,
  "timestamp": "2025-10-16T12:30:11.809371"
}
```

**Features:**
- Course-specific ID generation (stcw_001, h2s_001, etc.)
- Company-wise rate integration
- Automatic duplicate prevention
- Receipt invoice generation support

### 13.5 Enhanced File Organization

**Atomic File Operations:**
- Database-driven file metadata
- Transactional file movements
- Automatic cleanup procedures
- Conflict resolution algorithms
- Secure path sanitization

**File Storage Architecture:**
```
backend/uploads/
├── temp/{sessionId}/          # Temporary processing
├── images/{candidateName}/    # Permanent candidate files
├── json/                      # Configuration and data files
│   ├── current_candidate_for_certificate.json
│   └── certificate_selections_for_receipt.json
└── pdfs/                      # Generated documents
    ├── certificates/
    └── invoices/
```

### 13.6 Frontend Architecture Improvements

**Modular Component Structure:**
- Separate modules for Operations, Bookkeeping, Database
- Reusable component library
- State persistence with localStorage
- URL-based navigation with step management
- Responsive design with Tailwind CSS

**State Management Enhancements:**
```javascript
// Advanced state management with useReducer
const [state, dispatch] = useReducer(invoiceReducer, null, loadPersistedData);

// Automatic persistence
useEffect(() => {
  saveToLocalStorage(STORAGE_KEYS.FORM_DATA, state.formData);
}, [state.formData]);
```

### 13.7 API Architecture Modernization

**Blueprint-Based API Structure:**
```python
# Modular API organization
certificate_bp = Blueprint('certificate', __name__)
candidate_bp = Blueprint('candidate', __name__)
bookkeeping_bp = Blueprint('bookkeeping', __name__)

# Register blueprints in main app
app.register_blueprint(certificate_bp, url_prefix='/certificate')
app.register_blueprint(candidate_bp, url_prefix='/candidate')
app.register_blueprint(bookkeeping_bp, url_prefix='/bookkeeping')
```

**Enhanced Error Handling:**
- Standardized response formats
- Comprehensive error logging
- Graceful degradation strategies
- User-friendly error messages

### 13.8 Security and Performance Improvements

**Security Enhancements:**
- File upload validation and sanitization
- Path traversal protection
- SQL injection prevention with parameterized queries
- CORS configuration for cross-origin requests

**Performance Optimizations:**
- Database connection pooling
- File processing optimization
- Image compression and resizing
- Lazy loading for components
- Caching strategies for frequently accessed data

---

## Conclusion

This Maritime Certificate Generation System provides a comprehensive solution for maritime training certificate management. The system's modular architecture, simplified data management, and robust error handling make it suitable for production use in maritime training environments.

The recent updates have significantly improved system maintainability while preserving all core functionality. The simplified JSON-based data system and updated certificate field structure provide a clean, efficient foundation for certificate generation across multiple maritime training courses.

For technical support or additional information, refer to the test scripts and integration documentation provided with the system.

---

## Appendices

### Appendix A: Complete API Reference

#### A.1 Request/Response Examples

**Upload Images Example:**
```bash
curl -X POST http://localhost:5000/upload-images \
  -F "files=@photo.jpg" \
  -F "files=@passport.jpg" \
  -F "session_id=session-12345"
```

**Save Candidate Data Example:**
```bash
curl -X POST http://localhost:5000/save-candidate-data \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Smith",
    "passport": "JS123456",
    "nationality": "US",
    "dob": "1985-03-15",
    "cdcNo": "CDC789012",
    "paymentStatus": "PAID",
    "session_id": "session-12345"
  }'
```

#### A.2 Error Response Examples

**Missing Required Fields:**
```json
{
  "error": "firstName, lastName, and passport are required for file organization",
  "status": "error"
}
```

**No Current Candidate Data:**
```json
{
  "error": "No current candidate data found for certificate generation",
  "status": "error"
}
```

### Appendix B: Troubleshooting Guide

#### B.1 Common Issues and Solutions

**Issue: OCR Not Working**
- **Cause**: Tesseract not installed or incorrect path
- **Solution**: Install Tesseract and update path in configuration
- **Verification**: Run `tesseract --version` in terminal

**Issue: File Upload Fails**
- **Cause**: File size exceeds limit or unsupported format
- **Solution**: Check file size (max 16MB) and format (JPG, PNG, PDF)
- **Verification**: Check browser console for error messages

**Issue: Certificate Generation Fails**
- **Cause**: No current candidate data available
- **Solution**: Submit candidate data before generating certificates
- **Verification**: Check `/get-current-candidate-for-certificate` endpoint

#### B.2 Debug Mode Configuration

**Enable Debug Logging:**
```python
# app.py
app.config['DEBUG'] = True
import logging
logging.basicConfig(level=logging.DEBUG)
```

**Frontend Debug Mode:**
```javascript
// Enable React development mode
const DEBUG = process.env.NODE_ENV === 'development';
if (DEBUG) {
  console.log('Debug mode enabled');
}
```

### Appendix C: Performance Optimization

#### C.1 File Processing Optimization

**Image Compression:**
```python
def optimize_image(image_path, max_size=(1920, 1080)):
    with Image.open(image_path) as img:
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        img.save(image_path, optimize=True, quality=85)
```

**Batch Processing:**
```python
def process_multiple_files(file_list):
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = [executor.submit(process_file, file) for file in file_list]
        results = [future.result() for future in futures]
    return results
```

#### C.2 Frontend Performance

**Component Optimization:**
```javascript
// Use React.memo for expensive components
const CertificateCanvas = React.memo(({ candidateData }) => {
  // Canvas rendering logic
});

// Lazy loading for certificate pages
const DualCertificate = lazy(() => import('./certificates/DualCertificate'));
```

### Appendix D: Security Considerations

#### D.1 File Upload Security

**File Validation:**
```python
def validate_file(file):
    # Check file extension
    if not allowed_file(file.filename):
        raise ValueError("File type not allowed")

    # Check file size
    if len(file.read()) > MAX_FILE_SIZE:
        raise ValueError("File too large")

    # Reset file pointer
    file.seek(0)
    return True
```

**Path Sanitization:**
```python
def sanitize_folder_name(name):
    # Remove dangerous characters
    sanitized = re.sub(r'[<>:"/\\|?*]', '_', name)
    # Limit length
    return sanitized[:50]
```

#### D.2 Data Protection

**Sensitive Data Handling:**
- Passport numbers and personal information encrypted at rest
- Session-based temporary storage with automatic cleanup
- No persistent storage of payment information

### Appendix E: Deployment Guide

#### E.1 Production Deployment

**Docker Configuration:**
```dockerfile
# Dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

# Install Tesseract
RUN apt-get update && apt-get install -y tesseract-ocr

COPY . .
EXPOSE 5000

CMD ["python", "app.py"]
```

**Environment Variables:**
```bash
# .env file
FLASK_ENV=production
GOOGLE_DRIVE_CREDENTIALS_PATH=/path/to/credentials.json
UPLOAD_FOLDER=/app/uploads
MAX_FILE_SIZE=16777216
```

#### E.2 Monitoring and Logging

**Application Monitoring:**
```python
import logging
from logging.handlers import RotatingFileHandler

# Configure logging
handler = RotatingFileHandler('app.log', maxBytes=10000000, backupCount=3)
handler.setFormatter(logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
))
app.logger.addHandler(handler)
app.logger.setLevel(logging.INFO)
```

**Health Check Endpoint:**
```python
@app.route('/health')
def health_check():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0",
        "services": {
            "ocr": check_tesseract_availability(),
            "storage": check_storage_availability(),
            "drive": check_drive_connectivity()
        }
    })
```

---

*Document Version: 2.0*
*Last Updated: October 16, 2025*
*System Version: VALUE_ADDED_2.0*
*Total Pages: 65*

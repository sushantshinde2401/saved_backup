// Common constants used across bookkeeping modules
export const INVOICE_TYPES = {
  GST: 'gst',
  REGULAR: 'regular'
};

export const CUSTOMER_TYPES = {
  B2B: 'B2B',
  B2C: 'B2C'
};

export const TAX_RATES = {
  CGST: 9,
  SGST: 9,
  IGST: 18
};

export const API_ENDPOINTS = {
  GET_COMPANY_ACCOUNTS: 'http://localhost:5000/api/bookkeeping/get-company-accounts',
  GET_ALL_COMPANIES: 'http://localhost:5000/api/bookkeeping/get-all-companies',
  GET_ALL_VENDORS: 'http://localhost:5000/api/bookkeeping/get-all-vendors',
  GET_COMPANY_DETAILS: 'http://localhost:5000/api/bookkeeping/get-company-details',
  GET_CUSTOMER_DETAILS: 'http://localhost:5000/api/bookkeeping/get-customer-details',
  GET_B2B_CUSTOMERS: 'http://localhost:5000/api/bookkeeping/get-b2b-customers',
  GET_B2B_CUSTOMER: 'http://localhost:5000/api/bookkeeping/get-b2b-customer',
  RECEIPT_AMOUNT_RECEIVED: 'http://localhost:5000/api/bookkeeping/receipt-amount-received',
  UPLOAD_TO_LEDGER: 'http://localhost:5000/api/bookkeeping/upload-to-ledger',
  VENDOR_SERVICE_ENTRY: 'http://localhost:5000/api/bookkeeping/vendor-service-entry',
  VENDOR_PAYMENT_ENTRY: 'http://localhost:5000/api/bookkeeping/vendor-payment-entry',
  GET_VENDOR_LEDGER: 'http://localhost:5000/api/bookkeeping/vendor-ledger',
  GET_COMPANY_LEDGER: 'http://localhost:5000/api/bookkeeping/company-ledger',
  GET_BANK_LEDGER: 'http://localhost:5000/api/bookkeeping/bank-ledger-report',
  // Delete endpoints
  DELETE_VENDOR_SERVICE: 'http://localhost:5000/api/bookkeeping/vendor-service',
  DELETE_VENDOR_PAYMENT: 'http://localhost:5000/api/bookkeeping/vendor-payment'
};

export const NAVIGATION_ROUTES = {
  DASHBOARD: '/bookkeeping',
  INVOICE_GENERATION: '/bookkeeping/invoice-generation',
  PAYMENT_RECEIPT: '/bookkeeping/payment-receipt',
  PERIODIC_LEDGER: '/bookkeeping/periodic-ledger',
  SUMMARY_REPORT: '/bookkeeping/summary-report',
  RATELISTS_ENTRIES: '/bookkeeping/ratelists-entries',
  TAX_INVOICE: '/bookkeeping/tax-invoice'
};
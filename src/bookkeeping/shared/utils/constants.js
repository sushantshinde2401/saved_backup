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
  GET_COMPANY_ACCOUNTS: 'http://localhost:5000/get-company-accounts',
  GET_COMPANY_DETAILS: 'http://localhost:5000/get-company-details',
  GET_B2B_CUSTOMERS: 'http://localhost:5000/get-b2b-customers',
  GET_B2B_CUSTOMER: 'http://localhost:5000/get-b2b-customer'
};

export const NAVIGATION_ROUTES = {
  DASHBOARD: '/bookkeeping',
  INVOICE_GENERATION: '/bookkeeping/invoice-generation',
  PAYMENT_RECEIPT: '/bookkeeping/payment-receipt',
  COMPANIES_LEDGER: '/bookkeeping/companies-ledger',
  PERIODIC_LEDGER: '/bookkeeping/periodic-ledger',
  SUMMARY_REPORT: '/bookkeeping/summary-report',
  RATELISTS_ENTRIES: '/bookkeeping/ratelists-entries',
  TAX_INVOICE: '/bookkeeping/tax-invoice'
};
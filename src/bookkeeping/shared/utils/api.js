// Common API utilities for bookkeeping modules
import { API_ENDPOINTS } from './constants';

// Generic fetch wrapper with error handling
export const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Company-related API calls
export const getCompanyAccounts = async () => {
  return apiRequest(API_ENDPOINTS.GET_COMPANY_ACCOUNTS);
};

export const getAllCompanies = async () => {
  return apiRequest(API_ENDPOINTS.GET_ALL_COMPANIES);
};

export const getAllVendors = async () => {
  return apiRequest(API_ENDPOINTS.GET_ALL_VENDORS);
};

export const getCompanyDetails = async (accountNumber) => {
  return apiRequest(`${API_ENDPOINTS.GET_COMPANY_DETAILS}/${accountNumber}`);
};

export const getCustomerDetails = async (customerName) => {
  return apiRequest(`${API_ENDPOINTS.GET_CUSTOMER_DETAILS}?name=${encodeURIComponent(customerName)}`);
};

// Customer-related API calls
export const getB2BCustomers = async () => {
  return apiRequest(API_ENDPOINTS.GET_B2B_CUSTOMERS);
};

export const getB2BCustomer = async (customerId) => {
  return apiRequest(`${API_ENDPOINTS.GET_B2B_CUSTOMER}/${customerId}`);
};

// Utility functions for data formatting
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-GB');
};

export const calculateTax = (amount, rate) => {
  return (amount * rate) / 100;
};

export const calculateTotal = (subtotal, cgst, sgst) => {
  return subtotal + cgst + sgst;
};

// Ledger-related API calls
export const uploadToLedger = async (ledgerData) => {
  return apiRequest(API_ENDPOINTS.UPLOAD_TO_LEDGER, {
    method: 'POST',
    body: JSON.stringify(ledgerData)
  });
};

// Receipt amount received API call
export const createReceiptAmountReceived = async (receiptData) => {
  return apiRequest(API_ENDPOINTS.RECEIPT_AMOUNT_RECEIVED, {
    method: 'POST',
    body: JSON.stringify(receiptData)
  });
};

// Vendor service entry API call
export const createVendorServiceEntry = async (serviceData) => {
  return apiRequest(API_ENDPOINTS.VENDOR_SERVICE_ENTRY, {
    method: 'POST',
    body: JSON.stringify(serviceData)
  });
};

// Vendor payment entry API call
export const createVendorPaymentEntry = async (paymentData) => {
  return apiRequest(API_ENDPOINTS.VENDOR_PAYMENT_ENTRY, {
    method: 'POST',
    body: JSON.stringify(paymentData)
  });
};

// Get vendor ledger API call
export const getVendorLedger = async (vendorId, params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const url = `${API_ENDPOINTS.GET_VENDOR_LEDGER}/${vendorId}${queryParams ? '?' + queryParams : ''}`;
  return apiRequest(url);
};

// Get bank ledger API call
export const getBankLedger = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const url = `${API_ENDPOINTS.GET_BANK_LEDGER}${queryParams ? '?' + queryParams : ''}`;
  return apiRequest(url);
};
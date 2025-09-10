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

export const getCompanyDetails = async (accountNumber) => {
  return apiRequest(`${API_ENDPOINTS.GET_COMPANY_DETAILS}/${accountNumber}`);
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
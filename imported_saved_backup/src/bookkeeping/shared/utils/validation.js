// Common validation utilities for bookkeeping modules
import { CUSTOMER_TYPES } from './constants';

// Validation functions for different form steps
export const validateCompanyDetails = (formData) => {
  const errors = [];

  if (!formData.companyAccountNumber?.trim()) {
    errors.push('Company Account Number is required');
  }

  if (!formData.companyName?.trim()) {
    errors.push('Company Name is required');
  }

  return errors;
};

export const validateCustomerDetails = (formData) => {
  const errors = [];

  if (formData.customerType === CUSTOMER_TYPES.B2B) {
    if (!formData.selectedB2BCustomer) {
      errors.push('B2B Customer selection is required');
    }
    if (!formData.b2bCustomerGstNumber?.trim()) {
      errors.push('GST Number is required for B2B');
    }
    if (!formData.b2bPhoneNumber?.trim()) {
      errors.push('Phone Number is required for B2B');
    }
    if (!formData.b2bCustomerAddress?.trim()) {
      errors.push('Address is required for B2B');
    }
    if (!formData.b2bEmail?.trim()) {
      errors.push('Email is required for B2B');
    }
  } else if (formData.customerType === CUSTOMER_TYPES.B2C) {
    if (!formData.b2cFullName?.trim()) {
      errors.push('Full Name is required for B2C');
    }
    if (!formData.b2cPhoneNumber?.trim()) {
      errors.push('Phone Number is required for B2C');
    }
    if (!formData.b2cAddress?.trim()) {
      errors.push('Address is required for B2C');
    }
    if (!formData.b2cCity?.trim()) {
      errors.push('City is required for B2C');
    }
    if (!formData.b2cState?.trim()) {
      errors.push('State is required for B2C');
    }
    if (!formData.b2cPincode?.trim()) {
      errors.push('Pincode is required for B2C');
    }
  }

  return errors;
};

export const validateParticulars = (particularinfoCustomers) => {
  const errors = [];

  const hasValidCustomer = particularinfoCustomers.some(customer =>
    customer.name.trim() !== '' && customer.items.some(item => item.trim() !== '')
  );

  if (!hasValidCustomer) {
    errors.push('At least one customer with name and items is required');
  }

  return errors;
};

export const validateInvoiceType = (selectedInvoiceType) => {
  const errors = [];

  if (!selectedInvoiceType) {
    errors.push('Please select an invoice type');
  }

  return errors;
};

// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation
export const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// GST number validation (basic)
export const isValidGSTNumber = (gst) => {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gst);
};

// Generic required field validation
export const isRequired = (value) => {
  return value !== null && value !== undefined && String(value).trim() !== '';
};
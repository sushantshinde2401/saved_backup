import React, { useState, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  Circle,
  ChevronRight,
  Building,
  Users,
  Receipt,
  FileCheck,
  Eye,
  CheckCircle2,
  Loader,
  X,
  Truck,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_ENDPOINTS } from '../../../shared/utils';

// Import step components
import OrgInfoStep from './steps pages/OrgInfoStep';
import ClientInfoStep from './steps pages/ClientInfoStep';
import BillingInfoStep from './steps pages/BillingInfoStep';
import InvoiceDetailsStep from './steps pages/InvoiceDetailsStep';
import FinalizeStep from './steps pages/FinalizeStep';
import PreviewDownloadStep from './steps pages/PreviewDownloadStep';

// Initial state
const initialState = {
  currentStep: 1,
  formData: {
    // Step 1: Organization Info (from CompanyDetailsStep)
    companyAccountNumber: '',
    companyName: '',
    gstNumber: '',
    companyAddress: '',
    stateCode: '',
    bankName: '',
    branch: '',
    ifscCode: '',
    swiftCode: '',

    // Step 2: Client Info (from CustomerDetailsStep)
    customerType: 'B2B',
    selectedB2BCustomer: '',
    selectedB2BCustomerName: '',
    b2bCustomerGstNumber: '',
    b2bCustomerAddress: '',
    b2bPhoneNumber: '',
    b2bCustomerStateCode: '',
    b2bEmail: '',
    b2cFullName: '',
    b2cPhoneNumber: '',
    b2cEmail: '',
    b2cAddress: '',
    b2cCity: '',
    b2cState: '',
    b2cPincode: '',
    b2cDateOfBirth: '',
    b2cGender: '',

    // Step 3: Billing Info
    partyName: '',
    invoiceNumber: '',
    dateReceived: '',
    amountReceived: '',
    applyGST: false,
    paymentType: '',
    selectedCourses: [],
    deliveryNote: '',
    dispatchDocNo: '',
    deliveryNoteDate: '',
    dispatchThrough: '',
    destination: '',
    termsOfDelivery: ''
  },
  companyAccounts: [],
  customers: [],
  availableCertificates: [],
  rateData: {},
  loadingCompanyDetails: false,
  savedInvoiceData: null, // Store the saved invoice data from steps 1-4
  savedReceiptData: null,   // Store the saved receipt data from step 6
  isUploadingInvoice: false, // Loading state for invoice data upload
  isUploadingReceipt: false  // Loading state for receipt data upload
};

// Reducer function
function stepperReducer(state, action) {
  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    case 'UPDATE_FORM_DATA':
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.field]: action.value
        }
      };
    case 'SET_COMPANY_ACCOUNTS':
      return { ...state, companyAccounts: action.payload };
    case 'SET_CUSTOMERS':
      return { ...state, customers: action.payload };
    case 'SET_AVAILABLE_CERTIFICATES':
      return { ...state, availableCertificates: action.payload };
    case 'SET_RATE_DATA':
      return { ...state, rateData: action.payload };
    case 'SET_LOADING_COMPANY_DETAILS':
      return { ...state, loadingCompanyDetails: action.payload };
    case 'SET_SAVED_INVOICE_DATA':
      return { ...state, savedInvoiceData: action.payload };
    case 'SET_SAVED_RECEIPT_DATA':
      return { ...state, savedReceiptData: action.payload };
    case 'SET_UPLOADING_INVOICE':
      return { ...state, isUploadingInvoice: action.payload };
    case 'SET_UPLOADING_RECEIPT':
      return { ...state, isUploadingReceipt: action.payload };
    case 'CLEAR_ALL_DATA':
      return initialState;
    default:
      return state;
  }
}

function NewStepper() {
  const navigate = useNavigate();

  // Load initial state from localStorage
  const loadInitialState = () => {
    const saved = localStorage.getItem('newStepperState');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved stepper state:', e);
        return initialState;
      }
    }
    return initialState;
  };

  const [state, dispatch] = useReducer(stepperReducer, loadInitialState());

  // Steps configuration
  const steps = [
    { id: 1, title: 'Org Info', icon: Building, description: 'Organization details' },
    { id: 2, title: 'Client Info', icon: Users, description: 'Client information' },
    { id: 3, title: 'Billing Info', icon: Receipt, description: 'Billing configuration' },
    { id: 4, title: 'Invoice Details', icon: Truck, description: 'Delivery & dispatch info' },
    { id: 5, title: 'Finalize', icon: Eye, description: 'Finalize & upload' },
    { id: 6, title: 'Preview & Download', icon: FileText, description: 'Preview and download invoice' }
  ];

  // Load data on component mount
  useEffect(() => {
    loadCompanyAccounts();
    loadCustomers();
    loadAvailableCertificates();
    loadRateData();
  }, []);

  // Save state to localStorage on every change
  useEffect(() => {
    localStorage.setItem('newStepperState', JSON.stringify(state));
  }, [state]);

  // Load company accounts
  const loadCompanyAccounts = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.GET_COMPANY_ACCOUNTS);
      if (response.ok) {
        const result = await response.json();
        dispatch({ type: 'SET_COMPANY_ACCOUNTS', payload: result.data || [] });
      }
    } catch (error) {
      console.error('Error loading company accounts:', error);
    }
  };

  // Load customers
  const loadCustomers = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.GET_B2B_CUSTOMERS);
      if (response.ok) {
        const result = await response.json();
        dispatch({ type: 'SET_CUSTOMERS', payload: result.data || [] });
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  // Load available certificates
  const loadAvailableCertificates = async () => {
    try {
      const response = await fetch('http://localhost:5000/get-certificate-selections-for-receipt');
      if (response.ok) {
        const result = await response.json();
        dispatch({ type: 'SET_AVAILABLE_CERTIFICATES', payload: result.data || [] });
      }
    } catch (error) {
      console.error('Error loading certificates:', error);
    }
  };

  // Load rate data
  const loadRateData = () => {
    const savedRates = JSON.parse(localStorage.getItem('courseRates') || '{}');
    dispatch({ type: 'SET_RATE_DATA', payload: savedRates });
  };

  // Load company details when account number changes
  const loadCompanyDetails = async (accountNumber) => {
    if (!accountNumber) return;

    dispatch({ type: 'SET_LOADING_COMPANY_DETAILS', payload: true });
    try {
      const response = await fetch(`${API_ENDPOINTS.GET_COMPANY_DETAILS}/${accountNumber}`);
      if (response.ok) {
        const result = await response.json();
        const companyData = result.data;

        const fieldsToUpdate = {
          companyName: companyData.company_name || '',
          gstNumber: companyData.company_gst_number || '',
          companyAddress: companyData.company_address || '',
          bankName: companyData.bank_name || '',
          branch: companyData.branch || '',
          ifscCode: companyData.ifsc_code || '',
          swiftCode: companyData.swift_code || '',
          stateCode: state.formData.stateCode
        };

        Object.keys(fieldsToUpdate).forEach(field => {
          dispatch({ type: 'UPDATE_FORM_DATA', field, value: fieldsToUpdate[field] });
        });
      }
    } catch (error) {
      console.error('Error loading company details:', error);
    } finally {
      dispatch({ type: 'SET_LOADING_COMPANY_DETAILS', payload: false });
    }
  };

  // Load B2B customer details
  const loadB2BCustomerDetails = async (customerId) => {
    if (!customerId) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.GET_B2B_CUSTOMER}/${customerId}`);
      if (response.ok) {
        const result = await response.json();
        const customerData = result.data;

        const b2bFields = {
          b2bCustomerGstNumber: customerData.gst_number || '',
          b2bCustomerAddress: `${customerData.address || ''}${customerData.city ? ', ' + customerData.city : ''}${customerData.state ? ', ' + customerData.state : ''}${customerData.pincode ? ' - ' + customerData.pincode : ''}`.trim(),
          b2bPhoneNumber: customerData.phone_number || '',
          b2bCustomerStateCode: customerData.state_code || '',
          b2bEmail: customerData.email || ''
        };

        Object.keys(b2bFields).forEach(field => {
          dispatch({ type: 'UPDATE_FORM_DATA', field, value: b2bFields[field] });
        });
      }
    } catch (error) {
      console.error('Error loading B2B customer details:', error);
    }
  };

  // Update certificates with selected company name
  const updateCertificatesWithCompany = async (companyName) => {
    if (!companyName) return;

    try {
      // First get all certificates
      const response = await fetch('http://localhost:5000/get-certificate-selections-for-receipt');
      if (response.ok) {
        const result = await response.json();
        const certificates = result.data || [];

        // Get certificate IDs that need updating (those without companyName or with empty companyName)
        const certificateIdsToUpdate = certificates
          .filter(cert => !cert.companyName || cert.companyName.trim() === '')
          .map(cert => cert.id);

        if (certificateIdsToUpdate.length > 0) {
          // Update certificates with company name and rate data
          const updateResponse = await fetch('http://localhost:5000/update-certificate-company-data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              certificateIds: certificateIdsToUpdate,
              companyName: companyName,
              rateData: state.rateData
            }),
          });

          if (updateResponse.ok) {
            const updateResult = await updateResponse.json();
            console.log(`[INVOICE] Updated ${updateResult.updated_count} certificates with company: ${companyName}`);

            // Reload available certificates to reflect the changes
            loadAvailableCertificates();
          } else {
            console.error('[INVOICE] Failed to update certificates with company data');
          }
        }
      }
    } catch (error) {
      console.error('[INVOICE] Error updating certificates with company:', error);
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    dispatch({ type: 'UPDATE_FORM_DATA', field, value });

    // Auto-load company details
    if (field === 'companyAccountNumber') {
      loadCompanyDetails(value);
    }

    // Auto-load B2B customer details and set party name
    if (field === 'selectedB2BCustomer' && value) {
      const selectedCustomer = state.customers.find(customer => customer.id.toString() === value.toString());
      if (selectedCustomer) {
        const customerName = selectedCustomer.company_name || '';
        dispatch({ type: 'UPDATE_FORM_DATA', field: 'selectedB2BCustomerName', value: customerName });
        // Automatically set party name to the selected B2B customer name
        dispatch({ type: 'UPDATE_FORM_DATA', field: 'partyName', value: customerName });

        // Update certificates with the selected company name
        updateCertificatesWithCompany(customerName);
      }
      loadB2BCustomerDetails(value);
    }

    // Handle customer type change
    if (field === 'customerType') {
      if (value === 'B2B') {
        const b2cFields = ['b2cFullName', 'b2cPhoneNumber', 'b2cEmail', 'b2cAddress', 'b2cCity', 'b2cState', 'b2cPincode', 'b2cDateOfBirth', 'b2cGender'];
        b2cFields.forEach(f => dispatch({ type: 'UPDATE_FORM_DATA', field: f, value: '' }));
      } else if (value === 'B2C') {
        const b2bFields = ['selectedB2BCustomer', 'selectedB2BCustomerName', 'b2bCustomerGstNumber', 'b2bCustomerAddress', 'b2bPhoneNumber', 'b2bCustomerStateCode', 'b2bEmail'];
        b2bFields.forEach(f => dispatch({ type: 'UPDATE_FORM_DATA', field: f, value: '' }));
        // Clear party name when switching to B2C
        dispatch({ type: 'UPDATE_FORM_DATA', field: 'partyName', value: '' });
      }
    }
  };

  // Navigation functions
  const nextStep = async () => {
    if (state.currentStep < 6) {
      // Check if data upload is required and completed before proceeding
      if (state.currentStep === 5 && !state.savedInvoiceData) {
        toast.error('Please upload the invoice data before proceeding to the next step.');
        return;
      }

      dispatch({ type: 'SET_CURRENT_STEP', payload: state.currentStep + 1 });
    }
  };

  const prevStep = () => {
    if (state.currentStep > 1) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: state.currentStep - 1 });
    }
  };

  const goToStep = (stepId) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: stepId });
  };

  // Validation for each step
  const validateCurrentStep = () => {
    const errors = [];

    switch (state.currentStep) {
      case 1:
        if (!state.formData.companyAccountNumber) errors.push('Company Account Number is required');
        if (!state.formData.companyName) errors.push('Company Name is required');
        break;
      case 2:
        if (state.formData.customerType === 'B2B') {
          if (!state.formData.selectedB2BCustomer) errors.push('B2B Customer selection is required');
        } else if (state.formData.customerType === 'B2C') {
          if (!state.formData.b2cFullName) errors.push('Full Name is required for B2C');
          if (!state.formData.b2cPhoneNumber) errors.push('Phone Number is required for B2C');
          if (!state.formData.b2cAddress) errors.push('Address is required for B2C');
        }
        break;
      case 3:
        if (!state.formData.invoiceNumber) errors.push('Invoice Number is required');
        if (!state.formData.dateReceived) errors.push('Date Received is required');
        if (!state.formData.selectedCourses || state.formData.selectedCourses.length === 0) {
          errors.push('At least one course must be selected');
        }
        break;
      case 4:
        // InvoiceDetails step - no validation needed, just proceed
        break;
      case 5:
        // Finalize step - no validation needed, just proceed
        break;
      case 6:
        // Preview & Download step - no validation needed, just proceed
        break;
      default:
        break;
    }

    return errors;
  };

  // Get current candidate ID from the most recent candidate
  const getCurrentCandidateId = async () => {
    try {
      // Get all candidates and return the most recent one
      const response = await fetch('http://localhost:5000/candidate/get-all-candidates');
      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success' && result.data && result.data.length > 0) {
          // Return the most recent candidate's ID (first in the list since ordered by created_at DESC)
          const mostRecentCandidate = result.data[0];
          return mostRecentCandidate.id;
        }
      }
    } catch (error) {
      console.warn('Failed to get current candidate ID:', error);
    }
    throw new Error('No candidates found');
  };

  // Get or create candidate ID based on customer type
  const getCandidateId = async () => {
    try {
      if (state.formData.customerType === 'B2C') {
        // For B2C, try to search for existing candidate first
        if (state.formData.b2cPhoneNumber) {
          try {
            const searchResponse = await fetch(`http://localhost:5000/candidate/search-candidates?q=${encodeURIComponent(state.formData.b2cPhoneNumber)}&field=phone`);
            if (searchResponse.ok) {
              const searchResult = await searchResponse.json();
              if (searchResult.data && searchResult.data.length > 0) {
                console.log('Found existing candidate:', searchResult.data[0]);
                return searchResult.data[0].candidate_id || searchResult.data[0].id;
              }
            }
          } catch (searchError) {
            console.warn('Search failed, proceeding to create:', searchError);
          }
        }

        // Create new candidate if not found
        const candidateData = {
          firstName: state.formData.b2cFullName || 'Unknown',
          lastName: '',
          passport: state.formData.b2cPhoneNumber || `B2C_${Date.now()}`, // Unique identifier
          dob: state.formData.b2cDateOfBirth || '',
          email: state.formData.b2cEmail || '',
          phone: state.formData.b2cPhoneNumber || '',
          address: state.formData.b2cAddress || '',
          city: state.formData.b2cCity || '',
          state: state.formData.b2cState || '',
          pincode: state.formData.b2cPincode || '',
          gender: state.formData.b2cGender || ''
        };

        const response = await fetch('http://localhost:5000/candidate/save-candidate-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(candidateData),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Created new candidate:', result);
          return result.candidate_id;
        } else {
          const errorText = await response.text();
          console.error('Candidate creation failed:', response.status, errorText);
          throw new Error(`Failed to create candidate: ${response.status} ${errorText}`);
        }
      } else if (state.formData.customerType === 'B2B') {
        // For B2B, try to search for existing candidate first
        if (state.formData.selectedB2BCustomerName) {
          try {
            const searchResponse = await fetch(`http://localhost:5000/candidate/search-candidates?q=${encodeURIComponent(state.formData.selectedB2BCustomerName)}&field=firstName`);
            if (searchResponse.ok) {
              const searchResult = await searchResponse.json();
              if (searchResult.data && searchResult.data.length > 0) {
                console.log('Found existing B2B candidate:', searchResult.data[0]);
                return searchResult.data[0].candidate_id || searchResult.data[0].id;
              }
            }
          } catch (searchError) {
            console.warn('B2B search failed:', searchError);
          }
        }

        // For B2B, use the current candidate ID instead of creating new
        console.log('No existing candidate found for B2B customer, using current candidate ID');
        return await getCurrentCandidateId();
      }
    } catch (error) {
      console.error('Error in getCandidateId:', error);
      throw error;
    }
  };

  // Save Steps 1-4 data to ReceiptInvoiceData table
  const saveInvoiceData = async () => {
    dispatch({ type: 'SET_UPLOADING_INVOICE', payload: true });
    try {
      // Get dynamic candidate ID
      const candidateId = await getCandidateId();

      // Calculate GST if applied
      const baseAmount = parseFloat(state.formData.amountReceived) || 0;
      const gstRate = 0.18; // 18% GST
      const gstAmount = state.formData.applyGST ? baseAmount * gstRate : 0;
      const cgstAmount = state.formData.applyGST ? gstAmount / 2 : 0; // 9% CGST
      const sgstAmount = state.formData.applyGST ? gstAmount / 2 : 0; // 9% SGST
      const finalAmount = baseAmount + gstAmount;

      // Resolve selected courses to full objects
      const resolvedCourses = (state.formData.selectedCourses || []).map(id =>
        state.availableCertificates.find(cert => cert.id === id)
      ).filter(Boolean);

      // Prepare data for ReceiptInvoiceData table
      const invoiceData = {
        invoice_no: state.formData.invoiceNumber,
        candidate_id: candidateId,
        company_name: state.formData.companyName,
        company_account_number: state.formData.companyAccountNumber,
        customer_name: state.formData.customerType === 'B2B' ? state.formData.selectedB2BCustomerName : state.formData.b2cFullName,
        customer_phone: state.formData.customerType === 'B2B' ? state.formData.b2bPhoneNumber : state.formData.b2cPhoneNumber,
        party_name: state.formData.partyName,
        invoice_date: state.formData.dateReceived,
        amount: baseAmount,
        gst: gstAmount,
        gst_applied: state.formData.applyGST, // Boolean flag
        cgst: cgstAmount,
        sgst: sgstAmount,
        final_amount: finalAmount,
        selected_courses: resolvedCourses,
        delivery_note: state.formData.deliveryNote || '',
        dispatch_doc_no: state.formData.dispatchDocNo || '',
        delivery_date: state.formData.deliveryNoteDate || null,
        dispatch_through: state.formData.dispatchThrough || '',
        destination: state.formData.destination || '',
        terms_of_delivery: state.formData.termsOfDelivery || ''
      };

      console.log('Sending invoice data:', invoiceData);

      const response = await fetch('http://localhost:5000/api/bookkeeping/receipt-invoice-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      if (response.ok) {
        const result = await response.json();
        dispatch({ type: 'SET_SAVED_INVOICE_DATA', payload: result.data });
        toast.success('Invoice data saved successfully!');
        return result.data;
      } else {
        const errorText = await response.text();
        console.error('Invoice save failed:', response.status, errorText);
        throw new Error(`Failed to save invoice data: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('Error saving invoice data:', error);
      toast.error(`Error saving invoice data: ${error.message}`);
      throw error;
    } finally {
      dispatch({ type: 'SET_UPLOADING_INVOICE', payload: false });
    }
  };

  // Save Step 6 data to ReceiptAmountReceived table
  const saveReceiptData = async () => {
    dispatch({ type: 'SET_UPLOADING_RECEIPT', payload: true });
    try {
      // Get dynamic candidate ID
      const candidateId = await getCandidateId();

      // Prepare data for ReceiptAmountReceived table
      const receiptData = {
        candidate_id: candidateId,
        amount_received: parseFloat(state.formData.amountReceived) || 0,
        payment_type: state.formData.paymentType || '',
        transaction_date: state.formData.dateReceived,
        invoice_reference: state.formData.invoiceNumber,
        remark: state.formData.deliveryNote || '', // Using deliveryNote as remark
        customer_name: state.formData.customerType === 'B2B' ? state.formData.selectedB2BCustomerName : state.formData.b2cFullName
      };

      console.log('Sending receipt data:', receiptData);

      const response = await fetch('http://localhost:5000/api/bookkeeping/receipt-amount-received', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(receiptData),
      });

      if (response.ok) {
        const result = await response.json();
        dispatch({ type: 'SET_SAVED_RECEIPT_DATA', payload: result.data });
        toast.success('Receipt data saved successfully!');
        return result.data;
      } else {
        const errorText = await response.text();
        console.error('Receipt save failed:', response.status, errorText);
        throw new Error(`Failed to save receipt data: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('Error saving receipt data:', error);
      toast.error(`Error saving receipt data: ${error.message}`);
      throw error;
    } finally {
      dispatch({ type: 'SET_UPLOADING_RECEIPT', payload: false });
    }
  };

  // Clear all data function
  const clearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This will reset the stepper to step 1 and clear all entered information.')) {
      // Reset to step 1
      dispatch({ type: 'SET_CURRENT_STEP', payload: 1 });

      // Clear form data but preserve loaded reference data (company accounts, customers, etc.)
      Object.keys(initialState.formData).forEach(field => {
        dispatch({ type: 'UPDATE_FORM_DATA', field, value: initialState.formData[field] });
      });

      // Clear saved data states
      dispatch({ type: 'SET_SAVED_INVOICE_DATA', payload: null });
      dispatch({ type: 'SET_SAVED_RECEIPT_DATA', payload: null });

      localStorage.removeItem('newStepperState');
      toast.info('All data has been cleared and stepper reset.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 p-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/bookkeeping/payment-receipt')}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Payment/Receipt Entries
          </button>
          <button
            onClick={clearData}
            title="Clear all data and reset stepper"
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-600/30 rounded-lg transition-colors text-white"
          >
            <Trash2 className="w-4 h-4" />
            Clear Data
          </button>
          <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-green-300" />
              <div>
                <h1 className="text-2xl font-bold text-white">New Invoice Stepper</h1>
                <p className="text-green-200 text-sm">Create invoice with 7-step process</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full p-6">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
          {/* Progress Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Create New Invoice</h2>
              <span className="text-green-100 text-sm">Step {state.currentStep} of 6</span>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center space-x-4 overflow-x-auto">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <motion.div
                    className={`flex items-center space-x-2 cursor-pointer ${state.currentStep >= step.id ? 'text-white' : 'text-green-200'} hover:text-white transition-colors`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => goToStep(step.id)}
                  >
                    <div className={`p-2 rounded-full transition-all duration-200 ${state.currentStep >= step.id ? 'bg-white text-green-600 hover:bg-green-100' : 'bg-green-500 text-green-100 hover:bg-green-400'}`}>
                      {state.currentStep > step.id ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <step.icon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="hidden sm:block">
                      <p className="font-semibold text-sm">{step.title}</p>
                      <p className="text-xs opacity-75">{step.description}</p>
                    </div>
                  </motion.div>
                  {index < steps.length - 1 && (
                    <ChevronRight className={`w-5 h-5 ${state.currentStep > step.id ? 'text-white' : 'text-green-300'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {state.currentStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <OrgInfoStep
                    formData={state.formData}
                    onInputChange={handleInputChange}
                    loadingCompanyDetails={state.loadingCompanyDetails}
                    companyAccounts={state.companyAccounts}
                  />
                </motion.div>
              )}

              {state.currentStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <ClientInfoStep
                    formData={state.formData}
                    onInputChange={handleInputChange}
                    customers={state.customers}
                  />
                </motion.div>
              )}

              {state.currentStep === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <BillingInfoStep
                    formData={state.formData}
                    onInputChange={handleInputChange}
                    availableCertificates={state.availableCertificates}
                  />
                </motion.div>
              )}

              {state.currentStep === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <InvoiceDetailsStep
                    formData={state.formData}
                    onInputChange={handleInputChange}
                  />
                </motion.div>
              )}

              {state.currentStep === 5 && (
                <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <FinalizeStep
                    formData={state.formData}
                    onUploadInvoiceData={saveInvoiceData}
                    savedInvoiceData={state.savedInvoiceData}
                    isUploadingInvoice={state.isUploadingInvoice}
                    availableCertificates={state.availableCertificates}
                    savedReceiptData={state.savedReceiptData}
                  />
                </motion.div>
              )}

              {state.currentStep === 6 && (
                <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <PreviewDownloadStep formData={state.formData} />
                </motion.div>
              )}

            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
              <button
                onClick={prevStep}
                disabled={state.currentStep === 1}
                className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                  state.currentStep === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                Previous
              </button>

              <div className="flex gap-4">
                {state.currentStep < 6 ? (
                  <button
                    onClick={() => {
                      const errors = validateCurrentStep();
                      if (errors.length > 0) {
                        toast.error(`Please fill in the required fields:\n${errors.join('\n')}`);
                        return;
                      }
                      nextStep();
                    }}
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/bookkeeping/payment-receipt')}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all"
                  >
                    Back to Payment/Receipt Entries
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default NewStepper;
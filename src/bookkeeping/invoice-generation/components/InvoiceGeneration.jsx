import React, { useState, useEffect, useReducer } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  List,
  Save,
  X,
  Plus,
  Loader,
  Calculator
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CompanyDetailsStep from './CompanyDetailsStep';
import CustomerDetailsStep from './CustomerDetailsStep';
import ParticularInfoStep from './ParticularInfoStep';
import InvoiceTypeStep from './InvoiceTypeStep';
import { API_ENDPOINTS, CUSTOMER_TYPES, INVOICE_TYPES } from '../../shared/utils';

// Initial state
const initialState = {
  currentStep: 1,
  selectedInvoiceType: '',
  formData: {
    // Step 1: Company Details
    companyAccountNumber: '',
    companyName: '',
    gstNumber: '',
    companyAddress: '',
    stateCode: '',
    bankName: '',
    branch: '',
    ifscCode: '',
    swiftCode: '',
    // Step 2: Customer Details
    customerType: CUSTOMER_TYPES.B2B, // B2B or B2C
    // B2B Fields
    selectedB2BCustomer: '',
    selectedB2BCustomerName: '',
    b2bCustomerGstNumber: '',
    b2bCustomerAddress: '',
    b2bPhoneNumber: '',
    b2bCustomerStateCode: '',
    b2bEmail: '',
    // B2C Fields
    b2cFullName: '',
    b2cPhoneNumber: '',
    b2cEmail: '',
    b2cAddress: '',
    b2cCity: '',
    b2cState: '',
    b2cPincode: '',
    b2cDateOfBirth: '',
    b2cGender: ''
  },
  particularinfoCustomers: [
    { id: 1, name: '', items: [''] }
  ],
  companyAccounts: [],
  customers: [],
  loadingCompanyDetails: false,
  isSubmitting: false
};

// Reducer function
function invoiceReducer(state, action) {
  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_SELECTED_INVOICE_TYPE':
      return { ...state, selectedInvoiceType: action.payload };
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
    case 'SET_LOADING_COMPANY_DETAILS':
      return { ...state, loadingCompanyDetails: action.payload };
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.payload };
    case 'UPDATE_PARTICULAR_CUSTOMERS':
      return { ...state, particularinfoCustomers: action.payload };
    case 'RESTORE_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

function InvoiceGeneration() {
    const navigate = useNavigate();
    const location = useLocation();

    // Get step from URL search params
    const getStepFromURL = () => {
        const urlParams = new URLSearchParams(location.search);
        const stepParam = urlParams.get('step');
        if (stepParam) {
            const parsedStep = parseInt(stepParam, 10);
            if (parsedStep >= 1 && parsedStep <= 4) {
                return parsedStep;
            }
        }
        return null;
    };

    // Update URL with current step
    const updateURLWithStep = (step) => {
        const urlParams = new URLSearchParams(location.search);
        urlParams.set('step', step.toString());
        const newSearch = urlParams.toString();
        if (location.search !== `?${newSearch}`) {
            navigate(`${location.pathname}?${newSearch}`, { replace: true });
        }
    };

    // localStorage keys for persistence
    const STORAGE_KEYS = {
        FORM_DATA: 'invoice_generation_form_data',
        PARTICULAR_CUSTOMERS: 'invoice_generation_particular_customers',
        CURRENT_STEP: 'invoice_generation_current_step',
        SELECTED_INVOICE_TYPE: 'invoice_generation_selected_invoice_type',
        SELECTED_DATE: 'invoice_generation_selected_date'
    };

    // Load persisted data from localStorage and URL
    const loadPersistedData = () => {
        try {
            const persistedFormData = localStorage.getItem(STORAGE_KEYS.FORM_DATA);
            const persistedParticularCustomers = localStorage.getItem(STORAGE_KEYS.PARTICULAR_CUSTOMERS);
            const persistedCurrentStep = localStorage.getItem(STORAGE_KEYS.CURRENT_STEP);
            const persistedSelectedInvoiceType = localStorage.getItem(STORAGE_KEYS.SELECTED_INVOICE_TYPE);

            // Check URL for step parameter (takes priority)
            const urlStep = getStepFromURL();

            const loadedState = { ...initialState };

            if (persistedFormData) {
                loadedState.formData = { ...initialState.formData, ...JSON.parse(persistedFormData) };
                console.log('[PERSISTENCE] Loaded form data from localStorage');
            }

            if (persistedParticularCustomers) {
                loadedState.particularinfoCustomers = JSON.parse(persistedParticularCustomers);
                console.log('[PERSISTENCE] Loaded particular customers from localStorage');
            }

            // Priority: URL parameter > localStorage > default (1)
            if (urlStep) {
                loadedState.currentStep = urlStep;
                console.log('[PERSISTENCE] Loaded current step from URL:', loadedState.currentStep);
            } else if (persistedCurrentStep) {
                const parsedStep = parseInt(persistedCurrentStep, 10);
                if (parsedStep >= 1 && parsedStep <= 4) {
                    loadedState.currentStep = parsedStep;
                    console.log('[PERSISTENCE] Loaded current step from localStorage:', loadedState.currentStep);
                } else {
                    console.warn('[PERSISTENCE] Invalid current step in localStorage:', persistedCurrentStep);
                }
            }

            if (persistedSelectedInvoiceType) {
                loadedState.selectedInvoiceType = persistedSelectedInvoiceType;
                console.log('[PERSISTENCE] Loaded selected invoice type from localStorage:', loadedState.selectedInvoiceType);
            }

            console.log('[PERSISTENCE] Final loaded state current step:', loadedState.currentStep);
            return loadedState;
        } catch (error) {
            console.error('[PERSISTENCE] Error loading persisted data:', error);
            return initialState;
        }
    };

    // Save data to localStorage
    const saveToLocalStorage = (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('[PERSISTENCE] Error saving to localStorage:', error);
        }
    };

    // Clear all persisted data
    const clearPersistedData = () => {
        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            console.log('[PERSISTENCE] Cleared all persisted data');
        } catch (error) {
            console.error('[PERSISTENCE] Error clearing persisted data:', error);
        }
    };

    // Initialize state with persisted data
    const [state, dispatch] = useReducer(invoiceReducer, null, () => loadPersistedData());

  // Load data on component mount
  useEffect(() => {
    loadCompanyAccounts();
    loadCustomers();

    // Check if we're restoring from preview mode
    const locationState = location.state;
    if (locationState?.restoreStep === 4 && locationState?.invoiceData) {
      console.log('Restoring from preview mode, setting step to 4');
      const targetStep = 4;
      dispatch({ type: 'SET_CURRENT_STEP', payload: targetStep });
      updateURLWithStep(targetStep);

      // Populate form data from invoice data
      const invoiceData = locationState.invoiceData;
      const restoredFormData = {
        companyName: invoiceData.companyName || '',
        companyAddress: invoiceData.companyAddress || '',
        gstNumber: invoiceData.companyGST || '',
        stateCode: invoiceData.companyStateCode || '',
        customerType: invoiceData.customerType || 'B2B',
        selectedB2BCustomerName: invoiceData.customerName || '',
        b2bCustomerAddress: invoiceData.customerAddress || '',
        b2bCustomerGstNumber: invoiceData.customerGST || '',
        b2bCustomerStateCode: invoiceData.customerStateCode || '',
        b2cFullName: invoiceData.customerName || '',
        b2cAddress: invoiceData.customerAddress || '',
        b2cCity: '',
        b2cState: '',
        b2cPincode: ''
      };

      Object.keys(restoredFormData).forEach(field => {
        dispatch({ type: 'UPDATE_FORM_DATA', field, value: restoredFormData[field] });
      });

      // Set selected invoice type based on preview mode
      if (locationState.previewMode) {
        dispatch({ type: 'SET_SELECTED_INVOICE_TYPE', payload: 'gst' }); // Default to GST for preview
      }
    } else {
      // If no location state and no URL step, ensure we have step 1 in URL
      const urlStep = getStepFromURL();
      if (!urlStep) {
        console.log('[NAVIGATION] No step in URL, setting to step 1');
        updateURLWithStep(1);
      } else {
        console.log('[NAVIGATION] Using step from URL:', urlStep);
      }
    }
  }, []);

  // Persist form data to localStorage whenever it changes
  useEffect(() => {
    if (state.formData && Object.keys(state.formData).length > 0) {
      saveToLocalStorage(STORAGE_KEYS.FORM_DATA, state.formData);
    }
  }, [state.formData]);

  // Persist particular customers to localStorage whenever they change
  useEffect(() => {
    if (state.particularinfoCustomers && state.particularinfoCustomers.length > 0) {
      saveToLocalStorage(STORAGE_KEYS.PARTICULAR_CUSTOMERS, state.particularinfoCustomers);
    }
  }, [state.particularinfoCustomers]);

  // Persist current step to localStorage and URL whenever it changes
  useEffect(() => {
    if (state.currentStep) {
      saveToLocalStorage(STORAGE_KEYS.CURRENT_STEP, state.currentStep);
      updateURLWithStep(state.currentStep);
    }
  }, [state.currentStep]);

  // Persist selected invoice type to localStorage whenever it changes
  useEffect(() => {
    if (state.selectedInvoiceType) {
      saveToLocalStorage(STORAGE_KEYS.SELECTED_INVOICE_TYPE, state.selectedInvoiceType);
    }
  }, [state.selectedInvoiceType]);

  // Debug: Log current step changes
  useEffect(() => {
    console.log('[NAVIGATION] Current step changed to:', state.currentStep);
  }, [state.currentStep]);

  // Listen for URL changes (browser back/forward, manual URL editing)
  useEffect(() => {
    const urlStep = getStepFromURL();
    if (urlStep && urlStep !== state.currentStep) {
      console.log('[NAVIGATION] URL step changed to:', urlStep, 'updating component state');
      dispatch({ type: 'SET_CURRENT_STEP', payload: urlStep });
    }
  }, [location.search]); // Re-run when URL search params change

  // Load company accounts from DB
  const loadCompanyAccounts = async () => {
    try {
      console.log('[INVOICE] Loading company accounts from API...');
      const response = await fetch(API_ENDPOINTS.GET_COMPANY_ACCOUNTS);
      if (response.ok) {
        const result = await response.json();
        const accounts = result.data || [];
        console.log('[INVOICE] Raw API response:', result);
        console.log('[INVOICE] Accounts array:', accounts);
        console.log('[INVOICE] Number of accounts:', accounts.length);

        // Log each account for debugging
        accounts.forEach((account, index) => {
          console.log(`[INVOICE] Account ${index + 1}:`, {
            id: account.id,
            accountNumber: account.account_number,
            companyName: account.company_name,
            bankName: account.bank_name
          });
        });

        dispatch({ type: 'SET_COMPANY_ACCOUNTS', payload: accounts });
        console.log('[INVOICE] Successfully loaded company accounts:', accounts);
      } else {
        console.warn('[INVOICE] Failed to load company accounts. Status:', response.status);
        dispatch({ type: 'SET_COMPANY_ACCOUNTS', payload: [] });
      }
    } catch (error) {
      console.error('[INVOICE] Error loading company accounts:', error);
      dispatch({ type: 'SET_COMPANY_ACCOUNTS', payload: [] });
    }
  };

  // Load B2B customers from DB
  const loadCustomers = async () => {
    try {
      console.log('[INVOICE] Loading B2B customers from API...');
      const response = await fetch(API_ENDPOINTS.GET_B2B_CUSTOMERS);
      if (response.ok) {
        const result = await response.json();
        const customerList = result.data || [];
        dispatch({ type: 'SET_CUSTOMERS', payload: customerList });
        console.log('[INVOICE] Successfully loaded B2B customers:', customerList);
        console.log('[INVOICE] Number of customers loaded:', customerList.length);
      } else {
        console.warn('[INVOICE] Failed to load B2B customers. Status:', response.status);
        // Fallback to mock data if API fails
        const mockCustomers = [
          { id: 1, company_name: 'Tech Solutions India Pvt Ltd' },
          { id: 2, company_name: 'Global Manufacturing Corp' },
          { id: 3, company_name: 'Digital Services Hub' },
          { id: 4, company_name: 'Logistics & Supply Chain Ltd' },
          { id: 5, company_name: 'Healthcare Solutions Inc' }
        ];
        dispatch({ type: 'SET_CUSTOMERS', payload: mockCustomers });
        console.log('[INVOICE] Using mock B2B customers:', mockCustomers);
      }
    } catch (error) {
      console.error('[INVOICE] Error loading B2B customers:', error);
      // Fallback to mock data if network error
      const mockCustomers = [
        { id: 1, company_name: 'Tech Solutions India Pvt Ltd' },
        { id: 2, company_name: 'Global Manufacturing Corp' },
        { id: 3, company_name: 'Digital Services Hub' },
        { id: 4, company_name: 'Logistics & Supply Chain Ltd' },
        { id: 5, company_name: 'Healthcare Solutions Inc' }
      ];
      dispatch({ type: 'SET_CUSTOMERS', payload: mockCustomers });
      console.log('[INVOICE] Using mock B2B customers due to error:', mockCustomers);
    }
  };

  // Load company details by account number
  const loadCompanyDetails = async (accountNumber) => {
    if (!accountNumber) return;

    dispatch({ type: 'SET_LOADING_COMPANY_DETAILS', payload: true });
    try {
      console.log('[INVOICE] Loading company details for account:', accountNumber);
      const response = await fetch(`${API_ENDPOINTS.GET_COMPANY_DETAILS}/${accountNumber}`);
      if (response.ok) {
        const result = await response.json();
        const companyData = result.data;
        console.log('[INVOICE] Successfully loaded company details:', companyData);

        // Auto-fill the form fields
        const fieldsToUpdate = {
          companyName: companyData.company_name || '',
          gstNumber: companyData.company_gst_number || '',
          companyAddress: companyData.company_address || '',
          bankName: companyData.bank_name || '',
          branch: companyData.branch || '',
          ifscCode: companyData.ifsc_code || '',
          swiftCode: companyData.swift_code || '',
          // Note: stateCode is not in our database, so we'll leave it empty
          stateCode: state.formData.stateCode // Keep existing value
        };

        Object.keys(fieldsToUpdate).forEach(field => {
          dispatch({ type: 'UPDATE_FORM_DATA', field, value: fieldsToUpdate[field] });
        });
      } else if (response.status === 404) {
        console.warn('[INVOICE] Company not found for account:', accountNumber);
        // Clear the fields if company not found
        const fieldsToClear = ['companyName', 'gstNumber', 'companyAddress', 'bankName', 'branch', 'ifscCode', 'swiftCode'];
        fieldsToClear.forEach(field => {
          dispatch({ type: 'UPDATE_FORM_DATA', field, value: '' });
        });
      } else {
        console.warn('[INVOICE] Failed to load company details. Status:', response.status);
      }
    } catch (error) {
      console.error('[INVOICE] Error loading company details:', error);
    } finally {
      dispatch({ type: 'SET_LOADING_COMPANY_DETAILS', payload: false });
    }
  };

  // Load B2B customer details by ID
  const loadB2BCustomerDetails = async (customerId) => {
    if (!customerId) return;

    try {
      console.log('[INVOICE] Loading B2B customer details for ID:', customerId);
      const response = await fetch(`${API_ENDPOINTS.GET_B2B_CUSTOMER}/${customerId}`);
      if (response.ok) {
        const result = await response.json();
        const customerData = result.data;
        console.log('[INVOICE] Successfully loaded B2B customer details:', customerData);

        // Auto-fill the B2B customer form fields
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
      } else if (response.status === 404) {
        console.warn('[INVOICE] B2B customer not found for ID:', customerId);
        // Clear the B2B customer fields if customer not found
        const b2bFields = ['b2bCustomerGstNumber', 'b2bCustomerAddress', 'b2bPhoneNumber', 'b2bCustomerStateCode', 'b2bEmail'];
        b2bFields.forEach(field => {
          dispatch({ type: 'UPDATE_FORM_DATA', field, value: '' });
        });
      } else {
        console.warn('[INVOICE] Failed to load B2B customer details. Status:', response.status);
      }
    } catch (error) {
      console.error('[INVOICE] Error loading B2B customer details:', error);
    }
  };

  // Handle invoice form input changes
  const handleInvoiceInputChange = (field, value) => {
    dispatch({ type: 'UPDATE_FORM_DATA', field, value });

    // Auto-fill company details when account number changes
    if (field === 'companyAccountNumber') {
      loadCompanyDetails(value);
    }

    // Auto-fill B2B customer details when customer is selected
    if (field === 'selectedB2BCustomer' && value) {
      // Find the customer name from the customers array
      const selectedCustomer = state.customers.find(customer => customer.id.toString() === value.toString());
      if (selectedCustomer) {
        dispatch({ type: 'UPDATE_FORM_DATA', field: 'selectedB2BCustomerName', value: selectedCustomer.company_name || '' });
      }
      loadB2BCustomerDetails(value);
    }

    // Handle customer type change - clear other type's data
    if (field === 'customerType') {
      if (value === CUSTOMER_TYPES.B2B) {
        // Clear B2C fields when switching to B2B
        const b2cFields = ['b2cFullName', 'b2cPhoneNumber', 'b2cEmail', 'b2cAddress', 'b2cCity', 'b2cState', 'b2cPincode', 'b2cDateOfBirth', 'b2cGender'];
        b2cFields.forEach(f => dispatch({ type: 'UPDATE_FORM_DATA', field: f, value: '' }));
      } else if (value === CUSTOMER_TYPES.B2C) {
        // Clear B2B fields when switching to B2C
        const b2bFields = ['selectedB2BCustomer', 'selectedB2BCustomerName', 'b2bCustomerGstNumber', 'b2bCustomerAddress', 'b2bPhoneNumber', 'b2bCustomerStateCode', 'b2bEmail'];
        b2bFields.forEach(f => dispatch({ type: 'UPDATE_FORM_DATA', field: f, value: '' }));
      }
    }
  };

  // Handle step navigation
  const nextStep = () => {
    if (state.currentStep < 4) {
      const newStep = state.currentStep + 1;
      dispatch({ type: 'SET_CURRENT_STEP', payload: newStep });
      updateURLWithStep(newStep);
    }
  };

  const prevStep = () => {
    if (state.currentStep > 1) {
      const newStep = state.currentStep - 1;
      dispatch({ type: 'SET_CURRENT_STEP', payload: newStep });
      updateURLWithStep(newStep);
    }
  };

  // Handle particularinfo customer changes
  const handleParticularinfoCustomerChange = (customerId, name) => {
    const updatedCustomers = state.particularinfoCustomers.map(customer =>
      customer.id === customerId ? { ...customer, name } : customer
    );
    dispatch({ type: 'UPDATE_PARTICULAR_CUSTOMERS', payload: updatedCustomers });
  };

  const handleParticularinfoItemChange = (customerId, itemIndex, value) => {
    const updatedCustomers = state.particularinfoCustomers.map(customer =>
      customer.id === customerId
        ? {
            ...customer,
            items: customer.items.map((item, idx) =>
              idx === itemIndex ? value : item
            )
          }
        : customer
    );
    dispatch({ type: 'UPDATE_PARTICULAR_CUSTOMERS', payload: updatedCustomers });
  };

  const addParticularinfoCustomer = () => {
    const newId = Math.max(...state.particularinfoCustomers.map(c => c.id)) + 1;
    const updatedCustomers = [
      ...state.particularinfoCustomers,
      { id: newId, name: '', items: [''] }
    ];
    dispatch({ type: 'UPDATE_PARTICULAR_CUSTOMERS', payload: updatedCustomers });
  };

  const removeParticularinfoCustomer = (customerId) => {
    if (state.particularinfoCustomers.length > 1) {
      const updatedCustomers = state.particularinfoCustomers.filter(customer => customer.id !== customerId);
      dispatch({ type: 'UPDATE_PARTICULAR_CUSTOMERS', payload: updatedCustomers });
    }
  };

  const addParticularinfoItem = (customerId) => {
    const updatedCustomers = state.particularinfoCustomers.map(customer =>
      customer.id === customerId
        ? { ...customer, items: [...customer.items, ''] }
        : customer
    );
    dispatch({ type: 'UPDATE_PARTICULAR_CUSTOMERS', payload: updatedCustomers });
  };

  const removeParticularinfoItem = (customerId, itemIndex) => {
    const updatedCustomers = state.particularinfoCustomers.map(customer =>
      customer.id === customerId
        ? {
            ...customer,
            items: customer.items.filter((_, idx) => idx !== itemIndex)
          }
        : customer
    );
    dispatch({ type: 'UPDATE_PARTICULAR_CUSTOMERS', payload: updatedCustomers });
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate required fields based on customer type
    const validationErrors = validateForm();

    if (validationErrors.length > 0) {
      toast.error(`Please fill in the required fields:\n${validationErrors.join('\n')}`);
      return;
    }

    dispatch({ type: 'SET_SUBMITTING', payload: true });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Invoice form data:', state.formData);
      console.log('Particular info customers:', state.particularinfoCustomers);

      // Prepare invoice data for TaxInvoice component
      const invoiceData = {
        // Company Details
        companyName: state.formData.companyName,
        companyAddress: state.formData.companyAddress,
        companyGST: state.formData.gstNumber,
        companyState: 'Maharashtra', // You can make this dynamic
        companyStateCode: state.formData.stateCode,

        // Bank Details
        bankDetails: {
          accountHolderName: state.formData.companyName,
          bankName: state.formData.bankName,
          accountNumber: state.formData.companyAccountNumber,
          branch: state.formData.branch,
          ifscCode: state.formData.ifscCode,
          swiftCode: state.formData.swiftCode
        },

        // Customer Details
        customerType: state.formData.customerType,
        customerName: state.formData.customerType === CUSTOMER_TYPES.B2B ? state.formData.selectedB2BCustomerName : state.formData.b2cFullName,
        customerAddress: state.formData.customerType === CUSTOMER_TYPES.B2B ? state.formData.b2bCustomerAddress : `${state.formData.b2cAddress}, ${state.formData.b2cCity}, ${state.formData.b2cState} - ${state.formData.b2cPincode}`,
        customerGST: state.formData.customerType === CUSTOMER_TYPES.B2B ? state.formData.b2bCustomerGstNumber : '',
        customerState: 'Maharashtra', // You can make this dynamic
        customerStateCode: state.formData.customerType === CUSTOMER_TYPES.B2B ? state.formData.b2bCustomerStateCode : '',

        // Invoice Details
        invoiceNo: 'PROFORMA INVOICE',
        invoiceDate: new Date().toLocaleDateString('en-GB'),
        // Ensure these are plain strings, not JSON serialized
        invoiceNoString: 'PROFORMA INVOICE',
        invoiceDateString: new Date().toLocaleDateString('en-GB'),
        // Static invoice number (never changes)
        invoiceNumber: 'PROFORMA INVOICE',

        // Financial Details
        items: state.particularinfoCustomers.map((customer, index) => ({
          slNo: index + 1,
          particulars: `${customer.name}\n${customer.items.join('\n')}`,
          hsnSac: '',
          quantity: 1,
          rate: 1000, // You can calculate this based on your requirements
          amount: 1000, // You can calculate this based on your requirements
          taxable: true
        })),

        // Tax Details
        cgstRate: 9,
        sgstRate: 9,
        cgstAmount: 0, // Will be calculated
        sgstAmount: 0, // Will be calculated
        totalAmount: 0 // Will be calculated
      };

      // Clear persisted data after successful submission
      clearPersistedData();
      console.log('[PERSISTENCE] Cleared persisted data after successful invoice generation');

      // Navigate to TaxInvoice page with data
      navigate('/bookkeeping/tax-invoice', { state: { invoiceData } });

    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Error generating invoice. Please try again.');
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  };

  // Handle manual data clearing
  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all entered data? This action cannot be undone.')) {
      clearPersistedData();
      // Reset state to initial state
      dispatch({ type: 'RESTORE_STATE', payload: initialState });
      toast.success('All data has been cleared successfully.');
      console.log('[PERSISTENCE] Manually cleared all data and reset form');
    }
  };

  // Validate current step
  const validateCurrentStep = () => {
    const errors = [];

    switch (state.currentStep) {
      case 1:
        if (!state.formData.companyAccountNumber) errors.push('Company Account Number is required');
        if (!state.formData.companyName) errors.push('Company Name is required');
        break;
      case 2:
        if (state.formData.customerType === CUSTOMER_TYPES.B2B) {
          if (!state.formData.selectedB2BCustomer) errors.push('B2B Customer selection is required');
        } else if (state.formData.customerType === CUSTOMER_TYPES.B2C) {
          if (!state.formData.b2cFullName) errors.push('Full Name is required for B2C');
        }
        break;
      case 3:
        // Validate that at least one customer has a name
        const hasValidCustomer = state.particularinfoCustomers.some(customer =>
          customer.name.trim() !== '' && customer.items.some(item => item.trim() !== '')
        );
        if (!hasValidCustomer) {
          errors.push('At least one customer with name and items is required');
        }
        break;
      case 4:
        if (!state.selectedInvoiceType) errors.push('Please select an invoice type');
        break;
      default:
        break;
    }

    return errors;
  };

  // Validate form based on customer type (for final submission)
  const validateForm = () => {
    const errors = [];

    // Company details validation
    if (!state.formData.companyAccountNumber) errors.push('Company Account Number is required');
    if (!state.formData.companyName) errors.push('Company Name is required');

    // Customer type specific validation
    if (state.formData.customerType === CUSTOMER_TYPES.B2B) {
      if (!state.formData.selectedB2BCustomer) errors.push('B2B Customer selection is required');
    } else if (state.formData.customerType === CUSTOMER_TYPES.B2C) {
      if (!state.formData.b2cFullName) errors.push('Full Name is required for B2C');
    }

    return errors;
  };

  const steps = [
    { id: 1, title: 'Company Details', icon: Building, description: 'Enter company information' },
    { id: 2, title: 'Customer Details', icon: Users, description: 'Add customer information' },
    { id: 3, title: 'Particular Info', icon: List, description: 'Specify invoice items' },
    { id: 4, title: 'Invoice Types', icon: FileText, description: 'Select document type' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/bookkeeping')}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Bookkeeping
            </button>
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-green-300" />
              <div>
                <h1 className="text-2xl font-bold text-white">Invoice Generation</h1>
                <p className="text-green-200 text-sm">Create professional invoices</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClearData}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              title="Clear all entered data"
            >
              <X className="w-4 h-4" />
              Clear Data
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
          {/* Progress Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Create New Invoice</h2>
              <span className="text-green-100 text-sm">Step {state.currentStep} of 4</span>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <motion.div
                    className={`flex items-center space-x-2 ${
                      state.currentStep >= step.id ? 'text-white' : 'text-green-200'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className={`p-2 rounded-full ${
                      state.currentStep >= step.id
                        ? 'bg-white text-green-600'
                        : 'bg-green-500 text-green-100'
                    }`}>
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
                    <ChevronRight className={`w-5 h-5 ${
                      state.currentStep > step.id ? 'text-white' : 'text-green-300'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {state.currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CompanyDetailsStep
                    formData={state.formData}
                    onInputChange={handleInvoiceInputChange}
                    loadingCompanyDetails={state.loadingCompanyDetails}
                    companyAccounts={state.companyAccounts}
                  />
                </motion.div>
              )}

              {state.currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CustomerDetailsStep
                    formData={state.formData}
                    onInputChange={handleInvoiceInputChange}
                    customers={state.customers}
                  />
                </motion.div>
              )}

              {state.currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ParticularInfoStep
                    particularinfoCustomers={state.particularinfoCustomers}
                    onCustomerChange={handleParticularinfoCustomerChange}
                    onItemChange={handleParticularinfoItemChange}
                    onAddCustomer={addParticularinfoCustomer}
                    onRemoveCustomer={removeParticularinfoCustomer}
                    onAddItem={addParticularinfoItem}
                    onRemoveItem={removeParticularinfoItem}
                  />
                </motion.div>
              )}

              {state.currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <InvoiceTypeStep
                    selectedInvoiceType={state.selectedInvoiceType}
                    onSelectInvoiceType={(type) => dispatch({ type: 'SET_SELECTED_INVOICE_TYPE', payload: type })}
                    onPreview={(invoiceData, invoiceType) => {
                      if (invoiceType === INVOICE_TYPES.GST) {
                        navigate('/bookkeeping/tax-invoice', { state: { invoiceData } });
                      } else if (invoiceType === INVOICE_TYPES.REGULAR) {
                        navigate('/bookkeeping/proforma-invoice', { state: { invoiceData } });
                      }
                    }}
                    formData={state.formData}
                    particularinfoCustomers={state.particularinfoCustomers}
                  />
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
                {state.currentStep < 4 ? (
                  <button
                    onClick={() => {
                      // Add validation before proceeding to next step
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
                  state.selectedInvoiceType && (
                    <button
                      onClick={handleSubmit}
                      disabled={state.isSubmitting}
                      className={`px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                        state.isSubmitting
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {state.isSubmitting ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Generate Documents
                        </>
                      )}
                    </button>
                  )
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

export default InvoiceGeneration;

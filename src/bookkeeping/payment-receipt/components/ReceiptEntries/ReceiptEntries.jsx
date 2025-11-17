import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, ArrowLeft, Eye, Download, Trash2 } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReceivedPayment from './ReceivedPayment';
import { getCompanyAccounts, getCompanyDetails, getCustomerDetails, createReceiptAmountReceived } from '../../../shared/utils/api';

function ReceiptEntries() {
  const navigate = useNavigate();

  // Initial form data
  const initialFormData = {
    accountNo: '',
    companyName: '',
    companyAddress: '',
    companyGST: '',
    companyState: '',
    companyStateCode: '',
    bankName: '',
    bankBranchCode: '',
    bankAccountNo: '',
    branchName: '',
    ifscCode: '',
    amountReceived: '',
    paymentType: '',
    dateReceived: '',
    tdsPercentage: '',
    gst: '',
    customerName: '',
    customerAddress: '',
    customerGST: '',
    customerState: '',
    customerStateCode: '',
    transactionId: '',
    onAccountOf: '',
    deliveryNote: ''
  };

  // Load initial state from localStorage
  const loadInitialState = () => {
    const saved = localStorage.getItem('receiptEntriesState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          formData: { ...initialFormData, ...parsed.formData },
          savedReceiptData: parsed.savedReceiptData || null
        };
      } catch (e) {
        console.warn('Failed to parse saved receipt entries state:', e);
        return { formData: initialFormData, savedReceiptData: null };
      }
    }
    return { formData: initialFormData, savedReceiptData: null };
  };

  const initialState = loadInitialState();

  // State for ReceivedPayment component
  const [formData, setFormData] = useState(initialState.formData);
  const [savedReceiptData, setSavedReceiptData] = useState(initialState.savedReceiptData);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [companyAccounts, setCompanyAccounts] = useState([]);
  const [loadingCompanyDetails, setLoadingCompanyDetails] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadCompanyAccounts();
  }, []);

  // Save state to localStorage on changes
  useEffect(() => {
    const stateToSave = { formData, savedReceiptData };
    localStorage.setItem('receiptEntriesState', JSON.stringify(stateToSave));
  }, [formData, savedReceiptData]);

  // Load company accounts
  const loadCompanyAccounts = async () => {
    try {
      const result = await getCompanyAccounts();
      setCompanyAccounts(result.data || []);
    } catch (error) {
      console.error('Error loading company accounts:', error);
    }
  };

  // Load company details when account number changes
  const loadCompanyDetails = async (accountNumber) => {
    if (!accountNumber) return;

    setLoadingCompanyDetails(true);
    try {
      const result = await getCompanyDetails(accountNumber);
      const companyData = result.data;

      // Auto-fill company details
      setFormData(prev => ({
        ...prev,
        companyName: companyData.company_name || '',
        companyAddress: companyData.company_address || '',
        companyGST: companyData.company_gst_number || '',
        companyState: companyData.state || '',
        companyStateCode: companyData.state_code || '',
        bankName: companyData.bank_name || '',
        bankBranchCode: companyData.swift_code || '',
        bankAccountNo: companyData.account_number || '',
        branchName: companyData.branch || '',
        ifscCode: companyData.ifsc_code || ''
      }));
    } catch (error) {
      console.error('Error loading company details:', error);
    } finally {
      setLoadingCompanyDetails(false);
    }
  };

  // Load customer details when customer name changes
  const loadCustomerDetails = async (customerName) => {
    if (!customerName) return;

    try {
      const result = await getCustomerDetails(customerName);
      const customerData = result.data;

      // Auto-fill customer details
      setFormData(prev => ({
        ...prev,
        customerAddress: customerData.address || '',
        customerGST: customerData.gst_number || '',
        customerState: customerData.state || '',
        customerStateCode: customerData.state_code || ''
      }));
    } catch (error) {
      console.error('Error loading customer details:', error);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-load company details when account number changes
    if (field === 'accountNo') {
      loadCompanyDetails(value);
    }

    // Auto-load customer details when customer name changes
    if (field === 'customerName') {
      loadCustomerDetails(value);
    }
  };

  // Get candidate ID (similar logic from NewStepper)
  const getCandidateId = async () => {
    try {
      const response = await fetch('http://localhost:5000/candidate/get-current-candidate-for-certificate');
      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success' && result.data) {
          const firstName = result.data.firstName;
          const lastName = result.data.lastName;
          const passport = result.data.passport;
          if (firstName && lastName && passport) {
            const searchResponse = await fetch(`http://localhost:5000/candidate/search-candidates?q=${encodeURIComponent(firstName)}&field=firstName`);
            if (searchResponse.ok) {
              const searchResult = await searchResponse.json();
              if (searchResult.data && searchResult.data.length > 0) {
                const candidate = searchResult.data.find(c =>
                  c.json_data?.lastName === lastName && c.json_data?.passport === passport
                );
                if (candidate) {
                  return candidate.candidate_id || candidate.id;
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to get current candidate ID:', error);
    }
    return 1; // Fallback
  };

  // Save receipt data
  const saveReceiptData = async () => {
    setIsUploadingReceipt(true);
    try {
      let candidateId = 1;
      try {
        candidateId = await getCandidateId();
      } catch (candidateError) {
        console.warn('Candidate ID retrieval failed for receipt, using default:', candidateError);
        toast.warn('Using default candidate ID for receipt due to backend connectivity issues');
      }

      const receiptData = {
        candidate_id: candidateId,
        account_no: formData.accountNo || '',
        company_name: formData.companyName || '',
        amount_received: parseFloat(formData.amountReceived) || 0,
        payment_type: formData.paymentType || '',
        transaction_date: formData.dateReceived,
        tds_percentage: parseFloat(formData.tdsPercentage) || 0,
        gst: parseFloat(formData.gst) || 0,
        customer_name: formData.customerName || '',
        transaction_id: formData.transactionId || '',
        on_account_of: formData.onAccountOf || '',
        remark: formData.deliveryNote || ''
      };

      console.log('Sending receipt data:', receiptData);

      const result = await createReceiptAmountReceived(receiptData);
      setSavedReceiptData(result.data);
      toast.success('Receipt data saved successfully!');

      // Automatically navigate to preview to generate and save the PDF
      navigate('/bookkeeping/receipt-invoice-preview', {
        state: {
          receiptData: {
            ...formData,
            savedReceiptData: result.data
          }
        }
      });

      return result.data;
    } catch (error) {
      console.error('Error saving receipt data:', error);
      toast.error(`Error saving receipt data: ${error.message}`);
      throw error;
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  // Handle preview button click
  const handlePreview = () => {
    navigate('/bookkeeping/receipt-invoice-preview', {
      state: {
        receiptData: {
          ...formData,
          savedReceiptData: savedReceiptData
        }
      }
    });
  };

  // Handle download button click
  const handleDownload = () => {
    if (!savedReceiptData) {
      toast.error('Please save the receipt data first');
      return;
    }

    // Create a temporary element to trigger download
    const link = document.createElement('a');
    link.href = `/bookkeeping/receipt-invoice-preview?download=true&data=${encodeURIComponent(JSON.stringify({
      ...formData,
      savedReceiptData: savedReceiptData
    }))}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Clear all data function
  const clearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This will reset all entered information.')) {
      setFormData(initialFormData);
      setSavedReceiptData(null);
      localStorage.removeItem('receiptEntriesState');
      toast.info('All data has been cleared.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Loading Overlay */}
      {isUploadingReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Uploading Receipt Data...</h2>
            <p className="text-gray-600">Please wait while we save your receipt data and generate the invoice.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Receipt className="w-8 h-8 text-blue-700 mr-3" />
              <h1 className="text-3xl font-bold text-gray-800">
                Receipt Entries
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={clearData}
                title="Clear all data"
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear Data
              </button>
              <button
                onClick={() => navigate('/bookkeeping/payment-receipt')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Payment/Receipt Entries
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <ReceivedPayment
            formData={formData}
            onInputChange={handleInputChange}
            onUploadReceiptData={saveReceiptData}
            savedReceiptData={savedReceiptData}
            isUploadingReceipt={isUploadingReceipt}
            companyAccounts={companyAccounts}
            loadingCompanyDetails={loadingCompanyDetails}
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Receipt Actions</h3>
            <div className="flex gap-4">
              <button
                onClick={handlePreview}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
              >
                <Eye className="w-5 h-5" />
                Preview Receipt
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
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

export default ReceiptEntries;
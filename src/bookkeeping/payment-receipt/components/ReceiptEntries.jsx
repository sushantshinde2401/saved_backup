import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, ArrowLeft } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReceivedPayment from './steps/ReceivedPayment';
import ReceiptInvoicePreview from './ReceiptInvoicePreview';

function ReceiptEntries() {
  const navigate = useNavigate();

  // State for ReceivedPayment component
  const [formData, setFormData] = useState({
    accountNo: '',
    companyName: '',
    amountReceived: '',
    paymentType: '',
    dateReceived: '',
    tdsPercentage: '',
    gst: '',
    customerName: '',
    transactionId: '',
    onAccountOf: '',
    deliveryNote: ''
  });
  const [savedReceiptData, setSavedReceiptData] = useState(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [companyAccounts, setCompanyAccounts] = useState([]);
  const [loadingCompanyDetails, setLoadingCompanyDetails] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadCompanyAccounts();
  }, []);

  // Load company accounts
  const loadCompanyAccounts = async () => {
    try {
      const response = await fetch('http://localhost:5000/get-company-accounts');
      if (response.ok) {
        const result = await response.json();
        setCompanyAccounts(result.data || []);
      }
    } catch (error) {
      console.error('Error loading company accounts:', error);
    }
  };

  // Load company details when account number changes
  const loadCompanyDetails = async (accountNumber) => {
    if (!accountNumber) return;

    setLoadingCompanyDetails(true);
    try {
      const response = await fetch(`http://localhost:5000/get-company-details/${accountNumber}`);
      if (response.ok) {
        const result = await response.json();
        const companyData = result.data;

        // Auto-fill company name
        if (companyData.company_name) {
          setFormData(prev => ({
            ...prev,
            companyName: companyData.company_name || ''
          }));
        }
      }
    } catch (error) {
      console.error('Error loading company details:', error);
    } finally {
      setLoadingCompanyDetails(false);
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

      const response = await fetch('http://localhost:5000/receipt-amount-received', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(receiptData),
      });

      if (response.ok) {
        const result = await response.json();
        setSavedReceiptData(result.data);
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
      setIsUploadingReceipt(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
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

        {/* Receipt Invoice Preview */}
        {savedReceiptData && (
          <div className="mt-8">
            <ReceiptInvoicePreview
              data={{
                ...formData,
                savedReceiptData: savedReceiptData
              }}
            />
          </div>
        )}
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
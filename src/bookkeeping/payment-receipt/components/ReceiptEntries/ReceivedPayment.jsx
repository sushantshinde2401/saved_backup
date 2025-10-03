import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCheck, Upload, CheckCircle, Loader, FileText } from 'lucide-react';
import { API_ENDPOINTS } from '../../../shared/utils';

function ReceivedPayment({ formData, onInputChange, onUploadReceiptData, savedReceiptData, isUploadingReceipt, companyAccounts, loadingCompanyDetails }) {
  const navigate = useNavigate();
  const [b2bCustomers, setB2bCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Load B2B customers on component mount
  useEffect(() => {
    loadB2bCustomers();
  }, []);

  const loadB2bCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const response = await fetch(API_ENDPOINTS.GET_B2B_CUSTOMERS);
      if (response.ok) {
        const result = await response.json();
        setB2bCustomers(result.data || []);
      } else {
        // Fallback to provided customer names if API fails
        setB2bCustomers([
          { id: 1, company_name: 'Tech Solutions India Pvt Ltd' },
          { id: 2, company_name: 'Global Manufacturing Corp' },
          { id: 3, company_name: 'Digital Services Hub' },
          { id: 4, company_name: 'Logistics & Supply Chain Ltd' },
          { id: 5, company_name: 'Healthcare Solutions Inc' },
          { id: 6, company_name: 'Education Technology Pvt Ltd' },
          { id: 7, company_name: 'Construction & Engineering Co' },
          { id: 8, company_name: 'Retail Chain Solutions' },
          { id: 9, company_name: 'Automotive Parts Ltd' },
          { id: 10, company_name: 'Software Development Corp' }
        ]);
      }
    } catch (error) {
      console.error('Error loading B2B customers:', error);
      // Fallback to provided customer names
      setB2bCustomers([
        { id: 1, company_name: 'Tech Solutions India Pvt Ltd' },
        { id: 2, company_name: 'Global Manufacturing Corp' },
        { id: 3, company_name: 'Digital Services Hub' },
        { id: 4, company_name: 'Logistics & Supply Chain Ltd' },
        { id: 5, company_name: 'Healthcare Solutions Inc' },
        { id: 6, company_name: 'Education Technology Pvt Ltd' },
        { id: 7, company_name: 'Construction & Engineering Co' },
        { id: 8, company_name: 'Retail Chain Solutions' },
        { id: 9, company_name: 'Automotive Parts Ltd' },
        { id: 10, company_name: 'Software Development Corp' }
      ]);
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Handle input changes - directly update parent form data
  const handleInputChange = (field, value) => {
    onInputChange(field, value);
  };

  const handleUploadReceiptData = async () => {
    if (savedReceiptData) {
      // Data already saved, show message
      return;
    }

    // Validate required fields before upload
    const errors = [];
    if (!formData.accountNo) {
      errors.push('Account No is required');
    }
    if (!formData.companyName) {
      errors.push('Company Name is required');
    }
    if (!formData.amountReceived || parseFloat(formData.amountReceived) <= 0) {
      errors.push('Received Amount is required and must be greater than 0');
    }
    if (!formData.paymentType) {
      errors.push('Payment Type is required');
    }
    if (!formData.dateReceived) {
      errors.push('Date of Transaction is required');
    }
    if (!formData.customerName) {
      errors.push('Customer Name is required');
    }

    if (errors.length > 0) {
      alert(`Please fix the following errors before uploading:\n${errors.join('\n')}`);
      return;
    }

    try {
      await onUploadReceiptData();
    } catch (error) {
      // Error is handled in the parent component
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <FileCheck className="w-16 h-16 text-orange-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">ReceivedPayment Step</h3>
        <p className="text-gray-600">Review your received payment details (placeholder)</p>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-orange-800 mb-4">Payment Details</h4>
        <p className="text-orange-700 mb-6">
          Please enter the payment details manually.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account No: *</label>
              <select
                value={formData.accountNo}
                onChange={(e) => handleInputChange('accountNo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select Account Number</option>
                {companyAccounts.length > 0 ? (
                  companyAccounts.map(account => (
                    <option key={account.id} value={account.account_number}>
                      {account.account_number} - {account.company_name}
                    </option>
                  ))
                ) : (
                  <option disabled>No accounts available</option>
                )}
              </select>
              {loadingCompanyDetails && (
                <div className="mt-1 flex items-center text-sm text-blue-600">
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Loading company details...
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name:</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                disabled={loadingCompanyDetails || !!formData.accountNo}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  loadingCompanyDetails || !!formData.accountNo ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Enter company name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Received Amount:</label>
              <input
                type="number"
                value={formData.amountReceived}
                onChange={(e) => handleInputChange('amountReceived', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter received amount"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type:</label>
              <select
                value={formData.paymentType}
                onChange={(e) => handleInputChange('paymentType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select payment type</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="Credit Card">Credit Card</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Transaction:</label>
              <input
                type="date"
                value={formData.dateReceived}
                onChange={(e) => handleInputChange('dateReceived', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">TDS:</label>
              <input
                type="number"
                value={formData.tdsPercentage}
                onChange={(e) => handleInputChange('tdsPercentage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter TDS amount"
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST:</label>
              <input
                type="number"
                value={formData.gst}
                onChange={(e) => handleInputChange('gst', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter GST amount"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name: *</label>
              <select
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select B2B Customer</option>
                {b2bCustomers.length > 0 ? (
                  b2bCustomers.map(customer => (
                    <option key={customer.id} value={customer.company_name}>
                      {customer.company_name}
                    </option>
                  ))
                ) : (
                  <option disabled>No customers available</option>
                )}
              </select>
              {loadingCustomers && (
                <div className="mt-1 flex items-center text-sm text-blue-600">
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Loading customers...
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Id:</label>
              <input
                type="text"
                value={formData.transactionId}
                onChange={(e) => handleInputChange('transactionId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter transaction ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">On Account of:</label>
              <input
                type="text"
                value={formData.onAccountOf}
                onChange={(e) => handleInputChange('onAccountOf', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter what the payment is on account of"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Remark:</label>
              <textarea
                value={formData.deliveryNote}
                onChange={(e) => handleInputChange('deliveryNote', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter any remarks or notes"
                rows="3"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Upload Receipt Data */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center">
          <Upload className="w-12 h-12 text-orange-600 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Upload Receipt Data</h4>
          <p className="text-gray-600 text-sm mb-4">
            Save payment data to ReceiptAmountReceived table
            {savedReceiptData && (
              <span className="block text-green-600 font-medium mt-1">
                ✓ Data uploaded successfully (ID: {savedReceiptData.receipt_amount_id})
              </span>
            )}
          </p>
          <div className="space-y-3">
            <button
              onClick={handleUploadReceiptData}
              disabled={isUploadingReceipt || savedReceiptData}
              className={`w-full py-3 px-4 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 ${
                isUploadingReceipt || savedReceiptData
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              {isUploadingReceipt ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : savedReceiptData ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Data Uploaded
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload
                </>
              )}
            </button>

            {savedReceiptData && (
              <button
                onClick={() => navigate('/bookkeeping/receipt-invoice-preview', {
                  state: {
                    receiptData: {
                      ...formData,
                      savedReceiptData: savedReceiptData
                    }
                  }
                })}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                View Receipt Invoice
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

export default ReceivedPayment;
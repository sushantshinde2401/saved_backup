import React, { useState, useEffect } from 'react';
import { FileCheck, Upload, CheckCircle, RotateCcw } from 'lucide-react';

function ReceivedPayment({ formData, onInputChange, onUploadReceiptData, savedReceiptData, isUploadingReceipt }) {
  // Local state for payment details to prevent auto-filling from previous steps
  const [paymentDetails, setPaymentDetails] = useState({
    amountReceived: '',
    paymentType: '',
    dateReceived: '',
    deliveryNote: ''
  });

  // Load persisted data on component mount
  useEffect(() => {
    const persistedData = JSON.parse(localStorage.getItem('receivedPaymentData') || '{}');
    if (persistedData && Object.keys(persistedData).length > 0) {
      setPaymentDetails(persistedData);
      // Also update the main form data
      Object.keys(persistedData).forEach(field => {
        onInputChange(field, persistedData[field]);
      });
    }
  }, []);

  // Save data to localStorage whenever paymentDetails changes
  useEffect(() => {
    if (paymentDetails.amountReceived || paymentDetails.paymentType || paymentDetails.dateReceived || paymentDetails.deliveryNote) {
      localStorage.setItem('receivedPaymentData', JSON.stringify(paymentDetails));
    }
  }, [paymentDetails]);

  // Update local state when user inputs change
  const handleLocalChange = (field, value) => {
    setPaymentDetails(prev => ({
      ...prev,
      [field]: value
    }));
    // Also update the main form data
    onInputChange(field, value);
  };

  // Clear data function
  const handleClearData = () => {
    const clearedData = {
      amountReceived: '',
      paymentType: '',
      dateReceived: '',
      deliveryNote: ''
    };
    setPaymentDetails(clearedData);
    // Clear from localStorage
    localStorage.removeItem('receivedPaymentData');
    // Also clear from main form data
    Object.keys(clearedData).forEach(field => {
      onInputChange(field, clearedData[field]);
    });
  };

  const handleUploadReceiptData = async () => {
    if (savedReceiptData) {
      // Data already saved, show message
      return;
    }

    // Validate required fields before upload
    const errors = [];
    if (!paymentDetails.amountReceived || parseFloat(paymentDetails.amountReceived) <= 0) {
      errors.push('Received Amount is required and must be greater than 0');
    }
    if (!paymentDetails.paymentType) {
      errors.push('Payment Type is required');
    }
    if (!paymentDetails.dateReceived) {
      errors.push('Date of Transaction is required');
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Received Amount</label>
              <input
                type="number"
                value={paymentDetails.amountReceived}
                onChange={(e) => handleLocalChange('amountReceived', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter received amount"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
              <select
                value={paymentDetails.paymentType}
                onChange={(e) => handleLocalChange('paymentType', e.target.value)}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Transaction</label>
              <input
                type="date"
                value={paymentDetails.dateReceived}
                onChange={(e) => handleLocalChange('dateReceived', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
              <textarea
                value={paymentDetails.deliveryNote}
                onChange={(e) => handleLocalChange('deliveryNote', e.target.value)}
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
            Save Step 6 payment data to ReceiptAmountReceived table
            {savedReceiptData && (
              <span className="block text-green-600 font-medium mt-1">
                ✓ Data uploaded successfully (ID: {savedReceiptData.receipt_amount_id})
              </span>
            )}
          </p>
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
        </div>
      </div>

      {/* Clear Data Button */}
      <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={handleClearData}
          className="flex items-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl transition-colors font-semibold"
        >
          <RotateCcw className="w-4 h-4" />
          Clear Data
        </button>
      </div>
    </div>
  );
}

export default ReceivedPayment;
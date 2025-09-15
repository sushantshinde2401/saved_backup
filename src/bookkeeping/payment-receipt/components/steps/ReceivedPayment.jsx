import React, { useState, useEffect } from 'react';
import { FileCheck } from 'lucide-react';

function ReceivedPayment({ formData, onInputChange }) {
  // Local state for payment details to prevent auto-filling from previous steps
  const [paymentDetails, setPaymentDetails] = useState({
    amountReceived: '',
    paymentType: '',
    dateReceived: '',
    deliveryNote: ''
  });

  // Update local state when user inputs change
  const handleLocalChange = (field, value) => {
    setPaymentDetails(prev => ({
      ...prev,
      [field]: value
    }));
    // Also update the main form data
    onInputChange(field, value);
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
    </div>
  );
}

export default ReceivedPayment;
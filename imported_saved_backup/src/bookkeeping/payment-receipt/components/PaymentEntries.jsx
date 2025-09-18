import React from 'react';
import { DollarSign } from 'lucide-react';

function PaymentEntries() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <DollarSign className="w-8 h-8 text-green-700 mr-3" />
        <h2 className="text-2xl font-bold text-gray-800">
          Payment Entries
        </h2>
      </div>
      <p className="text-gray-600 mb-4">
        Manage outgoing payments
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-600">
          Payment entry functionality has been moved to Invoice Generation.
        </p>
      </div>
    </div>
  );
}

export default PaymentEntries;
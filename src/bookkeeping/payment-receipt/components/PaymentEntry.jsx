import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ArrowLeft } from 'lucide-react';

function PaymentEntry() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CreditCard className="w-8 h-8 text-blue-700 mr-3" />
              <h1 className="text-3xl font-bold text-gray-800">
                payment entry
              </h1>
            </div>
            <button
              onClick={() => navigate('/bookkeeping')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Bookkeeping
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Payment Entry Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <CreditCard className="w-8 h-8 text-green-700 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">
                payment entry
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Manage payment entries and transactions
            </p>
            {/* Add payment entry functionality here */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentEntry;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';

function SalesVoucher() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-700 mr-3" />
              <h1 className="text-3xl font-bold text-gray-800">
                Sales Voucher
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Sales Voucher Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <FileText className="w-8 h-8 text-green-700 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">
                Sales Voucher
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Create professional invoices with our 6-step guided process
            </p>
            <button
              onClick={() => navigate('/bookkeeping/new-invoice-stepper')}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Start New Invoice (6 Steps)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesVoucher;
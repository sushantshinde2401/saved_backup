import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ArrowLeft, FileText, Receipt } from 'lucide-react';

function PaymentReceiptPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CreditCard className="w-8 h-8 text-blue-700 mr-3" />
              <h1 className="text-3xl font-bold text-gray-800">
                Payment/Receipt Entries
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
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Payment & Receipt Management</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from our comprehensive suite of financial tools to manage your invoices, receipts, and payment entries efficiently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Sales Voucher Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center mb-6">
              <FileText className="w-8 h-8 text-green-700 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">
                Sales Voucher
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Create professional invoices 
            </p>
            <button
              onClick={() => navigate('/bookkeeping/sales-voucher')}
              className="w-80 mx-auto bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <FileText className="w-5 h-5" />
              Go to Sales Voucher
            </button>
          </div>

          {/* Receipt Entries Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center mb-6">
              <Receipt className="w-8 h-8 text-blue-700 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">
                Receipt Entries
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Manage receipt entries and transactions
            </p>
            <button
              onClick={() => navigate('/bookkeeping/receipt-entries')}
              className="w-80 mx-auto bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <Receipt className="w-5 h-5" />
              Go to Receipt Entries
            </button>
          </div>

          {/* Payment Entry Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center mb-6">
              <CreditCard className="w-8 h-8 text-purple-700 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">
                Payment Entry
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Manage payment entries and transactions
            </p>
            <button
              onClick={() => navigate('/bookkeeping/payment-receipt-page')}
              className="w-80 mx-auto bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <CreditCard className="w-5 h-5" />
              Go to Payment Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentReceiptPage;

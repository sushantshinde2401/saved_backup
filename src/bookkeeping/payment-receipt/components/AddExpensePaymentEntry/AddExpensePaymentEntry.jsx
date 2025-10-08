import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { createExpensePaymentEntry, formatCurrency, getAllCompanies } from '../../../shared/utils/api';

const EXPENSE_TYPES = ['Office Supplies', 'Travel', 'Utilities', 'Rent'];
const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'Credit Card'];

function AddExpensePaymentEntry() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  // Load companies on component mount
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const response = await getAllCompanies();
        if (response.status === 'success') {
          setCompanies(response.data || []);
        } else {
          setError('Failed to load companies');
        }
      } catch (err) {
        console.error('Error loading companies:', err);
        setError('Failed to load companies');
      } finally {
        setLoadingCompanies(false);
      }
    };

    loadCompanies();
  }, []);

  // Form fields state
  const [expenseType, setExpenseType] = useState('');
  const [company, setCompany] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [vendorGstNumber, setVendorGstNumber] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!expenseType || !company || !amount || !expenseDate || !transactionId || !paymentMethod || !vendorName) {
      setError('Please fill in all required fields.');
      return;
    }

    // Prepare payload
    const payload = {
      expenseType,
      company,
      amount: parseFloat(amount),
      expenseDate,
      transactionId,
      description,
      paymentMethod,
      vendorName,
      vendorGstNumber
    };

    try {
      setSubmitting(true);

      // Call API to save expense payment entry
      const result = await createExpensePaymentEntry(payload);

      if (result.status === 'success') {
        alert('Expense payment entry submitted successfully!');
        // Reset form
        setExpenseType('');
        setCompany('');
        setAmount('');
        setExpenseDate('');
        setTransactionId('');
        setDescription('');
        setPaymentMethod('');
        setVendorName('');
        setVendorGstNumber('');
      } else {
        setError(result.message || 'Failed to submit expense payment entry');
      }
    } catch (err) {
      console.error('Error submitting expense payment entry:', err);
      setError('Failed to submit expense payment entry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-red-700 mr-3" />
              <h1 className="text-3xl font-bold text-gray-800">
                Add Expense Payment Entry
              </h1>
            </div>
            <button
              onClick={() => navigate('/bookkeeping/payment-receipt')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Payment/Receipt
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Expense Payment Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expense Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={expenseType}
                  onChange={(e) => setExpenseType(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select expense type...</option>
                  {EXPENSE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company <span className="text-red-500">*</span>
                </label>
                <select
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                  disabled={loadingCompanies}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {loadingCompanies ? 'Loading companies...' : 'Select company...'}
                  </option>
                  {companies.map((comp) => (
                    <option key={comp.id} value={comp.company_name}>
                      {comp.company_name}
                    </option>
                  ))}
                </select>
                {loadingCompanies && (
                  <div className="mt-1 flex items-center text-sm text-blue-600">
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    Loading companies...
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expense Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Id <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter transaction ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select payment method...</option>
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter vendor name"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Optional details about the expense"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor GST Number
                </label>
                <input
                  type="text"
                  value={vendorGstNumber}
                  onChange={(e) => setVendorGstNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Optional GST number"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
            >
              {submitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {submitting ? 'Submitting...' : 'Submit Expense Payment Entry'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddExpensePaymentEntry;
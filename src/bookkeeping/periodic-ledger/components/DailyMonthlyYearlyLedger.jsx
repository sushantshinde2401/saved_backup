import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, ArrowLeft, Download, FileText, BarChart3,
  TrendingUp, PieChart, Search, Filter, Eye, AlertTriangle
} from 'lucide-react';
import axios from 'axios';

// Assuming Chart.js is installed
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
// import { Bar, Line, Pie } from 'react-chartjs-2';
// ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

function DailyMonthlyYearlyLedger() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('daily');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [showDrillDown, setShowDrillDown] = useState(false);
  const [drillDownData, setDrillDownData] = useState(null);
  const [outstandingDues, setOutstandingDues] = useState([]);
  const [showOutstandingDues, setShowOutstandingDues] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  const [comparisonFilters, setComparisonFilters] = useState({
    period1: { type: 'monthly', month: new Date().getMonth(), year: new Date().getFullYear() },
    period2: { type: 'monthly', month: new Date().getMonth() - 1, year: new Date().getFullYear() }
  });

  useEffect(() => {
    fetchData();
  }, [activeTab, filters]);


  const fetchData = async () => {
    setLoading(true);
    try {
      let url = '';
      let params = {};

      if (activeTab === 'daily') {
        url = '/api/bookkeeping/ledger/daily';
        params = {
          date: filters.date
        };
      } else if (activeTab === 'monthly') {
        url = '/api/bookkeeping/ledger/monthly';
        params = {
          month: filters.month,
          year: filters.year
        };
      } else if (activeTab === 'yearly') {
        url = '/api/bookkeeping/ledger/yearly';
        params = {
          year: filters.year
        };
      }

      const response = await axios.get(url, { params });
      setData(response.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchOutstandingDues = async () => {
    try {
      const params = { period: activeTab };
      if (activeTab === 'daily') {
        params.date = filters.date;
      } else if (activeTab === 'monthly') {
        params.month = filters.month;
        params.year = filters.year;
      }

      const response = await axios.get('/api/bookkeeping/outstanding-dues', { params });
      setOutstandingDues(response.data.data || []);
      setShowOutstandingDues(true);
    } catch (error) {
      console.error('Error fetching outstanding dues:', error);
    }
  };

  const handleExport = async (type) => {
    try {
      const response = await axios.post('/api/bookkeeping/export', {
        type,
        period: activeTab,
        filters
      });
      // Handle download
      console.log('Export URL:', response.data.data.export_url);
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  const fetchComparisonData = async () => {
    try {
      // Fetch data sequentially to avoid database connection issues
      const data1 = await axios.get(`/api/bookkeeping/ledger/${comparisonFilters.period1.type}`, {
        params: comparisonFilters.period1
      });
      const data2 = await axios.get(`/api/bookkeeping/ledger/${comparisonFilters.period2.type}`, {
        params: comparisonFilters.period2
      });

      setComparisonData({
        period1: { ...comparisonFilters.period1, data: data1.data.data },
        period2: { ...comparisonFilters.period2, data: data2.data.data }
      });
    } catch (error) {
      console.error('Error fetching comparison data:', error);
      // Reset comparison data on error
      setComparisonData(null);
    }
  };

  const handleDrillDown = (transaction) => {
    setDrillDownData(transaction);
    setShowDrillDown(true);
  };

  const renderDailyLedger = () => {
    if (!data || !data.summary) return <div className="text-center py-8">No data available</div>;

    const { transactions, summary } = data;

    // No company filtering needed
    const filteredTransactions = transactions;

    // Calculate summary totals from transactions if backend summary is incomplete
    const calculatedSummary = { ...summary };
    if (!summary.total_income || !summary.total_expenses || !summary.net_profit) {
      let totalSales = 0;
      let totalExpenses = 0;
      let totalReceived = 0; // Includes Receipts + Adjustments

      filteredTransactions.forEach(t => {
        const amount = t.debit || t.credit || 0;
        if (t.voucher_type === 'Sales') {
          totalSales += amount;
        } else if (t.voucher_type === 'Expense') {
          totalExpenses += amount;
        } else if (t.voucher_type === 'Receipt' || t.voucher_type === 'Adjustment') {
          totalReceived += amount;
        }
      });

      calculatedSummary.total_income = totalSales;
      calculatedSummary.total_expenses = totalExpenses;
      calculatedSummary.total_receipts = totalReceived;
      calculatedSummary.outstanding = totalSales - totalReceived;
      calculatedSummary.net_profit = totalSales - totalExpenses;
      calculatedSummary.total_pending = summary.total_pending || 0; // Keep existing or default to 0
    }

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-green-800">Total Income</h3>
            <p className="text-2xl font-bold text-green-600">₹{calculatedSummary.total_income?.toLocaleString()}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-red-800">Total Expenses</h3>
            <p className="text-2xl font-bold text-red-600">₹{calculatedSummary.total_expenses?.toLocaleString()}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-orange-800">Total Receipts</h3>
            <p className="text-2xl font-bold text-orange-600">₹{calculatedSummary.total_receipts?.toLocaleString()}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-blue-800">Net Profit</h3>
            <p className="text-2xl font-bold text-blue-600">₹{calculatedSummary.net_profit?.toLocaleString()}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-yellow-800">Outstanding</h3>
            <p className="text-2xl font-bold text-yellow-600">₹{calculatedSummary.outstanding?.toLocaleString()}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-purple-800">Total Transactions</h3>
            <p className="text-2xl font-bold text-purple-600">{filteredTransactions.length}</p>
          </div>
        </div>

        {/* Payment Mode Breakdown */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Payment Mode Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(summary.payment_mode_breakdown || {}).map(([mode, breakdown]) => (
              <div key={mode} className="text-center">
                <p className="text-sm text-gray-600">{mode}</p>
                <p className="text-sm font-semibold text-green-600">+₹{breakdown.income?.toLocaleString()}</p>
                <p className="text-sm font-semibold text-red-600">-₹{breakdown.expense?.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h3 className="text-lg font-semibold">Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Particulars</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voucher Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voucher No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions?.map((transaction, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.date ? new Date(transaction.date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.company_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.particulars}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.voucher_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.voucher_no}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{transaction.debit?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{transaction.credit?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.entry_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button
                        onClick={() => handleDrillDown(transaction)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderMonthlyLedger = () => {
    if (!data || !data.summary) return <div className="text-center py-8">No data available</div>;

    const { chart_data, summary, transactions } = data;

    // No company filtering needed
    const filteredTransactions = transactions;

    // Calculate summary totals from transactions if backend summary is incomplete
    const calculatedSummary = { ...summary };
    if (!summary.total_invoices || !summary.total_received || !summary.outstanding_amount) {
      let totalSales = 0;
      let totalReceived = 0; // Includes Receipts + Adjustments
      let incomeByDay = {};
      let expenseByDay = {};

      filteredTransactions.forEach(t => {
        const amount = t.debit || t.credit || 0;
        const day = t.date ? new Date(t.date).getDate() : 0;

        if (t.voucher_type === 'Sales') {
          totalSales += amount;
          if (day) {
            incomeByDay[day] = (incomeByDay[day] || 0) + amount;
          }
        } else if (t.voucher_type === 'Receipt' || t.voucher_type === 'Adjustment') {
          totalReceived += amount;
        } else if (t.voucher_type === 'Expense') {
          if (day) {
            expenseByDay[day] = (expenseByDay[day] || 0) + amount;
          }
        }
      });

      // Find highest income/expense days
      const highestIncomeDay = Object.entries(incomeByDay).length > 0
        ? Object.entries(incomeByDay).reduce((max, [day, amount]) =>
            amount > max.amount ? { day: parseInt(day), amount } : max,
            { day: 0, amount: 0 }
          ).day
        : null;

      const highestExpenseDay = Object.entries(expenseByDay).length > 0
        ? Object.entries(expenseByDay).reduce((max, [day, amount]) =>
            amount > max.amount ? { day: parseInt(day), amount } : max,
            { day: 0, amount: 0 }
          ).day
        : null;

      calculatedSummary.total_invoices = filteredTransactions.filter(t => t.voucher_type === 'Sales').length;
      calculatedSummary.total_received = totalReceived;
      calculatedSummary.outstanding_amount = totalSales - totalReceived;
      calculatedSummary.highest_income_day = highestIncomeDay ? `${highestIncomeDay}` : 'N/A';
      calculatedSummary.highest_expense_day = highestExpenseDay ? `${highestExpenseDay}` : 'N/A';
    }

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-blue-800">Total Invoices</h3>
            <p className="text-2xl font-bold text-blue-600">{calculatedSummary.total_invoices}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-green-800">Total Received</h3>
            <p className="text-2xl font-bold text-green-600">₹{calculatedSummary.total_received?.toLocaleString()}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-red-800">Outstanding Amount</h3>
            <p className="text-2xl font-bold text-red-600">₹{calculatedSummary.outstanding_amount?.toLocaleString()}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-orange-800">Highest Income Day</h3>
            <p className="text-lg font-bold text-orange-600">{calculatedSummary.highest_income_day || 'N/A'}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-purple-800">Highest Expense Day</h3>
            <p className="text-lg font-bold text-purple-600">{calculatedSummary.highest_expense_day || 'N/A'}</p>
          </div>
        </div>

        {/* Charts Placeholder - Replace with actual Chart.js components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Income vs Expenses</h3>
            <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
              <BarChart3 className="w-12 h-12 text-gray-400" />
              <span className="ml-2 text-gray-500">Chart Placeholder</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Cash Flow</h3>
            <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
              <TrendingUp className="w-12 h-12 text-gray-400" />
              <span className="ml-2 text-gray-500">Chart Placeholder</span>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
          <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
            <PieChart className="w-12 h-12 text-gray-400" />
            <span className="ml-2 text-gray-500">Pie Chart Placeholder</span>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h3 className="text-lg font-semibold">Monthly Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Particulars</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voucher Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voucher No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry Type</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions?.map((transaction, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.date ? new Date(transaction.date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.company_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.particulars}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.voucher_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.voucher_no}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{transaction.debit?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{transaction.credit?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.entry_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderYearlyLedger = () => {
    if (!data || !data.summary) return <div className="text-center py-8">No data available</div>;

    const { transactions, summary } = data;

    // No company filtering needed
    const filteredTransactions = transactions;

    return (
      <div className="space-y-6">
        {/* Yearly Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-green-800">Total Debit</h3>
            <p className="text-2xl font-bold text-green-600">₹{summary.total_debit?.toLocaleString()}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-red-800">Total Credit</h3>
            <p className="text-2xl font-bold text-red-600">₹{summary.total_credit?.toLocaleString()}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-blue-800">Net Balance</h3>
            <p className="text-2xl font-bold text-blue-600">₹{(summary.total_debit - summary.total_credit)?.toLocaleString()}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-purple-800">Total Transactions</h3>
            <p className="text-2xl font-bold text-purple-600">{filteredTransactions.length}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-orange-800">Balance Type</h3>
            <p className="text-lg font-bold text-orange-600">{summary.balance_type || 'Settled'}</p>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h3 className="text-lg font-semibold">Yearly Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Particulars</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voucher Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voucher No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry Type</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions?.map((transaction, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.date ? new Date(transaction.date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.company_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.particulars}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.voucher_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.voucher_no}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{transaction.debit?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{transaction.credit?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.entry_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-orange-700 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Periodic Ledger</h1>
          </div>
          <button
            onClick={() => navigate('/bookkeeping')}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Bookkeeping
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {['daily', 'monthly', 'yearly'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab} Ledger
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg border mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            {activeTab === 'daily' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters({...filters, date: e.target.value})}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            )}

            {(activeTab === 'monthly' || activeTab === 'yearly') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters({...filters, year: parseInt(e.target.value)})}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {Array.from({length: 10}, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}

            {activeTab === 'monthly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  value={filters.month}
                  onChange={(e) => setFilters({...filters, month: parseInt(e.target.value)})}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                    <option key={month} value={month}>
                      {new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
            )}


            <div className="flex gap-2">
              <button
                onClick={fetchData}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Apply Filters
              </button>
              <button
                onClick={fetchOutstandingDues}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Outstanding Dues
              </button>
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => handleExport('pdf')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
          <button
            onClick={() => setShowComparison(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Compare Periods
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading data...</p>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {activeTab === 'daily' && renderDailyLedger()}
            {activeTab === 'monthly' && renderMonthlyLedger()}
            {activeTab === 'yearly' && renderYearlyLedger()}
          </>
        )}

        {/* Drill Down Modal */}
        {showDrillDown && drillDownData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Transaction Details</h2>
                <button
                  onClick={() => setShowDrillDown(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                {Object.entries(drillDownData).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-medium capitalize">{key.replace('_', ' ')}:</span>
                    <span>{typeof value === 'number' ? `₹${value.toLocaleString()}` : value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Outstanding Dues Modal */}
        {showOutstandingDues && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Outstanding Dues</h2>
                <button
                  onClick={() => setShowOutstandingDues(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Due</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Overdue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {outstandingDues.map((due, index) => (
                      <tr key={index} className={due.days_overdue > 30 ? 'bg-red-50' : 'bg-yellow-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{due.company}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{due.amount_due?.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{due.due_date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{due.days_overdue}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{due.contact_info || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Modal */}
        {showComparison && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Period Comparison</h2>
                <button
                  onClick={() => setShowComparison(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Comparison Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Period 1</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={comparisonFilters.period1.type}
                        onChange={(e) => setComparisonFilters({
                          ...comparisonFilters,
                          period1: { ...comparisonFilters.period1, type: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="daily">Daily</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                    {comparisonFilters.period1.type === 'daily' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          value={comparisonFilters.period1.date || ''}
                          onChange={(e) => setComparisonFilters({
                            ...comparisonFilters,
                            period1: { ...comparisonFilters.period1, date: e.target.value }
                          })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>
                    )}
                    {(comparisonFilters.period1.type === 'monthly' || comparisonFilters.period1.type === 'yearly') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <select
                          value={comparisonFilters.period1.year}
                          onChange={(e) => setComparisonFilters({
                            ...comparisonFilters,
                            period1: { ...comparisonFilters.period1, year: parseInt(e.target.value) }
                          })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          {Array.from({length: 10}, (_, i) => new Date().getFullYear() - i).map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    {comparisonFilters.period1.type === 'monthly' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                        <select
                          value={comparisonFilters.period1.month}
                          onChange={(e) => setComparisonFilters({
                            ...comparisonFilters,
                            period1: { ...comparisonFilters.period1, month: parseInt(e.target.value) }
                          })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                            <option key={month} value={month}>
                              {new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' })}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Period 2</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={comparisonFilters.period2.type}
                        onChange={(e) => setComparisonFilters({
                          ...comparisonFilters,
                          period2: { ...comparisonFilters.period2, type: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="daily">Daily</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                    {comparisonFilters.period2.type === 'daily' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          value={comparisonFilters.period2.date || ''}
                          onChange={(e) => setComparisonFilters({
                            ...comparisonFilters,
                            period2: { ...comparisonFilters.period2, date: e.target.value }
                          })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>
                    )}
                    {(comparisonFilters.period2.type === 'monthly' || comparisonFilters.period2.type === 'yearly') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <select
                          value={comparisonFilters.period2.year}
                          onChange={(e) => setComparisonFilters({
                            ...comparisonFilters,
                            period2: { ...comparisonFilters.period2, year: parseInt(e.target.value) }
                          })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          {Array.from({length: 10}, (_, i) => new Date().getFullYear() - i).map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    {comparisonFilters.period2.type === 'monthly' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                        <select
                          value={comparisonFilters.period2.month}
                          onChange={(e) => setComparisonFilters({
                            ...comparisonFilters,
                            period2: { ...comparisonFilters.period2, month: parseInt(e.target.value) }
                          })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                            <option key={month} value={month}>
                              {new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' })}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-center mb-6">
                <button
                  onClick={fetchComparisonData}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Compare Periods
                </button>
              </div>

              {/* Comparison Results */}
              {comparisonData && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-center">Comparison Results</h3>

                  {/* Calculate summaries from transactions like in main view */}
                  {(() => {
                    const calculateSummary = (data) => {
                      if (!data || !data.transactions) return { total_income: 0, total_expenses: 0, net_profit: 0 };
                      let totalSales = 0;
                      let totalExpenses = 0;
                      let totalReceived = 0;
                      data.transactions.forEach(t => {
                        const amount = t.debit || t.credit || 0;
                        if (t.voucher_type === 'Sales') {
                          totalSales += amount;
                        } else if (t.voucher_type === 'Expense') {
                          totalExpenses += amount;
                        } else if (t.voucher_type === 'Receipt' || t.voucher_type === 'Adjustment') {
                          totalReceived += amount;
                        }
                      });
                      return {
                        total_income: totalSales,
                        total_expenses: totalExpenses,
                        net_profit: totalSales - totalExpenses
                      };
                    };

                    const period1Summary = calculateSummary(comparisonData.period1.data);
                    const period2Summary = calculateSummary(comparisonData.period2.data);

                    return (
                      <>
                        {/* Summary Comparison */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg text-center">
                            <h4 className="font-semibold text-blue-800">Period 1</h4>
                            <p className="text-2xl font-bold text-blue-600">
                              ₹{period1Summary.net_profit?.toLocaleString() || 0}
                            </p>
                            <p className="text-sm text-blue-600">Net Profit</p>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg text-center">
                            <h4 className="font-semibold text-green-800">Difference</h4>
                            <p className={`text-2xl font-bold ${
                              period1Summary.net_profit > period2Summary.net_profit
                                ? 'text-green-600' : 'text-red-600'
                            }`}>
                              ₹{(period1Summary.net_profit - period2Summary.net_profit).toLocaleString()}
                            </p>
                            <p className="text-sm">Profit Change</p>
                          </div>
                          <div className="bg-purple-50 p-4 rounded-lg text-center">
                            <h4 className="font-semibold text-purple-800">Period 2</h4>
                            <p className="text-2xl font-bold text-purple-600">
                              ₹{period2Summary.net_profit?.toLocaleString() || 0}
                            </p>
                            <p className="text-sm text-purple-600">Net Profit</p>
                          </div>
                        </div>

                        {/* Detailed Comparison Table */}
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period 1</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period 2</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difference</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% Change</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Income</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ₹{period1Summary.total_income?.toLocaleString() || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ₹{period2Summary.total_income?.toLocaleString() || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ₹{(period1Summary.total_income - period2Summary.total_income).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {period2Summary.total_income ?
                                    ((period1Summary.total_income - period2Summary.total_income) /
                                     period2Summary.total_income * 100).toFixed(2) + '%' : 'N/A'}
                                </td>
                              </tr>
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Expenses</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ₹{period1Summary.total_expenses?.toLocaleString() || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ₹{period2Summary.total_expenses?.toLocaleString() || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ₹{(period1Summary.total_expenses - period2Summary.total_expenses).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {period2Summary.total_expenses ?
                                    ((period1Summary.total_expenses - period2Summary.total_expenses) /
                                     period2Summary.total_expenses * 100).toFixed(2) + '%' : 'N/A'}
                                </td>
                              </tr>
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Net Profit</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ₹{period1Summary.net_profit?.toLocaleString() || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ₹{period2Summary.net_profit?.toLocaleString() || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ₹{(period1Summary.net_profit - period2Summary.net_profit).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {period2Summary.net_profit ?
                                    ((period1Summary.net_profit - period2Summary.net_profit) /
                                     Math.abs(period2Summary.net_profit) * 100).toFixed(2) + '%' : 'N/A'}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DailyMonthlyYearlyLedger;

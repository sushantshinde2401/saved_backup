import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  ChevronUp,
  ChevronDown,
  FileText,
  DollarSign,
  Building,
  User,
  RefreshCw,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { API_ENDPOINTS } from '../../shared/utils';
import useDeleteLedgerRow from '../../shared/hooks/useDeleteLedgerRow';
import useLedgerSync from '../../shared/hooks/useLedgerSync';
import ConfirmationModal from '../../shared/components/ConfirmationModal';

const ClientLedger = () => {
  const navigate = useNavigate();
  const [ledgerData, setLedgerData] = useState([]);
  const [summary, setSummary] = useState({
    opening_balance: 0,
    total_debit: 0,
    total_credit: 0,
    closing_balance: 0,
    balance_type: 'Settled'
  });
  const [loading, setLoading] = useState(false); // Start with false since no company selected initially
  const [error, setError] = useState(null);
  const [b2bCustomers, setB2bCustomers] = useState([]);

  // Filter states
  const [filters, setFilters] = useState({
    company_name: '',
    start_date: '',
    end_date: '',
    voucher_type: ''
  });

  // UI states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Delete functionality state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);

  // Delete hook
  const {
    deleteLedgerRow,
    isDeleting,
    deleteError,
    resetError
  } = useDeleteLedgerRow({
    onSuccess: (entry) => {
      // Refresh data after successful deletion
      loadLedgerData();
      setDeleteModalOpen(false);
      setEntryToDelete(null);
      // Trigger sync for other tabs
      triggerSync();
    },
    onError: (error) => {
      setDeleteModalOpen(false);
      setEntryToDelete(null);
    },
    onOptimisticUpdate: (entry) => {
      // Remove entry from local state immediately
      setLedgerData(prev => prev.filter(item => item.id !== entry.id));
    },
    onRevertOptimisticUpdate: (entry) => {
      // Add entry back to local state if deletion failed
      setLedgerData(prev => {
        const newData = [...prev, entry];
        return newData.sort((a, b) => new Date(b.date || '1900-01-01') - new Date(a.date || '1900-01-01'));
      });
    }
  });

  // Sync hook for cross-tab updates
  const { triggerSync } = useLedgerSync({
    onSync: () => {
      // Only sync if we have a company selected and not currently deleting
      if (filters.company_name && !isDeleting) {
        console.log('[CLIENT_LEDGER] Sync triggered, refreshing data');
        loadLedgerData();
      }
    },
    syncKey: 'client_ledger_sync',
    pollInterval: 15000 // Check every 15 seconds
  });

  // Fetch B2B customers
  const fetchB2bCustomers = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.GET_B2B_CUSTOMERS);
      if (response.ok) {
        const result = await response.json();
        setB2bCustomers(result.data || []);
      }
    } catch (err) {
      console.error('[LEDGER] Error fetching B2B customers:', err);
    }
  };

  // Load ledger data
  const loadLedgerData = async () => {
    // Only load if company is selected
    if (!filters.company_name) {
      setLedgerData([]);
      setSummary({
        opening_balance: 0,
        total_debit: 0,
        total_credit: 0,
        closing_balance: 0,
        balance_type: 'Settled'
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        ...filters,
        limit: itemsPerPage.toString(),
        offset: ((currentPage - 1) * itemsPerPage).toString()
      });

      const response = await fetch(`${API_ENDPOINTS.GET_COMPANY_LEDGER}?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ledger data');
      }

      const result = await response.json();
      setLedgerData(result.data.entries || []);
      setSummary(result.data.summary || summary);
    } catch (err) {
      setError(err.message);
      console.error('[LEDGER] Error loading ledger data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load B2B customers on component mount
  useEffect(() => {
    fetchB2bCustomers();
  }, []);

  // Load data when filters change (only if company selected)
  useEffect(() => {
    loadLedgerData();
  }, [filters, currentPage]);

  // Auto-refresh functionality
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadLedgerData();
        setLastRefresh(new Date());
      }, 30000); // Refresh every 30 seconds
    }
    return () => clearInterval(interval);
  }, [autoRefresh, filters, currentPage]);

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort data and calculate running balance
  const sortedData = React.useMemo(() => {
    let sortableItems = [...ledgerData];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    // Calculate running balance
    let runningBalance = 0;
    sortableItems.forEach(item => {
      runningBalance += (item.debit || 0) - (item.credit || 0);
      item.runningBalance = runningBalance;
    });

    return sortableItems;
  }, [ledgerData, sortConfig]);

  // Filter by search term
  const filteredData = sortedData.filter(entry =>
    entry.particulars?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.voucher_no?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Audit trail logging
  const logAuditEvent = (action, details = {}) => {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      user: 'System User', // In a real app, this would come from authentication
      action,
      details,
      ip: window.location.hostname,
      userAgent: navigator.userAgent
    };

    // Log to console (in production, this would be sent to a logging service)
    console.log('[AUDIT]', auditEntry);

    // Store in localStorage for demo purposes
    const auditLog = JSON.parse(localStorage.getItem('ledger_audit_log') || '[]');
    auditLog.push(auditEntry);
    // Keep only last 100 entries
    if (auditLog.length > 100) auditLog.shift();
    localStorage.setItem('ledger_audit_log', JSON.stringify(auditLog));
  };

  // Delete handlers
  const handleDeleteClick = (entry) => {
    setEntryToDelete(entry);
    setDeleteModalOpen(true);
    resetError();
  };

  const handleConfirmDelete = async () => {
    if (!entryToDelete) return;

    logAuditEvent('DELETE_ATTEMPT', {
      entry_id: entryToDelete.id,
      voucher_no: entryToDelete.voucher_no,
      company_name: entryToDelete.company_name,
      amount: entryToDelete.debit || entryToDelete.credit
    });

    await deleteLedgerRow(entryToDelete, 'company-ledger');
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setEntryToDelete(null);
    resetError();
  };

  // Export functions
  const exportToCSV = () => {
    logAuditEvent('EXPORT_CSV', {
      filters,
      recordCount: filteredData.length,
      searchTerm
    });

    const headers = ['Date', 'Particulars', 'Voucher Type', 'Voucher No.', 'Debit', 'Credit', 'Balance'];
    const csvData = filteredData.map(entry => [
      entry.date,
      entry.particulars,
      entry.voucher_type,
      entry.voucher_no,
      entry.debit,
      entry.credit,
      entry.runningBalance
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell || ''}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `company-ledger-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    logAuditEvent('EXPORT_EXCEL', {
      filters,
      recordCount: filteredData.length,
      searchTerm
    });
    // For now, use CSV export (Excel can open CSV files)
    exportToCSV();
  };

  const exportToPDF = () => {
    logAuditEvent('EXPORT_PDF', {
      filters,
      recordCount: filteredData.length,
      searchTerm
    });
    // Basic PDF export using browser print
    window.print();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  // Get balance color
  const getBalanceColor = (balance) => {
    if (balance > 0) return 'text-red-600'; // Outstanding (debit)
    if (balance < 0) return 'text-green-600'; // Advance (credit)
    return 'text-gray-600'; // Settled
  };

  if (loading && ledgerData.length === 0 && filters.company_name) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading ledger data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Building className="w-8 h-8 mr-3 text-blue-600" />
                Client Ledger
              </h1>
              <p className="text-gray-600 mt-1">Tally-style accounting ledger for client transactions</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  loadLedgerData();
                  setLastRefresh(new Date());
                  logAuditEvent('MANUAL_REFRESH');
                }}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto-refresh"
                  checked={autoRefresh}
                  onChange={(e) => {
                    setAutoRefresh(e.target.checked);
                    logAuditEvent('AUTO_REFRESH_TOGGLE', { enabled: e.target.checked });
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="auto-refresh" className="text-sm text-gray-700">
                  Auto-refresh (30s)
                </label>
              </div>
              <div className="text-sm text-gray-500">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Opening Balance</div>
              <div className="text-2xl font-bold text-blue-800">{formatCurrency(summary.opening_balance)}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Total Debit</div>
              <div className="text-2xl font-bold text-green-800">{formatCurrency(summary.total_debit)}</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm text-orange-600 font-medium">Total Credit</div>
              <div className="text-2xl font-bold text-orange-800">{formatCurrency(summary.total_credit)}</div>
            </div>
            <div className={`p-4 rounded-lg ${summary.closing_balance >= 0 ? 'bg-red-50' : 'bg-green-50'}`}>
              <div className={`text-sm font-medium ${getBalanceColor(summary.closing_balance)}`}>
                Closing Balance ({summary.balance_type})
              </div>
              <div className={`text-2xl font-bold ${getBalanceColor(summary.closing_balance)}`}>
                {formatCurrency(Math.abs(summary.closing_balance))}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                  <select
                    value={filters.company_name}
                    onChange={(e) => handleFilterChange('company_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Company</option>
                    {b2bCustomers.map(customer => (
                      <option key={customer.id} value={customer.company_name}>
                        {customer.company_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Voucher Type</label>
                  <select
                    value={filters.voucher_type}
                    onChange={(e) => handleFilterChange('voucher_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="Sales">Sales</option>
                    <option value="Receipt">Receipt</option>
                  </select>
                </div>
              </div>
            </div>

          {/* Search and Export */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by particulars or voucher no..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={exportToCSV}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                CSV
              </button>
              <button
                onClick={exportToExcel}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Excel
              </button>
              <button
                onClick={exportToPDF}
                className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-600 font-medium">Error loading ledger data:</div>
              <div className="ml-2 text-red-800">{error}</div>
            </div>
          </div>
        )}

        {/* Ledger Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    { key: 'date', label: 'Date' },
                    { key: 'particulars', label: 'Particulars' },
                    { key: 'voucher_type', label: 'Voucher Type' },
                    { key: 'voucher_no', label: 'Voucher No.' },
                    { key: 'debit', label: 'Debit' },
                    { key: 'credit', label: 'Credit' },
                    { key: 'balance', label: 'Balance' },
                    { key: 'actions', label: 'Actions' }
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => key !== 'actions' && handleSort(key)}
                    >
                      <div className="flex items-center">
                        {label}
                        {key !== 'actions' && sortConfig.key === key && (
                          sortConfig.direction === 'asc' ?
                            <ChevronUp className="w-4 h-4 ml-1" /> :
                            <ChevronDown className="w-4 h-4 ml-1" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                          Loading...
                        </div>
                      ) : !filters.company_name ? (
                        <div>
                          <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium">Select a Company</p>
                          <p className="text-sm">Choose a company from the dropdown above to view its ledger</p>
                        </div>
                      ) : (
                        <div>
                          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium">No ledger entries found</p>
                          <p className="text-sm">No transactions found for the selected company and filters</p>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredData.map((entry, index) => (
                    <tr key={`${entry.id}-${entry.entry_type}-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.date ? new Date(entry.date).toLocaleDateString('en-IN') : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={entry.particulars}>
                        {entry.particulars}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          entry.voucher_type === 'Sales' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {entry.voucher_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {entry.voucher_no}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={entry.credit > 0 ? 'text-green-600' : entry.debit > 0 ? 'text-red-600' : 'text-gray-900'}>
                          {formatCurrency(entry.runningBalance)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedEntry(entry);
                              logAuditEvent('VIEW_ENTRY_DETAILS', {
                                entry_type: entry.entry_type,
                                voucher_no: entry.voucher_no,
                                company_name: entry.company_name
                              });
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(entry)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Delete Entry"
                            aria-label={`Delete entry: ${entry.particulars}`}
                            disabled={isDeleting}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-700">
                    Page {currentPage}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage * itemsPerPage >= filteredData.length}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Entry Details Modal */}
        {selectedEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Entry Details</h3>
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date</label>
                      <div className="mt-1 text-sm text-gray-900">
                        {selectedEntry.date ? new Date(selectedEntry.date).toLocaleDateString('en-IN') : '-'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Voucher Type</label>
                      <div className="mt-1 text-sm text-gray-900">{selectedEntry.voucher_type}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Voucher No.</label>
                      <div className="mt-1 text-sm text-gray-900 font-mono">{selectedEntry.voucher_no}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Entry Type</label>
                      <div className="mt-1 text-sm text-gray-900 capitalize">{selectedEntry.entry_type}</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Particulars</label>
                    <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">{selectedEntry.particulars}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company</label>
                    <div className="mt-1 text-sm text-gray-900">{selectedEntry.company_name || '-'}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Debit Amount</label>
                      <div className="mt-1 text-lg font-bold text-gray-900">
                        {selectedEntry.debit > 0 ? formatCurrency(selectedEntry.debit) : '-'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Credit Amount</label>
                      <div className="mt-1 text-lg font-bold text-gray-900">
                        {selectedEntry.credit > 0 ? formatCurrency(selectedEntry.credit) : '-'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={deleteModalOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="Delete Ledger Entry"
          message="Are you sure you want to delete this ledger entry? This action cannot be undone."
          confirmText="Delete Entry"
          cancelText="Cancel"
          isLoading={isDeleting}
          variant="danger"
        >
          {entryToDelete && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm space-y-1">
                <div><strong>Date:</strong> {entryToDelete.date ? new Date(entryToDelete.date).toLocaleDateString('en-IN') : '-'}</div>
                <div><strong>Particulars:</strong> {entryToDelete.particulars}</div>
                <div><strong>Voucher Type:</strong> {entryToDelete.voucher_type}</div>
                <div><strong>Voucher No:</strong> {entryToDelete.voucher_no}</div>
                <div><strong>Amount:</strong> {entryToDelete.debit > 0 ? formatCurrency(entryToDelete.debit) + ' (DR)' : entryToDelete.credit > 0 ? formatCurrency(entryToDelete.credit) + ' (CR)' : '-'}</div>
              </div>
            </div>
          )}
        </ConfirmationModal>
      </div>
    </div>
  );
};

export default ClientLedger;
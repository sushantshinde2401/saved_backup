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
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { API_ENDPOINTS } from '../../shared/utils';
import { getAllCompanies, getBankLedger, formatCurrency } from '../../shared/utils/api';
import useLedgerSync from '../../shared/hooks/useLedgerSync';
import useDeleteLedgerRow from '../../shared/hooks/useDeleteLedgerRow';
import ConfirmationModal from '../../shared/components/ConfirmationModal';

const BankLedger = () => {
  const navigate = useNavigate();
  const [ledgerData, setLedgerData] = useState([]);
  const [summary, setSummary] = useState({
    opening_balance: 0,
    total_debit: 0,
    total_credit: 0,
    closing_balance: 0,
    balance_type: 'Settled'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [companies, setCompanies] = useState([]);

  // Filter states
  const [filters, setFilters] = useState({
    company_id: '',
    start_date: '',
    end_date: ''
  });

  // UI states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [sortConfig, setSortConfig] = useState({ key: 'entry_date', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [showExpenseEntries, setShowExpenseEntries] = useState(false);

  // Delete functionality state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);

  // Fetch companies
  const fetchCompanies = async () => {
    try {
      const response = await getAllCompanies();
      setCompanies(response.data || []);
    } catch (err) {
      console.error('[BANK_LEDGER] Error fetching companies:', err);
    }
  };

  // Load ledger data
  const loadLedgerData = async () => {
    // Only load if company is selected
    if (!filters.company_id) {
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
      const params = {
        company_id: filters.company_id,
        limit: itemsPerPage.toString(),
        offset: ((currentPage - 1) * itemsPerPage).toString()
      };

      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;

      const response = await getBankLedger(params);

      if (response.status === 'success') {
        setLedgerData(response.data || []);

        // Calculate summary from entries
        const entries = response.data || [];
        const totalDebit = entries.reduce((sum, entry) => sum + (entry.dr || 0), 0);
        const totalCredit = entries.reduce((sum, entry) => sum + (entry.cr || 0), 0);
        const closingBalance = totalDebit - totalCredit;
        const balanceType = closingBalance > 0 ? 'Outstanding' : closingBalance < 0 ? 'Advance' : 'Settled';

        setSummary({
          opening_balance: 0,
          total_debit: totalDebit,
          total_credit: totalCredit,
          closing_balance: Math.abs(closingBalance),
          balance_type: balanceType
        });
      } else {
        throw new Error(response.message || 'Failed to fetch ledger data');
      }
    } catch (err) {
      setError(err.message);
      console.error('[BANK_LEDGER] Error loading ledger data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sync hook for cross-tab updates
  const { triggerSync } = useLedgerSync({
    onSync: () => {
      // Only sync if we have a company selected
      if (filters.company_id) {
        console.log('[BANK_LEDGER] Sync triggered, refreshing data');
        loadLedgerData();
      }
    },
    syncKey: 'expense_ledger_sync', // Use same sync key as ExpenseLedger
    pollInterval: 15000 // Check every 15 seconds
  });

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
        return newData.sort((a, b) => new Date(b.entry_date || '1900-01-01') - new Date(a.entry_date || '1900-01-01'));
      });
    }
  });

  // Load companies on component mount
  useEffect(() => {
    fetchCompanies();
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

  // Sort data
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
    return sortableItems;
  }, [ledgerData, sortConfig]);

  // Filter by search term and expense entries
  const filteredData = sortedData.filter(entry => {
    const matchesSearch = entry.particulars?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          entry.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExpenseFilter = !showExpenseEntries || entry.source === 'expense_ledger';
    return matchesSearch && matchesExpenseFilter;
  });

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Audit trail logging
  const logAuditEvent = (action, details = {}) => {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      user: 'System User',
      action,
      details,
      ip: window.location.hostname,
      userAgent: navigator.userAgent
    };

    console.log('[AUDIT]', auditEntry);

    const auditLog = JSON.parse(localStorage.getItem('bank_ledger_audit_log') || '[]');
    auditLog.push(auditEntry);
    if (auditLog.length > 100) auditLog.shift();
    localStorage.setItem('bank_ledger_audit_log', JSON.stringify(auditLog));
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
      particulars: entryToDelete.particulars,
      transactionId: entryToDelete.transaction_id,
      amount: entryToDelete.cr || entryToDelete.dr
    });

    await deleteLedgerRow(entryToDelete, 'bank-ledger');
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

    const headers = ['Date', 'Particular', 'Transaction ID', 'DR', 'CR', 'Balance'];
    const csvData = filteredData.map(entry => [
      entry.entry_date,
      entry.particulars,
      entry.transaction_id || '',
      entry.dr,
      entry.cr,
      entry.balance
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell || ''}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bank-ledger-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    logAuditEvent('EXPORT_EXCEL', {
      filters,
      recordCount: filteredData.length,
      searchTerm
    });
    exportToCSV();
  };

  const exportToPDF = () => {
    logAuditEvent('EXPORT_PDF', {
      filters,
      recordCount: filteredData.length,
      searchTerm
    });
    window.print();
  };

  // Get balance color
  const getBalanceColor = (balance) => {
    if (balance > 0) return 'text-red-600'; // Outstanding (debit)
    if (balance < 0) return 'text-green-600'; // Advance (credit)
    return 'text-gray-600'; // Settled
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Building className="w-8 h-8 mr-3 text-blue-600" />
                Bank Ledger
              </h1>
              <p className="text-gray-600 mt-1">Tally-style accounting ledger for bank transactions</p>
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
               <button
                 onClick={() => {
                   setShowExpenseEntries(!showExpenseEntries);
                   logAuditEvent('EXPENSE_FILTER_TOGGLE', { enabled: !showExpenseEntries });
                 }}
                 className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                   showExpenseEntries
                     ? 'bg-green-600 hover:bg-green-700 text-white'
                     : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                 }`}
               >
                 <Filter className="w-4 h-4 mr-2" />
                 {showExpenseEntries ? 'Show All Entries' : 'Show Expense Entries'}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                  <select
                    value={filters.company_id}
                    onChange={(e) => handleFilterChange('company_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Company</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.company_name}
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
                placeholder="Search by particulars or transaction ID..."
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
                    { key: 'entry_date', label: 'Date' },
                    { key: 'particulars', label: 'Particular' },
                    { key: 'transaction_id', label: 'Transaction ID' },
                    { key: 'dr', label: 'DR (Debit)' },
                    { key: 'cr', label: 'CR (Credit)' },
                    { key: 'balance', label: 'Balance' }
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort(key)}
                    >
                      <div className="flex items-center">
                        {label}
                        {sortConfig.key === key && (
                          sortConfig.direction === 'asc' ?
                            <ChevronUp className="w-4 h-4 ml-1" /> :
                            <ChevronDown className="w-4 h-4 ml-1" />
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                          Loading...
                        </div>
                      ) : !filters.company_id ? (
                        <div>
                          <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium">Select a Company</p>
                          <p className="text-sm">Choose a company from the dropdown above to view its bank ledger</p>
                        </div>
                      ) : (
                        <div>
                          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium">No ledger entries found</p>
                          <p className="text-sm">No bank transactions found for the selected company and filters</p>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredData.map((entry, index) => (
                    <tr key={`${entry.entry_date}-${entry.particulars}-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.entry_date ? new Date(entry.entry_date).toLocaleDateString('en-IN') : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={entry.particulars}>
                        {entry.particulars}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {entry.transaction_id || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {entry.dr > 0 ? formatCurrency(entry.dr) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {entry.cr > 0 ? formatCurrency(entry.cr) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={entry.balance >= 0 ? 'text-red-600' : 'text-green-600'}>
                          {formatCurrency(Math.abs(entry.balance))}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedEntry(entry);
                              logAuditEvent('VIEW_ENTRY_DETAILS', {
                                particulars: entry.particulars,
                                transactionId: entry.transaction_id,
                                amount: entry.cr || entry.dr
                              });
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="View Details"
                            aria-label={`View details for ${entry.particulars}`}
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
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Bank Ledger Entry"
        message="Are you sure you want to delete this bank ledger entry? This action cannot be undone."
        confirmText="Delete Entry"
        cancelText="Cancel"
        isLoading={isDeleting}
        variant="danger"
      >
        {entryToDelete && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm space-y-1">
              <div><strong>Date:</strong> {entryToDelete.entry_date ? new Date(entryToDelete.entry_date).toLocaleDateString('en-IN') : '-'}</div>
              <div><strong>Particulars:</strong> {entryToDelete.particulars}</div>
              <div><strong>Transaction ID:</strong> {entryToDelete.transaction_id || '-'}</div>
              <div><strong>Amount:</strong> {entryToDelete.dr > 0 ? formatCurrency(entryToDelete.dr) + ' (DR)' : entryToDelete.cr > 0 ? formatCurrency(entryToDelete.cr) + ' (CR)' : '-'}</div>
            </div>
          </div>
        )}
      </ConfirmationModal>
    </div>
  );
};

export default BankLedger;
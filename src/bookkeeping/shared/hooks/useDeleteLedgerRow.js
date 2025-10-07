import { useState } from 'react';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Custom hook for deleting ledger rows with optimistic updates
 * Supports different ledger types: company-ledger, vendor-service, vendor-payment, expense-ledger, bank-ledger
 *
 * @param {Object} options - Configuration options
 * @param {Function} options.onSuccess - Callback when deletion succeeds
 * @param {Function} options.onError - Callback when deletion fails
 * @param {Function} options.onOptimisticUpdate - Callback for optimistic UI updates
 * @param {Function} options.onRevertOptimisticUpdate - Callback to revert optimistic updates
 * @returns {Object} Hook methods and state
 */
export const useDeleteLedgerRow = ({
  onSuccess,
  onError,
  onOptimisticUpdate,
  onRevertOptimisticUpdate
} = {}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  /**
   * Delete a ledger entry with optimistic updates
   * @param {Object} entry - The ledger entry to delete
   * @param {string} ledgerType - Type of ledger ('company-ledger', 'vendor-service', 'vendor-payment', 'expense-ledger', 'bank-ledger')
   */
  const deleteLedgerRow = async (entry, ledgerType) => {
    if (!entry || !entry.id) {
      const error = 'Invalid entry data';
      setDeleteError(error);
      toast.error(error);
      onError?.(error);
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    // Store original entry for potential revert
    const originalEntry = { ...entry };

    // Optimistic update - remove from UI immediately
    onOptimisticUpdate?.(entry);

    try {
      let endpoint;

      // Determine the correct endpoint based on ledger type
      switch (ledgerType) {
        case 'company-ledger':
          endpoint = `${API_ENDPOINTS.GET_COMPANY_LEDGER}/${entry.id}`;
          break;
        case 'vendor-service':
          endpoint = `${API_ENDPOINTS.DELETE_VENDOR_SERVICE}/${entry.id}`;
          break;
        case 'vendor-payment':
          endpoint = `${API_ENDPOINTS.DELETE_VENDOR_PAYMENT}/${entry.id}`;
          break;
        case 'expense-ledger':
          endpoint = `${API_ENDPOINTS.DELETE_EXPENSE_LEDGER}/${entry.id}`;
          break;
        case 'bank-ledger':
          endpoint = `${API_ENDPOINTS.DELETE_BANK_LEDGER}/${entry.id}`;
          break;
        default:
          throw new Error(`Unsupported ledger type: ${ledgerType}`);
      }

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete entry (${response.status})`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        toast.success(result.message || 'Entry deleted successfully');
        onSuccess?.(entry, result);
      } else {
        throw new Error(result.message || 'Failed to delete entry');
      }

    } catch (error) {
      console.error('[DELETE_LEDGER_ROW] Error deleting entry:', error);

      // Revert optimistic update
      onRevertOptimisticUpdate?.(originalEntry);

      const errorMessage = error.message || 'Failed to delete record. Please try again.';
      setDeleteError(errorMessage);
      toast.error(errorMessage);
      onError?.(error, originalEntry);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Reset error state
   */
  const resetError = () => {
    setDeleteError(null);
  };

  return {
    deleteLedgerRow,
    isDeleting,
    deleteError,
    resetError
  };
};

export default useDeleteLedgerRow;
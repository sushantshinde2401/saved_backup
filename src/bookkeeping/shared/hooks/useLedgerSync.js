import { useEffect, useRef } from 'react';

/**
 * Hook for synchronizing ledger data across multiple tabs/windows
 * Uses localStorage events and polling to detect changes
 * @param {Object} options - Configuration options
 * @param {Function} options.onSync - Callback when sync is triggered
 * @param {number} options.pollInterval - Polling interval in milliseconds (default: 30000)
 * @param {string} options.syncKey - localStorage key for sync events
 */
export const useLedgerSync = ({
  onSync,
  pollInterval = 30000,
  syncKey = 'ledger_sync_timestamp'
} = {}) => {
  const lastSyncRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Handle storage events (cross-tab communication)
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === syncKey && event.newValue !== event.oldValue) {
        console.log('[LEDGER_SYNC] Storage event detected, triggering sync');
        onSync?.();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [onSync, syncKey]);

  // Polling mechanism for same-tab updates
  useEffect(() => {
    if (pollInterval > 0) {
      pollIntervalRef.current = setInterval(() => {
        const currentTimestamp = localStorage.getItem(syncKey);
        if (lastSyncRef.current !== currentTimestamp) {
          lastSyncRef.current = currentTimestamp;
          console.log('[LEDGER_SYNC] Poll detected change, triggering sync');
          onSync?.();
        }
      }, pollInterval);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [onSync, pollInterval, syncKey]);

  // Trigger sync event (call this after mutations)
  const triggerSync = () => {
    const timestamp = Date.now().toString();
    localStorage.setItem(syncKey, timestamp);
    lastSyncRef.current = timestamp;
    console.log('[LEDGER_SYNC] Sync triggered at', timestamp);
  };

  // Initialize last sync timestamp
  useEffect(() => {
    lastSyncRef.current = localStorage.getItem(syncKey);
  }, [syncKey]);

  return {
    triggerSync
  };
};

export default useLedgerSync;
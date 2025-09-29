import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BankLedger from './BankLedger';
import ClientLedger from './ClientLedger';
import CompanyLedger from './CompanyLedger';
import TaxLedger from './TaxLedger';
import ExpenseLedger from './ExpenseLedger';
import VendorLedger from './VendorLedger';
import './LedgerDashboard.css';

const LedgerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedLedger, setSelectedLedger] = useState(null);
  const navigate = useNavigate();

  const ledgers = [
    { id: 'bank', name: 'Bank Ledger', component: BankLedger },
    { id: 'client', name: 'Client Ledger', component: ClientLedger },
    { id: 'company', name: 'Company Ledger', component: CompanyLedger },
    { id: 'tax', name: 'Tax Ledger', component: TaxLedger },
    { id: 'expense', name: 'Expense Ledger', component: ExpenseLedger },
    { id: 'vendor', name: 'Vendor Ledger', component: VendorLedger }
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLedgerSelect = (ledgerId) => {
    setSelectedLedger(ledgerId);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const renderSelectedLedger = () => {
    if (!selectedLedger) return null;
    const ledger = ledgers.find(l => l.id === selectedLedger);
    if (!ledger) return null;
    const Component = ledger.component;
    return <Component />;
  };

  return (
    <div className="ledger-dashboard">
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <h2>Ledger Dashboard</h2>
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {sidebarOpen ? '×' : '☰'}
        </button>
        <nav>
          <ul>
            {ledgers.map(ledger => (
              <li key={ledger.id}>
                <button
                  className={selectedLedger === ledger.id ? 'active' : ''}
                  onClick={() => handleLedgerSelect(ledger.id)}
                >
                  {ledger.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="main-content">
        <div className="mb-6">
          <button
            onClick={() => navigate('/bookkeeping')}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-full shadow-lg font-semibold text-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Bookkeeping
          </button>
        </div>

        {selectedLedger ? (
          renderSelectedLedger()
        ) : (
          <>
            <h1>Welcome to Ledger Dashboard</h1>
            <p>Select a ledger from the sidebar to view details.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default LedgerDashboard;
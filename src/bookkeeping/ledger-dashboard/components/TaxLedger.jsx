import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TaxLedger = () => {
  return (
    <div className="ledger-page">
      <h2>Tax Ledger</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Debit</th>
              <th>Credit</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="5" className="text-center py-8 text-gray-500">
                No tax ledger data available
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaxLedger;
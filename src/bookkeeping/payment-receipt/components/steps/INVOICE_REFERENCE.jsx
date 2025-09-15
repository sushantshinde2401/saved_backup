import React from 'react';
import { CheckCircle2 } from 'lucide-react';

function INVOICE_REFERENCE({ formData }) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">INVOICE_REFERENCE Step</h3>
        <p className="text-gray-600">Invoice reference details (placeholder)</p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-green-800 mb-4">Process Completed</h4>
        <p className="text-green-700">
          This is a placeholder step for confirming the completion of the invoice process.
          In a complete implementation, this would show confirmation details and next steps.
        </p>

        <div className="mt-4 p-4 bg-white rounded border">
          <p className="text-sm text-gray-600">Status: Invoice Generated Successfully</p>
          <p className="text-sm text-gray-600">Invoice ID: {formData.invoiceNumber || 'AUTO-GENERATED'}</p>
          <p className="text-sm text-gray-600">Total Amount: ₹{(parseFloat(formData.amountReceived) || 0).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

export default INVOICE_REFERENCE;
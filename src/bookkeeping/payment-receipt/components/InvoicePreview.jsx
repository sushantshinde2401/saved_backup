import React, { forwardRef } from 'react';

const InvoicePreview = forwardRef(({ data }, ref) => {
  if (!data) return null;

  return (
    <div ref={ref} className="invoice-preview p-8 bg-white">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">INVOICE</h1>
        <p className="text-gray-600">Payment Receipt</p>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-bold text-gray-800 mb-2">From:</h3>
          <p className="text-gray-600">Your Company Name</p>
          <p className="text-gray-600">Address Line 1</p>
          <p className="text-gray-600">Address Line 2</p>
          <p className="text-gray-600">City, State, ZIP</p>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 mb-2">To:</h3>
          <p className="text-gray-600">{data.partyName}</p>
          <p className="text-gray-600">Date: {data.dateReceived}</p>
          <p className="text-gray-600">Invoice #: {data.invoiceNumber}</p>
        </div>
      </div>

      <table className="w-full mb-8">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Description</th>
            <th className="text-right py-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-2">Payment Received</td>
            <td className="text-right py-2">₹{data.amountReceived}</td>
          </tr>
          {data.discount > 0 && (
            <tr>
              <td className="py-2">Discount</td>
              <td className="text-right py-2">-₹{data.discount}</td>
            </tr>
          )}
          {data.gst && (
            <tr>
              <td className="py-2">GST (18%)</td>
              <td className="text-right py-2">₹{data.gstAmount}</td>
            </tr>
          )}
          <tr className="border-t font-bold">
            <td className="py-2">Total</td>
            <td className="text-right py-2">₹{data.finalAmount}</td>
          </tr>
        </tbody>
      </table>

      <div className="text-center text-gray-600">
        <p>Thank you for your business!</p>
      </div>
    </div>
  );
});

export default InvoicePreview;
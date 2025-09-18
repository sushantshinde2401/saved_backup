import React from 'react';
import { FileText, Calculator, CheckCircle } from 'lucide-react';
import { CUSTOMER_TYPES, INVOICE_TYPES } from '../../shared/utils';

function InvoiceTypeStep({
  selectedInvoiceType,
  onSelectInvoiceType,
  onPreview,
  formData,
  particularinfoCustomers
}) {
  const handlePreview = (type) => {
    // Prepare invoice data for preview
    const invoiceData = {
      // Company Details
      companyName: formData.companyName,
      companyAddress: formData.companyAddress,
      companyGST: formData.gstNumber,
      companyState: 'Maharashtra',
      companyStateCode: formData.stateCode,

      // Bank Details
      bankDetails: {
        accountHolderName: formData.companyName,
        bankName: formData.bankName,
        accountNumber: formData.companyAccountNumber,
        branch: formData.branch,
        ifscCode: formData.ifscCode,
        swiftCode: formData.swiftCode
      },

      // Customer Details
      customerType: formData.customerType,
      customerName: formData.customerType === CUSTOMER_TYPES.B2B ? formData.selectedB2BCustomerName : formData.b2cFullName,
      customerAddress: formData.customerType === CUSTOMER_TYPES.B2B ? formData.b2bCustomerAddress : `${formData.b2cAddress}, ${formData.b2cCity}, ${formData.b2cState} - ${formData.b2cPincode}`,
      customerGST: formData.customerType === CUSTOMER_TYPES.B2B ? formData.b2bCustomerGstNumber : '',
      customerState: 'Maharashtra',
      customerStateCode: formData.customerType === CUSTOMER_TYPES.B2B ? formData.b2bCustomerStateCode : '',

      // Invoice Details
      invoiceNo: 'PROFORMA INVOICE',
      invoiceDate: new Date().toLocaleDateString('en-GB'),

      // Financial Details
      items: particularinfoCustomers.map((customer, index) => ({
        slNo: index + 1,
        particulars: `${customer.name}\n${customer.items.join('\n')}`,
        hsnSac: '',
        quantity: 1,
        rate: 1000,
        amount: 1000,
        taxable: type === INVOICE_TYPES.GST // Only taxable for GST invoices
      })),

      // Tax Details (only for GST invoices)
      ...(type === INVOICE_TYPES.GST && {
        cgstRate: 9,
        sgstRate: 9,
        cgstAmount: 0,
        sgstAmount: 0,
        totalAmount: 0
      }),

      // Total Amount (for non-GST invoices)
      ...(type === INVOICE_TYPES.REGULAR && {
        totalAmount: 0
      })
    };

    onPreview(invoiceData, type);
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <FileText className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Select Invoice Types</h3>
        <p className="text-gray-600">Choose what documents you want to generate</p>
      </div>

      {/* Invoice Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Proforma GST Invoice */}
        <div
          className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
            selectedInvoiceType === INVOICE_TYPES.GST
              ? 'border-blue-500 bg-blue-50 shadow-lg'
              : 'border-gray-200 bg-white hover:border-blue-300'
          }`}
          onClick={() => onSelectInvoiceType(INVOICE_TYPES.GST)}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calculator className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800">Proforma GST Invoice</h4>
                <p className="text-sm text-gray-600">GST-based preview</p>
              </div>
            </div>
            {selectedInvoiceType === INVOICE_TYPES.GST && (
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Goods/services with GST calculations
          </p>
          {selectedInvoiceType === INVOICE_TYPES.GST && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePreview(INVOICE_TYPES.GST);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
            >
              Preview
            </button>
          )}
        </div>

        {/* Proforma Invoice */}
        <div
          className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
            selectedInvoiceType === INVOICE_TYPES.REGULAR
              ? 'border-green-500 bg-green-50 shadow-lg'
              : 'border-gray-200 bg-white hover:border-green-300'
          }`}
          onClick={() => onSelectInvoiceType(INVOICE_TYPES.REGULAR)}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800">Proforma Invoice</h4>
                <p className="text-sm text-gray-600">Non-GST preview</p>
              </div>
            </div>
            {selectedInvoiceType === INVOICE_TYPES.REGULAR && (
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Estimate / Quotation without GST
          </p>
          {selectedInvoiceType === INVOICE_TYPES.REGULAR && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePreview(INVOICE_TYPES.REGULAR);
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
            >
              Preview
            </button>
          )}
        </div>
      </div>

      {/* Selected Documents Display */}
      {selectedInvoiceType && (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Selected Documents:</h4>
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-lg text-white font-medium ${
              selectedInvoiceType === INVOICE_TYPES.GST ? 'bg-blue-600' : 'bg-green-600'
            }`}>
              {selectedInvoiceType === INVOICE_TYPES.GST ? 'Proforma GST Invoice' : 'Proforma Invoice'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InvoiceTypeStep;
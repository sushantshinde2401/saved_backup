import React, { useState, useRef } from 'react';
import { Download, Eye, FileText, X, Printer } from 'lucide-react';
import InvoicePreview from '../InvoicePreview';

function PreviewDownloadStep({ formData }) {
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const invoiceRef = useRef();

  // Prepare invoice data for preview
  const prepareInvoiceData = () => {
    const invoiceData = {
      // Company Details
      companyName: formData.companyName || '',
      companyAddress: formData.companyAddress || '',
      companyGST: formData.gstNumber || '',
      companyStateCode: formData.stateCode || '',

      // Bank Details
      bankDetails: {
        bankName: formData.bankName || '',
        accountNumber: formData.companyAccountNumber || '',
        branch: formData.branch || '',
        ifscCode: formData.ifscCode || '',
        swiftCode: formData.swiftCode || ''
      },

      // Customer Details
      customerType: formData.customerType || 'B2B',
      customerName: formData.customerType === 'B2B'
        ? (formData.selectedB2BCustomerName || formData.b2bCustomerAddress?.split(',')[0] || '')
        : formData.b2cFullName || '',
      customerAddress: formData.customerType === 'B2B'
        ? formData.b2bCustomerAddress || ''
        : `${formData.b2cAddress || ''}, ${formData.b2cCity || ''}, ${formData.b2cState || ''} - ${formData.b2cPincode || ''}`,
      customerGST: formData.customerType === 'B2B' ? formData.b2bCustomerGstNumber || '' : '',
      customerStateCode: formData.customerType === 'B2B' ? formData.b2bCustomerStateCode || '' : '',

      // Invoice Details
      invoiceNo: formData.invoiceNumber || 'AUTO-GENERATED',
      invoiceDate: formData.dateReceived || new Date().toLocaleDateString('en-GB'),

      // Financial Details
      amountReceived: parseFloat(formData.amountReceived) || 0,
      applyGST: formData.applyGST || false,
      finalAmount: calculateFinalAmount(),

      // Billing Details
      paymentType: formData.paymentType || '',
      deliveryNote: formData.deliveryNote || '',
      dispatchDocNo: formData.dispatchDocNo || '',
      deliveryNoteDate: formData.deliveryNoteDate || '',
      dispatchThrough: formData.dispatchThrough || '',
      destination: formData.destination || '',
      termsOfDelivery: formData.termsOfDelivery || '',

      // Selected Courses
      selectedCourses: formData.selectedCourses || []
    };

    return invoiceData;
  };

  const calculateFinalAmount = () => {
    const amount = parseFloat(formData.amountReceived) || 0;
    if (formData.applyGST) {
      return amount + (amount * 0.18);
    }
    return amount;
  };

  const handlePreview = () => {
    const invoiceData = prepareInvoiceData();
    setPreviewData(invoiceData);
    setShowPreview(true);
  };

  const handleDownload = () => {
    if (invoiceRef.current) {
      window.print();
    }
  };

  // Handle data changes from InvoicePreview controls
  const handleDataChange = (updatedData) => {
    setPreviewData(updatedData);
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <FileText className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Preview & Download Invoice</h3>
        <p className="text-gray-600">Review your invoice and download as PDF</p>
      </div>

      {/* Invoice Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Invoice Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Invoice Number:</p>
            <p className="font-medium">{formData.invoiceNumber || 'AUTO-GENERATED'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date:</p>
            <p className="font-medium">{formData.dateReceived || new Date().toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Company:</p>
            <p className="font-medium">{formData.companyName || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Customer:</p>
            <p className="font-medium">
              {formData.customerType === 'B2B'
                ? (formData.selectedB2BCustomerName || 'B2B Customer')
                : (formData.b2cFullName || 'B2C Customer')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Amount:</p>
            <p className="font-medium">₹{(parseFloat(formData.amountReceived) || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Final Amount:</p>
            <p className="font-bold text-green-600">₹{calculateFinalAmount().toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons - Prominently Displayed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Preview PDF */}
        <div className="bg-white border-2 border-blue-200 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-center">
            <Eye className="w-16 h-16 text-blue-600 mx-auto mb-6" />
            <h4 className="text-xl font-bold text-gray-800 mb-3">Preview Invoice</h4>
            <p className="text-gray-600 text-base mb-6">View the complete invoice before downloading</p>
            <button
              onClick={handlePreview}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl transition-colors font-semibold text-lg flex items-center justify-center gap-3 shadow-md hover:shadow-lg"
            >
              <Eye className="w-6 h-6" />
              Preview Invoice
            </button>
          </div>
        </div>

        {/* Download PDF */}
        <div className="bg-white border-2 border-green-200 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-center">
            <Download className="w-16 h-16 text-green-600 mx-auto mb-6" />
            <h4 className="text-xl font-bold text-gray-800 mb-3">Download PDF</h4>
            <p className="text-gray-600 text-base mb-6">Download the invoice as a PDF file</p>
            <button
              onClick={handleDownload}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl transition-colors font-semibold text-lg flex items-center justify-center gap-3 shadow-md hover:shadow-lg"
            >
              <Download className="w-6 h-6" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Full Screen Invoice Preview */}
      {showPreview && previewData && (
        <div className="fixed inset-0 z-50 bg-white">
          <InvoicePreview
            ref={invoiceRef}
            data={previewData}
            onDataChange={handleDataChange}
            formData={formData}
          />
        </div>
      )}
    </div>
  );
}

export default PreviewDownloadStep;
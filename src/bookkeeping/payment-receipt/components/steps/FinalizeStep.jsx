import React, { useState, useRef } from 'react';
import { Download, Eye, Upload, FileText, CheckCircle, X, Printer, Save } from 'lucide-react';
import InvoicePreview from '../InvoicePreview';

function FinalizeStep({ formData, onSubmit, isSubmitting }) {
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
      discountAmount: parseFloat(formData.discountAmount) || 0,
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
    const discount = parseFloat(formData.discountAmount) || 0;
    const baseAmount = amount - discount;
    if (formData.applyGST) {
      return baseAmount + (baseAmount * 0.18);
    }
    return baseAmount;
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

  const handleUpload = async () => {
    const invoiceData = prepareInvoiceData();

    // Prepare data for backend upload (similar to invoice-generation)
    const uploadData = {
      ...invoiceData,
      timestamp: new Date().toISOString(),
      status: 'generated'
    };

    onSubmit(uploadData);
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Finalize Invoice</h3>
        <p className="text-gray-600">Review and finalize your invoice</p>
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

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Preview PDF */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-center">
            <Eye className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Preview PDF</h4>
            <p className="text-gray-600 text-sm mb-4">View the invoice before downloading</p>
            <button
              onClick={handlePreview}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <Eye className="w-5 h-5" />
              Preview Invoice
            </button>
          </div>
        </div>

        {/* Download PDF */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-center">
            <Download className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Download PDF</h4>
            <p className="text-gray-600 text-sm mb-4">Download the invoice as PDF</p>
            <button
              onClick={handleDownload}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Upload to Backend */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center">
          <Upload className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Upload to Database</h4>
          <p className="text-gray-600 text-sm mb-4">
            Save the invoice data to the Database system 
          </p>
          <button
            onClick={handleUpload}
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* Invoice Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Invoice Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              <InvoicePreview ref={invoiceRef} data={previewData} />
            </div>
            <div className="flex gap-4 p-4 border-t border-gray-200 justify-end">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
              <button
                onClick={handleDownload}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print / Save as PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FinalizeStep;
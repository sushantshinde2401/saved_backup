import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, Save, BookOpen } from 'lucide-react';
import { uploadToLedger } from '../../../../shared/utils/api';
import { toast } from 'react-toastify';

function FinalizeStep({ formData, onUploadInvoiceData, savedInvoiceData, isUploadingInvoice, availableCertificates, savedReceiptData }) {
  const [isUploadingLedger, setIsUploadingLedger] = useState(false);
  const [ledgerUploaded, setLedgerUploaded] = useState(false);

  const calculateFinalAmount = () => {
    const amount = parseFloat(formData.amountReceived) || 0;
    if (formData.applyGST) {
      return amount + (amount * 0.18);
    }
    return amount;
  };

  const handleUploadInvoiceData = async () => {
    if (savedInvoiceData) {
      // Data already saved, show message
      return;
    }

    // Validate required fields before upload
    const errors = [];
    if (!formData.invoiceNumber) errors.push('Invoice Number is required');
    if (!formData.companyName) errors.push('Company Name is required');
    if (!formData.companyAccountNumber) errors.push('Company Account Number is required');
    if (!formData.selectedCourses || formData.selectedCourses.length === 0) {
      errors.push('At least one course must be selected');
    }

    if (errors.length > 0) {
      alert(`Please fix the following errors before uploading:\n${errors.join('\n')}`);
      return;
    }

    try {
      await onUploadInvoiceData();
    } catch (error) {
      // Error is handled in the parent component
    }
  };

  const handleUploadToLedger = async () => {
    if (ledgerUploaded) {
      toast.info('Ledger data already uploaded');
      return;
    }

    // Validate required fields for ledger upload
    const errors = [];
    if (!savedInvoiceData) {
      errors.push('Please upload invoice data first before uploading to ledger');
    }
    if (!formData.partyName) errors.push('Party Name (Company) is required');
    if (!formData.invoiceNumber) errors.push('Invoice Number is required');
    if (!formData.dateReceived) errors.push('Date Received is required');
    if (!formData.selectedCourses || formData.selectedCourses.length === 0) {
      errors.push('At least one course must be selected');
    }

    if (errors.length > 0) {
      toast.error(`Please fix the following errors before uploading to ledger:\n${errors.join('\n')}`);
      return;
    }

    setIsUploadingLedger(true);
    try {
      // Format particulars from selected courses
      const particulars = formData.selectedCourses.map(courseId => {
        const certificate = availableCertificates?.find(cert => cert.id === courseId);
        return certificate ? `${certificate.firstName} ${certificate.lastName} - ${certificate.certificateName}` : `Course ID: ${courseId}`;
      }).join(', ');

      // Calculate final amount
      const finalAmount = calculateFinalAmount();

      const ledgerData = {
        company_name: formData.partyName,
        date: formData.dateReceived,
        particulars: particulars,
        voucher_no: formData.invoiceNumber,
        debit: finalAmount,
        credit: 0, // Assuming debit entry
        voucher_type: 'Sales'
      };

      await uploadToLedger(ledgerData);
      setLedgerUploaded(true);
      toast.success('Data uploaded to ledger successfully!');
    } catch (error) {
      console.error('Error uploading to ledger:', error);
      toast.error(`Error uploading to ledger: ${error.message}`);
    } finally {
      setIsUploadingLedger(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Finalize & Upload</h3>
        <p className="text-gray-600">Review invoice details and upload data</p>
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


      {/* Upload Invoice Data - Prominently Displayed */}
      <div className="bg-white border-2 border-purple-200 rounded-xl p-8 shadow-lg">
        <div className="text-center">
          <Save className="w-16 h-16 text-purple-600 mx-auto mb-6" />
          <h4 className="text-xl font-bold text-gray-800 mb-3">Upload Invoice Data</h4>
          <p className="text-gray-600 text-base mb-6">
            Save Steps 1-4 data to ReceiptInvoiceData table
            {savedInvoiceData && (
              <span className="block text-green-600 font-semibold text-lg mt-2">
                ✓ Data uploaded successfully (Invoice: {savedInvoiceData.invoice_no})
              </span>
            )}
          </p>
          <button
            onClick={handleUploadInvoiceData}
            disabled={isUploadingInvoice || savedInvoiceData}
            className={`w-full py-4 px-6 rounded-xl transition-colors font-semibold text-lg flex items-center justify-center gap-3 shadow-md hover:shadow-lg ${
              isUploadingInvoice || savedInvoiceData
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {isUploadingInvoice ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : savedInvoiceData ? (
              <>
                <CheckCircle className="w-6 h-6" />
                Data Uploaded
              </>
            ) : (
              <>
                <Save className="w-6 h-6" />
                Upload Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* Workflow Arrow */}
      <div className="flex justify-center my-6">
        <div className="flex items-center text-gray-400">
          <div className="w-8 h-0.5 bg-gray-300"></div>
          <div className="mx-2 text-sm">Then</div>
          <div className="w-8 h-0.5 bg-gray-300"></div>
        </div>
      </div>

      {/* Upload to Ledger */}
      <div className={`bg-white border-2 rounded-xl p-8 shadow-lg transition-all duration-300 ${
        !savedInvoiceData ? 'border-gray-200 opacity-75' : 'border-blue-200'
      }`}>
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-blue-600 mx-auto mb-6" />
          <h4 className="text-xl font-bold text-gray-800 mb-3">Upload to Ledger</h4>
          <p className="text-gray-600 text-base mb-6">
            Save invoice data to the company ledger under {formData.partyName || 'selected company'}.
            <span className="block text-sm text-orange-600 mt-1">
              Note: Invoice data must be uploaded first before ledger upload is available.
            </span>
            {ledgerUploaded && (
              <span className="block text-green-600 font-semibold text-lg mt-2">
                ✓ Data uploaded to ledger successfully!
              </span>
            )}
          </p>
          <button
            onClick={handleUploadToLedger}
            disabled={isUploadingLedger || ledgerUploaded || !formData.partyName || !savedInvoiceData}
            className={`w-full py-4 px-6 rounded-xl transition-colors font-semibold text-lg flex items-center justify-center gap-3 shadow-md hover:shadow-lg ${
              isUploadingLedger || ledgerUploaded || !formData.partyName || !savedInvoiceData
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isUploadingLedger ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading to Ledger...
              </>
            ) : ledgerUploaded ? (
              <>
                <CheckCircle className="w-6 h-6" />
                Uploaded to Ledger
              </>
            ) : (
              <>
                <BookOpen className="w-6 h-6" />
                Upload to Ledger
              </>
            )}
          </button>
          {!formData.partyName && (
            <p className="text-sm text-red-600 mt-2">Please select a company in Billing Info step</p>
          )}
          {formData.partyName && !savedInvoiceData && (
            <p className="text-sm text-orange-600 mt-2">Please upload invoice data first before uploading to ledger</p>
          )}
        </div>
      </div>

    </div>
  );
}

export default FinalizeStep;
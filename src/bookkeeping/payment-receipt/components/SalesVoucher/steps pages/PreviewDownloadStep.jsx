import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, FileText } from 'lucide-react';

function PreviewDownloadStep({ formData }) {
  const navigate = useNavigate();
  const invoiceRef = useRef();

  // Prepare invoice data for preview
  const prepareInvoiceData = async () => {
    // Resolve selected courses to full objects
    let resolvedCourses = [];
    if (formData.selectedCourses && formData.selectedCourses.length > 0) {
      try {
        const response = await fetch('http://localhost:5000/certificate/get-certificate-selections-for-receipt');
        if (response.ok) {
          const result = await response.json();
          const aggregatedCertificates = result.data || [];
          console.log('[PREVIEW] Aggregated certificates from API:', aggregatedCertificates);

          // Flatten the aggregated data to get individual certificates
          const allCertificates = [];
          aggregatedCertificates.forEach(candidateGroup => {
            if (candidateGroup.certificates) {
              candidateGroup.certificates.forEach(cert => {
                allCertificates.push({
                  ...cert,
                  candidate_name: candidateGroup.candidate_name,
                  candidate_id: candidateGroup.candidate_id
                });
              });
            }
          });

          console.log('[PREVIEW] Flattened certificates:', allCertificates);
          console.log('[PREVIEW] Selected course IDs:', formData.selectedCourses);

          resolvedCourses = formData.selectedCourses.map(id => {
            const cert = allCertificates.find(c => c.id === id);
            console.log(`[PREVIEW] Looking for cert id ${id}, found:`, cert);
            if (cert) {
              return {
                id: cert.id,
                certificate_name: cert.certificate_name,
                candidate_name: cert.candidate_name,
                candidate_id: cert.candidate_id,
                creation_date: cert.creation_date
              };
            }
            return null;
          }).filter(Boolean);

          console.log('[PREVIEW] Resolved courses:', resolvedCourses);
        }
      } catch (error) {
        console.warn('Failed to resolve selected courses:', error);
        resolvedCourses = [];
      }
    }

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
      deliveryNoteDate: formData.deliveryNoteDate || formData.dateReceived || '',
      dispatchThrough: formData.dispatchThrough || '',
      destination: formData.destination || '',
      termsOfDelivery: formData.termsOfDelivery || '',

      // Selected Courses - pass both IDs and resolved objects
      selectedCourses: formData.selectedCourses || [],
      selected_courses_resolved: resolvedCourses,
      availableCertificates: [] // Will be populated by InvoicePreview component
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

  const handlePreview = async () => {
    const invoiceData = await prepareInvoiceData();
    navigate('/bookkeeping/invoice-preview', {
      state: {
        data: invoiceData,
        formData: formData
      }
    });
  };



  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <FileText className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Preview Invoice</h3>
        <p className="text-gray-600">Review your invoice</p>
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
      <div className="grid grid-cols-1 gap-8">
        {/* Preview PDF */}
        <div className="bg-white border-2 border-blue-200 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow max-w-md mx-auto">
          <div className="text-center">
            <Eye className="w-16 h-16 text-blue-600 mx-auto mb-6" />
            <h4 className="text-xl font-bold text-gray-800 mb-3">Preview Invoice</h4>
            <p className="text-gray-600 text-base mb-6">View the complete invoice</p>
            <button
              onClick={handlePreview}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl transition-colors font-semibold text-lg flex items-center justify-center gap-3 shadow-md hover:shadow-lg"
            >
              <Eye className="w-6 h-6" />
              Preview Invoice
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default PreviewDownloadStep;
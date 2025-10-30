import React, { useState, useEffect } from 'react';
import { Receipt, DollarSign, Calendar, FileText, User, RefreshCw } from 'lucide-react';

function BillingInfoStep({ formData, onInputChange, availableCertificates }) {
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);



  // Load data on component mount
  useEffect(() => {
    loadAvailableCompanies();
    // Auto-generate invoice number when component mounts if not already set
    if (!formData.invoiceNumber) {
      generateInvoiceNumber();
    }
  }, []);

  // Load available companies from certificate selections
  const loadAvailableCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const response = await fetch('http://localhost:5000/certificate/get-certificate-selections-for-receipt');
      if (response.ok) {
        const result = await response.json();
        const certificates = result.data || [];
        console.log('[BILLING] Loaded certificates for companies:', certificates);

        // Extract unique company names from certificates where client_name is not empty
        const companies = [...new Set(
          certificates
            .filter(cert => cert.client_name && cert.client_name.trim() !== '')
            .map(cert => cert.client_name)
        )];

        console.log('[BILLING] Available companies:', companies);
        setAvailableCompanies(companies);
      } else {
        console.warn('[BILLING] Failed to load companies from certificates');
        setAvailableCompanies([]);
      }
    } catch (error) {
      console.error('[BILLING] Error loading companies from certificates:', error);
      setAvailableCompanies([]);
    } finally {
      setLoadingCompanies(false);
    }
  };

  // Generate invoice number
  const generateInvoiceNumber = async () => {
    setGeneratingInvoice(true);
    try {
      const response = await fetch('http://localhost:5000/api/bookkeeping/generate-invoice-number');
      if (response.ok) {
        const result = await response.json();
        const invoiceNumber = result.data.invoice_number;
        onInputChange('invoiceNumber', invoiceNumber);
        console.log('[BILLING] Generated invoice number:', invoiceNumber);
      } else {
        console.error('[BILLING] Failed to generate invoice number');
      }
    } catch (error) {
      console.error('[BILLING] Error generating invoice number:', error);
    } finally {
      setGeneratingInvoice(false);
    }
  };

  // Force re-render GST calculations when amount changes
  useEffect(() => {
    // This ensures GST fields update immediately when amountReceived changes
  }, [formData.amountReceived]);

  const calculateFinalAmount = () => {
    const amount = parseFloat(formData.amountReceived) || 0;
    if (formData.applyGST) {
      const gstRate = parseFloat(formData.gstRate) || 18;
      return (amount + (amount * gstRate / 100)).toFixed(2);
    }
    return amount.toFixed(2);
  };

  const handleCourseSelection = (courseId) => {
    const isCurrentlySelected = formData.selectedCourses?.includes(courseId) || false;
    const newSelectedCourses = isCurrentlySelected
      ? formData.selectedCourses.filter(id => id !== courseId)
      : [...(formData.selectedCourses || []), courseId];

    // Update selected courses
    onInputChange('selectedCourses', newSelectedCourses);
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <Receipt className="w-16 h-16 text-purple-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Billing Info</h3>
        <p className="text-gray-600">Configure billing details and select courses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Party Name (Auto-populated from B2B Customer) */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-1" />
            Party Name (Company) *
          </label>
          <input
            type="text"
            value={formData.partyName || ''}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
            placeholder="Will be auto-populated from B2B Customer selection"
          />
          <p className="text-sm text-gray-500 mt-1">
            Party name is automatically set from the selected B2B customer in Client Info step.
          </p>
        </div>

        {/* Invoice Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-1" />
            Invoice No. *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.invoiceNumber || ''}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
              placeholder="Auto-generated invoice number"
            />
            <button
              type="button"
              onClick={generateInvoiceNumber}
              disabled={generatingInvoice}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors flex items-center gap-1"
              title="Generate new invoice number"
            >
              <RefreshCw className={`w-4 h-4 ${generatingInvoice ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Invoice number is auto-generated in format: AMA/FY-25-26/XXXX
          </p>
        </div>

        {/* Date Received */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Date Received *
          </label>
          <input
            type="date"
            value={formData.dateReceived || ''}
            onChange={(e) => onInputChange('dateReceived', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Amount Received */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" />
            Amount Received *
          </label>
          <input
            type="number"
            value={formData.amountReceived || ''}
            onChange={(e) => onInputChange('amountReceived', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter amount received"
          />
        </div>


        {/* Apply GST Checkbox and Rate Input */}
        <div className="md:col-span-2 flex items-center space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.applyGST || false}
              onChange={(e) => onInputChange('applyGST', e.target.checked)}
              className="w-4 h-4 mr-2"
              id="gst-checkbox"
            />
            <label htmlFor="gst-checkbox" className="text-sm font-medium text-gray-700">Apply GST</label>
          </div>
          {formData.applyGST && (
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">GST Rate (%):</label>
              <input
                type="number"
                value={formData.gstRate || 18}
                onChange={(e) => onInputChange('gstRate', e.target.value)}
                className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          )}
        </div>

        {/* CGST and SGST Fields - Only show when GST is applied */}
        {formData.applyGST && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                CGST ({((parseFloat(formData.gstRate) || 18) / 2).toFixed(2)}%)
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg font-semibold bg-blue-50 text-blue-800">
                ₹{((parseFloat(formData.amountReceived) || 0) * ((parseFloat(formData.gstRate) || 18) / 2) / 100).toFixed(2)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                SGST ({((parseFloat(formData.gstRate) || 18) / 2).toFixed(2)}%)
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg font-semibold bg-blue-50 text-blue-800">
                ₹{((parseFloat(formData.amountReceived) || 0) * ((parseFloat(formData.gstRate) || 18) / 2) / 100).toFixed(2)}
              </div>
            </div>
          </>
        )}

        {/* Final Amount */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" />
            Final Amount {formData.applyGST ? '(After GST)' : ''}
          </label>
          <div className="w-full px-3 py-2 border border-gray-300 rounded-lg font-bold text-lg bg-green-50 text-green-800">
            ₹{calculateFinalAmount()}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Base: ₹{(parseFloat(formData.amountReceived) || 0).toLocaleString('en-IN')}
            {formData.applyGST && ` + GST: ₹${((parseFloat(formData.amountReceived) || 0) * (parseFloat(formData.gstRate) || 18) / 100).toFixed(2)}`}
          </p>
        </div>


      </div>

      {/* Course Selection */}
      <div className="mt-8">
        <h4 className="text-lg font-bold text-gray-800 mb-4">
          Select Courses * {formData.partyName ? `(for ${formData.partyName})` : ''}
        </h4>
        {!formData.partyName ? (
          <div className="text-center py-8 text-gray-500">
            <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Please select a company first</p>
            <p className="text-sm">Select a party name above to load available courses</p>
          </div>
        ) : availableCertificates && availableCertificates.length > 0 ? (
          <div className="space-y-6 max-h-96 overflow-y-auto">
            {/* Group certificates by client_name */}
            {(() => {
              console.log('[BILLING] availableCertificates:', availableCertificates);
              console.log('[BILLING] formData.partyName:', formData.partyName);

              // Flatten the certificates from the aggregated data structure
              const allCertificates = [];
              availableCertificates.forEach(candidateGroup => {
                if (candidateGroup.client_name === formData.partyName && candidateGroup.certificates) {
                  // Add candidate info to each certificate
                  candidateGroup.certificates.forEach(cert => {
                    allCertificates.push({
                      ...cert,
                      candidate_name: candidateGroup.candidate_name,
                      candidate_id: candidateGroup.candidate_id
                    });
                  });
                }
              });

              console.log('[BILLING] flattened certificates:', allCertificates);

              const groupedCertificates = allCertificates
                .reduce((acc, certificate) => {
                  const clientName = formData.partyName; // All are for the same company
                  if (!acc[clientName]) {
                    acc[clientName] = {
                      candidates: new Set(),
                      certificates: []
                    };
                  }
                  acc[clientName].candidates.add(certificate.candidate_name);
                  acc[clientName].certificates.push(certificate);
                  return acc;
                }, {});

              console.log('[BILLING] groupedCertificates:', groupedCertificates);

              return Object.entries(groupedCertificates).map(([clientName, data]) => (
                <div key={clientName} className="border rounded-lg p-4 bg-gray-50">
                  <h5 className="font-bold text-gray-800 mb-3">{clientName}</h5>

                  {/* Candidate Names Section */}
                  <div className="mb-4">
                    <h6 className="text-sm font-semibold text-gray-700 mb-2">Candidates:</h6>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(data.candidates).map((candidateName) => (
                        <span key={`candidate-${candidateName}`} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {candidateName.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Individual Certificate Selection Section */}
                  <div>
                    <h6 className="text-sm font-semibold text-gray-700 mb-2">Select Individual Certificates:</h6>
                    <div className="space-y-2">
                      {data.certificates.map((certificate) => {
                        console.log('[BILLING] Rendering certificate:', certificate);
                        return (
                          <div
                            key={`cert-${certificate.id}`}
                            className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                              formData.selectedCourses?.includes(certificate.id)
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.selectedCourses?.includes(certificate.id) || false}
                                onChange={() => handleCourseSelection(certificate.id)}
                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                              />
                              <div className="ml-3">
                                <h6 className="font-semibold text-gray-800">
                                  {certificate.certificate_name}
                                </h6>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Generated:</span> {new Date(certificate.creation_date).toLocaleDateString()}
                                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                    {certificate.candidate_name ? certificate.candidate_name.replace(/_/g, ' ') : 'Unknown'}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ));
            })()}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No certificates available for {formData.partyName}</p>
            <p className="text-sm">Generate certificates for this company to see them here</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BillingInfoStep;
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, X, Calendar, User, FileText, FilePlus, Printer, Trash2, DollarSign } from 'lucide-react';
import InvoicePreview from './InvoicePreview';
import { motion, AnimatePresence } from 'framer-motion';

function ReceiptEntries() {
  const navigate = useNavigate();

  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const invoiceRef = useRef();

  // Receipt Entry Modal State
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState({
    partyName: '',
    dateReceived: '',
    amountReceived: '',
    discount: '',
    paymentType: '',
    selectedCourses: [],
    accountNumber: '',
    invoiceNumber: '',
    deliveryNote: '',
    dispatchDocNo: '',
    deliveryNoteDate: '',
    dispatchedThrough: '',
    destination: '',
    termsOfDelivery: '',
    gst: false
  });

  // Certificate and company data
  const [availableCertificates, setAvailableCertificates] = useState([]);
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [rateData, setRateData] = useState({});
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const [rateWarning, setRateWarning] = useState('');

  // For dropdowns
  const deliveryNoteOptions = ["Note A", "Note B", "Note C"];
  const dispatchedThroughOptions = ["Courier", "Hand Delivery", "Transport"];

  // For auto-increment Dispatch Doc No.
  const getNextDispatchDocNo = () => {
    const lastNo = parseInt(localStorage.getItem('lastDispatchDocNo') || '1000', 10);
    const nextNo = lastNo + 1;
    localStorage.setItem('lastDispatchDocNo', nextNo);
    return nextNo.toString();
  };

  // Payment types dropdown
  const paymentTypes = [
    { value: 'cash', label: 'Cash' },
    { value: 'neft', label: 'NEFT' },
    { value: 'gpay', label: 'GPay' }
  ];

  // Load data on component mount
  useEffect(() => {
    loadCertificateSelections();
    loadRateData();
    loadAvailableCompanies();
  }, []);

  // Load certificate selections from backend
  const loadCertificateSelections = async () => {
    try {
      console.log('[RECEIPT] Loading certificate selections from API...');
      const response = await fetch('http://localhost:5000/get-certificate-selections-for-receipt');

      if (response.ok) {
        const result = await response.json();
        const certificates = result.data || [];
        setAvailableCertificates(certificates);
        console.log('[RECEIPT] Successfully loaded certificate selections:', certificates);
        console.log('[RECEIPT] Number of certificates loaded:', certificates.length);

        // Log each certificate for debugging
        certificates.forEach((cert, index) => {
          console.log(`[RECEIPT] Certificate ${index + 1}:`, {
            id: cert.id,
            name: `${cert.firstName} ${cert.lastName} - ${cert.certificateName}`,
            company: cert.companyName || 'Unprocessed',
            amount: cert.amount
          });
        });
      } else {
        console.warn('[RECEIPT] Failed to load certificate selections. Status:', response.status);
        setAvailableCertificates([]);
      }
    } catch (error) {
      console.error('[RECEIPT] Error loading certificate selections:', error);
      setAvailableCertificates([]);
    }
  };

  // Load rate data from localStorage
  const loadRateData = () => {
    const savedRates = JSON.parse(localStorage.getItem('courseRates') || '{}');
    setRateData(savedRates);
    console.log('[RECEIPT] Loaded rate data:', savedRates);
  };

  // Load available companies from certificate selections
  const loadAvailableCompanies = async () => {
    try {
      const response = await fetch('http://localhost:5000/get-certificate-selections-for-receipt');
      if (response.ok) {
        const result = await response.json();
        const certificates = result.data || [];

        // Extract unique company names from certificates where companyName is not empty
        const companies = [...new Set(
          certificates
            .filter(cert => cert.companyName && cert.companyName.trim() !== '')
            .map(cert => cert.companyName)
        )];

        setAvailableCompanies(companies);
        console.log('[RECEIPT] Available companies from certificates:', companies);
      } else {
        console.warn('[RECEIPT] Failed to load companies from certificates');
        setAvailableCompanies([]);
      }
    } catch (error) {
      console.error('[RECEIPT] Error loading companies from certificates:', error);
      setAvailableCompanies([]);
    }
  };

  // Calculate amount when courses and company are selected
  useEffect(() => {
    calculateTotalAmount();
  }, [receiptData.selectedCourses, receiptData.partyName, rateData]);

  const calculateTotalAmount = () => {
    console.log('[RECEIPT] Calculating total amount...');
    console.log('[RECEIPT] Selected company:', receiptData.partyName);
    console.log('[RECEIPT] Selected courses:', receiptData.selectedCourses);

    if (!receiptData.partyName || receiptData.selectedCourses.length === 0) {
      console.log('[RECEIPT] No company or courses selected, setting amount to 0');
      setCalculatedAmount(0);
      setRateWarning('');
      return;
    }

    let totalAmount = 0;
    let warnings = [];
    const companyRates = rateData[receiptData.partyName] || {};
    console.log('[RECEIPT] Company rates:', companyRates);

    receiptData.selectedCourses.forEach(courseId => {
      const certificate = availableCertificates.find(cert => cert.id === courseId);
      if (certificate) {
        const rate = companyRates[certificate.certificateName] || 0;
        totalAmount += rate;
        console.log(`[RECEIPT] Course: ${certificate.certificateName}, Rate: ₹${rate}`);

        if (rate === 0) {
          warnings.push(`${certificate.certificateName}: Rate not found`);
        }
      } else {
        console.warn(`[RECEIPT] Certificate not found for ID: ${courseId}`);
      }
    });

    console.log('[RECEIPT] Total calculated amount:', totalAmount);
    setCalculatedAmount(totalAmount);
    setReceiptData(prev => ({ ...prev, amountReceived: totalAmount.toString() }));

    if (warnings.length > 0) {
      setRateWarning(`⚠️ ${warnings.join(', ')}`);
      console.log('[RECEIPT] Rate warnings:', warnings);
    } else {
      setRateWarning('');
    }
  };

  // Handle form input changes
  const handleReceiptInputChange = (field, value) => {
    setReceiptData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle course selection
  const handleCourseSelection = (courseId) => {
    const certificate = availableCertificates.find(cert => cert.id === courseId);
    const isCurrentlySelected = receiptData.selectedCourses.includes(courseId);

    console.log(`[RECEIPT] ${isCurrentlySelected ? 'Deselecting' : 'Selecting'} course:`,
      certificate ? `${certificate.firstName} ${certificate.lastName} - ${certificate.certificateName}` : courseId);

    setReceiptData(prev => ({
      ...prev,
      selectedCourses: prev.selectedCourses.includes(courseId)
        ? prev.selectedCourses.filter(id => id !== courseId)
        : [...prev.selectedCourses, courseId]
    }));
  };

  // Reset modal
  const resetReceiptModal = () => {
    setShowReceiptModal(false);
    setReceiptData({
      partyName: '',
      dateReceived: '',
      amountReceived: '',
      discount: '',
      paymentType: '',
      selectedCourses: [],
      accountNumber: '',
      invoiceNumber: '',
      deliveryNote: '',
      dispatchDocNo: '',
      deliveryNoteDate: '',
      dispatchedThrough: '',
      destination: '',
      termsOfDelivery: '',
      gst: false
    });
    setCalculatedAmount(0);
    setRateWarning('');
  };

  // Auto-fill fields when opening modal
  useEffect(() => {
    if (showReceiptModal) {
      setReceiptData(prev => ({
        ...prev,
        dispatchDocNo: getNextDispatchDocNo(),
        deliveryNoteDate: prev.dateReceived || '',
      }));
    }
  }, [showReceiptModal]);

  // Auto-update deliveryNoteDate when dateReceived changes
  useEffect(() => {
    setReceiptData(prev => ({ ...prev, deliveryNoteDate: prev.dateReceived }));
  }, [receiptData.dateReceived]);

  // Handle receipt submission
  const handleReceiptSubmit = async () => {
    // Validate required fields
    if (!receiptData.partyName || !receiptData.dateReceived || receiptData.selectedCourses.length === 0) {
      alert('Please fill in all required fields and select at least one course.');
      return;
    }

    try {
      // Update certificate selections with company data
      await fetch('http://localhost:5000/update-certificate-company-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          certificateIds: receiptData.selectedCourses,
          companyName: receiptData.partyName,
          rateData: rateData
        }),
      });

      // GST calculation
      const GST_PERCENT = 18; // fixed GST %
      let gstAmount = 0;
      let finalAmount = (parseFloat(receiptData.amountReceived) || 0) - (parseFloat(receiptData.discount) || 0);
      if (receiptData.gst) {
        gstAmount = (finalAmount * GST_PERCENT) / 100;
        finalAmount += gstAmount;
      }

      // Create receipt entry with new fields
      const receiptEntry = {
        id: Date.now(),
        partyName: receiptData.partyName,
        dateReceived: receiptData.dateReceived,
        amountReceived: parseFloat(receiptData.amountReceived) || 0,
        discount: parseFloat(receiptData.discount) || 0,
        finalAmount,
        paymentType: receiptData.paymentType,
        accountNumber: receiptData.accountNumber,
        invoiceNumber: receiptData.invoiceNumber,
        deliveryNote: receiptData.deliveryNote,
        dispatchDocNo: receiptData.dispatchDocNo,
        deliveryNoteDate: receiptData.deliveryNoteDate,
        dispatchedThrough: receiptData.dispatchedThrough,
        destination: receiptData.destination,
        termsOfDelivery: receiptData.termsOfDelivery,
        gst: receiptData.gst,
        gstAmount,
        // Store individual candidate course details for detailed ledger display
        candidateCourses: receiptData.selectedCourses.map(courseId => {
          const cert = availableCertificates.find(c => c.id === courseId);
          return cert ? {
            candidateId: cert.id,
            candidateName: `${cert.firstName} ${cert.lastName}`,
            courseName: cert.certificateName,
            firstName: cert.firstName,
            lastName: cert.lastName
          } : {
            candidateId: courseId,
            candidateName: 'Unknown Candidate',
            courseName: 'Unknown Course',
            firstName: 'Unknown',
            lastName: 'Unknown'
          };
        }),
        // Keep legacy format for backward compatibility
        selectedCourses: receiptData.selectedCourses.map(courseId => {
          const cert = availableCertificates.find(c => c.id === courseId);
          return cert ? `${cert.firstName} ${cert.lastName} - ${cert.certificateName}` : 'Unknown Course';
        }),
        timestamp: new Date().toISOString()
      };

      // Save to localStorage and dispatch events for real-time sync
      const existingReceipts = JSON.parse(localStorage.getItem('receiptEntries') || '[]');
      existingReceipts.push(receiptEntry);
      localStorage.setItem('receiptEntries', JSON.stringify(existingReceipts));

      // Dispatch events to notify other components for real-time sync
      window.dispatchEvent(new CustomEvent('receiptDataUpdated', { detail: receiptEntry }));
      window.dispatchEvent(new CustomEvent('receiptEntryAdded', { detail: receiptEntry }));
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'receipt', data: receiptEntry } }));

      // Prepare only required fields for CompaniesLedger
      const ledgerData = {
        selectedCourses: receiptEntry.selectedCourses,
        finalAmount: receiptEntry.finalAmount,
        discount: receiptEntry.discount
      };

      console.log('[RECEIPT] Saved receipt entry:', receiptEntry);
      alert('Receipt entry saved successfully!');
      resetReceiptModal();

      // Reload certificate selections to reflect updated company data
      loadCertificateSelections();

      // Navigate to CompaniesLedger page with only required fields
      navigate('/bookkeeping/companies-ledger', { state: ledgerData });
    } catch (error) {
      console.error('[RECEIPT] Error saving receipt:', error);
      alert('Error saving receipt. Please try again.');
    }
  };

  return (
    <>
      {/* Receipt Entry Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center mb-6">
          <Receipt className="w-8 h-8 text-blue-700 mr-3" />
          <h2 className="text-2xl font-bold text-gray-800">
            Receipt Entry
          </h2>
        </div>
        <p className="text-gray-600 mb-4">
          Process incoming receipts from certificate selections
        </p>
        <button
          onClick={() => setShowReceiptModal(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors font-semibold"
        >
          Create Receipt Entry
        </button>
      </div>

      {/* Receipt Entry Modal */}
      <AnimatePresence>
        {showReceiptModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50"
            onClick={(e) => e.target === e.currentTarget && resetReceiptModal()}
          >
            <motion.div
              initial={{ scale: 1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1, opacity: 0 }}
              className="bg-white w-full h-full max-w-none max-h-none rounded-none shadow-none overflow-y-auto flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <Receipt className="w-6 h-6 text-blue-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-800">Receipt Entry</h2>
                </div>
                <button
                  onClick={resetReceiptModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Receipt Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Party Name (Company Selection) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Party Name (Company) *
                    </label>
                    <select
                      value={receiptData.partyName}
                      onChange={(e) => handleReceiptInputChange('partyName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Company</option>
                      {availableCompanies.map(company => (
                        <option key={company} value={company}>
                          {company}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Received */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Date Received *
                    </label>
                    <input
                      type="date"
                      value={receiptData.dateReceived}
                      onChange={(e) => handleReceiptInputChange('dateReceived', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                    <input
                      type="text"
                      value={receiptData.accountNumber}
                      onChange={e => handleReceiptInputChange('accountNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter account number"
                    />
                  </div>

                  {/* Invoice Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number</label>
                    <input
                      type="text"
                      value={receiptData.invoiceNumber}
                      onChange={e => handleReceiptInputChange('invoiceNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter invoice number"
                    />
                  </div>

                  {/* Delivery Note */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Note</label>
                    <select
                      value={receiptData.deliveryNote}
                      onChange={e => handleReceiptInputChange('deliveryNote', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Delivery Note</option>
                      {deliveryNoteOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Dispatch Doc No. (auto-generated) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dispatch Doc No.</label>
                    <input
                      type="text"
                      value={receiptData.dispatchDocNo}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none"
                    />
                  </div>

                  {/* Delivery Note Date (auto-filled) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Note Date</label>
                    <input
                      type="date"
                      value={receiptData.deliveryNoteDate}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none"
                    />
                  </div>

                  {/* Dispatched Through */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dispatched Through</label>
                    <select
                      value={receiptData.dispatchedThrough}
                      onChange={e => handleReceiptInputChange('dispatchedThrough', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Option</option>
                      {dispatchedThroughOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Destination */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                    <input
                      type="text"
                      value={receiptData.destination}
                      onChange={e => handleReceiptInputChange('destination', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter destination"
                    />
                  </div>

                  {/* Terms of Delivery */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Terms of Delivery</label>
                    <input
                      type="text"
                      value={receiptData.termsOfDelivery}
                      onChange={e => handleReceiptInputChange('termsOfDelivery', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter terms of delivery"
                    />
                  </div>

                  {/* GST Checkbox */}
                  <div className="md:col-span-2 flex items-center mt-2">
                    <input
                      type="checkbox"
                      checked={receiptData.gst}
                      onChange={e => handleReceiptInputChange('gst', e.target.checked)}
                      className="w-4 h-4 mr-2"
                      id="gst-checkbox"
                    />
                    <label htmlFor="gst-checkbox" className="text-sm font-medium text-gray-700">Apply GST (18%)</label>
                  </div>

                  {/* Amount Received */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Amount Received (Main Amount)
                    </label>
                    <input
                      type="number"
                      value={receiptData.amountReceived}
                      onChange={(e) => handleReceiptInputChange('amountReceived', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Auto-calculated from rate list"
                      readOnly
                    />
                    {rateWarning && (
                      <p className="text-sm text-orange-600 mt-1">{rateWarning}</p>
                    )}
                  </div>

                  {/* Discount Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Discount Amount
                    </label>
                    <input
                      type="number"
                      value={receiptData.discount}
                      onChange={(e) => handleReceiptInputChange('discount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter discount amount"
                      min="0"
                      max={receiptData.amountReceived}
                    />
                  </div>

                  {/* Final Amount After Discount & GST */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Final Amount {receiptData.gst ? 'After Discount & GST' : 'After Discount'}
                    </label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-green-50 text-green-800 font-bold text-lg">
                      ₹{(() => {
                        const amt = (parseFloat(receiptData.amountReceived) || 0) - (parseFloat(receiptData.discount) || 0);
                        if (receiptData.gst) {
                          return (amt + (amt * 0.18)).toLocaleString('en-IN');
                        }
                        return amt.toLocaleString('en-IN');
                      })()}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Main Amount (₹{(parseFloat(receiptData.amountReceived) || 0).toLocaleString('en-IN')}) - Discount (₹{(parseFloat(receiptData.discount) || 0).toLocaleString('en-IN')})
                      {receiptData.gst && (
                        <span> + GST (18%)</span>
                      )}
                    </p>
                  </div>

                  {/* Payment Type */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="w-4 h-4 inline mr-1" />
                      Payment Type *
                    </label>
                    <select
                      value={receiptData.paymentType}
                      onChange={(e) => handleReceiptInputChange('paymentType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Payment Type</option>
                      {paymentTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Course Selection */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Select Courses *</h3>
                  {availableCertificates.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No certificates available</p>
                      <p className="text-sm">Generate certificates first to see them here</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {availableCertificates.map((certificate) => (
                        <div
                          key={certificate.id}
                          className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                            receiptData.selectedCourses.includes(certificate.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={receiptData.selectedCourses.includes(certificate.id)}
                              onChange={() => handleCourseSelection(certificate.id)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div className="ml-3">
                              <h4 className="font-semibold text-gray-800">
                                {certificate.firstName} {certificate.lastName} - {certificate.certificateName}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Generated: {new Date(certificate.timestamp).toLocaleDateString()}
                                {!certificate.companyName || certificate.companyName === '' ? (
                                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                    Unprocessed
                                  </span>
                                ) : (
                                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                    {certificate.companyName}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-600">
                              ₹{receiptData.partyName && rateData[receiptData.partyName] && rateData[receiptData.partyName][certificate.certificateName]
                                ? rateData[receiptData.partyName][certificate.certificateName].toLocaleString()
                                : '0'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Total Amount Display */}
                {calculatedAmount > 0 && (
                  <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-green-800">Total Amount:</span>
                      <span className="text-2xl font-bold text-green-600">₹{calculatedAmount.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      const amount = parseFloat(receiptData.amountReceived) || 0;
                      const discount = parseFloat(receiptData.discount) || 0;
                      const baseAmount = amount - discount;
                      const gstAmount = receiptData.gst ? baseAmount * 0.18 : 0;
                      const finalAmount = baseAmount + gstAmount;
                      setInvoiceData({ ...receiptData, finalAmount, gstAmount });
                      setShowInvoice(true);
                    }}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    <FilePlus className="w-5 h-5" /> Generate Invoice
                  </button>
                  <button
                    onClick={handleReceiptSubmit}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors font-semibold"
                  >
                    Save Receipt Entry
                  </button>
                </div>
              </div>

              {/* Invoice Preview Modal */}
              {showInvoice && (
                <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center">
                  <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto relative p-6">
                    <button
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                      onClick={() => setShowInvoice(false)}
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <InvoicePreview ref={invoiceRef} data={invoiceData} />
                    <div className="flex gap-4 mt-6 justify-end">
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
                        onClick={() => {
                          if (invoiceRef.current) {
                            window.print();
                          }
                        }}
                      >
                        <Printer className="w-5 h-5" /> Print / Save as PDF
                      </button>
                      <button
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded flex items-center gap-2"
                        onClick={() => setShowInvoice(false)}
                      >
                        <Trash2 className="w-5 h-5" /> Delete Invoice
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ReceiptEntries;
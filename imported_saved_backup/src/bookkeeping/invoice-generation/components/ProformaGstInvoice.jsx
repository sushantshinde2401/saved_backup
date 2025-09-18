import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Printer,
  FileText,
  Building,
  User,
  Calculator,
  Banknote,
  Trash2
} from 'lucide-react';
import './ProformaGstInvoice.css';

function ProformaGstInvoice() {
  const navigate = useNavigate();
  const location = useLocation();

  // localStorage keys for persistence
  const STORAGE_KEYS = {
      INVOICE_DATA: 'gst_invoice_data',
      SELECTED_DATE: 'gst_selected_date',
      OPTIONAL_FIELDS: 'gst_optional_fields',
      VISIBLE_FIELDS: 'gst_visible_fields',
      TAXABLE_AMOUNT: 'gst_taxable_amount',
      CGST_RATE: 'gst_cgst_rate',
      SGST_RATE: 'gst_sgst_rate',
      
  };

  // Load persisted data from localStorage
  const loadPersistedData = () => {
       try {
           const persistedInvoiceData = localStorage.getItem(STORAGE_KEYS.INVOICE_DATA);
           const persistedSelectedDate = localStorage.getItem(STORAGE_KEYS.SELECTED_DATE);
           const persistedOptionalFields = localStorage.getItem(STORAGE_KEYS.OPTIONAL_FIELDS);
           const persistedVisibleFields = localStorage.getItem(STORAGE_KEYS.VISIBLE_FIELDS);
           const persistedTaxableAmount = localStorage.getItem(STORAGE_KEYS.TAXABLE_AMOUNT);
           const persistedCgstRate = localStorage.getItem(STORAGE_KEYS.CGST_RATE);
           const persistedSgstRate = localStorage.getItem(STORAGE_KEYS.SGST_RATE);

           // Clean selectedDate to ensure it's a proper date string
           let selectedDate = '2025-09-17';
           if (persistedSelectedDate) {
               try {
                   const parsed = JSON.parse(persistedSelectedDate);
                   // If parsed is a string and looks like a date, clean it
                   if (typeof parsed === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.replace(/"/g, ''))) {
                       selectedDate = parsed.replace(/"/g, '');
                   }
               } catch {
                   // If parsing fails, use default
                   selectedDate = '2025-09-17';
               }
           }

           return {
               invoiceData: persistedInvoiceData ? JSON.parse(persistedInvoiceData) : null,
               selectedDate: selectedDate,
               optionalFields: persistedOptionalFields ? JSON.parse(persistedOptionalFields) : {
                   deliveryNote: '',
                   referenceNo: '',
                   otherReferences: '',
                   dispatchDocNo: '',
                   deliveryNoteDate: '',
                   dispatchedThrough: '',
                   destination: '',
                   modeOfPayment: '',
                   buyerOrderNo: ''
               },
               visibleFields: persistedVisibleFields ? JSON.parse(persistedVisibleFields) : {
                   deliveryNote: true,
                   referenceNo: true,
                   otherReferences: true,
                   dispatchDocNo: true,
                   deliveryNoteDate: true,
                   dispatchedThrough: true,
                   destination: true,
                   modeOfPayment: true,
                   buyerOrderNo: true
               },
               taxableAmount: persistedTaxableAmount ? parseFloat(persistedTaxableAmount) : 0,
               cgstRate: persistedCgstRate ? parseFloat(persistedCgstRate) : 9,
               sgstRate: persistedSgstRate ? parseFloat(persistedSgstRate) : 9
           };
       } catch (error) {
           console.error('[PERSISTENCE] Error loading persisted data:', error);
           return {
               invoiceData: null,
               selectedDate: '2025-09-17',
               optionalFields: {
                   deliveryNote: '',
                   referenceNo: '',
                   otherReferences: '',
                   dispatchDocNo: '',
                   deliveryNoteDate: '',
                   dispatchedThrough: '',
                   destination: '',
                   modeOfPayment: '',
                   buyerOrderNo: ''
               },
               visibleFields: {
                   deliveryNote: true,
                   referenceNo: true,
                   otherReferences: true,
                   dispatchDocNo: true,
                   deliveryNoteDate: true,
                   dispatchedThrough: true,
                   destination: true,
                   modeOfPayment: true,
                   buyerOrderNo: true
               },
               taxableAmount: 0,
               cgstRate: 9,
               sgstRate: 9
           };
       }
   };

  // Save data to localStorage
  const saveToLocalStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('[PERSISTENCE] Error saving to localStorage:', error);
    }
  };

  // Initialize state with persisted data
  const initialData = loadPersistedData();
  const [invoiceData, setInvoiceData] = useState(initialData.invoiceData);
  const [isEditable, setIsEditable] = useState(true);
  const [selectedDate, setSelectedDate] = useState(initialData.selectedDate);
  const [optionalFields, setOptionalFields] = useState(initialData.optionalFields);
  const [visibleFields, setVisibleFields] = useState(initialData.visibleFields);
  const [taxableAmount, setTaxableAmount] = useState(initialData.taxableAmount);
  const [cgstRate, setCgstRate] = useState(initialData.cgstRate);
  const [sgstRate, setSgstRate] = useState(initialData.sgstRate);
  const [visibleInputs, setVisibleInputs] = useState({
      taxableAmount: true,
      cgstRate: true,
      sgstRate: true,
      totalAmount: true
  });

  // Get invoice data from navigation state or localStorage
  useEffect(() => {
    const data = location.state?.invoiceData;
    if (data) {
      setInvoiceData(data);
      saveToLocalStorage(STORAGE_KEYS.INVOICE_DATA, data);
    }
  }, [location.state]);

  // Persist data to localStorage whenever it changes
  useEffect(() => {
    if (invoiceData) {
      saveToLocalStorage(STORAGE_KEYS.INVOICE_DATA, invoiceData);
    }
  }, [invoiceData]);

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.SELECTED_DATE, selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.OPTIONAL_FIELDS, optionalFields);
  }, [optionalFields]);

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.VISIBLE_FIELDS, visibleFields);
  }, [visibleFields]);

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.TAXABLE_AMOUNT, taxableAmount);
  }, [taxableAmount]);

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.CGST_RATE, cgstRate);
  }, [cgstRate]);

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.SGST_RATE, sgstRate);
  }, [sgstRate]);



  const currentData = invoiceData || {
    companyName: '',
    companyAddress: '',
    companyGST: '',
    companyState: '',
    companyStateCode: '',
    customerType: '',
    customerName: '',
    customerAddress: '',
    customerGST: '',
    customerState: '',
    customerStateCode: '',
    invoiceNo: 'PROFORMA INVOICE',
    invoiceDate: '17-09-2025',
    deliveryNote: '',
    referenceNo: '',
    buyerOrderNo: '',
    dispatchDocNo: '',
    dispatchedThrough: '',
    termsOfDelivery: '',
    modeOfPayment: '',
    otherReferences: '',
    deliveryNoteDate: '',
    destination: '',
    // items: [
    //   {
    //     slNo: 1,
    //     particulars: 'REIMBURSEMENTS - NON TAXABLE',
    //     hsnSac: '',
    //     quantity: 1,
    //     rate: 0,
    //     amount: 0,
    //     taxable: false
    //   },
    //   {
    //     slNo: 2,
    //     particulars: 'SERVICE CHARGE + INSTITUTE (TAXABLE)',
    //     hsnSac: '',
    //     quantity: 1,
    //     rate: 0,
    //     amount: 0,
    //     taxable: true
    //   }
    // ],
    cgstRate: 9,
    sgstRate: 9,
    cgstAmount: 0,
    sgstAmount: 0,
    totalAmount: 0
  };

  // Calculate totals
  const calculateTotals = () => {
    const cgstAmount = (taxableAmount * cgstRate) / 100;
    const sgstAmount = (taxableAmount * sgstRate) / 100;
    const totalAmount = taxableAmount + cgstAmount + sgstAmount;

    return {
      taxableAmount,
      cgstAmount,
      sgstAmount,
      totalAmount
    };
  };

  const totals = calculateTotals();

  // Convert number to words
  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    const convertLessThanThousand = (n) => {
      if (n === 0) return '';
      let result = '';

      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }

      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      } else if (n >= 10) {
        result += teens[n - 10] + ' ';
        return result.trim();
      }

      if (n > 0) {
        result += ones[n] + ' ';
      }

      return result.trim();
    };

    const convert = (n) => {
      if (n === 0) return 'Zero';

      let result = '';
      let crore = Math.floor(n / 10000000);
      let lakh = Math.floor((n % 10000000) / 100000);
      let thousand = Math.floor((n % 100000) / 1000);
      let remainder = n % 1000;

      if (crore > 0) {
        result += convertLessThanThousand(crore) + ' Crore ';
      }
      if (lakh > 0) {
        result += convertLessThanThousand(lakh) + ' Lakh ';
      }
      if (thousand > 0) {
        result += convertLessThanThousand(thousand) + ' Thousand ';
      }
      if (remainder > 0) {
        result += convertLessThanThousand(remainder);
      }

      return result.trim();
    };

    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);

    let result = 'INR ' + convert(rupees);
    if (paise > 0) {
      result += ' and ' + convert(paise) + ' Paise';
    }
    result += ' Only';

    return result;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a temporary print-friendly version of the invoice
    const printContent = document.querySelector('.flex-1 .p-4.bg-white.shadow-lg');
    if (printContent) {
      // Create a new window for PDF generation
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Proforma GST Invoice</title>
              <style>
                @page {
                  size: A4;
                  margin: 15mm;
                }
                body {
                  font-family: Arial, sans-serif;
                  font-size: 12px;
                  line-height: 1.4;
                  margin: 0;
                  padding: 0;
                  -webkit-print-color-adjust: exact;
                  color-adjust: exact;
                }
                .invoice-container {
                  max-width: none;
                  width: 100%;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                }
                th, td {
                  border: 1px solid #333;
                  padding: 4px;
                  text-align: left;
                }
                th {
                  background-color: #f5f5f5;
                }
                .text-center {
                  text-align: center;
                }
                .text-right {
                  text-align: right;
                }
                .font-bold {
                  font-weight: bold;
                }
                .mb-3 {
                  margin-bottom: 12px;
                }
                .mb-4 {
                  margin-bottom: 16px;
                }
                .mt-6 {
                  margin-top: 24px;
                }
                .grid {
                  display: grid;
                  gap: 24px;
                }
                .grid-cols-2 {
                  grid-template-columns: 1fr 1fr;
                }
                .space-y-2 > * + * {
                  margin-top: 8px;
                }
                .border-b {
                  border-bottom: 1px solid #333;
                  padding-bottom: 32px;
                  margin-bottom: 4px;
                }
              </style>
            </head>
            <body>
              <div class="invoice-container">
                ${printContent.innerHTML}
              </div>
            </body>
          </html>
        `);

        printWindow.document.close();

        // Wait for content to load then print (which will trigger save as PDF)
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }
    }
  };

  const handleOptionalFieldChange = (field, value) => {
    setOptionalFields(prev => {
      const newFields = { ...prev };
      newFields[field] = value;
      return newFields;
    });
  };

  const deleteOptionalField = (field) => {
    setVisibleFields(prev => ({ ...prev, [field]: false }));
    setOptionalFields(prev => ({ ...prev, [field]: '' }));
  };

  const OptionalField = ({ label, field }) => {
    if (!visibleFields[field]) return null;

    if (!isEditable) {
      return optionalFields[field] ? (
        <div className="text-xs mb-1">
          <div className="font-medium">{label}:</div>
          <div className="text-gray-700">{optionalFields[field]}</div>
        </div>
      ) : null;
    }

    return (
      <div className="text-xs mb-1">
        <div className="font-medium mb-1">{label}:</div>
        <div className="flex items-center gap-1">
          <input
            type="text"
            defaultValue={optionalFields[field]}
            onBlur={(e) => handleOptionalFieldChange(field, e.target.value)}
            className="bg-yellow-50 border border-yellow-300 rounded px-2 py-1 text-xs flex-1"
            placeholder="Enter value"
          />
          <button
            type="button"
            onClick={() => deleteOptionalField(field)}
            className="text-red-500 hover:text-red-700 p-1"
          >
            <Trash2 size={10} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/bookkeeping')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Bookkeeping
              </button>
              <button
                onClick={() => {
                  const invoiceData = location.state?.invoiceData || currentData;
                  navigate('/bookkeeping/invoice-generation', {
                    state: {
                      invoiceData,
                      restoreStep: 4,
                      previewMode: true
                    }
                  });
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to InvoiceType
              </button>
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Proforma GST Invoice</h1>
                  <p className="text-gray-600 text-sm">Professional invoice layout</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>


      </div>
      {/* Main Content Layout */}
      <div className="flex gap-6 max-w-7xl mx-auto">
        {/* Invoice Content - Left Side */}
        <div className="flex-1 max-w-2xl">
          <div className="p-4 bg-white shadow-lg">
        {/* Tax Invoice Header */}
        <div className="text-center mb-2 bg-white px-4 py-2">
          <h1 className="text-3xl font-bold text-gray-800 tracking-wide">TAX INVOICE</h1>
        </div>

        {/* Top Section with Company/Buyer and Invoice Details */}
        <div className="grid grid-cols-2 gap-6 mb-4">
          {/* Left Side - Company and Buyer Details */}
          <div className="space-y-3">
            {/* Company Details Section */}
            <div>
              <h2 className="text-sm font-bold text-gray-800 mb-1">{currentData.companyName}</h2>
              <div className="text-xs text-gray-700 leading-tight">
                {currentData.companyAddress.split('\n').map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              </div>
              <div className="text-xs mt-1">
                <strong>GSTIN/UIN:</strong> {currentData.companyGST}
              </div>
              <div className="text-xs">
                <strong>State Name:</strong> {currentData.companyState}, <strong>Code:</strong> {currentData.companyStateCode}
              </div>
            </div>

            {/* Buyer Details Section */}
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">Buyer (Bill to)</h3>
              <div className="text-xs font-semibold text-gray-800 mb-1">{currentData.customerName}</div>
              <div className="text-xs text-gray-700 leading-tight mb-1">
                {currentData.customerAddress.split('\n').map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              </div>
              <div className="text-xs mb-1">
                <strong>GSTIN/UIN:</strong> {currentData.customerGST}
              </div>
              <div className="text-xs">
                <strong>State Name:</strong> {currentData.customerState}, <strong>Code:</strong> {currentData.customerStateCode}
              </div>
            </div>
          </div>

          {/* Right Side - Invoice Details */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left Column - Invoice Details */}
            <div className="space-y-2">
              <div className="text-xs">
                <strong>Invoice No.</strong><br />
                <span className="text-gray-700">PROFORMA INVOICE</span>
              </div>
              <div className="text-xs">
                <strong>Delivery Note</strong><br />
                <span className="text-gray-700">{optionalFields.deliveryNote || '-'}</span>
              </div>
              <div className="text-xs">
                <strong>Reference No & Date</strong><br />
                <span className="text-gray-700">{optionalFields.referenceNo || '-'}</span>
              </div>
              <div className="text-xs">
                <strong>Buyer's Order No.</strong><br />
                <span className="text-gray-700">{optionalFields.buyerOrderNo || '-'}</span>
              </div>
              <div className="text-xs">
                <strong>Dispatch Doc No</strong><br />
                <span className="text-gray-700">{optionalFields.dispatchDocNo || '-'}</span>
              </div>
            </div>

            {/* Right Column - Invoice Details */}
            <div className="space-y-2">
              <div className="text-xs">
                <strong>Dated</strong><br />
                <span className="text-gray-700">{selectedDate || currentData.invoiceDateString || currentData.invoiceDate || '2-Sep-25'}</span>
              </div>
              <div className="text-xs">
                <strong>Dispatched through</strong><br />
                <span className="text-gray-700">{optionalFields.dispatchedThrough || '-'}</span>
              </div>
              <div className="text-xs">
                <strong>Mode/Terms of Payment</strong><br />
                <span className="text-gray-700">{optionalFields.modeOfPayment || '-'}</span>
              </div>
              <div className="text-xs">
                <strong>Other References</strong><br />
                <span className="text-gray-700">{optionalFields.otherReferences || '-'}</span>
              </div>
              <div className="text-xs">
                <strong>Destination</strong><br />
                <span className="text-gray-700">{optionalFields.destination || '-'}</span>
              </div>
            </div>
          </div>


        </div>

        {/* Particulars Section */}
        <div className="mb-4">
          <table className="w-full border-collapse border border-gray-400 text-xs">
            <thead>
              <tr>
                <th className="border border-gray-400 p-1 text-center w-12">Sl No.</th>
                <th className="border border-gray-400 p-1 text-left">Particulars</th>
                <th className="border border-gray-400 p-1 text-center w-20">Amount</th>
              </tr>
            </thead>
            <tbody>
              {currentData.items.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-400 p-1 text-center">{item.slNo}</td>
                  <td className="border border-gray-400 p-1">
                    <div className="whitespace-pre-line text-xs">{item.particulars}</div>
                  </td>
                  <td className="border border-gray-400 p-1 text-right">
                    <span className="text-xs"></span>
                  </td>
                </tr>
              ))}

              {/* Total Amount Row */}
              <tr className="bg-gray-50">
                <td className="border border-gray-400 p-1 text-right font-semibold text-xs" colSpan="2">
                  Total Amount
                </td>
                <td className="border border-gray-400 p-1 text-right font-semibold text-xs">{taxableAmount.toLocaleString()}</td>
              </tr>

              {/* Tax Rows */}
              <tr>
                <td className="border border-gray-400 p-1 text-right font-semibold text-xs" colSpan="2">
                  CGST {cgstRate}%
                </td>
                <td className="border border-gray-400 p-1 text-right text-xs">{totals.cgstAmount.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-1 text-right font-semibold text-xs" colSpan="2">
                  SGST {sgstRate}%
                </td>
                <td className="border border-gray-400 p-1 text-right text-xs">{totals.sgstAmount.toLocaleString()}</td>
              </tr>
              <tr className="bg-gray-100">
                <td className="border border-gray-400 p-1 font-bold text-right text-xs" colSpan="2">
                  Total
                </td>
                <td className="border border-gray-400 p-1 font-bold text-right text-xs">₹ {totals.totalAmount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Amount in Words */}
        <div className="mb-3 text-xs">
          <strong>Amount Chargeable (in words)</strong> E. & O.E<br />
          <div className="mt-1">
            <strong>Total Amount: ₹{totals.totalAmount.toLocaleString()}</strong><br />
            {numberToWords(totals.totalAmount)}
          </div>
        </div>

        {/* Tax Summary Table */}
        <div className="mb-3">
          <table className="w-full border-collapse border border-gray-400 text-xs">
            <thead>
              <tr>
                <th className="border border-gray-400 p-1 text-center" rowSpan="2">Taxable Value</th>
                <th className="border border-gray-400 p-1 text-center" colSpan="2">CGST</th>
                <th className="border border-gray-400 p-1 text-center" colSpan="2">SGST/UTGST</th>
                <th className="border border-gray-400 p-1 text-center" rowSpan="2">Total Tax Amount</th>
              </tr>
              <tr>
                <th className="border border-gray-400 p-1 text-center">Rate</th>
                <th className="border border-gray-400 p-1 text-center">Amount</th>
                <th className="border border-gray-400 p-1 text-center">Rate</th>
                <th className="border border-gray-400 p-1 text-center">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-400 p-1 text-right">{totals.taxableAmount.toLocaleString()}</td>
                <td className="border border-gray-400 p-1 text-center">{cgstRate}%</td>
                <td className="border border-gray-400 p-1 text-right">{totals.cgstAmount.toLocaleString()}</td>
                <td className="border border-gray-400 p-1 text-center">{sgstRate}%</td>
                <td className="border border-gray-400 p-1 text-right">{totals.sgstAmount.toLocaleString()}</td>
                <td className="border border-gray-400 p-1 text-right">{totals.totalAmount.toLocaleString()}</td>
              </tr>
              <tr className="border-t-2 border-gray-600">
                <td className="border border-gray-400 p-1 font-bold text-right">{totals.taxableAmount.toLocaleString()}</td>
                <td className="border border-gray-400 p-1 font-bold text-center" colSpan="2">{totals.cgstAmount.toLocaleString()}</td>
                <td className="border border-gray-400 p-1 font-bold text-center" colSpan="2">{totals.sgstAmount.toLocaleString()}</td>
                <td className="border border-gray-400 p-1 font-bold text-right">{totals.totalAmount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tax Amount in Words */}
        <div className="mb-3 text-xs">
          <strong>Tax Amount (in words) :</strong><br />
          <div className="mt-1">
            {numberToWords(totals.totalAmount)}
          </div>
        </div>

        {/* Bank Details */}
        {currentData.bankDetails && (
          <div className="mb-3">
            <h3 className="text-sm font-bold text-gray-800 mb-2">Company's Bank Details</h3>
            <div className="text-xs space-y-1">
              {currentData.bankDetails.accountHolderName && (
                <div>
                  <strong>A/c Holder's Name:</strong><br />
                  {currentData.bankDetails.accountHolderName}
                </div>
              )}
              {currentData.bankDetails.bankName && (
                <div>
                  <strong>Bank Name:</strong><br />
                  {currentData.bankDetails.bankName}
                  {currentData.bankDetails.accountNumber && ` - ${currentData.bankDetails.accountNumber.slice(-7)}`}
                </div>
              )}
              {currentData.bankDetails.accountNumber && (
                <div>
                  <strong>A/c No.:</strong><br />
                  {currentData.bankDetails.accountNumber}
                </div>
              )}
              {currentData.bankDetails.branch && currentData.bankDetails.ifscCode && (
                <div>
                  <strong>Branch & IFS Code:</strong><br />
                  {currentData.bankDetails.branch} & {currentData.bankDetails.ifscCode}
                </div>
              )}
              {currentData.bankDetails.swiftCode && (
                <div>
                  <strong>SWIFT Code:</strong><br />
                  {currentData.bankDetails.swiftCode}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Signature Section */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          <div className="text-center">
            <div className="border-b border-gray-400 pb-8 mb-1"></div>
            <strong className="text-xs">Customer's Seal and Signature</strong>
          </div>
          <div className="text-center">
            <div className="border-b border-gray-400 pb-8 mb-1"></div>
            <strong className="text-xs">for ANGEL SEAFARER DOCUMENTATION PVT LTD</strong><br />
            <strong className="text-xs">Authorised Signatory</strong>
          </div>
        </div>

        {/* Footer */}
        {/* <div className="text-center mt-4 text-xs text-gray-600">
          This is a Computer Generated Invoice
        </div> */}
        </div>
      </div>

        {/* Invoice Controls Sidebar - Right Side */}
        <div className="input-controls w-96 bg-gray-50 border border-gray-200 rounded-lg p-4 h-fit sticky top-4 max-h-screen overflow-y-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">PROFORMA INVOICE</h2>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Invoice Controls</h3>

          {/* Invoice Details Section */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-700 mb-3">Invoice Details</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Ensure the value is a clean date string
                    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
                      setSelectedDate(value);
                    }
                  }}
                  className="bg-yellow-50 border border-yellow-300 rounded px-2 py-1 text-sm w-full"
                />
              </div>
            </div>
          </div>

          {/* Financial Details Section */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-700 mb-3">Financial Details</h4>
            <div className="space-y-3">
              {visibleInputs.taxableAmount && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taxable Amount</label>
                  <input
                    type="number"
                    value={taxableAmount}
                    onChange={(e) => setTaxableAmount(Number(e.target.value))}
                    onBlur={(e) => {
                      const newAmount = Number(e.target.value);
                      setTaxableAmount(newAmount);
                    }}
                    className="bg-yellow-50 border border-yellow-300 rounded px-2 py-1 text-sm w-full"
                    placeholder="Enter amount"
                  />
                </div>
              )}
              {visibleInputs.cgstRate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CGST Rate (%)</label>
                  <input
                    type="number"
                    value={cgstRate}
                    onChange={(e) => setCgstRate(Number(e.target.value))}
                    onBlur={(e) => {
                      const newRate = Number(e.target.value);
                      setCgstRate(newRate);
                    }}
                    className="bg-yellow-50 border border-yellow-300 rounded px-2 py-1 text-sm w-full"
                    placeholder="Enter CGST rate"
                  />
                </div>
              )}
              {visibleInputs.sgstRate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SGST Rate (%)</label>
                  <input
                    type="number"
                    value={sgstRate}
                    onChange={(e) => setSgstRate(Number(e.target.value))}
                    onBlur={(e) => {
                      const newRate = Number(e.target.value);
                      setSgstRate(newRate);
                    }}
                    className="bg-yellow-50 border border-yellow-300 rounded px-2 py-1 text-sm w-full"
                    placeholder="Enter SGST rate"
                  />
                </div>
              )}
              {visibleInputs.totalAmount && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                  <input
                    type="number"
                    value={totals.totalAmount}
                    readOnly
                    className="bg-gray-100 border border-gray-300 rounded px-2 py-1 text-sm w-full"
                    placeholder="Auto calculated"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Reference Details Section */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-700 mb-3">Reference Details</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Note</label>
                <input
                  type="text"
                  value={optionalFields.deliveryNote}
                  onChange={(e) => handleOptionalFieldChange('deliveryNote', e.target.value)}
                  className="bg-yellow-50 border border-yellow-300 rounded px-2 py-1 text-sm w-full"
                  placeholder="Enter delivery note"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference No</label>
                <input
                  type="text"
                  value={optionalFields.referenceNo}
                  onChange={(e) => handleOptionalFieldChange('referenceNo', e.target.value)}
                  className="bg-yellow-50 border border-yellow-300 rounded px-2 py-1 text-sm w-full"
                  placeholder="Enter reference number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Buyer's Order No</label>
                <input
                  type="text"
                  value={optionalFields.buyerOrderNo}
                  onChange={(e) => handleOptionalFieldChange('buyerOrderNo', e.target.value)}
                  className="bg-yellow-50 border border-yellow-300 rounded px-2 py-1 text-sm w-full"
                  placeholder="Enter buyer's order number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dispatch Doc No</label>
                <input
                  type="text"
                  value={optionalFields.dispatchDocNo}
                  onChange={(e) => handleOptionalFieldChange('dispatchDocNo', e.target.value)}
                  className="bg-yellow-50 border border-yellow-300 rounded px-2 py-1 text-sm w-full"
                  placeholder="Enter dispatch document number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dispatched Through</label>
                <input
                  type="text"
                  value={optionalFields.dispatchedThrough}
                  onChange={(e) => handleOptionalFieldChange('dispatchedThrough', e.target.value)}
                  className="bg-yellow-50 border border-yellow-300 rounded px-2 py-1 text-sm w-full"
                  placeholder="Enter dispatch method"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mode of Payment</label>
                <input
                  type="text"
                  value={optionalFields.modeOfPayment}
                  onChange={(e) => handleOptionalFieldChange('modeOfPayment', e.target.value)}
                  className="bg-yellow-50 border border-yellow-300 rounded px-2 py-1 text-sm w-full"
                  placeholder="Enter payment mode"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Other References</label>
                <input
                  type="text"
                  value={optionalFields.otherReferences}
                  onChange={(e) => handleOptionalFieldChange('otherReferences', e.target.value)}
                  className="bg-yellow-50 border border-yellow-300 rounded px-2 py-1 text-sm w-full"
                  placeholder="Enter other references"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                <input
                  type="text"
                  value={optionalFields.destination}
                  onChange={(e) => handleOptionalFieldChange('destination', e.target.value)}
                  className="bg-yellow-50 border border-yellow-300 rounded px-2 py-1 text-sm w-full"
                  placeholder="Enter destination"
                />
              </div>
            </div>
          </div>
        </div>
        </div>
        </div>
      </>
    );
  }

export default ProformaGstInvoice;
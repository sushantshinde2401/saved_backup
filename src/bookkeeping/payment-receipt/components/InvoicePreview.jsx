import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Printer,
  FileText,
  Building,
  User,
  Calculator,
  Banknote,
  Trash2,
  Edit3,
  X
} from 'lucide-react';

function InvoicePreview({ data, onDataChange, formData }) {
  const navigate = useNavigate();

  // State for editable fields
  const [isEditable, setIsEditable] = useState(true);
  const [selectedDate, setSelectedDate] = useState(data?.invoiceDate || '');
  const [optionalFields, setOptionalFields] = useState({
    deliveryNote: data?.deliveryNote || '',
    referenceNo: data?.referenceNo || '',
    otherReferences: data?.otherReferences || '',
    dispatchDocNo: data?.dispatchDocNo || '',
    deliveryNoteDate: data?.deliveryNoteDate || '',
    dispatchedThrough: data?.dispatchThrough || '',
    destination: data?.destination || '',
    modeOfPayment: data?.modeOfPayment || '',
    buyerOrderNo: data?.buyerOrderNo || ''
  });
  const [visibleFields, setVisibleFields] = useState({
    deliveryNote: true,
    referenceNo: true,
    otherReferences: true,
    dispatchDocNo: true,
    deliveryNoteDate: true,
    dispatchedThrough: true,
    destination: true,
    modeOfPayment: true,
    buyerOrderNo: true
  });

  // Financial state
  const [amountReceived, setAmountReceived] = useState(data?.amountReceived || 0);
  const [applyGST, setApplyGST] = useState(data?.applyGST || false);
  const [gstRate, setGstRate] = useState(18); // Fixed GST rate for payment receipt

  // Update state when data changes
  useEffect(() => {
    if (data) {
      setSelectedDate(data.invoiceDate || '');
      setOptionalFields({
        deliveryNote: data.deliveryNote || '',
        referenceNo: data.referenceNo || '',
        otherReferences: data.otherReferences || '',
        dispatchDocNo: data.dispatchDocNo || '',
        deliveryNoteDate: data.deliveryNoteDate || '',
        dispatchedThrough: data.dispatchThrough || '',
        destination: data.destination || '',
        modeOfPayment: data.modeOfPayment || '',
        buyerOrderNo: data.buyerOrderNo || ''
      });
      setAmountReceived(data.amountReceived || 0);
      setApplyGST(data.applyGST || false);
    }
  }, [data]);

  // Calculate totals
  const calculateTotals = () => {
    const baseAmount = amountReceived;
    const gstAmount = applyGST ? (baseAmount * gstRate) / 100 : 0;
    const finalAmount = baseAmount + gstAmount;

    return {
      baseAmount,
      gstAmount,
      finalAmount
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
    const printContent = document.querySelector('.invoice-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Payment Receipt Invoice</title>
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

        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }
    }
  };

  const handleOptionalFieldChange = (field, value) => {
    const newFields = { ...optionalFields, [field]: value };
    setOptionalFields(newFields);

    // Notify parent component of changes
    if (onDataChange) {
      onDataChange({
        ...data,
        [field]: value
      });
    }
  };

  const deleteOptionalField = (field) => {
    setVisibleFields(prev => ({ ...prev, [field]: false }));
    handleOptionalFieldChange(field, '');
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

  if (!data) return null;

  return (
    <>
      {/* Full-screen Modal Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
        <div className="bg-gray-100 w-full h-full overflow-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Preview & Download Invoice
                </button>
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">Payment Receipt Invoice</h1>
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
                <button
                  onClick={() => navigate('/bookkeeping/payment-receipt')}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex gap-6 max-w-7xl mx-auto p-4">
          {/* Invoice Content - Left Side */}
          <div className="flex-1 max-w-2xl">
            <div className="invoice-content p-4 bg-white shadow-lg">
              {/* Tax Invoice Header */}
              <div className="text-center mb-2 bg-white px-4 py-2">
                <h1 className="text-3xl font-bold text-gray-800 tracking-wide">PAYMENT RECEIPT</h1>
              </div>

              {/* Top Section with Company/Buyer and Invoice Details */}
              <div className="grid grid-cols-2 gap-6 mb-4">
                {/* Left Side - Company and Customer Details */}
                <div className="space-y-3">
                  {/* Company Details Section */}
                  <div>
                    <h2 className="text-sm font-bold text-gray-800 mb-1">{data.companyName}</h2>
                    <div className="text-xs text-gray-700 leading-tight">
                      {data.companyAddress.split('\n').map((line, index) => (
                        <div key={index}>{line}</div>
                      ))}
                    </div>
                    <div className="text-xs mt-1">
                      <strong>GSTIN/UIN:</strong> {data.companyGST}
                    </div>
                    <div className="text-xs">
                      <strong>State Code:</strong> {data.companyStateCode}
                    </div>
                  </div>

                  {/* Customer Details Section */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 mb-1">Customer (Bill to)</h3>
                    <div className="text-xs font-semibold text-gray-800 mb-1">{data.customerName}</div>
                    <div className="text-xs text-gray-700 leading-tight mb-1">
                      {data.customerAddress.split('\n').map((line, index) => (
                        <div key={index}>{line}</div>
                      ))}
                    </div>
                    {data.customerGST && (
                      <div className="text-xs mb-1">
                        <strong>GSTIN/UIN:</strong> {data.customerGST}
                      </div>
                    )}
                    {data.customerStateCode && (
                      <div className="text-xs">
                        <strong>State Code:</strong> {data.customerStateCode}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side - Invoice Details */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Left Column - Invoice Details */}
                  <div className="space-y-2">
                    <div className="text-xs">
                      <strong>Receipt No.</strong><br />
                      <span className="text-gray-700">{data.invoiceNo}</span>
                    </div>
                    <OptionalField label="Delivery Note" field="deliveryNote" />
                    <OptionalField label="Reference No & Date" field="referenceNo" />
                    <OptionalField label="Buyer's Order No" field="buyerOrderNo" />
                    <OptionalField label="Dispatch Doc No" field="dispatchDocNo" />
                  </div>

                  {/* Right Column - Invoice Details */}
                  <div className="space-y-2">
                    <div className="text-xs">
                      <strong>Dated</strong><br />
                      <span className="text-gray-700">{selectedDate}</span>
                    </div>
                    <OptionalField label="Dispatched through" field="dispatchedThrough" />
                    <OptionalField label="Mode/Terms of Payment" field="modeOfPayment" />
                    <OptionalField label="Other References" field="otherReferences" />
                    <OptionalField label="Destination" field="destination" />
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
                    <tr>
                      <td className="border border-gray-400 p-1 text-center">1</td>
                      <td className="border border-gray-400 p-1">
                        <div className="whitespace-pre-line text-xs">Payment Received</div>
                      </td>
                      <td className="border border-gray-400 p-1 text-right">
                        <span className="text-xs">₹{totals.baseAmount.toLocaleString()}</span>
                      </td>
                    </tr>

                    {/* Total Amount Row */}
                    <tr className="bg-gray-50">
                      <td className="border border-gray-400 p-1 text-right font-semibold text-xs" colSpan="2">
                        Total Amount
                      </td>
                      <td className="border border-gray-400 p-1 text-right font-semibold text-xs">₹{totals.baseAmount.toLocaleString()}</td>
                    </tr>

                    {/* GST Rows */}
                    {applyGST && (
                      <>
                        <tr>
                          <td className="border border-gray-400 p-1 text-right font-semibold text-xs" colSpan="2">
                            CGST {gstRate/2}%
                          </td>
                          <td className="border border-gray-400 p-1 text-right text-xs">₹{(totals.gstAmount/2).toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-400 p-1 text-right font-semibold text-xs" colSpan="2">
                            SGST {gstRate/2}%
                          </td>
                          <td className="border border-gray-400 p-1 text-right text-xs">₹{(totals.gstAmount/2).toLocaleString()}</td>
                        </tr>
                      </>
                    )}

                    <tr className="bg-gray-100">
                      <td className="border border-gray-400 p-1 font-bold text-right text-xs" colSpan="2">
                        Total
                      </td>
                      <td className="border border-gray-400 p-1 font-bold text-right text-xs">₹{totals.finalAmount.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Amount in Words */}
              <div className="mb-3 text-xs">
                <strong>Amount Chargeable (in words)</strong> E. & O.E<br />
                <div className="mt-1">
                  <strong>Total Amount: ₹{totals.finalAmount.toLocaleString()}</strong><br />
                  {numberToWords(totals.finalAmount)}
                </div>
              </div>

              {/* GST Summary Table */}
              {applyGST && (
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
                        <td className="border border-gray-400 p-1 text-right">₹{totals.baseAmount.toLocaleString()}</td>
                        <td className="border border-gray-400 p-1 text-center">{gstRate/2}%</td>
                        <td className="border border-gray-400 p-1 text-right">₹{(totals.gstAmount/2).toLocaleString()}</td>
                        <td className="border border-gray-400 p-1 text-center">{gstRate/2}%</td>
                        <td className="border border-gray-400 p-1 text-right">₹{(totals.gstAmount/2).toLocaleString()}</td>
                        <td className="border border-gray-400 p-1 text-right">₹{totals.gstAmount.toLocaleString()}</td>
                      </tr>
                      <tr className="border-t-2 border-gray-600">
                        <td className="border border-gray-400 p-1 font-bold text-right">₹{totals.baseAmount.toLocaleString()}</td>
                        <td className="border border-gray-400 p-1 font-bold text-center" colSpan="2">₹{(totals.gstAmount/2).toLocaleString()}</td>
                        <td className="border border-gray-400 p-1 font-bold text-center" colSpan="2">₹{(totals.gstAmount/2).toLocaleString()}</td>
                        <td className="border border-gray-400 p-1 font-bold text-right">₹{totals.gstAmount.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Bank Details */}
              {data.bankDetails && (
                <div className="mb-3">
                  <h3 className="text-sm font-bold text-gray-800 mb-2">Company's Bank Details</h3>
                  <div className="text-xs space-y-1">
                    {data.bankDetails.accountHolderName && (
                      <div>
                        <strong>A/c Holder's Name:</strong><br />
                        {data.bankDetails.accountHolderName}
                      </div>
                    )}
                    {data.bankDetails.bankName && (
                      <div>
                        <strong>Bank Name:</strong><br />
                        {data.bankDetails.bankName}
                        {data.bankDetails.accountNumber && ` - ${data.bankDetails.accountNumber.slice(-7)}`}
                      </div>
                    )}
                    {data.bankDetails.accountNumber && (
                      <div>
                        <strong>A/c No.:</strong><br />
                        {data.bankDetails.accountNumber}
                      </div>
                    )}
                    {data.bankDetails.branch && data.bankDetails.ifscCode && (
                      <div>
                        <strong>Branch & IFS Code:</strong><br />
                        {data.bankDetails.branch} & {data.bankDetails.ifscCode}
                      </div>
                    )}
                    {data.bankDetails.swiftCode && (
                      <div>
                        <strong>SWIFT Code:</strong><br />
                        {data.bankDetails.swiftCode}
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
                  <strong className="text-xs">for {data.companyName}</strong><br />
                  <strong className="text-xs">Authorised Signatory</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Controls Sidebar - Right Side */}
          <div className="input-controls w-96 bg-gray-50 border border-gray-200 rounded-lg p-4 h-fit sticky top-4 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">PAYMENT RECEIPT</h2>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Invoice Controls</h3>

            {/* Invoice Details Section */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-700 mb-3">Invoice Details</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedDate(value);
                      if (onDataChange) {
                        onDataChange({
                          ...data,
                          invoiceDate: value
                        });
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount Received</label>
                  <input
                    type="number"
                    value={amountReceived}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setAmountReceived(value);
                      if (onDataChange) {
                        onDataChange({
                          ...data,
                          amountReceived: value
                        });
                      }
                    }}
                    className="bg-yellow-50 border border-yellow-300 rounded px-2 py-1 text-sm w-full"
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <input
                      type="checkbox"
                      checked={applyGST}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setApplyGST(checked);
                        if (onDataChange) {
                          onDataChange({
                            ...data,
                            applyGST: checked
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    Apply GST (18%)
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Final Amount</label>
                  <input
                    type="number"
                    value={totals.finalAmount}
                    readOnly
                    className="bg-gray-100 border border-gray-300 rounded px-2 py-1 text-sm w-full"
                    placeholder="Auto calculated"
                  />
                </div>
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
      </div>
    </>
  );
}

export default InvoicePreview;
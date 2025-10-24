import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Download, Printer, FileText, ArrowLeft } from 'lucide-react';
import html2pdf from 'html2pdf.js';

function ReceiptInvoicePreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const receiptData = location.state?.receiptData;

  const [selectedDate, setSelectedDate] = useState(receiptData.dateReceived);
  const [optionalFields, setOptionalFields] = useState({
    transactionId: receiptData.transactionId,
    onAccountOf: receiptData.onAccountOf,
    remark: receiptData.deliveryNote
  });
  const [amountReceived, setAmountReceived] = useState(receiptData.amountReceived);

  const calculateTotals = () => {
    const baseAmount = amountReceived;
    const netAmount = baseAmount;
    return { baseAmount, netAmount };
  };

  const totals = calculateTotals();

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

      if (crore > 0) result += convertLessThanThousand(crore) + ' Crore ';
      if (lakh > 0) result += convertLessThanThousand(lakh) + ' Lakh ';
      if (thousand > 0) result += convertLessThanThousand(thousand) + ' Thousand ';
      if (remainder > 0) result += convertLessThanThousand(remainder);

      return result.trim();
    };

    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);
    let result = 'INR ' + convert(rupees);
    if (paise > 0) result += ' and ' + convert(paise) + ' Paise';
    result += ' Only';
    return result;
  };

  const handlePrint = () => window.print();

  const handleDownload = () => {
    const element = document.querySelector('.receipt-content');
    if (element) {
      // Clone the element to apply print styles
      const clonedElement = element.cloneNode(true);

      // Apply print styles to the cloned element
      clonedElement.style.boxShadow = 'none';
      clonedElement.style.width = '100%';
      clonedElement.style.maxWidth = 'none';

      const opt = {
        margin: 0.5,
        filename: `Payment_Receipt_${receiptData.savedReceiptData?.receipt_amount_id || 'N/A'}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: {
          scale: 3,
          useCORS: true,
          letterRendering: true,
          allowTaint: false
        },
        jsPDF: {
          unit: 'in',
          format: 'a4',
          orientation: 'portrait',
          compress: true
        }
      };
      html2pdf().set(opt).from(clonedElement).save();
    }
  };

  if (!receiptData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Receipt Data Found</h2>
          <p className="text-gray-600 mb-6">Please go back to the receipt entries page and save your data first.</p>
          <button
            onClick={() => navigate('/bookkeeping/receipt-entries')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Receipt Entries
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .shadow-lg {
            box-shadow: none !important;
          }
        }
      `}</style>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 no-print">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/bookkeeping/receipt-entries')}
              className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <FileText className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Payment Receipt Preview</h2>
              <p className="text-blue-100 text-sm">Professional receipt layout</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors">
              <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6 p-6">
          <div className="flex-1 max-w-2xl">
            <div className="receipt-content p-4 bg-white shadow-lg">
              <div className="text-center mb-2">
                <h1 className="text-3xl font-bold text-gray-800">PAYMENT RECEIPT</h1>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-4">
                {/* Left Side - Company and Customer Details */}
                <div className="space-y-3">
                  {/* Company Details Section */}
                  <div>
                    <h2 className="text-sm font-bold text-gray-800 mb-1">{receiptData.companyName}</h2>
                    <div className="text-xs text-gray-700 leading-tight">
                      {(receiptData.companyAddress || '').split('\n').map((line, index) => (
                        <div key={index}>{line}</div>
                      ))}
                    </div>
                    <div className="text-xs mt-1">
                      <strong>GSTIN/UIN:</strong> {receiptData.companyGST}
                    </div>
                    <div className="text-xs">
                      <strong>State Name:</strong> {receiptData.companyState}, <strong>Code:</strong> {receiptData.companyStateCode}
                    </div>
                  </div>

                  <hr className="border-t border-gray-400 my-2" />

                  {/* Customer Details Section */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 mb-1">Received From</h3>
                    <div className="text-xs font-semibold text-gray-800 mb-1">{receiptData.customerName}</div>
                    <div className="text-xs text-gray-700 leading-tight mb-1">
                      {(receiptData.customerAddress || '').split('\n').map((line, index) => (
                        <div key={index}>{line}</div>
                      ))}
                    </div>
                    <div className="text-xs mb-1">
                      <strong>GSTIN/UIN:</strong> {receiptData.customerGST}
                    </div>
                    <div className="text-xs">
                      <strong>State Name:</strong> {receiptData.customerState}, <strong>Code:</strong> {receiptData.customerStateCode}
                    </div>
                  </div>
                </div>

                {/* Right Side - Receipt Details */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Left Column - Receipt Details */}
                  <div className="space-y-2">
                    <div className="text-xs">
                      <strong>Receipt No.</strong><br />
                      <span className="text-gray-700">{receiptData.savedReceiptData?.receipt_amount_id || 'N/A'}</span>
                    </div>
                    <div className="text-xs">
                      <strong>Transaction ID</strong><br />
                      <span className="text-gray-700">{optionalFields.transactionId || '-'}</span>
                    </div>
                    <div className="text-xs">
                      <strong>On Account of</strong><br />
                      <span className="text-gray-700">{optionalFields.onAccountOf || '-'}</span>
                    </div>
                  </div>

                  {/* Right Column - Receipt Details */}
                  <div className="space-y-2">
                    <div className="text-xs">
                      <strong>Dated</strong><br />
                      <span className="text-gray-700">{selectedDate}</span>
                    </div>
                    <div className="text-xs">
                      <strong>Payment Type</strong><br />
                      <span className="text-gray-700">{receiptData.paymentType}</span>
                    </div>
                    <div className="text-xs">
                      <strong>Remarks</strong><br />
                      <span className="text-gray-700">{optionalFields.remark || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

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
                        <div className="whitespace-pre-line text-xs">
                          Payment Received{optionalFields.onAccountOf && `\nOn Account of: ${optionalFields.onAccountOf}`}
                        </div>
                      </td>
                      <td className="border border-gray-400 p-1 text-right">₹{totals.baseAmount.toLocaleString()}</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-400 p-1 text-right font-semibold text-xs" colSpan="2">Net Amount Received</td>
                      <td className="border border-gray-400 p-1 text-right font-semibold text-xs">₹{totals.netAmount.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mb-3 text-xs">
                <strong>Received Amount:</strong> ₹{totals.netAmount.toLocaleString()}<br />
                <strong>Amount Received (in words)</strong><br />
                {numberToWords(totals.netAmount)}
              </div>

              {optionalFields.remark && (
                <div className="mb-3 text-xs">
                  <strong>Remarks:</strong> {optionalFields.remark}
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-800 mb-2">Company's Bank Details</h3>
                <div className="text-xs text-gray-700">
                  <strong>A/c Holder's Name:</strong> {receiptData.companyName}<br />
                  <strong>Bank Name:</strong> {receiptData.bankName} - {receiptData.bankBranchCode}<br />
                  <strong>A/c No.:</strong> {receiptData.bankAccountNo}<br />
                  <strong>Branch & IFS Code:</strong> {receiptData.branchName} & {receiptData.ifscCode}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-6">
                <div className="text-center">
                  <div className="border-b border-gray-400 pb-8 mb-1"></div>
                  <strong className="text-xs">Customer's Seal and Signature</strong>
                </div>
                <div className="text-center">
                  <div className="border-b border-gray-400 pb-8 mb-1"></div>
                  <strong className="text-xs">for {receiptData.companyName}<br />Authorised Signatory</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="input-controls w-96 bg-gray-50 border border-gray-200 rounded-lg p-4 no-print">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">RECEIPT CONTROLS</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Date</label>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-yellow-50 border border-yellow-300 rounded px-2 py-1 text-sm w-full" />
            </div>
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-700 mb-3">Financial Details</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount Received</label>
                  <input type="number" value={amountReceived} onChange={(e) => setAmountReceived(Number(e.target.value))} className="bg-yellow-50 border border-yellow-300 rounded px-2 py-1 text-sm w-full" step="0.01" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Net Amount</label>
                  <input type="number" value={totals.netAmount} readOnly className="bg-gray-100 border border-gray-300 rounded px-2 py-1 text-sm w-full" />
                </div>
              </div>
            </div>
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-700 mb-3">Additional Details</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                  <input type="text" value={optionalFields.transactionId} onChange={(e) => setOptionalFields(prev => ({ ...prev, transactionId: e.target.value }))} className="bg-yellow-50 border border-yellow-300 rounded px-2 py-1 text-sm w-full" placeholder="Enter transaction ID" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">On Account of</label>
                  <input type="text" value={optionalFields.onAccountOf} onChange={(e) => setOptionalFields(prev => ({ ...prev, onAccountOf: e.target.value }))} className="bg-yellow-50 border border-yellow-300 rounded px-2 py-1 text-sm w-full" placeholder="Enter account details" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <textarea value={optionalFields.remark} onChange={(e) => setOptionalFields(prev => ({ ...prev, remark: e.target.value }))} className="bg-yellow-50 border border-yellow-300 rounded px-2 py-1 text-sm w-full" placeholder="Enter remarks" rows="3" />
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
   </>
  );
}

export default ReceiptInvoicePreview;

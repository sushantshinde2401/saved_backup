import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Operations Section
const HomePage = React.lazy(() => import('./operations/pages/HomePage'));
const AdminPanel = React.lazy(() => import('./operations/pages/AdminPanel'));
const UploadDocx = React.lazy(() => import('./operations/pages/UploadDocx'));
const CandidateDetail = React.lazy(() => import('./operations/pages/CandidateDetail'));
const CourseSelection = React.lazy(() => import('./operations/pages/CourseSelection'));
const CoursePreview = React.lazy(() => import('./operations/pages/CoursePreview'));
const DynamicCertificate = React.lazy(() => import('./operations/pages/certificates/DynamicCertificate'));

// Bookkeeping Section
const BookkeepingDashboard = React.lazy(() => import('./bookkeeping/dashboard/components/BookkeepingDashboard'));
const PaymentReceiptPage = React.lazy(() => import('./bookkeeping/payment-receipt/components/PaymentReceiptEntries'));
const VendorServiceEntry = React.lazy(() => import('./bookkeeping/payment-receipt/components/VendorServiceEntry/VendorServiceEntry'));
const SalesVoucher = React.lazy(() => import('./bookkeeping/payment-receipt/components/SalesVoucher/SalesVoucher'));
const ReceiptEntries = React.lazy(() => import('./bookkeeping/payment-receipt/components/ReceiptEntries/ReceiptEntries'));
const VendorPaymentEntry = React.lazy(() => import('./bookkeeping/payment-receipt/components/VendorPaymentEntry/VendorPaymentEntry'));
const AddExpensePaymentEntry = React.lazy(() => import('./bookkeeping/payment-receipt/components/AddExpensePaymentEntry/AddExpensePaymentEntry'));
const AdjustmentEntry = React.lazy(() => import('./bookkeeping/payment-receipt/components/AdjustmentEntry/AdjustmentEntry'));
const ClientAdjustmentInvoicePreview = React.lazy(() => import('./bookkeeping/payment-receipt/components/AdjustmentEntry/ClientAdjustmentInvoicePreview'));
const VendorAdjustmentInvoicePreview = React.lazy(() => import('./bookkeeping/payment-receipt/components/AdjustmentEntry/VendorAdjustmentInvoicePreview'));
const ReceiptInvoicePreview = React.lazy(() => import('./bookkeeping/payment-receipt/components/ReceiptEntries/ReceiptInvoicePreview'));
const NewStepper = React.lazy(() => import('./bookkeeping/payment-receipt/components/SalesVoucher/NewStepper'));
const InvoicePreview = React.lazy(() => import('./bookkeeping/payment-receipt/components/SalesVoucher/InvoicePreview'));
const InvoiceGeneration = React.lazy(() => import('./bookkeeping/invoice-generation/components/InvoiceGeneration'));
const ProformaGstInvoice = React.lazy(() => import('./bookkeeping/invoice-generation/components/ProformaGstInvoice'));
const ProformaInvoice = React.lazy(() => import('./bookkeeping/invoice-generation/components/ProformaInvoice'));
const DailyMonthlyYearlyLedger = React.lazy(() => import('./bookkeeping/periodic-ledger/components/DailyMonthlyYearlyLedger'));
const SummaryReport = React.lazy(() => import('./bookkeeping/summary-report/components/SummaryReport'));
const RateListEntries = React.lazy(() => import('./bookkeeping/ratelists-entries/components/RateListEntries'));
const LedgerDashboard = React.lazy(() => import('./bookkeeping/ledger-dashboard/components/LedgerDashboard'));

// Database Section
const DatabaseDashboard = React.lazy(() => import('./database/pages/DatabaseDashboard'));
const LegacyCertificates = React.lazy(() => import('./database/pages/LegacyCertificates'));

function App() {
  return (
    <Router>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-lg">Loading...</div></div>}>
        <Routes>
          {/* Main Dashboard */}
          <Route path="/" element={<HomePage />} />

          {/* Operations Section */}
          <Route path="/admin-panel" element={<AdminPanel />} />
          <Route path="/upload-docx" element={<UploadDocx />} />
          <Route path="/candidate-details" element={<CandidateDetail />} />
          <Route path="/course-selection" element={<CourseSelection />} />
          <Route path="/certificate/:certificateType" element={<DynamicCertificate />} />

          {/* Bookkeeping Section */}
          <Route path="/bookkeeping" element={<BookkeepingDashboard />} />
          <Route path="/bookkeeping/payment-receipt" element={<PaymentReceiptPage />} />
          <Route path="/bookkeeping/vendor-service-entry" element={<VendorServiceEntry />} />
          <Route path="/bookkeeping/sales-voucher" element={<SalesVoucher />} />
          <Route path="/bookkeeping/receipt-entries" element={<ReceiptEntries />} />
          <Route path="/bookkeeping/receipt-invoice-preview" element={<ReceiptInvoicePreview />} />
          <Route path="/bookkeeping/vendor-payment-entry" element={<VendorPaymentEntry />} />
          <Route path="/bookkeeping/add-expense-payment-entry" element={<AddExpensePaymentEntry />} />
          <Route path="/bookkeeping/adjustment-entry" element={<AdjustmentEntry />} />
          <Route path="/bookkeeping/client-adjustment-invoice-preview" element={<ClientAdjustmentInvoicePreview />} />
          <Route path="/bookkeeping/vendor-adjustment-invoice-preview" element={<VendorAdjustmentInvoicePreview />} />
          <Route path="/bookkeeping/new-invoice-stepper" element={<NewStepper />} />
          <Route path="/bookkeeping/invoice-preview" element={<InvoicePreview />} />
          <Route path="/bookkeeping/invoice-generation" element={<InvoiceGeneration />} />
          <Route path="/bookkeeping/tax-invoice" element={<ProformaGstInvoice />} />
          <Route path="/bookkeeping/proforma-invoice" element={<ProformaInvoice />} />
          <Route path="/bookkeeping/ledger" element={<DailyMonthlyYearlyLedger />} />
          <Route path="/bookkeeping/summary-report" element={<SummaryReport />} />
          <Route path="/bookkeeping/ratelist-entries" element={<RateListEntries />} />
          <Route path="/bookkeeping/ledger-dashboard" element={<LedgerDashboard />} />

          {/* Database Section */}
          <Route path="/database" element={<DatabaseDashboard />} />
          <Route path="/legacy-certificates" element={<LegacyCertificates />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

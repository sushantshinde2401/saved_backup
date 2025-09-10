import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Operations Section
import HomePage from './operations/pages/HomePage';
import UploadDocx from './operations/pages/UploadDocx';
import CandidateDetail from './operations/pages/CandidateDetail';
import CourseSelection from './operations/pages/CourseSelection';
import CoursePreview from "./operations/pages/CoursePreview";
import DualCertificate from './operations/pages/certificates/DualCertificate';
import DualCertificate2 from './operations/pages/certificates/DualCertificate2';
import DualCertificate3 from './operations/pages/certificates/DualCertificate3';
import DualCertificate4 from './operations/pages/certificates/DualCertificate4';

// Bookkeeping Section
import BookkeepingDashboard from './bookkeeping/dashboard/components/BookkeepingDashboard';
import PaymentReceiptEntries from './bookkeeping/payment-receipt/components/PaymentReceiptEntries';
import InvoiceGeneration from './bookkeeping/invoice-generation/components/InvoiceGeneration';
import ProformaGstInvoice from './bookkeeping/invoice-generation/components/ProformaGstInvoice';
import ProformaInvoice from './bookkeeping/invoice-generation/components/ProformaInvoice';
import CompaniesLedger from './bookkeeping/companies-ledger/components/CompaniesLedger';
import DailyMonthlyYearlyLedger from './bookkeeping/periodic-ledger/components/DailyMonthlyYearlyLedger';
import SummaryReport from './bookkeeping/summary-report/components/SummaryReport';
import RateListEntries from './bookkeeping/ratelists-entries/components/RateListEntries';
import SelectedCourses from './bookkeeping/payment-receipt/components/SelectedCourses';

// Database Section
import DatabaseDashboard from './database/pages/DatabaseDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Dashboard */}
        <Route path="/" element={<HomePage />} />

        {/* Operations Section */}
        <Route path="/upload-docx" element={<UploadDocx />} />
        <Route path="/candidate-details" element={<CandidateDetail />} />
        <Route path="/course-selection" element={<CourseSelection />} />
        <Route path="/course-preview" element={<CoursePreview />} />
        <Route path="/certificate-form" element={<DualCertificate />} />
        <Route path="/dual-certificate-2" element={<DualCertificate2 />} />
        <Route path="/dual-certificate-3" element={<DualCertificate3 />} />
        <Route path="/dual-certificate-4" element={<DualCertificate4 />} />

        {/* Bookkeeping Section */}
        <Route path="/bookkeeping" element={<BookkeepingDashboard />} />
        <Route path="/bookkeeping/payment-receipt" element={<PaymentReceiptEntries />} />
        <Route path="/bookkeeping/invoice-generation" element={<InvoiceGeneration />} />
        <Route path="/bookkeeping/tax-invoice" element={<ProformaGstInvoice />} />
        <Route path="/bookkeeping/proforma-invoice" element={<ProformaInvoice />} />
        <Route path="/bookkeeping/companies-ledger" element={<CompaniesLedger />} />
        <Route path="/bookkeeping/ledger" element={<DailyMonthlyYearlyLedger />} />
        <Route path="/bookkeeping/summary-report" element={<SummaryReport />} />
        <Route path="/bookkeeping/ratelist-entries" element={<RateListEntries />} />
        <Route path="/bookkeeping/selected-courses" element={<SelectedCourses />} />

        {/* Database Section */}
        <Route path="/database" element={<DatabaseDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;

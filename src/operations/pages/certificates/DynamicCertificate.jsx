import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import OperationsNavbar from '../../../shared/components/OperationsNavbar';
import {
  User,
  BookOpen,
  FileText,
  Eye,
  EyeOff,
  ArrowLeft,
  RotateCcw,
  Calendar,
  Hash,
  MapPin,
  CreditCard,
  Phone,
  Mail,
  QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function DynamicCertificate() {
  const navigate = useNavigate();
  const { certificateType } = useParams();

  const [certificateData, setCertificateData] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [documents, setDocuments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVerificationPreview, setShowVerificationPreview] = useState(false);
  const [showCertificatePreview, setShowCertificatePreview] = useState(false);

  // Editable dates for final confirmation
  const [issueDate, setIssueDate] = useState(null);
  const [expiryDate, setExpiryDate] = useState(null);

  // Helper function to parse date string in dd-mm-yyyy format
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return null;
  };

  // Load certificate preview data
  useEffect(() => {
    const loadPreviewData = () => {
      try {
        const previewData = localStorage.getItem("certificatePreviewData");
        if (previewData) {
          const parsed = JSON.parse(previewData);
          setCertificateData(parsed.certificate_data);
          setCourseData(parsed.course_data);
          setDocuments(parsed.documents);

          // Set initial dates
          if (parsed.certificate_data.DATE_ISSUE) {
            setIssueDate(parseDate(parsed.certificate_data.DATE_ISSUE));
          }
          if (parsed.certificate_data.DATE_EXPIRY) {
            setExpiryDate(parseDate(parsed.certificate_data.DATE_EXPIRY));
          }
        } else {
          // No preview data, redirect to course selection
          navigate('/course-selection');
        }
      } catch (error) {
        console.error('Error loading preview data:', error);
        navigate('/course-selection');
      } finally {
        setLoading(false);
      }
    };

    loadPreviewData();
  }, [navigate]);

  const handleBack = () => {
    navigate('/course-selection');
  };

  const handleRegenerate = async () => {
    // Clear current preview data and go back to course selection for regeneration
    localStorage.removeItem("certificatePreviewData");
    navigate('/course-selection');
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading certificate preview...</div>
      </div>
    );
  }

  if (!certificateData || !courseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">No Preview Data</h2>
          <p className="text-gray-700 mb-4">No certificate preview data found. Please generate a certificate first.</p>
          <button
            onClick={() => navigate('/course-selection')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Course Selection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <OperationsNavbar />

      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden min-h-screen">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        <div className="relative z-10 flex flex-col items-center justify-start min-h-screen p-6 py-12">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl w-full max-w-6xl p-10 mb-6 border border-white/20"
          >
            {/* Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-center mb-10"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Certificate Preview & Confirmation
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Review all certificate details before final confirmation and saving
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Data Display */}
              <div className="space-y-6">
                {/* Candidate Information */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">Candidate Information</h3>
                      <p className="text-gray-600 text-sm mt-1">Read-only candidate details</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Name:</span>
                        <span className="text-sm text-gray-800">{certificateData.NAME}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Passport:</span>
                        <span className="text-sm text-gray-800">{certificateData.PASSPORT}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Nationality:</span>
                        <span className="text-sm text-gray-800">{certificateData.NATIONALITY}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Date of Birth:</span>
                        <span className="text-sm text-gray-800">{certificateData.DOB}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">CDC Number:</span>
                        <span className="text-sm text-gray-800">{certificateData.CDC}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">INDOS Number:</span>
                        <span className="text-sm text-gray-800">{certificateData.INDOS}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">COC Number:</span>
                        <span className="text-sm text-gray-800">{certificateData.COC}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Grade:</span>
                        <span className="text-sm text-gray-800">{certificateData.GRADE}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">ID Number:</span>
                      <span className="text-sm text-gray-800">{certificateData.ID_NO}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Issuing Country:</span>
                      <span className="text-sm text-gray-800">{certificateData.ISSUING_COUNTRY}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Course & Certificate Information */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">Course & Certificate Details</h3>
                      <p className="text-gray-600 text-sm mt-1">Course information and certificate details</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="font-medium text-gray-800 text-lg mb-2">{certificateData.COURSE_NAME}</div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Certificate Number: <span className="font-mono text-gray-800">{certificateData.CERTIFICATE_NUM}</span></div>
                        <div>Course Start: <span className="text-gray-800">{certificateData.DATE_FROM}</span></div>
                        <div>Course End: <span className="text-gray-800">{certificateData.DATE_TO}</span></div>
                        <div>Issue Date: <span className="text-gray-800">{certificateData.DATE_ISSUE}</span></div>
                        <div>Expiry Date: <span className="text-gray-800">{certificateData.DATE_EXPIRY}</span></div>
                      </div>
                    </div>

                    {/* Editable Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Date of Issue</label>
                        <div className="relative">
                          <DatePicker
                            selected={issueDate}
                            onChange={(date) => setIssueDate(date)}
                            dateFormat="dd-MM-yyyy"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholderText="Select issue date"
                          />
                          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Date of Expiry</label>
                        <div className="relative">
                          <DatePicker
                            selected={expiryDate}
                            onChange={(date) => setExpiryDate(date)}
                            dateFormat="dd-MM-yyyy"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholderText="Select expiry date"
                          />
                          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Topics Section */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">Course Topics</h3>
                      <p className="text-gray-600 text-sm mt-1">Topics covered in this course</p>
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto bg-gray-50 rounded-xl p-4">
                    <div className="space-y-2">
                      {certificateData.TOPICS && (
                        Array.isArray(certificateData.TOPICS)
                          ? certificateData.TOPICS.map((topic, index) => (
                              <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span>{topic}</span>
                              </div>
                            ))
                          : certificateData.TOPICS.split(', ').map((topic, index) => (
                              <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span>{topic.trim()}</span>
                              </div>
                            ))
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Right Column - Previews */}
              <div className="space-y-6">
                {/* Verification Preview */}
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">Verification Document</h3>
                        <p className="text-gray-600 text-sm mt-1">Generated PDF verification ready for download</p>
                      </div>
                    </div>
                    {documents && (
                      <a
                        href={`http://localhost:5000${documents.download_urls.verification}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center gap-2 font-medium"
                      >
                        <FileText className="w-4 h-4" />
                        Download Verification
                      </a>
                    )}
                  </div>

                  <div className="bg-gray-100 rounded-xl p-4 min-h-48 flex items-center justify-center">
                    <div className="text-center text-gray-600">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-green-500" />
                      <h4 className="text-lg font-bold text-gray-800 mb-2">PDF Verification Generated</h4>
                      <p className="text-sm mb-4">PDF verification with candidate and course information</p>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="text-sm space-y-1">
                          <div><span className="font-medium">File:</span> {documents?.verification_file}</div>
                          <div><span className="font-medium">Certificate:</span> {certificateData.CERTIFICATE_NUM}</div>
                          <div><span className="font-medium">Status:</span> <span className="text-green-600">Ready for download</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Certificate Preview */}
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">Certificate Document</h3>
                        <p className="text-gray-600 text-sm mt-1">Generated PDF certificate with photo and signature</p>
                      </div>
                    </div>
                    {documents && (
                      <a
                        href={`http://localhost:5000${documents.download_urls.certificate}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center gap-2 font-medium"
                      >
                        <FileText className="w-4 h-4" />
                        Download Certificate
                      </a>
                    )}
                  </div>

                  <div className="bg-gray-100 rounded-xl p-4 min-h-64 flex items-center justify-center">
                    <div className="text-center text-gray-600">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-green-500" />
                      <h4 className="text-lg font-bold text-gray-800 mb-2">PDF Certificate Generated</h4>
                      <p className="text-sm mb-4">Complete certificate with photo, signature, and QR code</p>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="text-sm space-y-1">
                          <div><span className="font-medium">File:</span> {documents?.certificate_file}</div>
                          <div><span className="font-medium">Certificate:</span> {certificateData.CERTIFICATE_NUM}</div>
                          <div><span className="font-medium">Course:</span> {certificateData.COURSE_NAME}</div>
                          <div><span className="font-medium">Status:</span> <span className="text-green-600">Ready for download</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mt-12 pt-8 border-t border-gray-200"
            >
              <button
                onClick={handleBack}
                className="group relative font-bold py-4 px-8 rounded-full transition-all duration-300 flex items-center gap-3 shadow-2xl bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white"
              >
                <div className="absolute inset-0 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-300 bg-gradient-to-r from-gray-400 to-gray-500"></div>
                <ArrowLeft className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Back to Course Selection</span>
              </button>

              <button
                onClick={handleRegenerate}
                className="group relative font-bold py-4 px-8 rounded-full transition-all duration-300 flex items-center gap-3 shadow-2xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              >
                <div className="absolute inset-0 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-300 bg-gradient-to-r from-orange-400 to-red-400"></div>
                <RotateCcw className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Regenerate Certificate</span>
              </button>

            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default DynamicCertificate;
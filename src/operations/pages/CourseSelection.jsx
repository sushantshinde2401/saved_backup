import React, { useState, useEffect } from "react";
import "../../App.css";
import { useNavigate } from "react-router-dom";
import OperationsNavbar from "../../shared/components/OperationsNavbar";
import {
  Info,
  ArrowRight,
  BookOpen,
  Plus,
  Trash2,
  ChevronDown,
  GraduationCap,
  Calendar,
  Hash,
  Search,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function CourseSelection() {
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedCourseData, setSelectedCourseData] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [courseSearchTerm, setCourseSearchTerm] = useState("");

  // Certificate generation fields
   const [startDate, setStartDate] = useState(null);
   const [endDate, setEndDate] = useState(null);

   // Helper function to validate dates
   const isValidDate = (date) => {
     return date instanceof Date && !isNaN(date.getTime());
   };
   const [certificateValidity, setCertificateValidity] = useState("");

   // Candidate selection (optional)
   const [selectedCandidateId, setSelectedCandidateId] = useState("");
   const [candidateSearchTerm, setCandidateSearchTerm] = useState("");
   const [availableCandidates, setAvailableCandidates] = useState([]);
   const [showCandidateDropdown, setShowCandidateDropdown] = useState(false);

  // Auto-calculated fields
  const [expiryDate, setExpiryDate] = useState("");
  const [issueDate, setIssueDate] = useState(null);

  const navigate = useNavigate();

  // Filter courses based on search term
  const filteredCourses = availableCourses.filter(course =>
    course.course_name.toLowerCase().includes(courseSearchTerm.toLowerCase())
  );

  // Filter candidates based on search term
  const filteredCandidates = availableCandidates.filter(candidate =>
    candidate.passport.toLowerCase().includes(candidateSearchTerm.toLowerCase()) ||
    candidate.candidate_name.toLowerCase().includes(candidateSearchTerm.toLowerCase())
  );

  // Fetch available courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/courses');
        if (response.ok) {
          const data = await response.json();
          setAvailableCourses(data);
          console.log("Fetched courses:", data);
        } else {
          console.error("Failed to fetch courses");
          setValidationError("Failed to load courses. Please try again.");
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        setValidationError("Failed to load courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Fetch available candidates for selection
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch('http://localhost:5000/candidate/get-candidates-for-dropdown');
        if (response.ok) {
          const result = await response.json();
          if (result.status === 'success') {
            setAvailableCandidates(result.data);
            console.log("Fetched candidates:", result.data);
          }
        } else {
          console.error("Failed to fetch candidates");
        }
      } catch (error) {
        console.error("Error fetching candidates:", error);
      }
    };

    fetchCandidates();
  }, []);

  // Fetch course details when course is selected
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!selectedCourseId) {
        setSelectedCourseData(null);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/courses/${selectedCourseId}`);
        if (response.ok) {
          const data = await response.json();
          setSelectedCourseData(data);
          console.log("Fetched course details:", data);
        } else {
          console.error("Failed to fetch course details");
          setValidationError("Failed to load course details. Please try again.");
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
        setValidationError("Failed to load course details. Please try again.");
      }
    };

    fetchCourseDetails();
  }, [selectedCourseId]);

  // Calculate expiry date when end date or certificate validity change
  useEffect(() => {
    if (isValidDate(endDate) && certificateValidity) {
      const endDateObj = new Date(endDate);
      const expiryDateObj = new Date(endDateObj);
      expiryDateObj.setFullYear(expiryDateObj.getFullYear() + parseInt(certificateValidity));
      expiryDateObj.setDate(expiryDateObj.getDate() - 1); // Subtract 1 day

      const dd = String(expiryDateObj.getDate()).padStart(2, '0');
      const mm = String(expiryDateObj.getMonth() + 1).padStart(2, '0');
      const yyyy = expiryDateObj.getFullYear();
      setExpiryDate(`${dd}-${mm}-${yyyy}`);
    } else {
      setExpiryDate("");
    }
  }, [endDate, certificateValidity]);

  // Set issue date when end date changes
  useEffect(() => {
    if (isValidDate(endDate)) {
      setIssueDate(endDate);
    } else {
      setIssueDate(null);
    }
  }, [endDate]);

  // Clear certificate form when course selection changes
  useEffect(() => {
    // Clear all certificate form fields whenever course selection changes
    setStartDate(null);
    setEndDate(null);
    setCertificateValidity("");
    setExpiryDate("");
    setIssueDate(null);
  }, [selectedCourseData?.course_id]); // Watch for course_id changes specifically


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.dropdown-container')) {
        setShowDropdown(false);
        setCourseSearchTerm(""); // Clear search when closing dropdown
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Handle escape key to close dropdown
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && showDropdown) {
        setShowDropdown(false);
        setCourseSearchTerm("");
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showDropdown]);



  const handleSave = () => {
    if (!selectedCourseId || !selectedCourseData) {
      setValidationError("Please select a course before saving.");
      return;
    }

    setValidationError("");
    localStorage.setItem("selectedCourse", JSON.stringify(selectedCourseData));
    console.log(`[COURSE] Saved selected course:`, selectedCourseData);
    // Navigate to certificate page with course data
    navigate("/certificate/stcw");
  };

  const handleGenerateCertificate = async () => {
    if (!selectedCourseData || !startDate || !endDate || !certificateValidity) {
      setValidationError("Please fill in all required fields.");
      return;
    }

    setValidationError("");

    // Helper function to format date as YYYY-MM-DD without timezone conversion
    const formatDateLocal = (date) => {
      if (!date) return null;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Prepare certificate data
    const certificateData = {
      course_name: selectedCourseData.course_name,
      topics: selectedCourseData.topics,
      course_id: selectedCourseData.course_id,
      start_date: formatDateLocal(startDate), // YYYY-MM-DD format without timezone conversion
      end_date: formatDateLocal(endDate),
      certificate_validity: parseInt(certificateValidity)
    };

    // Add candidate selection if specified
    if (selectedCandidateId) {
      const selectedCandidate = availableCandidates.find(c => c.id === parseInt(selectedCandidateId));
      if (selectedCandidate) {
        certificateData.candidate_id = selectedCandidate.id;
        certificateData.passport = selectedCandidate.passport;
      }
    }

    try {
      console.log("Generating certificate with data:", certificateData);

      // Send to backend API
      const response = await fetch('http://localhost:5000/api/generate-certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(certificateData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Certificate generated successfully:", result);

        // Store certificate data and document info in localStorage for the preview page
        localStorage.setItem("certificatePreviewData", JSON.stringify({
          certificate_data: result.certificate_data,
          course_data: selectedCourseData,
          documents: result.documents,
          serial_number: result.serial_number,
          certificate_number: result.certificate_number,
          issue_date: result.issue_date,
          expiry_date: result.expiry_date,
          generation_timestamp: new Date().toISOString()
        }));

        // Navigate to certificate preview page
        navigate("/certificate/preview");
      } else {
        const error = await response.json();
        console.error("Failed to generate certificate:", error);

        if (error.action_required === 'select_candidate') {
          setValidationError(error.message || "Please select a candidate from the dropdown above.");
        } else {
          setValidationError(error.error || "Failed to generate certificate. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error generating certificate:", error);
      setValidationError("Error generating certificate. Please try again.");
    }
  };



  // Error boundary for debugging
  try {
    console.log("CourseSelection: Rendering component");
    console.log("CourseSelection: availableCourses length:", availableCourses.length);
    console.log("CourseSelection: selectedCourseId:", selectedCourseId);

    return (
      <div className="min-h-screen">
        {/* Operations Navbar - positioned outside relative container */}
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
          className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl w-full max-w-5xl p-10 mb-6 border border-white/20"
          style={{ position: 'relative', zIndex: 'auto' }}
        >
          {/* Enhanced Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Course Selection
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Select a maritime course from the dropdown menu below to proceed with certificate generation
            </p>
          </motion.div>

          {/* Step 1: Candidate Selection */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-8"
            style={{ position: 'relative', zIndex: 10 }}
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Step 1: Select Existing Candidate</h3>
                  <p className="text-gray-600 text-sm mt-1">Search by passport number or candidate name (leave empty to use current candidate)</p>
                </div>
              </div>

              <div className="relative">
                <div
                  className="dropdown-button w-full bg-gray-50 border-2 border-gray-200 rounded-xl hover:bg-gray-100 hover:border-blue-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all duration-200 cursor-pointer"
                >
                  {showCandidateDropdown ? (
                    <input
                      type="text"
                      placeholder="Search by passport or candidate name..."
                      value={candidateSearchTerm}
                      onChange={(e) => setCandidateSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 bg-transparent outline-none text-gray-700 placeholder-gray-500"
                      autoFocus
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowCandidateDropdown(true)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left"
                    >
                      <span className="text-gray-700">
                        {selectedCandidateId
                          ? availableCandidates.find(c => c.id === parseInt(selectedCandidateId))?.candidate_name || "Selected candidate"
                          : "Use current candidate (leave empty)"}
                      </span>
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-gray-400" />
                        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${showCandidateDropdown ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {showCandidateDropdown && (
                    <>
                      {/* Dropdown backdrop */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/10"
                        style={{ zIndex: 1000000 }}
                        onClick={() => setShowCandidateDropdown(false)}
                      />

                      {/* Dropdown menu */}
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="dropdown-menu absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-300 rounded-xl shadow-2xl max-h-64 overflow-y-auto"
                        style={{
                          position: 'absolute',
                          zIndex: 1000001,
                          backgroundColor: 'white',
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                          minWidth: '100%'
                        }}
                      >
                        {/* Clear selection option */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCandidateId("");
                            setCandidateSearchTerm("");
                            setShowCandidateDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors duration-200 border-b border-gray-100 first:rounded-t-xl"
                        >
                          <div className="font-medium text-blue-600">
                            Use current candidate (default)
                          </div>
                          <div className="text-sm text-gray-500">Leave empty to use most recent candidate data</div>
                        </button>

                        {/* Candidates list */}
                        <div className="overflow-y-auto">
                          {(() => {
                            if (availableCandidates.length === 0) {
                              return (
                                <div className="px-4 py-3 text-gray-500 text-center">
                                  No candidates available
                                </div>
                              );
                            }

                            if (filteredCandidates.length === 0) {
                              return (
                                <div className="px-4 py-3 text-gray-500 text-center">
                                  No candidates found matching "{candidateSearchTerm}"
                                </div>
                              );
                            }

                            return filteredCandidates.map((candidate) => (
                              <button
                                key={candidate.id}
                                type="button"
                                onClick={() => {
                                  setSelectedCandidateId(candidate.id.toString());
                                  setCandidateSearchTerm("");
                                  setShowCandidateDropdown(false);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors duration-200 border-b border-gray-100 last:border-b-0 last:rounded-b-xl"
                              >
                                <div className="font-medium text-gray-800">
                                  {candidate.candidate_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Passport: {candidate.passport}
                                </div>
                              </button>
                            ));
                          })()}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Step 2: Maritime Course Selection */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-12"
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 w-full" style={{ overflow: 'visible', display: 'block', position: 'relative', zIndex: 1 }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Step 2: Select Maritime Course</h3>
                  <p className="text-gray-600 text-sm mt-1">Choose a course from the dropdown menu below</p>
                </div>
              </div>

              <div className="relative dropdown-container" style={{ overflow: 'visible', zIndex: 1000 }}>
                <div
                  className="dropdown-button w-full bg-gray-50 border-2 border-gray-200 rounded-xl hover:bg-gray-100 hover:border-blue-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all duration-200 cursor-pointer"
                >
                  {showDropdown ? (
                    <input
                      type="text"
                      placeholder="Search courses..."
                      value={courseSearchTerm}
                      onChange={(e) => setCourseSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 bg-transparent outline-none text-gray-700 placeholder-gray-500"
                      autoFocus
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        console.log('Dropdown button clicked, current state:', showDropdown);
                        setShowDropdown(true);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 text-left"
                    >
                      <span className="text-gray-700">
                        {selectedCourseId
                          ? availableCourses.find(c => c.id === parseInt(selectedCourseId))?.course_name
                          : "Select a maritime course..."}
                      </span>
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-gray-400" />
                        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {showDropdown && (
                    <>
                      {/* Dropdown backdrop for better visibility */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/10"
                        style={{ zIndex: 999998 }}
                        onClick={() => setShowDropdown(false)}
                      />

                      {/* Dropdown menu */}
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="dropdown-menu absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-300 rounded-xl shadow-2xl max-h-64 overflow-y-auto"
                        style={{
                          position: 'absolute',
                          zIndex: 999999,
                          backgroundColor: 'white',
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                          minWidth: '100%'
                        }}
                      >
                        {/* Courses list */}
                        <div className="overflow-y-auto">
                          {(() => {
                            if (availableCourses.length === 0) {
                              return (
                                <div className="px-4 py-3 text-gray-500 text-center">
                                  {loading ? "Loading courses..." : "No courses available"}
                                </div>
                              );
                            }

                            if (filteredCourses.length === 0) {
                              return (
                                <div className="px-4 py-3 text-gray-500 text-center">
                                  No courses found matching "{courseSearchTerm}"
                                </div>
                              );
                            }

                            return filteredCourses.map((course) => (
                              <button
                                key={course.id}
                                type="button"
                                onClick={() => {
                                  console.log('Course selected:', course.id);
                                  setSelectedCourseId(course.id.toString());
                                  setCourseSearchTerm(""); // Clear search when course is selected
                                  setShowDropdown(false);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors duration-200 border-b border-gray-100 last:border-b-0 group cursor-pointer"
                              >
                                <div className="font-medium text-gray-800 group-hover:text-blue-600">
                                  {course.course_name}
                                </div>
                              </button>
                            ));
                          })()}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Step 2: Course Details */}
          {selectedCourseData && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mb-12"
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Step 3: Course Details</h3>
                    <p className="text-gray-600 text-sm mt-1">Review the selected course information</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium text-gray-800 text-lg">{selectedCourseData.course_name}</div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCourseId("");
                          setSelectedCourseData(null);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 rounded-full hover:bg-red-50"
                        title="Remove selected course"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">Course Topics:</div>
                    <div className="space-y-1">
                      {selectedCourseData.topics.map((topic, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          {topic}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {validationError && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-4 mb-6 shadow-lg"
            >
              <div className="text-red-700 font-medium flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <Info className="w-4 h-4 text-white" />
                </div>
                {validationError}
              </div>
            </motion.div>
          )}


          {/* Step 3: Certificate Details */}
          {selectedCourseData && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mb-12"
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Step 4: Certificate Details</h3>
                    <p className="text-gray-600 text-sm mt-1">Configure certificate dates and generate certificate number</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Start Date */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <div className="relative">
                      <DatePicker
                        selected={isValidDate(startDate) ? startDate : null}
                        onChange={(date) => setStartDate(date)}
                        dateFormat="dd-MM-yyyy"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholderText="Select start date"
                        filterDate={(date) => date.getDay() !== 0}
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <div className="relative">
                      <DatePicker
                        selected={isValidDate(endDate) ? endDate : null}
                        onChange={(date) => setEndDate(date)}
                        dateFormat="dd-MM-yyyy"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholderText="Select end date"
                        filterDate={(date) => date.getDay() !== 0}
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Certificate Validity */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Certificate Validity (Years)</label>
                    <select
                      value={certificateValidity}
                      onChange={(e) => setCertificateValidity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select validity period</option>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map(year => (
                        <option key={year} value={year}>{year} year{year > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  {/* Auto-calculated fields */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                    <input
                      type="text"
                      value={expiryDate}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700"
                      placeholder="Auto-calculated"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Issue Date</label>
                    <input
                      type="text"
                      value={issueDate ? `${String(issueDate.getDate()).padStart(2, '0')}-${String(issueDate.getMonth() + 1).padStart(2, '0')}-${issueDate.getFullYear()}` : ''}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700"
                      placeholder="Auto-calculated"
                    />
                  </div>


                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Generate Certificate */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-center mt-16"
          >
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Step 5: Generate Certificate</h3>
              <p className="text-blue-200">Generate certificate with all configured details</p>
            </div>
            <motion.button
              onClick={handleGenerateCertificate}
              disabled={!selectedCourseData || !startDate || !endDate || !certificateValidity}
              whileHover={{
                scale: (selectedCourseData && startDate && endDate && certificateValidity) ? 1.05 : 1,
                y: (selectedCourseData && startDate && endDate && certificateValidity) ? -2 : 0
              }}
              whileTap={{
                scale: (selectedCourseData && startDate && endDate && certificateValidity) ? 0.95 : 1
              }}
              className={`group relative font-bold py-4 px-8 rounded-full transition-all duration-300 flex items-center gap-3 shadow-2xl mx-auto ${
                (selectedCourseData && startDate && endDate && certificateValidity)
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              <div className={`absolute inset-0 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-300 ${
                (selectedCourseData && startDate && endDate && certificateValidity)
                  ? 'bg-gradient-to-r from-green-400 to-blue-400' : ''
              }`}></div>
              <ArrowRight className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Generate Certificate</span>
            </motion.button>
          </motion.div>
        </motion.div>



      </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("CourseSelection rendering error:", error);
    return (
      <div className="min-h-screen bg-red-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Component Error</h2>
          <p className="text-gray-700 mb-4">There was an error loading the Course Selection page.</p>
          <p className="text-sm text-gray-500">Check the browser console for details.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}

export default CourseSelection;

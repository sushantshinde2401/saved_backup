import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';

function OperationsNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Define navigation flow
  const getNavigationButtons = () => {
    const currentPath = location.pathname;

    switch (currentPath) {
      case '/upload-docx':
        return {
          back: null, // No back button for first page
          next: { path: '/candidate-details', label: 'Next', icon: ArrowRightCircle }
        };
      case '/candidate-details':
        return {
          back: { path: '/upload-docx', label: 'Back', icon: ArrowLeftCircle },
          next: { path: '/course-selection', label: 'Next', icon: ArrowRightCircle }
        };
      case '/course-selection':
        return {
          back: { path: '/candidate-details', label: 'Back', icon: ArrowLeftCircle },
          next: null // No next button for last page before certificates
        };
      default:
        if (currentPath.startsWith('/certificate/')) {
          return {
            back: { path: '/course-selection', label: 'Back', icon: ArrowLeftCircle },
            next: null
          };
        }
        return { back: null, next: null };
    }
  };

  const { back, next } = getNavigationButtons();

  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Mobile Layout */}
        <div className="flex items-center justify-between md:hidden">
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </button>

          <div className="flex items-center gap-2">
            {back && (
              <button
                onClick={() => navigate(back.path)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                <back.icon className="w-4 h-4" />
                {back.label}
              </button>
            )}

            {next && (
              <button
                onClick={() => navigate(next.path)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                {next.label}
                <next.icon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          {/* Left side: Back to Home + Back button */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>

            {back && (
              <button
                onClick={() => navigate(back.path)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <back.icon className="w-4 h-4" />
                {back.label}
              </button>
            )}
          </div>

          {/* Right side: Next button */}
          <div className="flex items-center">
            {next && (
              <button
                onClick={() => navigate(next.path)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                {next.label}
                <next.icon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OperationsNavbar;
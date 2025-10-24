import React from 'react';
import { motion } from 'framer-motion';

// Export motion for use in consuming components
export { motion };

// Unified Design System Components

// Dashboard Layout Component
export const DashboardLayout = ({ children, title, subtitle, icon: Icon, footerText }) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        when: "beforeChildren",
        staggerChildren: 0.08,
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      {/* Main Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div
          className="text-center mb-16"
          variants={headerVariants}
        >
          {Icon && (
            <motion.div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-8 shadow-2xl">
              <Icon className="w-12 h-12 text-white" />
            </motion.div>
          )}
          <motion.h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-4">
            {title}
          </motion.h1>
          {subtitle && (
            <motion.h2 className="text-3xl md:text-4xl font-semibold text-blue-200 mb-4">
              {subtitle}
            </motion.h2>
          )}
        </motion.div>

        {/* Content */}
        {children}

        {/* Footer Info */}
        {footerText && (
          <motion.div
            className="mt-16 text-center"
            variants={headerVariants}
          >
            <p className="text-blue-200 opacity-60 text-sm">
              {footerText}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

// Unified Card Component
export const UnifiedCard = ({ children, gradient, onClick, className = "" }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      className="group relative"
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-150`}></div>
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.02, y: -8 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`relative w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-10 text-center hover:shadow-2xl transition-all duration-150 border border-white/20 ${className}`}
      >
        {children}
      </motion.button>
    </motion.div>
  );
};

// Unified Button Component
export const UnifiedButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = "",
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center font-semibold rounded-full shadow-2xl transition-all duration-150 relative group";

  const variants = {
    primary: "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white",
    secondary: "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white",
    success: "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white",
    danger: "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-8 py-4 text-lg",
    lg: "px-12 py-6 text-xl",
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-150"></div>
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

// Back Button Component
export const BackButton = ({ onClick, children = "Back to Home", className = "" }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`group relative inline-flex items-center gap-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-4 rounded-full shadow-2xl font-semibold text-lg transition-all duration-150 ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-400 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-150"></div>
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

// Floating Action Button Component
export const FloatingActionButton = ({ onClick, icon: Icon, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8, duration: 0.3 }}
      className={`fixed bottom-6 right-6 z-50 ${className}`}
    >
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.1, y: -3 }}
        whileTap={{ scale: 0.9 }}
        className="group relative bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white p-4 rounded-full shadow-2xl transition-all duration-150"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-400 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-150"></div>
        <Icon size={24} className="relative z-10" />
      </motion.button>
    </motion.div>
  );
};

// Status Badge Component
export const StatusBadge = ({ status, children, className = "" }) => {
  const statusStyles = {
    success: "bg-green-100 text-green-800 border-green-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    error: "bg-red-100 text-red-800 border-red-200",
    info: "bg-blue-100 text-blue-800 border-blue-200",
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusStyles[status] || statusStyles.info} ${className}`}>
      {children}
    </span>
  );
};

// Form Input Component
export const UnifiedInput = ({ label, error, className = "", ...props }) => {
  return (
    <div className={`input-row ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <input
        className={`input-field ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

// Form Select Component
export const UnifiedSelect = ({ label, options, error, className = "", ...props }) => {
  return (
    <div className={`input-row ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <select
        className={`input-field ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default {
  DashboardLayout,
  UnifiedCard,
  UnifiedButton,
  BackButton,
  FloatingActionButton,
  StatusBadge,
  UnifiedInput,
  UnifiedSelect,
};
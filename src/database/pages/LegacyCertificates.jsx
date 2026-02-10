import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  File
} from 'lucide-react';
import { DashboardLayout, BackButton } from '../../shared/components/DesignSystem';

function LegacyCertificates() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    reset,
    setValue,
    watch,
    trigger
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      candidate_name: '',
      passport: '',
      certificate_name: '',
      certificate_number: '',
      start_date: null,
      end_date: null,
      issue_date: null,
      expiry_date: null
    }
  });

  const watchedStartDate = watch('start_date');
  const watchedEndDate = watch('end_date');
  const watchedIssueDate = watch('issue_date');
  const watchedExpiryDate = watch('expiry_date');

  // Custom validation functions
  const validateStartDate = (value) => {
    if (!value) return 'Start date is required';
    return true;
  };

  const validateEndDate = (value) => {
    if (!value) return 'End date is required';
    if (watchedStartDate && value < watchedStartDate) return 'End date must be after or equal to start date';
    return true;
  };

  const validateIssueDate = (value) => {
    if (!value) return 'Issue date is required';
    return true;
  };

  const validateExpiryDate = (value) => {
    if (!value) return 'Expiry date is required';
    if (watchedIssueDate && value < watchedIssueDate) return 'Expiry date must be after or equal to issue date';
    return true;
  };

  // Helper function to format date in local timezone
  const formatLocalDate = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        candidate_name: data.candidate_name,
        passport: data.passport,
        certificate_name: data.certificate_name || '',
        certificate_number: data.certificate_number,
        start_date: formatLocalDate(data.start_date),
        end_date: formatLocalDate(data.end_date),
        issue_date: formatLocalDate(data.issue_date),
        expiry_date: formatLocalDate(data.expiry_date)
      };

      const response = await axios.post('http://127.0.0.1:5000/misc/legacy-certificates', payload);

      if (response.data.status === 'inserted') {
        toast.success('New certificate added successfully.');
        reset();
      } else if (response.data.status === 'updated') {
        toast.info('Record already existed — data updated successfully.');
        reset();
      } else {
        toast.error(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Network error, please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="LEGACY CERTIFICATES"
      subtitle="MANAGE CERTIFICATE RECORDS"
      icon={File}
      footerText="Maritime Training Institute • Legacy Certificate Management • Database Integration"
    >
      {/* Custom Header Content */}
      <div className="text-center mb-8">
        <p className="text-lg text-purple-100 opacity-80 max-w-2xl mx-auto mb-6">
          Add and manage legacy certificate records for candidates with file attachments
        </p>
      </div>

      {/* Form Card */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Candidate Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Candidate Name *
                </label>
                <input
                  type="text"
                  {...register('candidate_name', {
                    required: 'Candidate name is required',
                    maxLength: { value: 255, message: 'Maximum 255 characters' }
                  })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Enter candidate name"
                />
                {errors.candidate_name && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle size={14} />
                    {errors.candidate_name.message}
                  </div>
                )}
              </div>

              {/* Passport */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Passport *
                </label>
                <input
                  type="text"
                  {...register('passport', {
                    required: 'Passport is required',
                    maxLength: { value: 50, message: 'Maximum 50 characters' },
                    pattern: { value: /^[A-Za-z0-9]+$/, message: 'Only alphanumeric characters allowed' }
                  })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Enter passport number"
                />
                {errors.passport && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle size={14} />
                    {errors.passport.message}
                  </div>
                )}
              </div>

              {/* Certificate Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Certificate Name
                </label>
                <input
                  type="text"
                  {...register('certificate_name', {
                    maxLength: { value: 255, message: 'Maximum 255 characters' }
                  })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Enter certificate name"
                />
                {errors.certificate_name && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle size={14} />
                    {errors.certificate_name.message}
                  </div>
                )}
              </div>

              {/* Certificate Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Certificate Number *
                </label>
                <input
                  type="text"
                  {...register('certificate_number', {
                    required: 'Certificate number is required',
                    maxLength: { value: 100, message: 'Maximum 100 characters' },
                    validate: value => value.trim() !== '' || 'Certificate number cannot be empty or whitespace'
                  })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Enter certificate number"
                />
                {errors.certificate_number && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle size={14} />
                    {errors.certificate_number.message}
                  </div>
                )}
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date *
                </label>
                <Controller
                  name="start_date"
                  control={control}
                  rules={{ validate: validateStartDate }}
                  render={({ field }) => (
                    <DatePicker
                      selected={field.value}
                      onChange={(date) => {
                        field.onChange(date);
                        trigger(['start_date', 'end_date']);
                        if (watchedEndDate && date > watchedEndDate) {
                          setValue('end_date', null);
                        }
                      }}
                      dateFormat="yyyy-MM-dd"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                      placeholderText="Select start date"
                      wrapperClassName="w-full"
                    />
                  )}
                />
                {errors.start_date && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle size={14} />
                    {errors.start_date.message}
                  </div>
                )}
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Date *
                </label>
                <Controller
                  name="end_date"
                  control={control}
                  rules={{ validate: validateEndDate }}
                  render={({ field }) => (
                    <DatePicker
                      selected={field.value}
                      onChange={(date) => {
                        field.onChange(date);
                        trigger('end_date');
                      }}
                      dateFormat="yyyy-MM-dd"
                      minDate={watchedStartDate}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                      placeholderText="Select end date"
                      wrapperClassName="w-full"
                    />
                  )}
                />
                {errors.end_date && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle size={14} />
                    {errors.end_date.message}
                  </div>
                )}
              </div>

              {/* Issue Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Issue Date *
                </label>
                <Controller
                  name="issue_date"
                  control={control}
                  rules={{ validate: validateIssueDate }}
                  render={({ field }) => (
                    <DatePicker
                      selected={field.value}
                      onChange={(date) => {
                        field.onChange(date);
                        trigger(['issue_date', 'expiry_date']);
                        if (watchedExpiryDate && date > watchedExpiryDate) {
                          setValue('expiry_date', null);
                        }
                      }}
                      dateFormat="yyyy-MM-dd"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                      placeholderText="Select issue date"
                      wrapperClassName="w-full"
                    />
                  )}
                />
                {errors.issue_date && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle size={14} />
                    {errors.issue_date.message}
                  </div>
                )}
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Expiry Date *
                </label>
                <Controller
                  name="expiry_date"
                  control={control}
                  rules={{ validate: validateExpiryDate }}
                  render={({ field }) => (
                    <DatePicker
                      selected={field.value}
                      onChange={(date) => {
                        field.onChange(date);
                        trigger('expiry_date');
                      }}
                      dateFormat="yyyy-MM-dd"
                      minDate={watchedIssueDate}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                      placeholderText="Select expiry date"
                      wrapperClassName="w-full"
                    />
                  )}
                />
                {errors.expiry_date && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle size={14} />
                    {errors.expiry_date.message}
                  </div>
                )}
              </div>
            </div>


            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Certificate
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Back to Database Button */}
      <div className="mt-8 flex justify-center">
        <BackButton onClick={() => navigate('/database')} />
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </DashboardLayout>
  );
}

export default LegacyCertificates;
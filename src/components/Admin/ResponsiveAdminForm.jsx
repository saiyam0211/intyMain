import React from 'react';
import './AdminResponsive.css';

/**
 * A responsive form component for admin pages
 * @param {Object} props
 * @param {React.ReactNode} props.children - The form fields
 * @param {Function} props.onSubmit - Form submit handler
 * @param {string} props.title - Form title
 * @param {string} props.submitText - Submit button text
 * @param {boolean} props.loading - Whether the form is submitting
 * @param {string} props.error - Error message to display
 * @param {string} props.successMessage - Success message to display
 */
const ResponsiveAdminForm = ({
  children,
  onSubmit,
  title,
  submitText = 'Save',
  loading = false,
  error = '',
  successMessage = ''
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {title && (
        <div className="px-4 py-3 sm:px-6 bg-gray-50 border-b">
          <h3 className="text-lg sm:text-xl font-medium text-gray-800">{title}</h3>
        </div>
      )}

      <form onSubmit={onSubmit} className="p-4 sm:p-6">
        {/* Error message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 mb-4 sm:mb-6 rounded">
            {error}
          </div>
        )}

        {/* Success message */}
        {successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 sm:p-4 mb-4 sm:mb-6 rounded">
            {successMessage}
          </div>
        )}

        {/* Form fields */}
        <div className="space-y-4 sm:space-y-6">
          {children}
        </div>

        {/* Submit button */}
        <div className="mt-6 sm:mt-8 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="admin-btn bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : submitText}
          </button>
        </div>
      </form>
    </div>
  );
};

/**
 * A responsive form field component
 * @param {Object} props
 * @param {string} props.label - Field label
 * @param {string} props.name - Field name
 * @param {string} props.type - Input type
 * @param {string} props.value - Field value
 * @param {Function} props.onChange - Change handler
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.disabled - Whether the field is disabled
 * @param {string} props.error - Error message for this field
 */
export const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder = '',
  disabled = false,
  error = ''
}) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm sm:text-base font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          disabled={disabled}
          className={`admin-input ${error ? 'border-red-500' : ''}`}
          rows={4}
        />
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          disabled={disabled}
          className={`admin-input ${error ? 'border-red-500' : ''}`}
        />
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

/**
 * A responsive select field component
 * @param {Object} props
 * @param {string} props.label - Field label
 * @param {string} props.name - Field name
 * @param {string} props.value - Field value
 * @param {Function} props.onChange - Change handler
 * @param {Array} props.options - Select options array of {value, label}
 * @param {boolean} props.required - Whether the field is required
 * @param {boolean} props.disabled - Whether the field is disabled
 * @param {string} props.error - Error message for this field
 */
export const SelectField = ({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  error = ''
}) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm sm:text-base font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`admin-select ${error ? 'border-red-500' : ''}`}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default ResponsiveAdminForm; 
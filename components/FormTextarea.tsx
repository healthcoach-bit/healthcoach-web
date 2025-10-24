import React from 'react';

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function FormTextarea({ 
  label, 
  error, 
  helperText,
  className = '',
  ...props 
}: FormTextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <textarea
        {...props}
        className={`
          w-full px-4 py-2 
          border ${error ? 'border-red-500' : 'border-gray-300'} 
          rounded-lg 
          text-gray-900 
          placeholder:text-gray-400
          focus:ring-2 focus:ring-green-500 focus:border-green-500
          disabled:bg-gray-100 disabled:text-gray-500
          resize-none
          ${className}
        `.trim().replace(/\s+/g, ' ')}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

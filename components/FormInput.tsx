import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  wrapperClassName?: string;
}

export default function FormInput({ 
  label, 
  error, 
  helperText,
  className = '',
  wrapperClassName = '',
  ...props 
}: FormInputProps) {
  return (
    <div className={wrapperClassName || 'w-full'}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`
          w-full px-4 py-2 
          border ${error ? 'border-red-500' : 'border-gray-300'} 
          rounded-lg 
          text-gray-900 
          placeholder:text-gray-400
          focus:ring-2 focus:ring-green-500 focus:border-green-500
          disabled:bg-gray-100 disabled:text-gray-500
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

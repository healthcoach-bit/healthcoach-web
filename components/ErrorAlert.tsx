interface ErrorAlertProps {
  message: string | Error;
  variant?: 'default' | 'centered';
}

export default function ErrorAlert({ message, variant = 'default' }: ErrorAlertProps) {
  const errorMessage = message instanceof Error ? message.message : message;

  if (variant === 'centered') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg 
          className="w-12 h-12 text-red-400 mx-auto mb-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
        <p className="text-red-700">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
      {errorMessage}
    </div>
  );
}

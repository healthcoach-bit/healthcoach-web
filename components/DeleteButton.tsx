interface DeleteButtonProps {
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function DeleteButton({ 
  onClick, 
  size = 'md',
  className = ''
}: DeleteButtonProps) {
  const sizeClasses = {
    sm: 'p-1 w-4 h-4',
    md: 'p-1.5 w-4 h-4 sm:w-5 sm:h-5',
    lg: 'p-2 w-6 h-6'
  };

  return (
    <button
      onClick={onClick}
      className={`text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ${className}`}
      aria-label="Delete"
    >
      <svg 
        className={sizeClasses[size]} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
        />
      </svg>
    </button>
  );
}

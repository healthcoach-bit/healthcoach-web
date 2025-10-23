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
  const buttonClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  const iconClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };

  return (
    <button
      onClick={onClick}
      className={`${buttonClasses[size]} text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ${className}`}
      aria-label="Delete"
    >
      <svg 
        className={iconClasses[size]} 
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

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import DeleteButton from './DeleteButton';

interface FoodLogCardProps {
  id: string;
  mealType: string;
  timestamp: string;
  totalCalories?: number;
  notes?: string;
  onDelete: () => void;
}

export default function FoodLogCard({
  id,
  mealType,
  timestamp,
  totalCalories,
  notes,
  onDelete
}: FoodLogCardProps) {
  const { t } = useLanguage();

  // Translate meal type from database value to i18n
  const getMealTypeTranslation = (type: string): string => {
    const typeKey = type.toLowerCase() as 'breakfast' | 'lunch' | 'dinner' | 'snack';
    return t[typeKey] || type;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg sm:text-xl text-gray-900">
            {getMealTypeTranslation(mealType)}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {new Date(timestamp).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-start gap-2">
          {totalCalories && (
            <span className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap">
              {totalCalories} cal
            </span>
          )}
          <DeleteButton onClick={onDelete} size="md" />
        </div>
      </div>
      
      {notes && (
        <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">
          {notes}
        </p>
      )}
      
      <Link
        href={`/dashboard/logs/${id}`}
        className="text-green-600 hover:text-green-700 font-medium text-xs sm:text-sm inline-flex items-center gap-1"
      >
        {t.viewDetails}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}

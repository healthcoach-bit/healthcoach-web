'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-0.5 sm:gap-1 bg-white rounded-md sm:rounded-lg px-1 sm:px-2 py-0.5 sm:py-1 shadow-sm border border-gray-200">
      <button
        onClick={() => setLanguage('en')}
        className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded text-xs font-medium transition-colors ${
          language === 'en'
            ? 'bg-green-600 text-white'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('es')}
        className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded text-xs font-medium transition-colors ${
          language === 'es'
            ? 'bg-green-600 text-white'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        ES
      </button>
    </div>
  );
}

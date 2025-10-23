'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSignOut } from '@/hooks/useSignOut';
import LanguageSwitcher from './LanguageSwitcher';
import UserEmail from './UserEmail';

interface DashboardHeaderProps {
  showBackButton?: boolean;
  backHref?: string;
}

export default function DashboardHeader({ 
  showBackButton = false,
  backHref = '/dashboard'
}: DashboardHeaderProps) {
  const { t } = useLanguage();
  const handleSignOut = useSignOut();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <Link 
              href={backHref} 
              className="flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              {showBackButton && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              )}
              <span className="text-xl sm:text-2xl">🥗</span>
              <span className="text-sm sm:text-base lg:text-xl font-bold text-green-600">
                {t.appName}
              </span>
            </Link>
            
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <LanguageSwitcher />
              
              {/* Desktop Navigation */}
              <div className="hidden sm:flex items-center gap-2 lg:gap-4">
                <UserEmail className="text-sm lg:text-base max-w-[120px] md:max-w-[180px] lg:max-w-none" />
                <button
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-gray-900 text-sm lg:text-base whitespace-nowrap px-3"
                >
                  {t.signOut}
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile User Info & Sign Out */}
          <div className="flex items-center justify-between gap-3 mt-3 sm:hidden">
            <UserEmail className="text-xs" />
            <button
              onClick={handleSignOut}
              className="text-gray-600 hover:text-red-600 text-xs font-medium whitespace-nowrap px-3 py-1.5 border border-gray-300 rounded-lg hover:border-red-300 transition-colors"
            >
              {t.signOut}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

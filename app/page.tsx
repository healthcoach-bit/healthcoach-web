'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Home() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="py-3 sm:py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥗</span>
              <span className="text-base sm:text-xl lg:text-2xl font-bold text-green-600">{t.appName}</span>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageSwitcher />
              
              {/* Desktop Navigation - Same Line as Header */}
              <div className="hidden lg:flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-green-600 font-medium text-base"
                >
                  {t.login}
                </Link>
                <Link
                  href="/signup"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium text-base"
                >
                  {t.signup}
                </Link>
              </div>
            </div>
          </div>
          
          {/* Mobile Navigation - Below Header */}
          <div className="flex items-center gap-2 mt-3 lg:hidden">
            <Link
              href="/login"
              className="flex-1 text-center text-gray-700 hover:text-green-600 font-medium text-sm py-2 px-4 border border-gray-300 rounded-lg hover:border-green-500 transition-colors"
            >
              {t.login}
            </Link>
            <Link
              href="/signup"
              className="flex-1 text-center bg-green-600 text-white font-medium text-sm py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              {t.signup}
            </Link>
          </div>
        </nav>

        <main className="py-12 sm:py-16 lg:py-20 text-center px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
            {t.heroTitle}
            <br />
            <span className="text-green-600">{t.heroSubtitle}</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
            {t.heroDescription}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto">
            <Link
              href="/signup"
              className="bg-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-green-700 font-semibold text-base sm:text-lg shadow-lg w-full sm:w-auto"
            >
              {t.getStarted}
            </Link>
            <Link
              href="#features"
              className="bg-white text-green-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-gray-50 font-semibold text-base sm:text-lg shadow-lg border-2 border-green-600 w-full sm:w-auto"
            >
              {t.learnMore}
            </Link>
          </div>

          <div id="features" className="mt-16 sm:mt-24 lg:mt-32 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📸</div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">{t.photoLoggingTitle}</h3>
              <p className="text-sm sm:text-base text-gray-600">
                {t.photoLoggingDesc}
              </p>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🤖</div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">{t.aiAnalysisTitle}</h3>
              <p className="text-sm sm:text-base text-gray-600">
                {t.aiAnalysisDesc}
              </p>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg sm:col-span-2 lg:col-span-1">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📊</div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">{t.trackProgressTitle}</h3>
              <p className="text-sm sm:text-base text-gray-600">
                {t.trackProgressDesc}
              </p>
            </div>
          </div>
        </main>

        <footer className="py-8 sm:py-12 text-center text-gray-600">
          <p className="text-sm sm:text-base">© 2025 {t.appName}. {t.poweredBy}</p>
        </footer>
      </div>
    </div>
  );
}

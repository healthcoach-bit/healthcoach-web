'use client';

import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardHeader from '@/components/DashboardHeader';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorAlert from '@/components/ErrorAlert';
import DeleteButton from '@/components/DeleteButton';
import { useFoodLog } from '@/hooks/useFoodLogs';
import { useUIStore } from '@/store/ui-store';

export default function FoodLogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const id = params.id as string;
  const openDeleteModal = useUIStore((state) => state.openDeleteModal);

  const { data, isLoading, error } = useFoodLog(id);
  const foodLog = data?.foodLog;

  const handleDelete = () => {
    openDeleteModal(id, 'foodLog', () => {
      // Redirect to dashboard after successful deletion
      router.push('/dashboard');
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader showBackButton backHref="/dashboard" />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !foodLog) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader showBackButton backHref="/dashboard" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorAlert 
            message={error instanceof Error ? error.message : 'Food log not found'} 
            variant="centered" 
          />
        </div>
      </div>
    );
  }

  const formattedDate = new Date(foodLog.timestamp).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = new Date(foodLog.timestamp).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader showBackButton backHref="/dashboard" />
      <DeleteConfirmModal />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header with Title and Actions */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 capitalize">
              {foodLog.meal_type}
            </h1>
            <DeleteButton onClick={handleDelete} size="lg" />
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm sm:text-base">{formattedDate}</span>
            <span className="text-gray-400">•</span>
            <span className="text-sm sm:text-base">{formattedTime}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Calories Card */}
          {foodLog.total_calories && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-1">
                    {t.calories || 'Calories'}
                  </p>
                  <p className="text-4xl font-bold text-green-900">
                    {foodLog.total_calories}
                    <span className="text-xl text-green-700 ml-2">cal</span>
                  </p>
                </div>
                <div className="bg-white rounded-full p-4 shadow-sm">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* Photos Grid */}
          {foodLog.photos && foodLog.photos.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {t.photos || 'Photos'} ({foodLog.photos.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {foodLog.photos.map((photo: any) => (
                  <div key={photo.id} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group">
                    <img
                      src={photo.url || photo.path}
                      alt="Food"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImage not available%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes Card */}
          {foodLog.notes && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {t.notes || 'Notes'}
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {foodLog.notes}
              </p>
            </div>
          )}

          {/* Analysis Card (if available) */}
          {foodLog.analysis_json && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                AI {t.analysis || 'Analysis'}
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(foodLog.analysis_json, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Metadata Card */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {t.metadata || 'Information'}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ID:</span>
                <span className="text-gray-900 font-mono text-xs">{foodLog.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t.createdAt || 'Created'}:</span>
                <span className="text-gray-900">
                  {new Date(foodLog.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

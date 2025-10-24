'use client';

import { useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardHeader from '@/components/DashboardHeader';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorAlert from '@/components/ErrorAlert';
import FoodLogCard from '@/components/FoodLogCard';
import { useFoodLogs } from '@/hooks/useFoodLogs';
import { useUIStore } from '@/store/ui-store';

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const dateFilter = useUIStore((state) => state.dateFilter);
  const openDeleteModal = useUIStore((state) => state.openDeleteModal);
  
  // React Query hooks
  const { data: foodLogs = [], isLoading, error } = useFoodLogs(dateFilter);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await getCurrentUser();
    } catch (err) {
      router.push('/login');
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <DeleteConfirmModal />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Health Profile Card */}
          <Link href="/dashboard/health" className="block group">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-white">{t.healthProfile}</h3>
                <span className="text-4xl">🏥</span>
              </div>
              <p className="text-green-50 text-sm mb-4">{t.trackMetrics}</p>
              <div className="flex items-center text-white text-sm font-medium">
                <span>{t.viewDetails}</span>
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>

          {/* Food Log Card */}
          <Link href="/dashboard/new-log" className="block group">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-white">{t.newFoodLog}</h3>
                <span className="text-4xl">🍽️</span>
              </div>
              <p className="text-blue-50 text-sm mb-4">{t.trackMeals}</p>
              <div className="flex items-center text-white text-sm font-medium">
                <span>+ {t.addNewMeal}</span>
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>
        </div>

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t.yourFoodLog}</h1>
          <p className="text-sm sm:text-base text-gray-700">{t.trackMeals}</p>
        </div>

        {error && (
          <ErrorAlert message={error instanceof Error ? error.message : 'Failed to load food logs'} />
        )}

        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {foodLogs.length === 0 ? (
            <div className="col-span-full text-center py-8 sm:py-12">
              <p className="text-gray-500 text-base sm:text-lg px-4">{t.noLogsYet}</p>
            </div>
          ) : (
            foodLogs.map((log: any) => (
              <FoodLogCard
                key={log.id}
                id={log.id}
                mealType={log.meal_type}
                timestamp={log.timestamp}
                totalCalories={log.total_calories}
                notes={log.notes}
                onDelete={() => openDeleteModal(log.id, 'foodLog')}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

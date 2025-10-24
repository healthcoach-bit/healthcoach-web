'use client';

import { useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardHeader from '@/components/DashboardHeader';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorAlert from '@/components/ErrorAlert';
import FoodLogCard from '@/components/FoodLogCard';
import { useFoodLogs } from '@/hooks/useFoodLogs';
import { useUIStore } from '@/store/ui-store';

export default function FoodLogsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const dateFilter = useUIStore((state) => state.dateFilter);
  const openDeleteModal = useUIStore((state) => state.openDeleteModal);
  
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
      <DashboardHeader showBackButton backHref="/dashboard" />
      <DeleteConfirmModal />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

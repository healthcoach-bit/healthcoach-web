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
  const { t, locale } = useLanguage();
  const dateFilter = useUIStore((state) => state.dateFilter);
  const openDeleteModal = useUIStore((state) => state.openDeleteModal);
  
  // React Query hooks
  const { data: foodLogs = [], isLoading, error } = useFoodLogs(dateFilter);

  // Calculate daily totals
  const dailyTotals = foodLogs.reduce((acc: { calories: number; protein: number; carbs: number; fat: number }, log: any) => {
    return {
      calories: acc.calories + (log.total_calories || 0),
      protein: acc.protein + (log.total_protein || 0),
      carbs: acc.carbs + (log.total_carbs || 0),
      fat: acc.fat + (log.total_fat || 0),
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const calorieGoal = 2500; // TODO: Get from user profile
  const calorieProgress = Math.min(100, (dailyTotals.calories / calorieGoal) * 100);

  const formatMealTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });
  };

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

        {/* Daily Nutrition Summary */}
        {foodLogs.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">📊 {t.dailySummary || 'Resumen del Día'}</h2>
              <span className="text-sm text-gray-500">{foodLogs.length} {t.meals || 'comidas'}</span>
            </div>

            {/* Calorie Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">{t.calories || 'Calorías'}</span>
                <span className="text-lg font-bold text-gray-900">
                  {dailyTotals.calories.toFixed(0)} / {calorieGoal} {t.kcal || 'kcal'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    calorieProgress > 100 ? 'bg-red-500' : calorieProgress > 80 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(calorieProgress, 100)}%` }}
                />
              </div>
            </div>

            {/* Macros */}
            {(dailyTotals.protein > 0 || dailyTotals.carbs > 0 || dailyTotals.fat > 0) && (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">{t.protein || 'Proteína'}</p>
                  <p className="text-lg font-semibold text-blue-600">{dailyTotals.protein.toFixed(0)}g</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">{t.carbs || 'Carbos'}</p>
                  <p className="text-lg font-semibold text-orange-600">{dailyTotals.carbs.toFixed(0)}g</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">{t.fat || 'Grasa'}</p>
                  <p className="text-lg font-semibold text-purple-600">{dailyTotals.fat.toFixed(0)}g</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Meals - Compact List */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">🍽️ {t.recentMeals || 'Últimas Comidas'}</h2>
            {foodLogs.length > 3 && (
              <Link
                href="/dashboard/food-logs"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                {t.viewAll || 'Ver Todas'} →
              </Link>
            )}
          </div>

          {error && (
            <ErrorAlert message={error instanceof Error ? error.message : 'Failed to load food logs'} />
          )}

          {foodLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg mb-4">🍽️</p>
              <p className="text-gray-500">{t.noLogsYet}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {foodLogs.slice(0, 3).map((log: any) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-2xl">
                      {log.meal_type === 'breakfast' ? '🌅' :
                       log.meal_type === 'lunch' ? '🍽️' :
                       log.meal_type === 'dinner' ? '🌙' : '🍎'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 capitalize">
                          {t[log.meal_type as keyof typeof t] || log.meal_type}
                        </h3>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{formatMealTime(log.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {log.notes || `${log.total_calories} ${t.kcal || 'kcal'}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{log.total_calories}</p>
                      <p className="text-xs text-gray-500">{t.kcal || 'kcal'}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/dashboard/food-logs/${log.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title={t.viewDetails}
                      >
                        👁️
                      </Link>
                      <button
                        onClick={() => openDeleteModal(log.id, 'foodLog')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title={t.delete}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View All Button */}
          {foodLogs.length > 3 && (
            <div className="mt-4 pt-4 border-t">
              <Link
                href="/dashboard/food-logs"
                className="block w-full text-center py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                {t.viewAllMeals || 'Ver Historial Completo'} ({foodLogs.length})
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

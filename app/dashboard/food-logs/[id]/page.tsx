'use client';

import { useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { useRouter, useParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardHeader from '@/components/DashboardHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorAlert from '@/components/ErrorAlert';
import { useFoodLog } from '@/hooks/useFoodLogs';
import { formatDate } from '@/lib/dateUtils';

export default function FoodLogDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { t, locale } = useLanguage();
  const foodLogId = params.id as string;

  const { data: foodLog, isLoading, error } = useFoodLog(foodLogId);

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

  if (error || !foodLog) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader showBackButton backHref="/dashboard" />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorAlert message={error?.message || 'Food log not found'} />
        </main>
      </div>
    );
  }

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '🍽️';
      case 'dinner': return '🌙';
      case 'snack': return '🍎';
      default: return '🍴';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader showBackButton backHref="/dashboard" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{getMealIcon(foodLog.meal_type)}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 capitalize">
                {t[foodLog.meal_type as keyof typeof t] || foodLog.meal_type}
              </h1>
              <p className="text-gray-600">{formatDate(foodLog.timestamp, locale)}</p>
            </div>
          </div>
        </div>

        {/* Nutrition Summary */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📊 {t.nutritionalInfo || 'Información Nutricional'}</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{t.calories || 'Calorías'}</p>
              <p className="text-2xl font-bold text-orange-600">{foodLog.total_calories}</p>
              <p className="text-xs text-gray-500">{t.kcal || 'kcal'}</p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{t.protein || 'Proteína'}</p>
              <p className="text-2xl font-bold text-blue-600">{foodLog.total_protein || 0}</p>
              <p className="text-xs text-gray-500">g</p>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{t.carbs || 'Carbos'}</p>
              <p className="text-2xl font-bold text-yellow-600">{foodLog.total_carbs || 0}</p>
              <p className="text-xs text-gray-500">g</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{t.fat || 'Grasa'}</p>
              <p className="text-2xl font-bold text-purple-600">{foodLog.total_fat || 0}</p>
              <p className="text-xs text-gray-500">g</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {foodLog.notes && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">📝 {t.notes || 'Notas'}</h2>
            <p className="text-gray-700">{foodLog.notes}</p>
          </div>
        )}

        {/* Photo */}
        {foodLog.photo_url && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">📷 {t.photos || 'Foto'}</h2>
            <img
              src={foodLog.photo_url}
              alt="Food"
              className="w-full rounded-lg"
            />
          </div>
        )}

        {/* Analysis (if available) */}
        {foodLog.analysis && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">🤖 {t.analysis}</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{foodLog.analysis}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

'use client';

import { useParams, useRouter } from 'next/navigation';
import { Edit2, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardHeader from '@/components/DashboardHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorAlert from '@/components/ErrorAlert';
import DeleteButton from '@/components/DeleteButton';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import { useFoodLog } from '@/hooks/useFoodLogs';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/store/ui-store';
import { formatDate, formatTime } from '@/lib/dateUtils';
import { apiClient } from '@/lib/api';

export default function FoodLogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, locale } = useLanguage();
  const foodLogId = params.id as string;
  const { isCheckingAuth } = useAuth();
  const openDeleteModal = useUIStore((state) => state.openDeleteModal);

  const { data: foodLog, isLoading, error } = useFoodLog(foodLogId);

  const handleDelete = () => {
    openDeleteModal(foodLogId, 'foodLog', () => {
      router.push('/dashboard');
    });
  };

  const handleEdit = () => {
    router.push(`/dashboard/new-log?id=${foodLogId}`);
  };

  const handleCleanBrokenPhotos = async () => {
    if (!confirm('¿Eliminar fotos rotas/no disponibles?')) return;
    
    try {
      await apiClient.deletePhotosByFoodLogId(foodLogId);
      // Refresh the page
      window.location.reload();
    } catch (err) {
      console.error('Error deleting photos:', err);
      alert('Error al eliminar fotos');
    }
  };

  if (isCheckingAuth || isLoading) {
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
      <DeleteConfirmModal />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{getMealIcon(foodLog.meal_type)}</span>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 capitalize">
                  {t[foodLog.meal_type as keyof typeof t] || foodLog.meal_type}
                </h1>
                <p className="text-gray-600">
                  {formatDate(foodLog.timestamp, locale)}
                  {foodLog.timestamp && (
                    <span className="ml-2 text-gray-500">
                      • {formatTime(foodLog.timestamp, locale)}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleEdit}
                className="p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Editar"
              >
                <Edit2 className="w-6 h-6" />
              </button>
              <DeleteButton onClick={handleDelete} size="lg" />
            </div>
          </div>
        </div>

        {/* Nutrition Summary */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📊 {t.nutritionalInfo || 'Información Nutricional'}</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{t.calories || 'Calorías'}</p>
              <p className="text-2xl font-bold text-orange-600">{foodLog.total_calories || 0}</p>
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
        {foodLog.photos && foodLog.photos.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-gray-900">📷 {t.photos || 'Foto'}</h2>
              <button
                onClick={handleCleanBrokenPhotos}
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                title="Eliminar fotos rotas"
              >
                <Trash2 className="w-4 h-4" />
                Limpiar fotos rotas
              </button>
            </div>
            {(() => {
              const photo = foodLog.photos[0];
              
              if (!photo.url) {
                return <p className="text-gray-500">No se pudo cargar la foto (URL no disponible)</p>;
              }
              
              return (
                <img
                  src={photo.url}
                  alt="Food"
                  className="w-full rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              );
            })()}
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

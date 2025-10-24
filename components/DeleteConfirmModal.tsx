'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useUIStore } from '@/store/ui-store';
import { useDeleteFoodLog } from '@/hooks/useFoodLogs';
import { useDeleteHealthMetric } from '@/hooks/useHealthMetrics';
import { useDeleteExerciseLog } from '@/hooks/useExercise';

export default function DeleteConfirmModal() {
  const { t } = useLanguage();
  const deleteModal = useUIStore((state) => state.deleteModal);
  const closeDeleteModal = useUIStore((state) => state.closeDeleteModal);
  const deleteFoodLog = useDeleteFoodLog();
  const deleteHealthMetric = useDeleteHealthMetric();
  const deleteExerciseLog = useDeleteExerciseLog();

  if (!deleteModal.isOpen) return null;

  const handleDelete = async () => {
    if (!deleteModal.itemId) return;

    try {
      if (deleteModal.itemType === 'foodLog') {
        await deleteFoodLog.mutateAsync(deleteModal.itemId);
      } else if (deleteModal.itemType === 'healthMetric') {
        await deleteHealthMetric.mutateAsync(deleteModal.itemId);
      } else if (deleteModal.itemType === 'exerciseLog') {
        await deleteExerciseLog.mutateAsync(deleteModal.itemId);
      }
      
      // Call success callback if provided (e.g., redirect)
      if (deleteModal.onSuccess) {
        deleteModal.onSuccess();
      }
      
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={closeDeleteModal}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all">
          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
            {t.deleteConfirmTitle || '¿Eliminar registro?'}
          </h3>

          {/* Message */}
          <p className="text-sm text-gray-600 text-center mb-6">
            {t.deleteConfirmMessage || 'Esta acción no se puede deshacer. El registro será eliminado permanentemente.'}
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={closeDeleteModal}
              disabled={deleteFoodLog.isPending || deleteHealthMetric.isPending || deleteExerciseLog.isPending}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t.cancel || 'Cancelar'}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteFoodLog.isPending || deleteHealthMetric.isPending || deleteExerciseLog.isPending}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {(deleteFoodLog.isPending || deleteHealthMetric.isPending || deleteExerciseLog.isPending) ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t.deleting || 'Eliminando...'}
                </>
              ) : (
                t.delete || 'Eliminar'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardHeader from '@/components/DashboardHeader';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorAlert from '@/components/ErrorAlert';
import { useExerciseLogs } from '@/hooks/useExercise';
import { useUIStore } from '@/store/ui-store';
import { formatDate } from '@/lib/dateUtils';

export default function ExerciseListPage() {
  const { t, locale } = useLanguage();
  const { data: exercises = [], isLoading, error } = useExerciseLogs(50); // Load more exercises
  const openDeleteModal = useUIStore((state) => state.openDeleteModal);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader showBackButton backHref="/dashboard/health" />
        <div className="flex justify-center items-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader showBackButton backHref="/dashboard/health" />
      <DeleteConfirmModal />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{t.exercises}</h1>
            <p className="text-gray-600 mt-2">{t.allExerciseLogs || 'Todos tus ejercicios registrados'}</p>
          </div>
          <Link
            href="/dashboard/exercise/new"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            + {t.addExercise}
          </Link>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorAlert message={error as any} />
          </div>
        )}

        {/* Exercise List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {exercises.length > 0 ? (
            <div className="space-y-3">
              {exercises.map((exercise: any) => (
                <div key={exercise.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">🏃</span>
                    <div>
                      <p className="font-semibold text-gray-900 text-lg capitalize">
                        {t[exercise.exercise_type as keyof typeof t] || exercise.exercise_type}
                      </p>
                      <p className="text-sm text-gray-600">
                        {exercise.duration_minutes} {t.minutes}
                        {exercise.intensity && ` • ${t[exercise.intensity as keyof typeof t] || exercise.intensity}`}
                      </p>
                      {exercise.notes && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{exercise.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">
                        {formatDate(exercise.performed_at, locale)}
                      </p>
                      {exercise.calories_burned && (
                        <p className="text-base text-orange-600 font-semibold">
                          {exercise.calories_burned} {t.kcal}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/dashboard/exercise/${exercise.id}`}
                      className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title={t.edit}
                    >
                      ✏️
                    </Link>
                    <button
                      onClick={() => openDeleteModal(exercise.id, 'exerciseLog')}
                      className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-2 text-red-600 hover:bg-red-50 rounded"
                      title={t.delete}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-4">🏃</p>
              <p className="text-lg font-medium mb-2">{t.noExerciseLogs}</p>
              <p className="text-sm mb-6">{t.startLoggingExercise || 'Comienza a registrar tus ejercicios'}</p>
              <Link
                href="/dashboard/exercise/new"
                className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                + {t.addExercise}
              </Link>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {exercises.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-600 mb-1">{t.totalExercises || 'Total de Ejercicios'}</p>
              <p className="text-2xl font-bold text-gray-900">{exercises.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-600 mb-1">{t.totalMinutes || 'Minutos Totales'}</p>
              <p className="text-2xl font-bold text-gray-900">
                {exercises.reduce((sum: number, ex: any) => sum + (ex.duration_minutes || 0), 0)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-600 mb-1">{t.totalCalories || 'Calorías Totales'}</p>
              <p className="text-2xl font-bold text-orange-600">
                {exercises.reduce((sum: number, ex: any) => sum + (ex.calories_burned || 0), 0)}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

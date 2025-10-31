'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardHeader from '@/components/DashboardHeader';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorAlert from '@/components/ErrorAlert';
import { useHealthMetrics } from '@/hooks/useHealthMetrics';
import { useUIStore } from '@/store/ui-store';
import { formatDate } from '@/lib/dateUtils';

export default function HealthMetricsListPage() {
  const { t, locale } = useLanguage();
  const { data: metrics = [], isLoading, error } = useHealthMetrics('weight', 50); // Load more metrics
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
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{t.healthMetrics || 'Métricas de Salud'}</h1>
            <p className="text-gray-600 mt-2">{t.allHealthMetrics || 'Todas tus métricas de salud registradas'}</p>
          </div>
          <Link
            href="/dashboard/health-metrics/new"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + {t.addMetric}
          </Link>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorAlert message={error as any} />
          </div>
        )}

        {/* Metrics List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {metrics.length > 0 ? (
            <div className="space-y-4">
              {metrics.map((metric: any) => (
                <div key={metric.id} className="border-l-4 border-blue-500 bg-gray-50 rounded-lg p-4 group hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-sm font-medium text-gray-500">
                          {formatDate(metric.measured_at, locale)}
                        </span>
                        <div className="flex items-center gap-2">
                          {metric.weight_kg && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                              ⚖️ {metric.weight_kg} {t.kg}
                            </span>
                          )}
                          {metric.body_fat_percentage && (
                            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                              💪 {metric.body_fat_percentage}% {t.bodyFat}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        {metric.blood_pressure_systolic && metric.blood_pressure_diastolic && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600">{t.bloodPressure}:</span>
                            <span className="font-medium text-gray-900">
                              {metric.blood_pressure_systolic}/{metric.blood_pressure_diastolic} mmHg
                            </span>
                          </div>
                        )}
                        {metric.heart_rate_bpm && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600">❤️ {t.heartRate}:</span>
                            <span className="font-medium text-gray-900">{metric.heart_rate_bpm} bpm</span>
                          </div>
                        )}
                        {metric.glucose_mg_dl && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600">{t.glucose}:</span>
                            <span className="font-medium text-gray-900">{metric.glucose_mg_dl} mg/dl</span>
                          </div>
                        )}
                        {metric.cholesterol_total_mg_dl && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600">{t.totalCholesterol}:</span>
                            <span className="font-medium text-gray-900">{metric.cholesterol_total_mg_dl} mg/dl</span>
                          </div>
                        )}
                        {metric.muscle_mass_kg && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600">{t.muscleMass}:</span>
                            <span className="font-medium text-gray-900">{metric.muscle_mass_kg} {t.kg}</span>
                          </div>
                        )}
                      </div>

                      {metric.notes && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          📝 {metric.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Link
                        href={`/dashboard/health-metrics/${metric.id}`}
                        className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title={t.edit}
                      >
                        ✏️
                      </Link>
                      <button
                        onClick={() => openDeleteModal(metric.id, 'healthMetric')}
                        className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-2 text-red-600 hover:bg-red-50 rounded"
                        title={t.delete}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-4">📊</p>
              <p className="text-lg font-medium mb-2">{t.noHealthMetrics || 'No hay métricas registradas'}</p>
              <p className="text-sm mb-6">{t.startLoggingMetrics || 'Comienza a registrar tus métricas de salud'}</p>
              <Link
                href="/dashboard/health-metrics/new"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                + {t.addMetric}
              </Link>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {metrics.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-600 mb-1">{t.totalMetrics || 'Total de Métricas'}</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-600 mb-1">{t.latestWeight || 'Último Peso'}</p>
              <p className="text-2xl font-bold text-blue-600">
                {metrics[0]?.weight_kg ? `${metrics[0].weight_kg} ${t.kg}` : '--'}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-600 mb-1">{t.weightChange || 'Cambio de Peso'}</p>
              <p className="text-2xl font-bold text-green-600">
                {(() => {
                  const firstWeight = metrics[0]?.weight_kg;
                  const lastWeight = metrics[metrics.length - 1]?.weight_kg;
                  if (metrics.length >= 2 && firstWeight != null && lastWeight != null) {
                    return `${(firstWeight - lastWeight).toFixed(1)} ${t.kg}`;
                  }
                  return '--';
                })()}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

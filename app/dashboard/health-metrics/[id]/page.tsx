'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardHeader from '@/components/DashboardHeader';
import HealthMetricForm from '@/components/HealthMetricForm';
import { useHealthMetric, useUpdateHealthMetric } from '@/hooks/useHealthMetrics';

export default function EditHealthMetricPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { t } = useLanguage();
  const { data: metric, isLoading, error: fetchError } = useHealthMetric(params.id);
  const updateMetric = useUpdateHealthMetric(params.id);
  const [saveError, setSaveError] = useState('');

  const handleSubmit = async (formData: any) => {
    setSaveError('');

    try {
      await updateMetric.mutateAsync({
        measuredAt: formData.measuredAt,
        weightKg: formData.weightKg ? parseFloat(formData.weightKg) : undefined,
        bodyFatPercentage: formData.bodyFatPercentage ? parseFloat(formData.bodyFatPercentage) : undefined,
        muscleMassKg: formData.muscleMassKg ? parseFloat(formData.muscleMassKg) : undefined,
        bloodPressureSystolic: formData.bloodPressureSystolic ? parseInt(formData.bloodPressureSystolic) : undefined,
        bloodPressureDiastolic: formData.bloodPressureDiastolic ? parseInt(formData.bloodPressureDiastolic) : undefined,
        heartRateBpm: formData.heartRateBpm ? parseInt(formData.heartRateBpm) : undefined,
        glucoseMgDl: formData.glucoseMgDl ? parseInt(formData.glucoseMgDl) : undefined,
        cholesterolTotalMgDl: formData.cholesterolTotalMgDl ? parseInt(formData.cholesterolTotalMgDl) : undefined,
        cholesterolHdlMgDl: formData.cholesterolHdlMgDl ? parseInt(formData.cholesterolHdlMgDl) : undefined,
        cholesterolLdlMgDl: formData.cholesterolLdlMgDl ? parseInt(formData.cholesterolLdlMgDl) : undefined,
        notes: formData.notes || undefined,
      });

      router.push('/dashboard/health');
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update metric');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader showBackButton backHref="/dashboard/health" />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">{t.loading}...</p>
          </div>
        </main>
      </div>
    );
  }

  if (fetchError || !metric) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader showBackButton backHref="/dashboard/health" />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center py-12">
            <p className="text-red-600">{t.failedToLoadMetric || 'Failed to load metric'}</p>
          </div>
        </main>
      </div>
    );
  }

  const initialData = {
    measuredAt: metric.measured_at?.slice(0, 16) || new Date().toISOString().slice(0, 16),
    weightKg: metric.weight_kg?.toString() || '',
    bodyFatPercentage: metric.body_fat_percentage?.toString() || '',
    muscleMassKg: metric.muscle_mass_kg?.toString() || '',
    bloodPressureSystolic: metric.blood_pressure_systolic?.toString() || '',
    bloodPressureDiastolic: metric.blood_pressure_diastolic?.toString() || '',
    heartRateBpm: metric.heart_rate_bpm?.toString() || '',
    glucoseMgDl: metric.glucose_mg_dl?.toString() || '',
    cholesterolTotalMgDl: metric.cholesterol_total_mg_dl?.toString() || '',
    cholesterolHdlMgDl: metric.cholesterol_hdl_mg_dl?.toString() || '',
    cholesterolLdlMgDl: metric.cholesterol_ldl_mg_dl?.toString() || '',
    notes: metric.notes || '',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader showBackButton backHref="/dashboard/health" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{t.editMetric}</h1>
          <p className="text-gray-600 mt-2">{t.updateMetricDetails}</p>
        </div>

        <HealthMetricForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/dashboard/health')}
          isSubmitting={updateMetric.isPending}
          submitLabel={t.updateMetric}
          error={saveError}
        />
      </main>
    </div>
  );
}

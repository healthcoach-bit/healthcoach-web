'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardHeader from '@/components/DashboardHeader';
import HealthMetricForm from '@/components/HealthMetricForm';
import { useCreateHealthMetric } from '@/hooks/useHealthMetrics';
import { localToUTC } from '@/lib/dateUtils';

export default function NewHealthMetricPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const createMetric = useCreateHealthMetric();
  const [saveError, setSaveError] = useState('');

  const handleSubmit = async (formData: any) => {
    setSaveError('');

    try {
      // ✅ NEW: Convert local datetime to UTC
      const measuredAtUTC = localToUTC(formData.measuredAt);
      
      await createMetric.mutateAsync({
        measuredAt: measuredAtUTC,
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
      setSaveError(err.message || 'Failed to save metric');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader showBackButton backHref="/dashboard/health" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{t.newMetric}</h1>
          <p className="text-gray-600 mt-2">{t.addNewMetric}</p>
        </div>

        <HealthMetricForm
          onSubmit={handleSubmit}
          onCancel={() => router.push('/dashboard/health')}
          isSubmitting={createMetric.isPending}
          submitLabel={t.saveMetric}
          error={saveError}
        />
      </main>
    </div>
  );
}

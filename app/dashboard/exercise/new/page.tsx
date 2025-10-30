'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardHeader from '@/components/DashboardHeader';
import ExerciseForm from '@/components/ExerciseForm';
import { useCreateExerciseLog } from '@/hooks/useExercise';

export default function NewExercisePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const createExercise = useCreateExerciseLog();
  const [saveError, setSaveError] = useState('');

  const handleSubmit = async (formData: any) => {
    setSaveError('');

    if (!formData.exerciseType || !formData.durationMinutes) {
      setSaveError('Please fill in exercise type and duration');
      return;
    }

    try {
      await createExercise.mutateAsync({
        exerciseType: formData.exerciseType,
        durationMinutes: parseInt(formData.durationMinutes),
        intensity: formData.intensity || undefined,
        caloriesBurned: formData.caloriesBurned ? parseInt(formData.caloriesBurned) : undefined,
        notes: formData.notes || undefined,
        performedAt: formData.performedAt,
      });

      router.push('/dashboard/health');
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save exercise');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader showBackButton backHref="/dashboard/health" />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{t.newExercise}</h1>
          <p className="text-gray-600 mt-2">{t.addExercise}</p>
        </div>

        <ExerciseForm
          onSubmit={handleSubmit}
          isSubmitting={createExercise.isPending}
          submitLabel={t.addExercise}
          error={saveError}
        />
      </main>
    </div>
  );
}

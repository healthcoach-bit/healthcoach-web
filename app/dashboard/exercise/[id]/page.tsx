'use client';

import { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardHeader from '@/components/DashboardHeader';
import ExerciseForm from '@/components/ExerciseForm';
import { useExerciseLog, useUpdateExerciseLog } from '@/hooks/useExercise';

export default function EditExercisePage() {
  const router = useRouter();
  const params = useParams();
  const exerciseId = params.id as string;
  const { t } = useLanguage();
  
  const { data: exercise, isLoading, error } = useExerciseLog(exerciseId);
  const updateExercise = useUpdateExerciseLog();
  const [saveError, setSaveError] = useState('');

  // Prepare initial data for form
  const initialData = useMemo(() => {
    if (!exercise) return undefined;

    // Extract time from performed_at string
    const timeMatch = exercise.performed_at?.match(/T(\d{2}:\d{2})/);
    const performedAt = timeMatch 
      ? exercise.performed_at.substring(0, 16) // YYYY-MM-DDTHH:mm
      : new Date().toISOString().slice(0, 16);

    return {
      exerciseType: exercise.exercise_type || '',
      durationMinutes: exercise.duration_minutes?.toString() || '',
      intensity: exercise.intensity || '',
      caloriesBurned: exercise.calories_burned?.toString() || '',
      notes: exercise.notes || '',
      performedAt,
    };
  }, [exercise]);

  const handleSubmit = async (formData: any) => {
    setSaveError('');

    if (!formData.exerciseType || !formData.durationMinutes) {
      setSaveError('Please fill in exercise type and duration');
      return;
    }

    try {
      // Format timestamp as display time with .000Z marker
      const performedAt = `${formData.performedAt}:00.000Z`;

      await updateExercise.mutateAsync({
        exerciseId,
        exerciseData: {
          exerciseType: formData.exerciseType,
          durationMinutes: parseInt(formData.durationMinutes),
          intensity: formData.intensity || undefined,
          caloriesBurned: formData.caloriesBurned ? parseInt(formData.caloriesBurned) : undefined,
          notes: formData.notes || undefined,
          performedAt,
        },
      });

      router.push('/dashboard/health');
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update exercise');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader showBackButton backHref="/dashboard/health" />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <p className="text-gray-600">{t.loading}...</p>
        </main>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader showBackButton backHref="/dashboard/health" />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">Failed to load exercise</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader showBackButton backHref="/dashboard/health" />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{t.editExercise}</h1>
          <p className="text-gray-600 mt-2">{t.updateExerciseDetails}</p>
        </div>

        <ExerciseForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isSubmitting={updateExercise.isPending}
          submitLabel={t.saveChanges}
          error={saveError}
        />
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardHeader from '@/components/DashboardHeader';
import FormInput from '@/components/FormInput';
import FormSelect from '@/components/FormSelect';
import FormTextarea from '@/components/FormTextarea';
import { useExerciseLog, useUpdateExerciseLog } from '@/hooks/useExercise';

export default function EditExercisePage() {
  const router = useRouter();
  const params = useParams();
  const exerciseId = params.id as string;
  const { t } = useLanguage();
  
  const { data: exercise, isLoading, error } = useExerciseLog(exerciseId);
  const updateExercise = useUpdateExerciseLog();

  const [formData, setFormData] = useState({
    exerciseType: '',
    durationMinutes: '',
    intensity: '',
    caloriesBurned: '',
    notes: '',
    performedAt: '',
  });

  const [saveError, setSaveError] = useState('');

  // Load exercise data into form
  useEffect(() => {
    if (exercise) {
      // Extract time from performed_at string
      const timeMatch = exercise.performed_at?.match(/T(\d{2}:\d{2})/);
      const performedAt = timeMatch 
        ? exercise.performed_at.substring(0, 16) // YYYY-MM-DDTHH:mm
        : new Date().toISOString().slice(0, 16);

      setFormData({
        exerciseType: exercise.exercise_type || '',
        durationMinutes: exercise.duration_minutes?.toString() || '',
        intensity: exercise.intensity || '',
        caloriesBurned: exercise.calories_burned?.toString() || '',
        notes: exercise.notes || '',
        performedAt,
      });
    }
  }, [exercise]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

        {saveError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{saveError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Exercise Info */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <FormInput
              label={t.measuredAt}
              type="datetime-local"
              value={formData.performedAt}
              onChange={(e) => setFormData({ ...formData, performedAt: e.target.value })}
              required
            />

            <FormSelect
              label={t.exerciseType}
              value={formData.exerciseType}
              onChange={(e) => setFormData({ ...formData, exerciseType: e.target.value })}
              required
            >
              <option value="">{t.select}</option>
              <option value="running">{t.running}</option>
              <option value="walking">{t.walking}</option>
              <option value="cycling">{t.cycling}</option>
              <option value="swimming">{t.swimming}</option>
              <option value="gym">{t.gym}</option>
              <option value="yoga">{t.yoga}</option>
              <option value="sports">{t.sports}</option>
              <option value="other">{t.otherExercise}</option>
            </FormSelect>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label={`${t.duration} (${t.minutes})`}
                type="number"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                placeholder="30"
                required
              />

              <FormSelect
                label={t.intensity}
                value={formData.intensity}
                onChange={(e) => setFormData({ ...formData, intensity: e.target.value })}
              >
                <option value="">{t.select}</option>
                <option value="low">{t.low}</option>
                <option value="moderate">{t.moderate}</option>
                <option value="high">{t.high}</option>
              </FormSelect>
            </div>

            <FormInput
              label={`${t.caloriesBurned} (${t.optional})`}
              type="number"
              value={formData.caloriesBurned}
              onChange={(e) => setFormData({ ...formData, caloriesBurned: e.target.value })}
              placeholder="250"
            />

            <FormTextarea
              label={t.notes}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t.addNotes}
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard/health')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={updateExercise.isPending}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {updateExercise.isPending ? t.saving : t.saveChanges}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

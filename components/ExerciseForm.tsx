'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import FormInput from '@/components/FormInput';
import FormSelect from '@/components/FormSelect';
import FormTextarea from '@/components/FormTextarea';
import { getLocalDateTimeString } from '@/lib/dateUtils';

interface ExerciseFormData {
  exerciseType: string;
  durationMinutes: string;
  intensity: string;
  caloriesBurned: string;
  notes: string;
  performedAt: string;
}

interface ExerciseFormProps {
  initialData?: Partial<ExerciseFormData>;
  onSubmit: (data: ExerciseFormData) => Promise<void>;
  isSubmitting: boolean;
  submitLabel: string;
  error?: string;
}

export default function ExerciseForm({ 
  initialData, 
  onSubmit, 
  isSubmitting, 
  submitLabel,
  error 
}: ExerciseFormProps) {
  const router = useRouter();
  const { t } = useLanguage();

  const [formData, setFormData] = useState<ExerciseFormData>({
    exerciseType: '',
    durationMinutes: '',
    intensity: '',
    caloriesBurned: '',
    notes: '',
    performedAt: getLocalDateTimeString(), // ✅ NEW: Use proper local datetime
    ...initialData,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
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
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            {isSubmitting ? t.saving : submitLabel}
          </button>
        </div>
      </form>
    </>
  );
}

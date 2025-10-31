'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import FormInput from '@/components/FormInput';
import FormTextarea from '@/components/FormTextarea';

interface HealthMetricFormData {
  measuredAt: string;
  weightKg: string;
  bodyFatPercentage: string;
  muscleMassKg: string;
  bloodPressureSystolic: string;
  bloodPressureDiastolic: string;
  heartRateBpm: string;
  glucoseMgDl: string;
  cholesterolTotalMgDl: string;
  cholesterolHdlMgDl: string;
  cholesterolLdlMgDl: string;
  notes: string;
}

interface HealthMetricFormProps {
  initialData?: Partial<HealthMetricFormData>;
  onSubmit: (data: HealthMetricFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel: string;
  error?: string;
}

export default function HealthMetricForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
  error,
}: HealthMetricFormProps) {
  const { t } = useLanguage();

  const [formData, setFormData] = useState<HealthMetricFormData>({
    measuredAt: new Date().toISOString().slice(0, 16),
    weightKg: '',
    bodyFatPercentage: '',
    muscleMassKg: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRateBpm: '',
    glucoseMgDl: '',
    cholesterolTotalMgDl: '',
    cholesterolHdlMgDl: '',
    cholesterolLdlMgDl: '',
    notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Measurement DateTime */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <FormInput
          label={t.measuredAt}
          type="datetime-local"
          value={formData.measuredAt}
          onChange={(e) => setFormData({ ...formData, measuredAt: e.target.value })}
          required
        />
      </div>

      {/* Body Measurements */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t.bodyMeasurements}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormInput
            label={`${t.weight} (${t.kg})`}
            type="number"
            step="0.1"
            value={formData.weightKg}
            onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
            placeholder="87.0"
          />
          <FormInput
            label={`${t.bodyFat} (%)`}
            type="number"
            step="0.1"
            value={formData.bodyFatPercentage}
            onChange={(e) => setFormData({ ...formData, bodyFatPercentage: e.target.value })}
            placeholder="22.5"
          />
          <FormInput
            label={`${t.muscleMass} (${t.kg})`}
            type="number"
            step="0.1"
            value={formData.muscleMassKg}
            onChange={(e) => setFormData({ ...formData, muscleMassKg: e.target.value })}
            placeholder="35.0"
          />
        </div>
      </div>

      {/* Vital Signs */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t.vitalSigns}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormInput
            label={`${t.bloodPressure} - ${t.systolic} (mmHg)`}
            type="number"
            value={formData.bloodPressureSystolic}
            onChange={(e) => setFormData({ ...formData, bloodPressureSystolic: e.target.value })}
            placeholder="120"
          />
          <FormInput
            label={`${t.bloodPressure} - ${t.diastolic} (mmHg)`}
            type="number"
            value={formData.bloodPressureDiastolic}
            onChange={(e) => setFormData({ ...formData, bloodPressureDiastolic: e.target.value })}
            placeholder="80"
          />
          <FormInput
            label={`${t.heartRate} (bpm)`}
            type="number"
            value={formData.heartRateBpm}
            onChange={(e) => setFormData({ ...formData, heartRateBpm: e.target.value })}
            placeholder="72"
          />
        </div>
      </div>

      {/* Blood Tests */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t.bloodTests}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label={`${t.glucose} (mg/dl)`}
            type="number"
            value={formData.glucoseMgDl}
            onChange={(e) => setFormData({ ...formData, glucoseMgDl: e.target.value })}
            placeholder="95"
          />
          <FormInput
            label={`${t.totalCholesterol} (mg/dl)`}
            type="number"
            value={formData.cholesterolTotalMgDl}
            onChange={(e) => setFormData({ ...formData, cholesterolTotalMgDl: e.target.value })}
            placeholder="180"
          />
          <FormInput
            label={`${t.hdl} (mg/dl)`}
            type="number"
            value={formData.cholesterolHdlMgDl}
            onChange={(e) => setFormData({ ...formData, cholesterolHdlMgDl: e.target.value })}
            placeholder="50"
          />
          <FormInput
            label={`${t.ldl} (mg/dl)`}
            type="number"
            value={formData.cholesterolLdlMgDl}
            onChange={(e) => setFormData({ ...formData, cholesterolLdlMgDl: e.target.value })}
            placeholder="110"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <FormTextarea
          label={t.notes}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder={t.addNotes}
          rows={4}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          {t.cancel}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting ? t.savingMetric : submitLabel}
        </button>
      </div>
    </form>
  );
}

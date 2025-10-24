'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardHeader from '@/components/DashboardHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorAlert from '@/components/ErrorAlert';
import { useHealthProfile, useSaveHealthProfile } from '@/hooks/useHealthProfile';

export default function HealthProfilePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { data: profile, isLoading, error } = useHealthProfile();
  const saveProfile = useSaveHealthProfile();

  const [formData, setFormData] = useState({
    dateOfBirth: '',
    gender: '',
    currentWeightKg: '',
    heightCm: '',
    targetWeightKg: '',
    medicalConditions: [] as string[],
    allergies: [] as string[],
    medications: [] as string[],
    familyHistory: {},
    activityLevel: '',
    smokingStatus: '',
    alcoholConsumption: '',
    healthGoals: [] as string[],
  });

  const [saveError, setSaveError] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await getCurrentUser();
    } catch (err) {
      router.push('/login');
    }
  };

  useEffect(() => {
    if (profile) {
      setFormData({
        dateOfBirth: profile.date_of_birth || '',
        gender: profile.gender || '',
        currentWeightKg: profile.current_weight_kg?.toString() || '',
        heightCm: profile.height_cm?.toString() || '',
        targetWeightKg: profile.target_weight_kg?.toString() || '',
        medicalConditions: profile.medical_conditions || [],
        allergies: profile.allergies || [],
        medications: profile.medications || [],
        familyHistory: profile.family_history || {},
        activityLevel: profile.activity_level || '',
        smokingStatus: profile.smoking_status || '',
        alcoholConsumption: profile.alcohol_consumption || '',
        healthGoals: profile.health_goals || [],
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');

    try {
      await saveProfile.mutateAsync({
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender || undefined,
        currentWeightKg: formData.currentWeightKg ? parseFloat(formData.currentWeightKg) : undefined,
        heightCm: formData.heightCm ? parseFloat(formData.heightCm) : undefined,
        targetWeightKg: formData.targetWeightKg ? parseFloat(formData.targetWeightKg) : undefined,
        medicalConditions: formData.medicalConditions.length > 0 ? formData.medicalConditions : undefined,
        allergies: formData.allergies.length > 0 ? formData.allergies : undefined,
        medications: formData.medications.length > 0 ? formData.medications : undefined,
        familyHistory: Object.keys(formData.familyHistory).length > 0 ? formData.familyHistory : undefined,
        activityLevel: formData.activityLevel || undefined,
        smokingStatus: formData.smokingStatus || undefined,
        alcoholConsumption: formData.alcoholConsumption || undefined,
        healthGoals: formData.healthGoals.length > 0 ? formData.healthGoals : undefined,
      });

      router.push('/dashboard/health');
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save profile');
    }
  };

  const addItem = (field: 'medicalConditions' | 'allergies' | 'medications', value: string) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData({
        ...formData,
        [field]: [...formData[field], value.trim()],
      });
    }
  };

  const removeItem = (field: 'medicalConditions' | 'allergies' | 'medications', value: string) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((item) => item !== value),
    });
  };

  const toggleGoal = (goal: string) => {
    setFormData({
      ...formData,
      healthGoals: formData.healthGoals.includes(goal)
        ? formData.healthGoals.filter((g) => g !== goal)
        : [...formData.healthGoals, goal],
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader showBackButton backHref="/dashboard" />
        <div className="flex justify-center items-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader showBackButton backHref="/dashboard/health" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{t.myHealthProfile}</h1>
          <p className="text-gray-600 mt-2">{t.basicInfo}</p>
        </div>

        {(error || saveError) && (
          <div className="mb-6">
            <ErrorAlert message={(error as Error)?.message || saveError} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t.basicInfo}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.dateOfBirth}
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.gender}</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">{t.select}</option>
                  <option value="male">{t.male}</option>
                  <option value="female">{t.female}</option>
                  <option value="other">{t.other}</option>
                  <option value="prefer_not_to_say">{t.preferNotToSay}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Measurements */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t.measurements}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.currentWeight} ({t.kg})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.currentWeightKg}
                  onChange={(e) => setFormData({ ...formData, currentWeightKg: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="70.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.height} ({t.cm})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.heightCm}
                  onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="170"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.targetWeight} ({t.kg})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.targetWeightKg}
                  onChange={(e) => setFormData({ ...formData, targetWeightKg: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="65.0"
                />
              </div>
            </div>
          </div>

          {/* Health Conditions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t.healthConditions}</h2>
            
            <div className="space-y-6">
              {/* Medical Conditions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.medicalConditions}
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem('medicalConditions', newCondition);
                        setNewCondition('');
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder={t.typeAndPressEnter}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addItem('medicalConditions', newCondition);
                      setNewCondition('');
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    {t.add}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.medicalConditions.map((condition) => (
                    <span
                      key={condition}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                    >
                      {condition}
                      <button
                        type="button"
                        onClick={() => removeItem('medicalConditions', condition)}
                        className="hover:text-red-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Similar sections for Allergies and Medications... */}
            </div>
          </div>

          {/* Lifestyle */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t.lifestyle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.activityLevel}
                </label>
                <select
                  value={formData.activityLevel}
                  onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">{t.select}</option>
                  <option value="sedentary">{t.sedentary}</option>
                  <option value="light">{t.lightActivity}</option>
                  <option value="moderate">{t.moderateActivity}</option>
                  <option value="active">{t.active}</option>
                  <option value="very_active">{t.veryActive}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.smokingStatus}
                </label>
                <select
                  value={formData.smokingStatus}
                  onChange={(e) => setFormData({ ...formData, smokingStatus: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">{t.select}</option>
                  <option value="never">{t.never}</option>
                  <option value="former">{t.former}</option>
                  <option value="current">{t.current}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.alcoholConsumption}
                </label>
                <select
                  value={formData.alcoholConsumption}
                  onChange={(e) => setFormData({ ...formData, alcoholConsumption: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">{t.select}</option>
                  <option value="none">{t.none}</option>
                  <option value="occasional">{t.occasional}</option>
                  <option value="moderate">{t.moderate}</option>
                  <option value="frequent">{t.frequent}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Health Goals */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t.healthGoals}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['lose_weight', 'build_muscle', 'improve_health', 'manage_condition'].map((goal) => (
                <label key={goal} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.healthGoals.includes(goal)}
                    onChange={() => toggleGoal(goal)}
                    className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <span className="text-gray-700">
                    {goal === 'lose_weight' && t.loseWeight}
                    {goal === 'build_muscle' && t.buildMuscle}
                    {goal === 'improve_health' && t.improveHealth}
                    {goal === 'manage_condition' && t.manageCondition}
                  </span>
                </label>
              ))}
            </div>
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
              disabled={saveProfile.isPending}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {saveProfile.isPending ? t.saving : t.saveProfile}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

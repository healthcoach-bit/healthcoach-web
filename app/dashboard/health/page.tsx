'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardHeader from '@/components/DashboardHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorAlert from '@/components/ErrorAlert';
import { useHealthProfile } from '@/hooks/useHealthProfile';
import { useHealthMetrics } from '@/hooks/useHealthMetrics';
import { formatDate } from '@/lib/dateUtils';

export default function HealthDashboardPage() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const { data: profile, isLoading: profileLoading, error: profileError } = useHealthProfile();
  const { data: metrics = [], isLoading: metricsLoading, error: metricsError } = useHealthMetrics('weight', 10);

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

  const calculateBMI = () => {
    if (!profile?.current_weight_kg || !profile?.height_cm) return null;
    const heightM = profile.height_cm / 100;
    return (profile.current_weight_kg / (heightM * heightM)).toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { text: 'Underweight', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (bmi < 25) return { text: 'Normal', color: 'text-green-600', bg: 'bg-green-100' };
    if (bmi < 30) return { text: 'Overweight', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { text: 'Obese', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getWeightProgress = () => {
    if (!profile?.current_weight_kg || !profile?.target_weight_kg) return null;
    const diff = profile.current_weight_kg - profile.target_weight_kg;
    const percentage = Math.abs((diff / profile.current_weight_kg) * 100);
    return { diff: diff.toFixed(1), percentage: percentage.toFixed(1) };
  };

  const getWeightTrend = () => {
    if (metrics.length < 2) return null;
    const latest = metrics[0].weight_kg || 0;
    const previous = metrics[1].weight_kg || 0;
    const change = latest - previous;
    return { change: change.toFixed(1), isDown: change < 0 };
  };

  const bmi = calculateBMI();
  const bmiInfo = bmi ? getBMICategory(parseFloat(bmi)) : null;
  const weightProgress = getWeightProgress();
  const weightTrend = getWeightTrend();

  if (profileLoading || metricsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader showBackButton backHref="/dashboard" />
        <div className="flex justify-center items-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader showBackButton backHref="/dashboard" />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.myHealthProfile}</h2>
            <p className="text-gray-600 mb-8">{t.createProfilePrompt}</p>
            <Link
              href="/dashboard/health-profile"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {t.editProfile}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader showBackButton backHref="/dashboard" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{t.healthProfile}</h1>
            <p className="text-gray-600 mt-2">{t.trackMetrics}</p>
          </div>
          <Link
            href="/dashboard/health-profile"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {t.editProfile}
          </Link>
        </div>

        {(profileError || metricsError) && (
          <div className="mb-6">
            <ErrorAlert message={(profileError || metricsError) as any} />
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Current Weight */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{t.currentWeight}</span>
              <span className="text-2xl">⚖️</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {profile.current_weight_kg || '--'}
              </span>
              <span className="text-gray-600">{t.kg}</span>
            </div>
            {weightTrend && (
              <div className={`mt-2 text-sm ${weightTrend.isDown ? 'text-green-600' : 'text-red-600'}`}>
                {weightTrend.isDown ? '↓' : '↑'} {Math.abs(parseFloat(weightTrend.change))} {t.kg}
              </div>
            )}
          </div>

          {/* BMI */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{t.bmi}</span>
              <span className="text-2xl">📊</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">{bmi || '--'}</span>
            </div>
            {bmiInfo && (
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${bmiInfo.bg} ${bmiInfo.color}`}>
                {bmiInfo.text}
              </span>
            )}
          </div>

          {/* Target Weight */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{t.targetWeight}</span>
              <span className="text-2xl">🎯</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {profile.target_weight_kg || '--'}
              </span>
              <span className="text-gray-600">{t.kg}</span>
            </div>
            {weightProgress && (
              <div className="mt-2 text-sm text-gray-600">
                {parseFloat(weightProgress.diff) > 0 ? '+' : ''}{weightProgress.diff} {t.kg}
              </div>
            )}
          </div>

          {/* Activity Level */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{t.activityLevel}</span>
              <span className="text-2xl">🏃</span>
            </div>
            <div className="text-lg font-semibold text-gray-900 capitalize">
              {profile.activity_level ? t[profile.activity_level as keyof typeof t] || profile.activity_level : '--'}
            </div>
          </div>
        </div>

        {/* Weight Progress Chart */}
        {metrics.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t.progress}</h2>
            <div className="space-y-4">
              {metrics.slice(0, 5).map((metric, index) => (
                <div key={metric.id} className="flex items-center gap-4">
                  <div className="w-32 text-sm text-gray-600">
                    {formatDate(metric.measured_at, locale)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(100, (metric.weight_kg! / (profile.target_weight_kg || 100)) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-16">
                        {metric.weight_kg} {t.kg}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Health Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Medical Conditions */}
          {profile.medical_conditions && profile.medical_conditions.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t.medicalConditions}</h3>
              <div className="flex flex-wrap gap-2">
                {profile.medical_conditions.map((condition) => (
                  <span key={condition} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                    {condition}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Allergies */}
          {profile.allergies && profile.allergies.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t.allergies}</h3>
              <div className="flex flex-wrap gap-2">
                {profile.allergies.map((allergy) => (
                  <span key={allergy} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Health Goals */}
          {profile.health_goals && profile.health_goals.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t.healthGoals}</h3>
              <ul className="space-y-2">
                {profile.health_goals.map((goal) => (
                  <li key={goal} className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-700 capitalize">
                      {goal === 'lose_weight' && t.loseWeight}
                      {goal === 'build_muscle' && t.buildMuscle}
                      {goal === 'improve_health' && t.improveHealth}
                      {goal === 'manage_condition' && t.manageCondition}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Lifestyle */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t.lifestyle}</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">{t.smokingStatus}:</span>
                <span className="ml-2 text-gray-900 capitalize">{profile.smoking_status || '--'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">{t.alcoholConsumption}:</span>
                <span className="ml-2 text-gray-900 capitalize">{profile.alcohol_consumption || '--'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Add Metric Button */}
        <div className="text-center">
          <Link
            href="/dashboard/health-metrics/new"
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-semibold"
          >
            + {t.addMetric}
          </Link>
        </div>
      </main>
    </div>
  );
}

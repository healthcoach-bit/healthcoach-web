'use client';

import { useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardHeader from '@/components/DashboardHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorAlert from '@/components/ErrorAlert';
import { useSuggestions, useUpdateSuggestion, useDeleteSuggestion } from '@/hooks/useSuggestions';

export default function SuggestionsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { data: suggestions = [], isLoading, error } = useSuggestions({ active: true });
  const updateSuggestion = useUpdateSuggestion();
  const deleteSuggestion = useDeleteSuggestion();

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

  const handleMarkAsRead = async (id: string) => {
    try {
      await updateSuggestion.mutateAsync({ id, updates: { isRead: true } });
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAsCompleted = async (id: string) => {
    try {
      await updateSuggestion.mutateAsync({ id, updates: { isCompleted: true } });
    } catch (err) {
      console.error('Failed to mark as completed:', err);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await updateSuggestion.mutateAsync({ id, updates: { dismissed: true } });
    } catch (err) {
      console.error('Failed to dismiss:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'high':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'low':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '🔴';
      case 'high':
        return '🟡';
      case 'medium':
        return '🟢';
      case 'low':
        return '🔵';
      default:
        return '⚪';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'nutrition':
        return '🥗';
      case 'exercise':
        return '🏃';
      case 'sleep':
        return '😴';
      case 'medical':
        return '⚕️';
      default:
        return '💡';
    }
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
      <DashboardHeader showBackButton backHref="/dashboard" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{t.personalizedSuggestions}</h1>
          <p className="text-gray-600 mt-2">{t.basedOnYourData}</p>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorAlert message={error as any} />
          </div>
        )}

        {/* Suggestions List */}
        {suggestions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 text-lg">{t.noSuggestions}</p>
            <p className="text-gray-500 text-sm mt-2">
              Keep tracking your health data to receive personalized suggestions
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion: any) => (
              <div
                key={suggestion.id}
                className={`border-2 rounded-lg p-6 ${getPriorityColor(suggestion.priority)}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{getCategoryIcon(suggestion.category)}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getPriorityIcon(suggestion.priority)}</span>
                        <h3 className="text-lg font-bold">{suggestion.title}</h3>
                      </div>
                      <p className="text-sm opacity-75 capitalize">
                        {t[suggestion.category as keyof typeof t] || suggestion.category} • 
                        {' '}{t[suggestion.priority + 'Priority' as keyof typeof t] || suggestion.priority}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDismiss(suggestion.id)}
                    className="text-gray-600 hover:text-gray-800"
                    title={t.dismiss}
                  >
                    ✕
                  </button>
                </div>

                {/* Description */}
                <p className="text-gray-800 mb-4">{suggestion.description}</p>

                {/* Action Items */}
                {suggestion.action_items && suggestion.action_items.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">{t.actionItems}:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {suggestion.action_items.map((item: string, index: number) => (
                        <li key={index} className="text-sm">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Reasoning */}
                {suggestion.reasoning && (
                  <div className="mb-4 p-3 bg-white bg-opacity-50 rounded">
                    <p className="text-sm italic">{suggestion.reasoning}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  {!suggestion.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(suggestion.id)}
                      disabled={updateSuggestion.isPending}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      {t.markAsRead}
                    </button>
                  )}
                  {!suggestion.is_completed && (
                    <button
                      onClick={() => handleMarkAsCompleted(suggestion.id)}
                      disabled={updateSuggestion.isPending}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      ✓ {t.markAsCompleted}
                    </button>
                  )}
                  {suggestion.is_completed && (
                    <span className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">
                      ✓ {t.markAsCompleted}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

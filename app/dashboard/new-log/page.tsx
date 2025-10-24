'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardHeader from '@/components/DashboardHeader';
import ErrorAlert from '@/components/ErrorAlert';
import FormInput from '@/components/FormInput';
import FormTextarea from '@/components/FormTextarea';
import { useCreateFoodLog } from '@/hooks/useFoodLogs';
import { usePhotoUpload } from '@/hooks/usePhotos';
import { useUIStore } from '@/store/ui-store';

// Helper function to get local datetime string for datetime-local input
const getLocalDateTimeString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function NewLogPage() {
  const router = useRouter();
  const { t } = useLanguage();

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
  
  const [mealType, setMealType] = useState('breakfast');
  const [notes, setNotes] = useState('');
  const [calories, setCalories] = useState('');
  const [timestamp, setTimestamp] = useState(getLocalDateTimeString());
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  
  // Zustand state for upload progress
  const uploadProgress = useUIStore((state) => state.uploadProgress);
  const setUploadProgress = useUIStore((state) => state.setUploadProgress);
  
  // React Query mutations
  const createFoodLog = useCreateFoodLog();
  const { uploadPhoto, isLoading: isUploadingPhoto } = usePhotoUpload();
  
  // Combined loading state
  const isLoading = createFoodLog.isPending || isUploadingPhoto;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError(t.invalidImage);
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError(t.imageTooLarge);
        return;
      }

      setPhoto(file);
      setError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUploadProgress(0);

    try {
      // Step 1: Create food log
      setUploadProgress(20);
      
      // Convert datetime-local to ISO string preserving the exact time the user selected
      // We need to ensure the time is treated as local time, not UTC
      const selectedDate = new Date(timestamp);
      const timezoneOffset = selectedDate.getTimezoneOffset() * 60000; // offset in milliseconds
      const localISOTime = new Date(selectedDate.getTime() - timezoneOffset).toISOString();
      
      const foodLogResponse = await createFoodLog.mutateAsync({
        mealType,
        notes: notes.trim() || undefined,
        totalCalories: calories ? parseInt(calories) : undefined,
        timestamp: localISOTime,
      });

      const foodLogId = foodLogResponse.foodLog.id;

      // Step 2: Upload photo if provided
      if (photo) {
        await uploadPhoto(photo, foodLogId, setUploadProgress);
      }

      setUploadProgress(100);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Error creating food log:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create food log');
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader showBackButton backHref="/dashboard" />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          {error && <ErrorAlert message={error} />}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Meal Type */}
            <div>
              <label htmlFor="mealType" className="block text-sm font-semibold text-gray-900 mb-3">
                {t.mealType}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMealType(type)}
                    className={`py-3 px-4 rounded-lg border-2 font-medium text-sm transition-all capitalize ${
                      mealType === type
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {type === 'breakfast' && '🍳'}
                    {type === 'lunch' && '🥗'}
                    {type === 'dinner' && '🍽️'}
                    {type === 'snack' && '🍎'}
                    <span className="ml-2">{t[type as keyof typeof t]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time */}
            <FormInput
              id="timestamp"
              type="datetime-local"
              label={t.dateTime}
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              required
            />

            {/* Calories */}
            <FormInput
              id="calories"
              type="number"
              label={`${t.calories} (${t.optional})`}
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="500"
              min="0"
              step="1"
            />

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                {t.photo} ({t.optional})
              </label>
              
              {!photoPreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    id="photo-upload"
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">{t.clickToUpload}</span>
                    <span className="text-xs text-gray-500 mt-1">{t.imageSize}</span>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    disabled={isLoading}
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Notes */}
            <FormTextarea
              id="notes"
              label={`${t.notes} (${t.optional})`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder={t.addNotes}
              disabled={isLoading}
              helperText={t.notesHelper}
            />

            {/* Upload Progress */}
            {isLoading && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{t.uploading}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Link
                href="/dashboard"
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors text-center"
              >
                {t.cancel}
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? t.creating : t.createFoodLog}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

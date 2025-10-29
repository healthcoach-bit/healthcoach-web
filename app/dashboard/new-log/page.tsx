'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardHeader from '@/components/DashboardHeader';
import ErrorAlert from '@/components/ErrorAlert';
import FormInput from '@/components/FormInput';
import FormTextarea from '@/components/FormTextarea';
import { useCreateFoodLog } from '@/hooks/useFoodLogs';
import { usePhotoUpload } from '@/hooks/usePhotos';
import { useUIStore } from '@/store/ui-store';
import { apiClient } from '@/lib/api';

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
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const isEditMode = !!editId;
  const { t } = useLanguage();

  const [loading, setLoading] = useState(isEditMode);
  const [mealType, setMealType] = useState('breakfast');
  const [notes, setNotes] = useState('');
  const [calories, setCalories] = useState('');
  const [timestamp, setTimestamp] = useState(getLocalDateTimeString());
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [existingPhotos, setExistingPhotos] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
    if (isEditMode && editId) {
      loadFoodLog(editId);
    }
  }, [editId]);

  const checkAuth = async () => {
    try {
      await getCurrentUser();
    } catch (err) {
      router.push('/login');
    }
  };

  const loadFoodLog = async (id: string) => {
    try {
      setLoading(true);
      const response = await apiClient.getFoodLog(id);
      const foodLog = response.foodLog || response.food_log;
      
      if (!foodLog) {
        setError('No se pudo cargar el registro');
        return;
      }
      
      setMealType(foodLog.meal_type);
      setNotes(foodLog.notes || '');
      setCalories(foodLog.total_calories?.toString() || '');
      setExistingPhotos(foodLog.photos || []);
      const date = new Date(foodLog.timestamp);
      setTimestamp(getLocalDateTimeString(date));
    } catch (err: any) {
      console.error('Error loading food log:', err);
      setError('Error al cargar el registro');
    } finally {
      setLoading(false);
    }
  };
  
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
      if (isEditMode && editId) {
        // UPDATE MODE
        setUploadProgress(30);
        await apiClient.updateFoodLog(editId, {
          mealType,
          notes: notes.trim() || undefined,
          totalCalories: calories ? parseInt(calories) : undefined,
        });

        // If user uploaded a new photo, replace the old ones
        if (photo) {
          setUploadProgress(50);
          // Delete existing photos first
          if (existingPhotos.length > 0) {
            await apiClient.deletePhotosByFoodLogId(editId);
          }
          // Upload new photo
          await uploadPhoto(photo, editId, setUploadProgress);
        }

        setUploadProgress(100);
      } else {
        // CREATE MODE
        setUploadProgress(20);
        const selectedDate = new Date(timestamp);
        
        const payload = {
          mealType,
          notes: notes.trim() || undefined,
          totalCalories: calories ? parseInt(calories) : undefined,
          timestamp: selectedDate.toISOString(),
        };
        
        const foodLogResponse = await createFoodLog.mutateAsync(payload);
        const foodLogId = foodLogResponse.foodLog.id;

        if (photo) {
          await uploadPhoto(photo, foodLogId, setUploadProgress);
        }

        setUploadProgress(100);
      }
      
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Error saving food log:', err);
      setError(err.response?.data?.message || err.message || 'Error al guardar');
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader showBackButton backHref="/dashboard" />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-green-600 border-r-transparent"></div>
              <p className="mt-2 text-gray-600">Cargando...</p>
            </div>
          )}
          {!loading && (
          <>
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

            {/* Date & Time - Only in CREATE mode */}
            {!isEditMode && (
              <FormInput
                id="timestamp"
                type="datetime-local"
                label={t.dateTime}
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                required
              />
            )}

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

            {/* Photos Section */}
            {isEditMode ? (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Foto ({t.optional})
                </label>
                
                {/* Show existing photos if any */}
                {existingPhotos.length > 0 && !photoPreview && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Foto actual:</p>
                    <div className="grid grid-cols-2 gap-4">
                      {existingPhotos.map((photo: any) => (
                        <div key={photo.id} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={photo.url || photo.path}
                            alt="Food"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="16" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImagen no disponible%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload new photo section */}
                {!photoPreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      id="photo-upload-edit"
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="photo-upload-edit"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">
                        {existingPhotos.length > 0 ? 'Cambiar foto' : 'Agregar foto'}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">{t.imageSize || 'PNG, JPG hasta 10MB'}</span>
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
            ) : (
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
            )}

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
                {isLoading ? (isEditMode ? 'Actualizando...' : t.creating) : (isEditMode ? 'Actualizar' : t.createFoodLog)}
              </button>
            </div>
          </form>
          </>
          )}
        </div>
      </main>
    </div>
  );
}

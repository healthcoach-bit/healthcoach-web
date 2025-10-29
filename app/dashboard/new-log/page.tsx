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
import { useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();

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
      const foodLog = response.foodLog || response.food_log || response;
      
      console.log('📦 Loaded food log for editing:', foodLog);
      console.log('🔍 Data types:', {
        meal_type: typeof foodLog.meal_type,
        notes: typeof foodLog.notes,
        total_calories: typeof foodLog.total_calories,
        total_calories_value: foodLog.total_calories
      });
      
      if (!foodLog || !foodLog.id) {
        setError('No se pudo cargar el registro');
        return;
      }
      
      setMealType(foodLog.meal_type);
      
      // Handle potentially corrupted notes (if notes === meal_type, it's corrupted)
      if (foodLog.notes && foodLog.notes === foodLog.meal_type) {
        console.warn('⚠️ Corrupted notes data detected:', foodLog.notes);
        setNotes('');
      } else {
        setNotes(foodLog.notes || '');
      }
      
      // Safely convert total_calories to string, handle corrupted data
      const caloriesValue = foodLog.total_calories;
      if (typeof caloriesValue === 'number') {
        setCalories(caloriesValue.toString());
      } else if (typeof caloriesValue === 'string' && !isNaN(Number(caloriesValue))) {
        setCalories(caloriesValue);
      } else {
        // Corrupted data - reset to empty
        console.warn('⚠️ Corrupted calories data detected:', caloriesValue);
        setCalories('');
      }
      
      setExistingPhotos(foodLog.photos || []);
      
      // Extract datetime directly from timestamp string WITHOUT timezone conversion
      // "2025-10-29T09:00:00.000Z" -> "2025-10-29T09:00"
      const timestampMatch = foodLog.timestamp.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
      if (timestampMatch) {
        setTimestamp(`${timestampMatch[1]}T${timestampMatch[2]}`);
      } else {
        // Fallback to current time if timestamp is invalid
        setTimestamp(getLocalDateTimeString());
      }
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

    // Validate data before submission
    if (calories && isNaN(parseInt(calories))) {
      setError('Las calorías deben ser un número válido');
      return;
    }

    const parsedCalories = calories ? parseInt(calories) : undefined;
    if (parsedCalories !== undefined && parsedCalories < 0) {
      setError('Las calorías no pueden ser negativas');
      return;
    }

    console.log('📤 Submitting food log:', {
      mealType,
      notes,
      calories,
      parsedCalories,
      isEditMode
    });

    try {
      if (isEditMode && editId) {
        // UPDATE MODE
        setUploadProgress(30);
        // Format timestamp to match Wallavi format: local time with .000Z
        // datetime-local input gives "2025-10-29T14:00"
        // We convert to "2025-10-29T14:00:00.000Z" (display time, not UTC)
        const formattedTimestamp = `${timestamp}:00.000Z`;
        
        await apiClient.updateFoodLog(editId, {
          mealType,
          notes: notes.trim() || undefined,
          totalCalories: parsedCalories,
          timestamp: formattedTimestamp,
        });

        // If user uploaded a new photo, replace the old ones
        if (photo) {
          setUploadProgress(50);
          // Delete existing photos first (CRITICAL: wait for completion)
          if (existingPhotos.length > 0) {
            console.log('🗑️ Deleting existing photos for food log:', editId);
            try {
              await apiClient.deletePhotosByFoodLogId(editId);
              console.log('✅ Photos deleted successfully');
              // Wait a bit to ensure delete is processed
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch (err) {
              console.error('❌ Failed to delete photos:', err);
              // Continue anyway to upload new photo
            }
          }
          // Upload new photo
          console.log('📤 Uploading new photo');
          await uploadPhoto(photo, editId, setUploadProgress);
        }

        setUploadProgress(100);
      } else {
        // CREATE MODE
        setUploadProgress(20);
        // Format timestamp to match Wallavi format: local time with .000Z
        // datetime-local input gives "2025-10-29T14:00"
        // We convert to "2025-10-29T14:00:00.000Z" (display time, not UTC)
        const formattedTimestamp = `${timestamp}:00.000Z`;
        
        const payload = {
          mealType,
          notes: notes.trim() || undefined,
          totalCalories: parsedCalories,
          timestamp: formattedTimestamp,
        };
        
        const foodLogResponse = await createFoodLog.mutateAsync(payload);
        const foodLogId = foodLogResponse.foodLog.id;

        if (photo) {
          await uploadPhoto(photo, foodLogId, setUploadProgress);
        }

        setUploadProgress(100);
      }
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['foodLogs'] });
      
      // Redirect after save
      if (isEditMode && editId) {
        router.push(`/dashboard/food-logs/${editId}`);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Error saving food log:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        config: err.config
      });
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Error al guardar el registro';
      setError(errorMessage);
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

            {/* Photos Section */}
            {isEditMode ? (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Foto ({t.optional})
                </label>
                
                {/* Show existing photos if any */}
                {existingPhotos.length > 0 && !photoPreview && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">
                        Foto actual {existingPhotos.length > 1 && (
                          <span className="text-orange-600 font-semibold">
                            ({existingPhotos.length} duplicadas)
                          </span>
                        )}
                      </p>
                      {existingPhotos.length > 1 && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (confirm('¿Limpiar todas las fotos duplicadas?')) {
                              try {
                                await apiClient.deletePhotosByFoodLogId(editId!);
                                setExistingPhotos([]);
                                alert('Fotos eliminadas. Puedes subir una nueva.');
                              } catch (err) {
                                alert('Error al eliminar fotos');
                              }
                            }
                          }}
                          className="text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          🗑️ Limpiar duplicadas
                        </button>
                      )}
                    </div>
                    <div className="max-w-md mx-auto">
                      {/* Show only the first photo */}
                      <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden" style={{ maxHeight: '400px' }}>
                        <img
                          src={existingPhotos[0].url || existingPhotos[0].path}
                          alt="Food"
                          className="w-full h-auto object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="16" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImagen no disponible%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </div>
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
                  <div className="relative max-w-md mx-auto">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-auto object-contain rounded-lg bg-gray-100"
                      style={{ maxHeight: '400px' }}
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

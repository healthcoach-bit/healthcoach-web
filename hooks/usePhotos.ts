import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { foodLogKeys } from './useFoodLogs';
import imageCompression from 'browser-image-compression';

// Query Keys
export const photoKeys = {
  all: ['photos'] as const,
  detail: (id: string) => [...photoKeys.all, id] as const,
};

/**
 * Compress and convert image to WebP format
 * - Max width: 1920px
 * - Quality: 0.8 (80%)
 * - Format: WebP
 */
async function compressAndConvertImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 2, // Maximum file size in MB
    maxWidthOrHeight: 1920, // Maximum width or height
    useWebWorker: true,
    fileType: 'image/webp', // Convert to WebP
    initialQuality: 0.8, // 80% quality
  };

  try {
    console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    const compressedFile = await imageCompression(file, options);
    console.log('Compressed file size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('Compression ratio:', ((1 - compressedFile.size / file.size) * 100).toFixed(1), '%');
    
    // Create a new File with .webp extension
    const webpFile = new File(
      [compressedFile],
      file.name.replace(/\.[^/.]+$/, '.webp'),
      { type: 'image/webp' }
    );
    
    return webpFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error('Failed to compress image');
  }
}

// Get photo
export function usePhoto(id: string) {
  return useQuery({
    queryKey: photoKeys.detail(id),
    queryFn: () => apiClient.getPhoto(id),
    enabled: !!id,
  });
}

// Get upload URL
export function useGetUploadUrl() {
  return useMutation({
    mutationFn: (data: {
      fileName: string;
      contentType: string;
      foodLogId?: string;
    }) => apiClient.getUploadUrl(data),
  });
}

// Upload to S3
export function useUploadToS3() {
  return useMutation({
    mutationFn: ({ presignedUrl, file }: { presignedUrl: string; file: File }) =>
      apiClient.uploadToS3(presignedUrl, file),
  });
}

// Confirm upload
export function useConfirmUpload() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      photoId: string;
      width: number;
      height: number;
    }) => apiClient.confirmUpload(data),
    onSuccess: () => {
      // Invalidate food logs to refresh with new photos
      queryClient.invalidateQueries({ queryKey: foodLogKeys.lists() });
    },
  });
}

// Composite hook for full photo upload flow
export function usePhotoUpload() {
  const getUploadUrl = useGetUploadUrl();
  const uploadToS3 = useUploadToS3();
  const confirmUpload = useConfirmUpload();
  
  const uploadPhoto = async (
    file: File,
    foodLogId?: string,
    onProgress?: (progress: number) => void
  ) => {
    try {
      // Step 1: Compress and convert to WebP
      onProgress?.(10);
      console.log('Compressing image...');
      const compressedFile = await compressAndConvertImage(file);
      
      // Step 2: Get presigned URL
      onProgress?.(30);
      const uploadUrlResponse = await getUploadUrl.mutateAsync({
        fileName: compressedFile.name,
        contentType: compressedFile.type, // image/webp
        foodLogId,
      });
      
      // Step 3: Upload to S3
      onProgress?.(60);
      await uploadToS3.mutateAsync({
        presignedUrl: uploadUrlResponse.uploadUrl,
        file: compressedFile,
      });
      
      // Step 4: Get image dimensions
      onProgress?.(85);
      const img = new Image();
      const imageUrl = URL.createObjectURL(compressedFile);
      img.src = imageUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      URL.revokeObjectURL(imageUrl);
      
      // Step 5: Confirm upload
      await confirmUpload.mutateAsync({
        photoId: uploadUrlResponse.photoId,
        width: img.width,
        height: img.height,
      });
      
      onProgress?.(100);
      
      return uploadUrlResponse.photoId;
    } catch (error) {
      onProgress?.(0);
      throw error;
    }
  };
  
  return {
    uploadPhoto,
    isLoading: getUploadUrl.isPending || uploadToS3.isPending || confirmUpload.isPending,
    error: getUploadUrl.error || uploadToS3.error || confirmUpload.error,
  };
}

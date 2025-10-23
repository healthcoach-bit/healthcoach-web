import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { foodLogKeys } from './useFoodLogs';

// Query Keys
export const photoKeys = {
  all: ['photos'] as const,
  detail: (id: string) => [...photoKeys.all, id] as const,
};

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
      // Step 1: Get presigned URL
      onProgress?.(20);
      const uploadUrlResponse = await getUploadUrl.mutateAsync({
        fileName: file.name,
        contentType: file.type,
        foodLogId,
      });
      
      // Step 2: Upload to S3
      onProgress?.(50);
      await uploadToS3.mutateAsync({
        presignedUrl: uploadUrlResponse.uploadUrl,
        file,
      });
      
      // Step 3: Get image dimensions
      onProgress?.(80);
      const img = new Image();
      const imageUrl = URL.createObjectURL(file);
      img.src = imageUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      URL.revokeObjectURL(imageUrl);
      
      // Step 4: Confirm upload
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

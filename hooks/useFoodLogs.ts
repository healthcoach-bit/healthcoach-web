import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

// Query Keys
export const foodLogKeys = {
  all: ['foodLogs'] as const,
  lists: () => [...foodLogKeys.all, 'list'] as const,
  list: (filters?: { from?: string; to?: string }) => 
    [...foodLogKeys.lists(), filters] as const,
  details: () => [...foodLogKeys.all, 'detail'] as const,
  detail: (id: string) => [...foodLogKeys.details(), id] as const,
};

// Get all food logs
export function useFoodLogs(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: foodLogKeys.list(params),
    queryFn: async () => {
      const response = await apiClient.getFoodLogs(params);
      return { foodLogs: response.foodLogs || response.food_logs || [] };
    },
    select: (data) => data.foodLogs,
    // Commented out for testing - reduce API calls
    refetchInterval: 8000, // Fast polling - check every 5 seconds
    refetchIntervalInBackground: false, // Only when tab is active
    refetchOnWindowFocus: true, // Instant refresh when returning to tab
    refetchOnReconnect: true, // Refresh when internet reconnects
  });
}

// Get single food log
export function useFoodLog(id: string) {
  return useQuery({
    queryKey: foodLogKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.getFoodLog(id);
      // Return the food log data directly
      return response.foodLog || response.food_log || response;
    },
    enabled: !!id,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

// Create food log
export function useCreateFoodLog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      mealType: string;
      notes?: string;
      totalCalories?: number;
      timestamp?: string;
    }) => apiClient.createFoodLog(data),
    onSuccess: () => {
      // Invalidate and refetch food logs list
      queryClient.invalidateQueries({ queryKey: foodLogKeys.lists() });
    },
  });
}

// Update food log
export function useUpdateFoodLog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: {
        mealType?: string;
        notes?: string;
        totalCalories?: number;
      }
    }) => apiClient.updateFoodLog(id, data),
    onSuccess: (_, variables) => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: foodLogKeys.lists() });
      queryClient.invalidateQueries({ queryKey: foodLogKeys.detail(variables.id) });
    },
  });
}

// Delete food log
export function useDeleteFoodLog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteFoodLog(id),
    onSuccess: () => {
      // Invalidate food logs list
      queryClient.invalidateQueries({ queryKey: foodLogKeys.lists() });
    },
  });
}

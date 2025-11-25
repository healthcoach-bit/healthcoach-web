import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useHealthProfile } from './useHealthProfile';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_URL;

interface HealthMetric {
  id: string;
  user_id: string;
  weight_kg?: number;
  body_fat_percentage?: number;
  muscle_mass_kg?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate_bpm?: number;
  glucose_mg_dl?: number;
  cholesterol_total_mg_dl?: number;
  cholesterol_hdl_mg_dl?: number;
  cholesterol_ldl_mg_dl?: number;
  notes?: string;
  measured_at: string;
  created_at: string;
}

interface CreateHealthMetricData {
  weightKg?: number;
  bodyFatPercentage?: number;
  muscleMassKg?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRateBpm?: number;
  glucoseMgDl?: number;
  cholesterolTotalMgDl?: number;
  cholesterolHdlMgDl?: number;
  cholesterolLdlMgDl?: number;
  notes?: string;
  measuredAt?: string;
}

async function getAuthToken(): Promise<string> {
  const session = await fetchAuthSession();
  return session.tokens?.idToken?.toString() || '';
}

async function fetchHealthMetrics(type?: string, limit = 30): Promise<HealthMetric[]> {
  const token = await getAuthToken();
  const params = new URLSearchParams({
    limit: limit.toString(),
    ...(type && { type }),
  });
  
  const response = await fetch(`${API_ENDPOINT}/health-metrics?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch health metrics');
  }

  const data = await response.json();
  return data.metrics;
}

async function createHealthMetric(metricData: CreateHealthMetricData): Promise<HealthMetric> {
  const token = await getAuthToken();
  const response = await fetch(`${API_ENDPOINT}/health-metrics`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(metricData),
  });

  if (!response.ok) {
    throw new Error('Failed to create health metric');
  }

  const data = await response.json();
  return data.metric;
}

async function fetchHealthMetric(id: string): Promise<HealthMetric> {
  const token = await getAuthToken();
  const response = await fetch(`${API_ENDPOINT}/health-metrics/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch health metric');
  }

  const data = await response.json();
  return data.metric;
}

async function updateHealthMetric(id: string, metricData: CreateHealthMetricData): Promise<HealthMetric> {
  const token = await getAuthToken();
  const response = await fetch(`${API_ENDPOINT}/health-metrics/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(metricData),
  });

  if (!response.ok) {
    throw new Error('Failed to update health metric');
  }

  const data = await response.json();
  return data.metric;
}

async function deleteHealthMetric(id: string): Promise<void> {
  const token = await getAuthToken();
  const response = await fetch(`${API_ENDPOINT}/health-metrics/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete health metric');
  }
}

async function updateProfileWeight(weightKg: number): Promise<void> {
  const token = await getAuthToken();
  const response = await fetch(`${API_ENDPOINT}/health-profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentWeightKg: weightKg }),
  });

  if (!response.ok) {
    console.error('Failed to update profile weight');
    // Don't throw error - we don't want to fail the metric creation/update if profile update fails
  }
}

export function useHealthMetrics(type?: string, limit?: number) {
  return useQuery({
    queryKey: ['healthMetrics', type, limit],
    queryFn: () => fetchHealthMetrics(type, limit),
    // Real-time updates via WebSocket (RealtimeProvider), no polling needed
    refetchOnWindowFocus: true, // Instant refresh when returning to tab
    refetchOnReconnect: true, // Refresh when internet reconnects
  });
}

export function useHealthMetric(id: string) {
  return useQuery({
    queryKey: ['healthMetric', id],
    queryFn: () => fetchHealthMetric(id),
    enabled: !!id,
  });
}

export function useCreateHealthMetric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createHealthMetric,
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['healthMetrics'] });
      
      // If weight was provided, update the profile weight too
      if (variables.weightKg !== undefined) {
        await updateProfileWeight(variables.weightKg);
        queryClient.invalidateQueries({ queryKey: ['healthProfile'] });
      }
    },
  });
}

export function useUpdateHealthMetric(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (metricData: CreateHealthMetricData) => updateHealthMetric(id, metricData),
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['healthMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['healthMetric', id] });
      
      // If weight was provided, update the profile weight too
      if (variables.weightKg !== undefined) {
        await updateProfileWeight(variables.weightKg);
        queryClient.invalidateQueries({ queryKey: ['healthProfile'] });
      }
    },
  });
}

export function useDeleteHealthMetric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteHealthMetric,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthMetrics'] });
    },
  });
}

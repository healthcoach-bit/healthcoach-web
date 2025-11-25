import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAuthSession } from 'aws-amplify/auth';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_URL;

interface ExerciseLog {
  id: string;
  user_id: string;
  exercise_type: string;
  duration_minutes: number;
  intensity?: string;
  calories_burned?: number;
  notes?: string;
  performed_at: string;
  created_at: string;
}

interface ExerciseData {
  exerciseType: string;
  durationMinutes: number;
  intensity?: string;
  caloriesBurned?: number;
  notes?: string;
  performedAt: string;
}

async function getAuthToken(): Promise<string> {
  const session = await fetchAuthSession();
  return session.tokens?.idToken?.toString() || '';
}

async function fetchExerciseLogs(limit: number = 30): Promise<ExerciseLog[]> {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_ENDPOINT}/exercise-logs?limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch exercise logs: ${response.status}`);
  }

  const data = await response.json();
  return data.exercises || [];
}

async function createExerciseLog(exerciseData: ExerciseData): Promise<ExerciseLog> {
  const token = await getAuthToken();
  const response = await fetch(`${API_ENDPOINT}/exercise-logs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(exerciseData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to create exercise log (${response.status})`);
  }

  const data = await response.json();
  return data.exercise;
}

async function fetchExerciseLog(exerciseId: string): Promise<ExerciseLog> {
  const token = await getAuthToken();
  const response = await fetch(`${API_ENDPOINT}/exercise-logs/${exerciseId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch exercise log');
  }

  const data = await response.json();
  return data.exercise;
}

async function updateExerciseLog(params: { exerciseId: string; exerciseData: Partial<ExerciseData> }): Promise<ExerciseLog> {
  const { exerciseId, exerciseData } = params;
  const token = await getAuthToken();
  const response = await fetch(`${API_ENDPOINT}/exercise-logs/${exerciseId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(exerciseData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to update exercise log (${response.status})`);
  }

  const data = await response.json();
  return data.exercise;
}

async function deleteExerciseLog(exerciseId: string): Promise<void> {
  const token = await getAuthToken();
  const response = await fetch(`${API_ENDPOINT}/exercise-logs/${exerciseId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete exercise log');
  }
}

export function useExerciseLogs(limit: number = 30) {
  return useQuery({
    queryKey: ['exerciseLogs', limit],
    queryFn: () => fetchExerciseLogs(limit),
    // Real-time updates via WebSocket (RealtimeProvider), no polling needed
    refetchOnWindowFocus: true, // Instant refresh when returning to tab
    refetchOnReconnect: true, // Refresh when internet reconnects
  });
}

export function useExerciseLog(exerciseId: string) {
  return useQuery({
    queryKey: ['exerciseLog', exerciseId],
    queryFn: () => fetchExerciseLog(exerciseId),
    enabled: !!exerciseId,
  });
}

export function useCreateExerciseLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExerciseLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exerciseLogs'] });
    },
  });
}

export function useUpdateExerciseLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateExerciseLog,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exerciseLogs'] });
      queryClient.invalidateQueries({ queryKey: ['exerciseLog', variables.exerciseId] });
    },
  });
}

export function useDeleteExerciseLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExerciseLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exerciseLogs'] });
    },
  });
}

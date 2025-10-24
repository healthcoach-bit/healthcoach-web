import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAuthSession } from 'aws-amplify/auth';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

interface HealthProfile {
  id: string;
  user_id: string;
  date_of_birth?: string;
  gender?: string;
  current_weight_kg?: number;
  height_cm?: number;
  target_weight_kg?: number;
  medical_conditions?: string[];
  allergies?: string[];
  medications?: string[];
  family_history?: Record<string, boolean>;
  activity_level?: string;
  smoking_status?: string;
  alcohol_consumption?: string;
  health_goals?: string[];
  created_at: string;
  updated_at: string;
}

interface HealthProfileData {
  dateOfBirth?: string;
  gender?: string;
  currentWeightKg?: number;
  heightCm?: number;
  targetWeightKg?: number;
  medicalConditions?: string[];
  allergies?: string[];
  medications?: string[];
  familyHistory?: Record<string, boolean>;
  activityLevel?: string;
  smokingStatus?: string;
  alcoholConsumption?: string;
  healthGoals?: string[];
}

async function getAuthToken(): Promise<string> {
  const session = await fetchAuthSession();
  return session.tokens?.idToken?.toString() || '';
}

async function fetchHealthProfile(): Promise<HealthProfile | null> {
  const token = await getAuthToken();
  const response = await fetch(`${API_ENDPOINT}/health-profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch health profile');
  }

  const data = await response.json();
  return data.profile;
}

async function createOrUpdateHealthProfile(
  profileData: HealthProfileData
): Promise<HealthProfile> {
  const token = await getAuthToken();
  const response = await fetch(`${API_ENDPOINT}/health-profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    throw new Error('Failed to save health profile');
  }

  const data = await response.json();
  return data.profile;
}

export function useHealthProfile() {
  return useQuery({
    queryKey: ['healthProfile'],
    queryFn: fetchHealthProfile,
  });
}

export function useSaveHealthProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrUpdateHealthProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthProfile'] });
    },
  });
}

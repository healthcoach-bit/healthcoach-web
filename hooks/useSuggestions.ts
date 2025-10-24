import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAuthSession } from 'aws-amplify/auth';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_URL;

interface HealthSuggestion {
  id: string;
  user_id: string;
  category: string;
  priority: string;
  title: string;
  description: string;
  action_items?: string[];
  based_on?: any;
  reasoning?: string;
  is_read: boolean;
  is_completed: boolean;
  dismissed: boolean;
  generated_by?: string;
  confidence_score?: number;
  created_at: string;
  expires_at?: string;
}

interface SuggestionFilters {
  category?: string;
  priority?: string;
  active?: boolean;
}

interface UpdateSuggestionData {
  isRead?: boolean;
  isCompleted?: boolean;
  dismissed?: boolean;
}

async function getAuthToken(): Promise<string> {
  const session = await fetchAuthSession();
  return session.tokens?.idToken?.toString() || '';
}

async function fetchSuggestions(filters?: SuggestionFilters): Promise<HealthSuggestion[]> {
  const token = await getAuthToken();
  
  const queryParams = new URLSearchParams();
  if (filters?.category) queryParams.append('category', filters.category);
  if (filters?.priority) queryParams.append('priority', filters.priority);
  if (filters?.active !== undefined) queryParams.append('active', String(filters.active));

  const url = `${API_ENDPOINT}/suggestions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch suggestions');
  }

  const data = await response.json();
  return data.suggestions || [];
}

async function updateSuggestion(suggestionId: string, updates: UpdateSuggestionData): Promise<HealthSuggestion> {
  const token = await getAuthToken();
  const response = await fetch(`${API_ENDPOINT}/suggestions/${suggestionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to update suggestion (${response.status})`);
  }

  const data = await response.json();
  return data.suggestion;
}

async function deleteSuggestion(suggestionId: string): Promise<void> {
  const token = await getAuthToken();
  const response = await fetch(`${API_ENDPOINT}/suggestions/${suggestionId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete suggestion');
  }
}

export function useSuggestions(filters?: SuggestionFilters) {
  return useQuery({
    queryKey: ['suggestions', filters],
    queryFn: () => fetchSuggestions(filters),
  });
}

export function useUpdateSuggestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateSuggestionData }) =>
      updateSuggestion(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
    },
  });
}

export function useDeleteSuggestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSuggestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
    },
  });
}

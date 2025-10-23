import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL && typeof window !== 'undefined') {
  console.warn('⚠️ NEXT_PUBLIC_API_URL is not configured. API calls will fail.');
  console.warn('Please add NEXT_PUBLIC_API_URL to your .env.local file');
}

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    // Not authenticated, continue without token
    console.log('No auth token available');
  }
  
  return config;
});

// API client methods
export const apiClient = {
  // Auth
  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Food Logs
  async getFoodLogs(params?: { from?: string; to?: string }) {
    const response = await api.get('/food-logs', { params });
    return response.data;
  },

  async getFoodLog(id: string) {
    const response = await api.get(`/food-logs/${id}`);
    return response.data;
  },

  async createFoodLog(data: {
    mealType: string;
    notes?: string;
    timestamp?: string;
  }) {
    const response = await api.post('/food-logs', data);
    return response.data;
  },

  async updateFoodLog(id: string, data: {
    mealType?: string;
    notes?: string;
    totalCalories?: number;
  }) {
    const response = await api.patch(`/food-logs/${id}`, data);
    return response.data;
  },

  async deleteFoodLog(id: string) {
    const response = await api.delete(`/food-logs/${id}`);
    return response.data;
  },

  // Photos
  async getUploadUrl(data: {
    fileName: string;
    contentType: string;
    foodLogId?: string;
  }) {
    const response = await api.post('/photos', data);
    return response.data;
  },

  async confirmUpload(data: {
    photoId: string;
    width: number;
    height: number;
  }) {
    const response = await api.post('/photos/confirm', data);
    return response.data;
  },

  async getPhoto(id: string) {
    const response = await api.get(`/photos/${id}`);
    return response.data;
  },

  // Upload file to S3 using presigned URL
  async uploadToS3(presignedUrl: string, file: File) {
    await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
    });
  },

  // Analysis
  async analyzeFood(foodLogId: string, analysis: any) {
    const response = await api.post(`/analyze/${foodLogId}`, { analysis });
    return response.data;
  },

  // Health check
  async healthCheck() {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;

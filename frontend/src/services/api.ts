import axios from 'axios';
import { Assignment, GeneratedPaper, ApiResponse, CreateAssignmentFormData } from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for Auth Token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Network error';
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/signup') {
        window.location.href = '/signup';
      }
    }
    return Promise.reject(new Error(message));
  }
);

// ─── Auth API ───────────────────────────────────────────────────────────────

export const authApi = {
  login: async (credentials: any) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  register: async (userData: any) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data.user;
  },
  updateMe: async (userData: any) => {
    const res = await api.put('/auth/me', userData);
    return res.data.user;
  },
};

// ─── Assignment API ─────────────────────────────────────────────────────────

export const assignmentApi = {
  getAll: async (): Promise<Assignment[]> => {
    const res = await api.get<ApiResponse<Assignment[]>>('/assignments');
    return res.data.data;
  },

  getById: async (id: string): Promise<Assignment> => {
    const res = await api.get<ApiResponse<Assignment>>(`/assignments/${id}`);
    return res.data.data;
  },

  create: async (formData: FormData): Promise<{ assignment: Assignment; jobId: string }> => {
    const res = await api.post<ApiResponse<{ assignment: Assignment; jobId: string }>>(
      '/assignments',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/assignments/${id}`);
  },

  regenerate: async (id: string): Promise<{ jobId: string }> => {
    const res = await api.post<ApiResponse<{ jobId: string }>>(`/assignments/${id}/regenerate`);
    return res.data.data;
  },

  getPaper: async (assignmentId: string): Promise<GeneratedPaper> => {
    const res = await api.get<ApiResponse<GeneratedPaper>>(`/assignments/${assignmentId}/paper`);
    return res.data.data;
  },
};

export default api;

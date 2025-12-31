import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - JWT 토큰 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - 401 에러 시 로그아웃
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
};

// Admin API
export const adminApi = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  getReports: async (status?: string, page = 0, size = 10) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', String(page));
    params.append('size', String(size));
    const response = await api.get(`/admin/reports?${params}`);
    return response.data;
  },
  getReport: async (id: number) => {
    const response = await api.get(`/admin/reports/${id}`);
    return response.data;
  },
  processReport: async (id: number, data: { action: 'RESOLVE' | 'REJECT'; adminNote?: string; deleteReview?: boolean }) => {
    const response = await api.post(`/admin/reports/${id}/process`, data);
    return response.data;
  },
  // 채팅 신고 API
  getChatReports: async (status?: string, page = 0, size = 10) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', String(page));
    params.append('size', String(size));
    const response = await api.get(`/admin/chat-reports?${params}`);
    return response.data;
  },
  getChatReport: async (id: number) => {
    const response = await api.get(`/admin/chat-reports/${id}`);
    return response.data;
  },
  processChatReport: async (id: number, data: { action: 'RESOLVE' | 'REJECT'; adminNote?: string }) => {
    const response = await api.post(`/admin/chat-reports/${id}/process`, data);
    return response.data;
  },
};

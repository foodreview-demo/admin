import { create } from 'zustand';
import type { User } from '../types';
import { authApi } from '../api/client';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      if (response.success) {
        localStorage.setItem('admin_token', response.data.token);

        // 사용자 정보 조회
        const userResponse = await authApi.getMe();
        if (userResponse.success && userResponse.data.role === 'ADMIN') {
          set({ user: userResponse.data, isAuthenticated: true });
          return true;
        } else {
          localStorage.removeItem('admin_token');
          return false;
        }
      }
      return false;
    } catch {
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const response = await authApi.getMe();
      if (response.success && response.data.role === 'ADMIN') {
        set({ user: response.data, isAuthenticated: true, isLoading: false });
      } else {
        localStorage.removeItem('admin_token');
        set({ isLoading: false, isAuthenticated: false });
      }
    } catch {
      localStorage.removeItem('admin_token');
      set({ isLoading: false, isAuthenticated: false });
    }
  },
}));

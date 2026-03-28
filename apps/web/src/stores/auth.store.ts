import { create } from 'zustand';
import { clearTokens, setTokens } from '@/lib/auth';

interface User {
  id: string;
  email: string;
  displayName: string | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;

  login: (data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  }) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  login: ({ user, accessToken, refreshToken }) => {
    setTokens(accessToken, refreshToken);
    set({ user, isLoading: false });
  },

  logout: () => {
    clearTokens();
    set({ user: null, isLoading: false });
  },

  setUser: (user) => {
    set({ user });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },
}));

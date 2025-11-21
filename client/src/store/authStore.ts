import { create } from 'zustand';
import api from '../lib/axios';

interface User {
    id: string;
    email: string;
    role: string;
    name?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: true,
    login: (token, user) => {
        localStorage.setItem('token', token);
        set({ token, user, isAuthenticated: true, isLoading: false });
    },
    logout: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
    },
    checkAuth: async () => {
        set({ isLoading: true });
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                set({ isLoading: false });
                return;
            }

            const response = await api.get('/auth/me');
            set({ user: response.data.user, isAuthenticated: true, isLoading: false });
        } catch (error) {
            localStorage.removeItem('token');
            set({ token: null, user: null, isAuthenticated: false, isLoading: false });
        }
    },
}));

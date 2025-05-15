
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, Role } from '../types';

interface AuthStore extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUserToken: () => Promise<void>;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setError: (error: string | null) => void;
  checkPermission: (requiredRole: Role) => boolean;
}

// Mock API for initial development
const mockLogin = async (username: string, password: string) => {
  return new Promise<{ user: User, token: string, refreshToken: string }>((resolve, reject) => {
    setTimeout(() => {
      if (username === 'admin' && password === 'admin123') {
        resolve({
          user: {
            id: '1',
            username: 'admin',
            email: 'admin@example.com',
            role: 'ADMIN',
            firstName: 'Admin',
            lastName: 'User'
          },
          token: 'mock-jwt-token',
          refreshToken: 'mock-refresh-token'
        });
      } else if (username === 'developer' && password === 'dev123') {
        resolve({
          user: {
            id: '2',
            username: 'developer',
            email: 'dev@example.com',
            role: 'DEVELOPER',
            firstName: 'Dev',
            lastName: 'User'
          },
          token: 'mock-jwt-token',
          refreshToken: 'mock-refresh-token'
        });
      } else if (username === 'viewer' && password === 'view123') {
        resolve({
          user: {
            id: '3',
            username: 'viewer',
            email: 'viewer@example.com',
            role: 'VIEWER',
            firstName: 'View',
            lastName: 'User'
          },
          token: 'mock-jwt-token',
          refreshToken: 'mock-refresh-token'
        });
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 800);
  });
};

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
      loading: false,
      error: null,

      login: async (username: string, password: string) => {
        set({ loading: true, error: null });
        try {
          const { user, token, refreshToken } = await mockLogin(username, password);
          set({
            isAuthenticated: true,
            user,
            token,
            refreshToken,
            loading: false
          });
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.message || 'Authentication failed',
            isAuthenticated: false,
            user: null,
            token: null,
            refreshToken: null
          });
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          refreshToken: null,
          error: null
        });
      },

      refreshUserToken: async () => {
        // In a real app, this would make an API call using the refresh token
        set({ loading: true });
        try {
          const refreshToken = get().refreshToken;
          if (!refreshToken) throw new Error('No refresh token available');
          
          // Mock refreshing token
          await new Promise(resolve => setTimeout(resolve, 500));
          set({
            token: 'new-mock-token',
            loading: false
          });
        } catch (error: any) {
          set({
            loading: false,
            error: error.message || 'Failed to refresh token',
            isAuthenticated: false,
            user: null,
            token: null,
            refreshToken: null
          });
        }
      },

      setUser: (user: User) => {
        set({ user });
      },

      setToken: (token: string) => {
        set({ token });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      checkPermission: (requiredRole: Role) => {
        const { user } = get();
        if (!user) return false;
        
        // Role hierarchy: ADMIN > DEVELOPER > VIEWER
        switch (requiredRole) {
          case 'VIEWER':
            return ['VIEWER', 'DEVELOPER', 'ADMIN'].includes(user.role);
          case 'DEVELOPER':
            return ['DEVELOPER', 'ADMIN'].includes(user.role);
          case 'ADMIN':
            return user.role === 'ADMIN';
          default:
            return false;
        }
      }
    }),
    {
      name: 'osb-ci-auth-storage',
      skipHydration: true, // Safer for JWT tokens
    }
  )
);

export default useAuthStore;


import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import { API_CONFIG, createApiUrl } from '@/config/api.config';
import { Role } from '@/types';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  role?: string;
  avatarUrl?: string;
  permissions?: string[];
}

export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export const PERMISSIONS = {
  // User permissions
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_EDIT: 'user:edit',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  
  // Role permissions
  ROLE_VIEW: 'role:view',
  ROLE_CREATE: 'role:create',
  ROLE_EDIT: 'role:edit',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',
  
  // Permission management
  PERMISSION_VIEW: 'permission:view',
  PERMISSION_ASSIGN: 'permission:assign',
  
  // Project permissions
  PROJECT_VIEW: 'project:view',
  PROJECT_CREATE: 'project:create',
  PROJECT_EDIT: 'project:edit',
  PROJECT_DELETE: 'project:delete',
  
  // Environment permissions
  ENV_VIEW: 'environment:view',
  ENV_CREATE: 'environment:create',
  ENV_EDIT: 'environment:edit',
  ENV_DELETE: 'environment:delete',
  
  // Deployment permissions
  DEPLOY_VIEW: 'deployment:view',
  DEPLOY_CREATE: 'deployment:create',
  DEPLOY_EXECUTE: 'deployment:execute',
  
  // Settings permissions
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',
};

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshTokens: () => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
  checkPermission: (requiredRole: Role) => boolean;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(createApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
          }

          const data = await response.json();
          
          // Extract data directly from the response
          const { token, refreshToken, user } = data;
          
          if (!token || typeof token !== 'string') {
            throw new Error('Invalid token received from server');
          }

          // No need to decode JWT - user data is provided directly
          set({
            token,
            refreshToken,
            user,
            isAuthenticated: true,
            loading: false,
          });
          return true;
        } catch (error) {
          console.error("Login error:", error);
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          return false;
        }
      },

      logout: () => {
        // Call logout endpoint if needed
        if (get().token) {
          fetch(createApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGOUT), {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${get().token}`,
            },
            body: JSON.stringify({ refreshToken: get().refreshToken }),
          }).catch(console.error); // Fire and forget
        }

        set({
          token: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        });
      },

      refreshTokens: async () => {
        const currentRefreshToken = get().refreshToken;
        if (!currentRefreshToken) return false;

        set({ loading: true });
        try {
          const response = await fetch(createApiUrl(API_CONFIG.ENDPOINTS.AUTH.REFRESH), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken: currentRefreshToken }),
          });

          if (!response.ok) {
            throw new Error('Token refresh failed');
          }

          const data = await response.json();
          const { token, refreshToken, user } = data;

          set({
            token,
            refreshToken,
            user,
            isAuthenticated: true,
            loading: false,
          });
          return true;
        } catch (error) {
          set({
            token: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
            loading: false,
          });
          return false;
        }
      },

      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user || !user.permissions) return false;
        return user.permissions.includes(permission);
      },

      hasAnyPermission: (permissions: string[]) => {
        const { user } = get();
        if (!user || !user.permissions) return false;
        return permissions.some(permission => user.permissions!.includes(permission));
      },

      hasRole: (role: string) => {
        const { user } = get();
        if (!user || !user.role) return false;
        return user.role === role;
      },
      
      checkPermission: (requiredRole: Role) => {
        const { user } = get();
        if (!user || !user.role) return false;
        
        const roles: Record<string, number> = {
          ADMIN: 3,
          DEVELOPER: 2,
          MANAGER: 1,
          VIEWER: 0
        };
        
        const userRoleLevel = roles[user.role] ?? -1;
        const requiredRoleLevel = roles[requiredRole] ?? -1;
        
        return userRoleLevel >= requiredRoleLevel;
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;

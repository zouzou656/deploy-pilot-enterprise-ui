
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
  checkPermission: (requiredRole: Role | string) => boolean;
  hasPermission: (permission: string) => boolean;
}

// Mock available permissions
const PERMISSIONS = {
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',
  ROLE_VIEW: 'role:view',
  ROLE_CREATE: 'role:create',
  ROLE_EDIT: 'role:edit',
  ROLE_DELETE: 'role:delete',
};

// Map roles to permissions - in a real app this would come from the API
const ROLE_PERMISSIONS = {
  ADMIN: [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.ROLE_VIEW,
    PERMISSIONS.ROLE_CREATE,
    PERMISSIONS.ROLE_EDIT,
    PERMISSIONS.ROLE_DELETE,
  ],
  DEVELOPER: [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.ROLE_VIEW,
  ],
  VIEWER: [
    PERMISSIONS.USER_VIEW,
  ],
};

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
            lastName: 'User',
            permissions: ROLE_PERMISSIONS.ADMIN,
            roleId: 'role-admin-001'
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
            lastName: 'User',
            permissions: ROLE_PERMISSIONS.DEVELOPER,
            roleId: 'role-dev-001'
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
            lastName: 'User',
            permissions: ROLE_PERMISSIONS.VIEWER,
            roleId: 'role-viewer-001'
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
      permissions: [],

      login: async (username: string, password: string) => {
        set({ loading: true, error: null });
        try {
          const { user, token, refreshToken } = await mockLogin(username, password);
          set({
            isAuthenticated: true,
            user,
            token,
            refreshToken,
            loading: false,
            permissions: user.permissions
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
          error: null,
          permissions: []
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

      checkPermission: (requiredRole: Role | string) => {
        const { user } = get();
        if (!user) return false;
        
        // If checking for a permission string directly
        if (typeof requiredRole === 'string' && !['ADMIN', 'DEVELOPER', 'VIEWER'].includes(requiredRole)) {
          return get().hasPermission(requiredRole);
        }
        
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
      },
      
      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user || !user.permissions) return false;
        
        return user.permissions.includes(permission);
      }
    }),
    {
      name: 'osb-ci-auth-storage',
      skipHydration: true, // Safer for JWT tokens
    }
  )
);

export default useAuthStore;
export { PERMISSIONS };

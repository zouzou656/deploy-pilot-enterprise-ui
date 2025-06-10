import { create } from "zustand";
import { AuthState, User, Role } from "@/types/index";
import { apiClient } from "@/services/api.client";
import { API_CONFIG } from "@/config/api.config";
import { toast } from "sonner";

// Permissions constants
export const PERMISSIONS = {
  // User management
  USER_VIEW: "user:view",
  USER_CREATE: "user:create",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",

  // Role management
  ROLE_VIEW: "role:view",
  ROLE_CREATE: "role:create",
  ROLE_UPDATE: "role:update",
  ROLE_DELETE: "role:delete",

  // Project management
  PROJECT_VIEW: "project:view",
  PROJECT_CREATE: "project:create",
  PROJECT_UPDATE: "project:update",
  PROJECT_DELETE: "project:delete",

  // Environment management
  ENV_VIEW: "environment:view",
  ENV_CREATE: "environment:create",
  ENV_UPDATE: "environment:update",
  ENV_DELETE: "environment:delete",

  // Deployment management
  DEPLOY_VIEW: "deployment:view",
  DEPLOY_CREATE: "deployment:create",
  DEPLOY_UPDATE: "deployment:update",
  DEPLOY_DELETE: "deployment:delete",
};

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  refreshToken: string;
  logout: () => void;
  checkPermission: (requiredRole: Role) => boolean;
  hasPermission: (permission: string) => boolean;
}

// Load initial state from localStorage
const loadInitialState = (): Partial<AuthState> => {
  try {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      return {
        isAuthenticated: true,
        token,
        user: JSON.parse(user),
        refreshToken: localStorage.getItem("refreshToken"),
      };
    }
  } catch (error) {
    console.error("Failed to load auth state from localStorage:", error);
  }

  return {
    isAuthenticated: false,
    user: null,
    token: null,
    refreshToken: null,
  };
};

const initialState = {
  ...loadInitialState(),
  loading: false,
  error: null,
};

const useAuthStore = create<AuthStore>((set, get) => ({
  ...(initialState as AuthState),

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });

    try {
      // Use our API client to make the login request
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        { email, password },
        { requiresAuth: false }
      );

      if (response.error || !response.data) {
        throw new Error(response.error || "Login failed");
      }

      const { user, token, refreshToken } = response.data;

      // Store in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      set({
        isAuthenticated: true,
        user,
        token,
        refreshToken,
        loading: false,
        error: null,
      });

      toast.success("Login successful");
    } catch (error) {
      set({
        isAuthenticated: false,
        user: null,
        token: null,
        refreshToken: null,
        loading: false,
        error: error instanceof Error ? error.message : "Login failed",
      });

      toast.error(error instanceof Error ? error.message : "Login failed");
    }
  },

  refreshToken: async () => {
    const currentRefreshToken = get().refreshToken;

    if (!currentRefreshToken) {
      return false;
    }

    try {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.AUTH.REFRESH,
        { refreshToken: currentRefreshToken },
        { requiresAuth: false }
      );

      if (response.error || !response.data) {
        throw new Error(response.error || "Token refresh failed");
      }

      const { user, token, refreshToken } = response.data;

      // Update localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      set({
        isAuthenticated: true,
        user,
        token,
        refreshToken,
        error: null,
      });

      return true;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      // Don't logout here, let the caller decide what to do
      return false;
    }
  },

  logout: () => {
    const currentRefreshToken = get().refreshToken;

    // Attempt to call logout API if we have a refresh token
    if (currentRefreshToken) {
      apiClient
        .post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
          refreshToken: currentRefreshToken,
        })
        .catch((error) => {
          console.error("Error during logout:", error);
        });
    }

    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // Reset state
    set({
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
      loading: false,
      error: null,
    });

    toast.info("Logged out successfully");
  },

  checkPermission: (requiredRole: Role) => {
    const { user } = get();
    if (!user) return false;

    // Admin has access to everything
    if (user.role === "ADMIN") return true;
  },

  hasPermission: (permission: string) => {
    const { user } = get();
    if (!user) return false;

    // Admin has all permissions
    if (user.role === "ADMIN") return true;

    // Check specific permission
    return user.permissions?.includes(permission) || false;
  },
}));

export default useAuthStore;

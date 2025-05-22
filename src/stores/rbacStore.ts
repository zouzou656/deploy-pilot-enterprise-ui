// src/stores/rbacStore.ts
import { create } from 'zustand';
import { apiClient } from '@/services/api.client';
import { createApiUrl, API_CONFIG } from '@/config/api.config';
import {
  Permission,
  Role,
  UserDetails,
  UserListItem,
  CreateUserDto,
  UpdateUserDto,
  CreateRoleDto,
  UpdateRoleDto
} from '@/types/rbac';

interface RBACState {
  users: UserListItem[];
  roles: Role[];
  permissions: Permission[];
  isLoading: boolean;
  error: string | null;
}

interface RBACActions {
  fetchUsers: () => Promise<void>;
  fetchUser: (id: string) => Promise<UserDetails>;
  createUser: (userData: CreateUserDto) => Promise<UserDetails>;
  updateUser: (id: string, userData: UpdateUserDto) => Promise<UserDetails>;
  deleteUser: (id: string) => Promise<void>;

  fetchRoles: () => Promise<void>;
  fetchRole: (id: string) => Promise<Role>;
  createRole: (roleData: CreateRoleDto) => Promise<Role>;
  updateRole: (id: string, roleData: UpdateRoleDto) => Promise<Role>;
  deleteRole: (id: string) => Promise<void>;

  fetchPermissions: () => Promise<void>;
}

const useRBACStore = create<RBACState & RBACActions>((set, get) => ({
  users: [],
  roles: [],
  permissions: [],
  isLoading: false,
  error: null,

  // -------- Users --------
  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apiClient.get<UserListItem[]>(
          API_CONFIG.ENDPOINTS.USERS.LIST
      );
      console.log(data);
      set({ users: data, isLoading: false });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message ?? 'Failed to fetch users'
      });
      throw err;
    }
  },

  fetchUser: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const url = createApiUrl(API_CONFIG.ENDPOINTS.USERS.GET, { id });
      const { data } = await apiClient.get<UserDetails>(url);
      set({ isLoading: false });
      return data;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message ?? `Failed to fetch user ${id}`
      });
      throw err;
    }
  },

  createUser: async (userData: CreateUserDto) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apiClient.post<UserDetails>(
          API_CONFIG.ENDPOINTS.USERS.CREATE,
          userData
      );
      set(state => ({
        users: [...state.users, data],
        isLoading: false
      }));
      return data;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message ?? 'Failed to create user'
      });
      throw err;
    }
  },

  updateUser: async (id: string, userData: UpdateUserDto) => {
    set({ isLoading: true, error: null });
    try {
      const url = createApiUrl(API_CONFIG.ENDPOINTS.USERS.UPDATE, { id });
      const { data } = await apiClient.put<UserDetails>(url, userData);
      set(state => ({
        users: state.users.map(u => (u.id === id ? data : u)),
        isLoading: false
      }));
      return data;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message ?? `Failed to update user ${id}`
      });
      throw err;
    }
  },

  deleteUser: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const url = createApiUrl(API_CONFIG.ENDPOINTS.USERS.DELETE, { id });
      await apiClient.delete(url);
      set(state => ({
        users: state.users.filter(u => u.id !== id),
        isLoading: false
      }));
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message ?? `Failed to delete user ${id}`
      });
      throw err;
    }
  },

  // -------- Roles --------
  fetchRoles: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apiClient.get<Role[]>(
          API_CONFIG.ENDPOINTS.ROLES.LIST
      );
      set({ roles: data, isLoading: false });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message ?? 'Failed to fetch roles'
      });
      throw err;
    }
  },

  fetchRole: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const url = createApiUrl(API_CONFIG.ENDPOINTS.ROLES.GET, { id });
      const { data } = await apiClient.get<Role>(url);
      set({ isLoading: false });
      return data;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message ?? `Failed to fetch role ${id}`
      });
      throw err;
    }
  },

  createRole: async (roleData: CreateRoleDto) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apiClient.post<Role>(
          API_CONFIG.ENDPOINTS.ROLES.CREATE,
          roleData
      );
      set(state => ({
        roles: [...state.roles, data],
        isLoading: false
      }));
      return data;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message ?? 'Failed to create role'
      });
      throw err;
    }
  },

  updateRole: async (id: string, roleData: UpdateRoleDto) => {
    set({ isLoading: true, error: null });
    try {
      const url = createApiUrl(API_CONFIG.ENDPOINTS.ROLES.UPDATE, { id });
      const { data } = await apiClient.put<Role>(url, roleData);
      set(state => ({
        roles: state.roles.map(r => (r.id === id ? data : r)),
        isLoading: false
      }));
      return data;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message ?? `Failed to update role ${id}`
      });
      throw err;
    }
  },

  deleteRole: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const url = createApiUrl(API_CONFIG.ENDPOINTS.ROLES.DELETE, { id });
      await apiClient.delete(url);
      set(state => ({
        roles: state.roles.filter(r => r.id !== id),
        isLoading: false
      }));
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message ?? `Failed to delete role ${id}`
      });
      throw err;
    }
  },

  // -------- Permissions --------
  fetchPermissions: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apiClient.get<Permission[]>(
          API_CONFIG.ENDPOINTS.PERMISSIONS.LIST
      );
      set({ permissions: data, isLoading: false });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message ?? 'Failed to fetch permissions'
      });
      throw err;
    }
  }
}));

export default useRBACStore;

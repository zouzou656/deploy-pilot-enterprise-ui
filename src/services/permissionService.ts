import { apiClient } from '@/services/api.client';
import { API_CONFIG, createApiUrl } from '@/config/api.config';
import { 
  Permission, 
  CreatePermissionDto, 
  UpdatePermissionDto 
} from '@/types/rbac';

export const permissionService = {
  async getPermissions(): Promise<Permission[]> {
    const { data, error } = await apiClient.get<Permission[]>(
      API_CONFIG.ENDPOINTS.PERMISSIONS.LIST
    );
    if (error) throw new Error(error);
    return data ?? [];
  },

  async getPermission(id: string): Promise<Permission> {
    const url = createApiUrl(API_CONFIG.ENDPOINTS.PERMISSIONS.GET, { id });
    const { data, error } = await apiClient.get<Permission>(url);
    if (error) throw new Error(error);
    return data!;
  },

  async createPermission(payload: CreatePermissionDto): Promise<Permission> {
    const { data, error } = await apiClient.post<Permission>(
      API_CONFIG.ENDPOINTS.PERMISSIONS.CREATE,
      payload
    );
    if (error) throw new Error(error);
    return data!;
  },

  async updatePermission(id: string, payload: UpdatePermissionDto): Promise<Permission> {
    const url = createApiUrl(API_CONFIG.ENDPOINTS.PERMISSIONS.UPDATE, { id });
    const { data, error } = await apiClient.put<Permission>(url, payload);
    if (error) throw new Error(error);
    return data!;
  },

  async deletePermission(id: string): Promise<void> {
    const url = createApiUrl(API_CONFIG.ENDPOINTS.PERMISSIONS.DELETE, { id });
    const { error } = await apiClient.delete(url);
    if (error) throw new Error(error);
  },

  async getPermissionsByRole(roleId: string): Promise<Permission[]> {
    const url = createApiUrl(API_CONFIG.ENDPOINTS.PERMISSIONS.GET_BY_ROLE, { roleId });
    const { data, error } = await apiClient.get<Permission[]>(url);
    if (error) throw new Error(error);
    return data ?? [];
  },

  async assignPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    const url = createApiUrl(API_CONFIG.ENDPOINTS.PERMISSIONS.ASSIGN_TO_ROLE, { roleId, permId: permissionId });
    const { error } = await apiClient.post(url, {});
    if (error) throw new Error(error);
  },

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    const url = createApiUrl(API_CONFIG.ENDPOINTS.PERMISSIONS.REMOVE_FROM_ROLE, { roleId, permId: permissionId });
    const { error } = await apiClient.delete(url);
    if (error) throw new Error(error);
  },

  async getPermissionsByUser(userId: string): Promise<Permission[]> {
    const url = createApiUrl(API_CONFIG.ENDPOINTS.PERMISSIONS.GET_BY_USER, { userId });
    const { data, error } = await apiClient.get<Permission[]>(url);
    if (error) throw new Error(error);
    return data ?? [];
  },

  async assignPermissionToUser(userId: string, permissionId: string): Promise<void> {
    const url = createApiUrl(API_CONFIG.ENDPOINTS.PERMISSIONS.ASSIGN_TO_USER, { userId, permId: permissionId });
    const { error } = await apiClient.post(url, {});
    if (error) throw new Error(error);
  },

  async removePermissionFromUser(userId: string, permissionId: string): Promise<void> {
    const url = createApiUrl(API_CONFIG.ENDPOINTS.PERMISSIONS.REMOVE_FROM_USER, { userId, permId: permissionId });
    const { error } = await apiClient.delete(url);
    if (error) throw new Error(error);
  }
};

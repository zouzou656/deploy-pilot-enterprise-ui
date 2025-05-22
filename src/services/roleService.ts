// src/services/roleService.ts
import { apiClient } from '@/services/api.client';
import { API_CONFIG, createApiUrl } from '@/config/api.config';
import { Role, CreateRoleDto, UpdateRoleDto } from '@/types/rbac';

export const roleService = {
  /** Fetch all roles */
  async getRoles(): Promise<Role[]> {
    const { data, error, status } = await apiClient.get<Role[]>(
        API_CONFIG.ENDPOINTS.ROLES.LIST
    );
    if (error) throw new Error(error);
    return data ?? [];
  },

  /** Fetch a single role by ID */
  async getRole(id: string): Promise<Role> {
    const { data, error } = await apiClient.get<Role>(API_CONFIG.ENDPOINTS.ROLES.GET, {params :{id}});
    if (error) throw new Error(error);
    return data!;
  },

  /** Create a new role */
  async createRole(payload: CreateRoleDto): Promise<Role> {
    const { data, error } = await apiClient.post<Role>(
        API_CONFIG.ENDPOINTS.ROLES.CREATE,
        payload
    );
    if (error) throw new Error(error);
    return data!;
  },

  /** Update an existing role */
  async updateRole(id: string, payload: UpdateRoleDto): Promise<Role> {
    const { data, error } = await apiClient.put<Role>(API_CONFIG.ENDPOINTS.ROLES.UPDATE, payload,{params: { id }});
    if (error) throw new Error(error);
    return data!;
  },

  /** Delete a role */
  async deleteRole(id: string): Promise<void> {
    const { status, error } = await apiClient.delete<void>(API_CONFIG.ENDPOINTS.ROLES.DELETE,{params : {id}});
    if (status < 200 || status >= 300) {
      throw new Error(error ?? `Delete failed with status ${status}`);
    }
  },
};

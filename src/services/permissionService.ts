// src/services/permissionService.ts
import { apiClient } from '@/services/api.client';
import { API_CONFIG } from '@/config/api.config';
import {
    Permission,
    CreatePermissionDto,
    UpdatePermissionDto
} from '@/types/rbac';

export const permissionService = {
    /** Fetch all permissions */
    async getPermissions(): Promise<Permission[]> {
        const { data, error } = await apiClient.get<Permission[]>(
            API_CONFIG.ENDPOINTS.PERMISSIONS.LIST
        );
        if (error) throw new Error(error);
        return data ?? [];
    },

    /** Fetch a single permission by ID */
    async getPermission(id: string): Promise<Permission> {
        const { data, error } = await apiClient.get<Permission>(
            API_CONFIG.ENDPOINTS.PERMISSIONS.GET,
            { params: { id } }
        );
        if (error) throw new Error(error);
        return data!;
    },

    /** Create a new permission */
    async createPermission(payload: CreatePermissionDto): Promise<Permission> {
        const { data, error } = await apiClient.post<Permission>(
            API_CONFIG.ENDPOINTS.PERMISSIONS.CREATE,
            payload
        );
        if (error) throw new Error(error);
        return data!;
    },

    /** Update an existing permission */
    async updatePermission(
        id: string,
        payload: UpdatePermissionDto
    ): Promise<Permission> {
        const { data, error } = await apiClient.put<Permission>(
            API_CONFIG.ENDPOINTS.PERMISSIONS.UPDATE,
            payload,
            { params: { id } }
        );
        if (error) throw new Error(error);
        return data!;
    },

    /** Delete a permission */
    async deletePermission(id: string): Promise<void> {
        const { status, error } = await apiClient.delete<void>(
            API_CONFIG.ENDPOINTS.PERMISSIONS.DELETE,
            { params: { id } }
        );
        if (status < 200 || status >= 300) {
            throw new Error(error ?? `Delete failed with status ${status}`);
        }
    },

    /** Fetch all permissions assigned to a specific role */
    async getPermissionsForRole(roleId: string): Promise<Permission[]> {
        const { data, error } = await apiClient.get<Permission[]>(
            API_CONFIG.ENDPOINTS.ROLES.ROLE_PERMISSIONS,
            { params: { roleId } }
        );
        if (error) throw new Error(error);
        return data ?? [];
    }
};

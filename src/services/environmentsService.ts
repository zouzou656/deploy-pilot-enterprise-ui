// src/services/environments.service.ts
import { apiClient } from '@/services/api.client';
import { API_CONFIG } from '@/config/api.config';
import { ProjectEnvironment } from '@/types/project';

export const environmentsService = {
    /** GET /api/environments?projectId=:projectId */
    async getEnvironments(projectId: string): Promise<ProjectEnvironment[]> {
        const { data, error } = await apiClient.get<ProjectEnvironment[]>(
            API_CONFIG.ENDPOINTS.ENVIRONMENTS.LIST,
            { params: { projectId } }
        );
        if (error) throw new Error(error);
        return data ?? [];
    },

    /** POST /api/environments */
    async createEnvironment(
        payload: Omit<ProjectEnvironment, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<ProjectEnvironment> {
        const { data, error } = await apiClient.post<ProjectEnvironment>(
            API_CONFIG.ENDPOINTS.ENVIRONMENTS.CREATE,
            payload
        );
        if (error) throw new Error(error);
        return data!;
    },

    /** PUT /api/environments/:id */
    async updateEnvironment(
        id: string,
        payload: Partial<ProjectEnvironment>
    ): Promise<ProjectEnvironment> {
        const { data, error } = await apiClient.put<ProjectEnvironment>(
            API_CONFIG.ENDPOINTS.ENVIRONMENTS.UPDATE,
            payload,
            { params: { id } }
        );
        if (error) throw new Error(error);
        return data!;
    },

    /** DELETE /api/environments/:id */
    async deleteEnvironment(id: string): Promise<void> {
        const { status, error } = await apiClient.delete<void>(
            API_CONFIG.ENDPOINTS.ENVIRONMENTS.DELETE,
            { params: { id } }
        );
        if (status < 200 || status >= 300) throw new Error(error || `Delete failed: ${status}`);
    }
};

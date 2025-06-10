// src/services/fileOverridesService.ts
import { apiClient } from '@/services/api.client';
import { API_CONFIG } from '@/config/api.config';
import { FileOverride } from '@/types/project';

export const fileOverridesService = {
    async getFileOverrides(environmentId: string): Promise<FileOverride[]> {
        const url = API_CONFIG.ENDPOINTS.OVERRIDES.LIST.replace(
            ':environmentId',
            environmentId
        );
        const { data, error } = await apiClient.get<FileOverride[]>(url);
        if (error) throw new Error(error);
        return data ?? [];
    },

    async createFileOverride(
        payload: Omit<FileOverride, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<FileOverride> {
        // POST /api/environments/:environmentId/file-overrides
        const url = API_CONFIG.ENDPOINTS.OVERRIDES.CREATE.replace(
            ':environmentId',
            payload.environmentId
        );
        const { data, error } = await apiClient.post<FileOverride>(url, payload);
        if (error) throw new Error(error);
        return data!;
    },

    async updateFileOverride(
        id: string,
        payload: Partial<FileOverride>
    ): Promise<FileOverride> {
        // PUT /api/environments/:environmentId/file-overrides/:id
        // (or if your back end accepts /api/overrides/:id, adjust accordingly)
        const url = API_CONFIG.ENDPOINTS.OVERRIDES.UPDATE.replace(':id', id);
        const { data, error } = await apiClient.put<FileOverride>(url, payload);
        if (error) throw new Error(error);
        return data!;
    },

    async deleteFileOverride(id: string): Promise<void> {
        const url = API_CONFIG.ENDPOINTS.OVERRIDES.DELETE.replace(':id', id);
        const { status, error } = await apiClient.delete<void>(url);
        if (status < 200 || status >= 300)
            throw new Error(error || `Delete failed: ${status}`);
    }
};

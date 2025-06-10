import { apiClient } from '@/services/api.client';
import { API_CONFIG } from '@/config/api.config';
import { Project } from '@/types/project';

export const projectService = {
    getUserProjects: async (userId: string): Promise<Project[]> => {
        const { data, error } = await apiClient.get<Project[]>(
            API_CONFIG.ENDPOINTS.PROJECTS.USER_PROJECTS,
            { params: { userId } }
        );
        if (error) throw new Error(error);
        return data ?? [];
    },

    getAllProjects: async (): Promise<Project[]> => {
        const { data, error } = await apiClient.get<Project[]>(
            API_CONFIG.ENDPOINTS.PROJECTS.LIST
        );
        if (error) throw new Error(error);
        return data ?? [];
    },

    createProject: async (payload: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> => {
        const { data, error } = await apiClient.post<Project>(
            API_CONFIG.ENDPOINTS.PROJECTS.CREATE,
            payload
        );
        if (error) throw new Error(error);
        return data!;
    },

    updateProject: async (id: string, payload: Partial<Project>): Promise<Project> => {
        const { data, error } = await apiClient.put<Project>(
            API_CONFIG.ENDPOINTS.PROJECTS.UPDATE,
            payload,
            { params: { id } }
        );
        if (error) throw new Error(error);
        return data!;
    },

    deleteProject: async (id: string): Promise<void> => {
        const { status, error } = await apiClient.delete<void>(
            API_CONFIG.ENDPOINTS.PROJECTS.DELETE,
            { params: { id } }
        );
        if (status < 200 || status >= 300) throw new Error(error || `Delete failed: ${status}`);
    }
};

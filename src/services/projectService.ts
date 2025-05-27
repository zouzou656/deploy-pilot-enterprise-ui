import { apiClient } from '@/services/api.client';
import { API_CONFIG } from '@/config/api.config';
import { Project } from '@/types/project';

export const projectService = {
    /** Fetch all projects for the current user */
    async getProjects(userId:string): Promise<Project[]> {
        const { data, error } = await apiClient.get<Project[]>(
            API_CONFIG.ENDPOINTS.PROJECTS.USER_PROJECTS,
            {params: { userId }}
        );
        if (error) throw new Error(error);
        return data ?? [];
    }
};

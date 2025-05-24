
import { apiClient } from '@/services/api.client';
import { API_CONFIG, createApiUrl } from '@/config/api.config';
import { Project, CreateProjectDto, UpdateProjectDto } from '@/types/project';

export const projectService = {
  async getProjects(): Promise<Project[]> {
    const { data, error } = await apiClient.get<Project[]>(
      API_CONFIG.ENDPOINTS.PROJECTS.LIST
    );
    if (error) throw new Error(error);
    return data ?? [];
  },

  async getUserProjects(userId: string): Promise<Project[]> {
    const url = createApiUrl(API_CONFIG.ENDPOINTS.PROJECTS.USER_PROJECTS, { userId });
    const { data, error } = await apiClient.get<Project[]>(url);
    if (error) throw new Error(error);
    return data ?? [];
  },

  async getProject(id: string): Promise<Project> {
    const url = createApiUrl(API_CONFIG.ENDPOINTS.PROJECTS.GET, { id });
    const { data, error } = await apiClient.get<Project>(url);
    if (error) throw new Error(error);
    return data!;
  },

  async createProject(payload: CreateProjectDto): Promise<Project> {
    const { data, error } = await apiClient.post<Project>(
      API_CONFIG.ENDPOINTS.PROJECTS.CREATE,
      payload
    );
    if (error) throw new Error(error);
    return data!;
  },

  async updateProject(id: string, payload: UpdateProjectDto): Promise<Project> {
    const url = createApiUrl(API_CONFIG.ENDPOINTS.PROJECTS.UPDATE, { id });
    const { data, error } = await apiClient.put<Project>(url, payload);
    if (error) throw new Error(error);
    return data!;
  },

  async deleteProject(id: string): Promise<void> {
    const url = createApiUrl(API_CONFIG.ENDPOINTS.PROJECTS.DELETE, { id });
    const { error } = await apiClient.delete(url);
    if (error) throw new Error(error);
  },

  async assignUserToProject(projectId: string, userId: string): Promise<void> {
    const url = createApiUrl(API_CONFIG.ENDPOINTS.PROJECTS.ASSIGN_USER, { projectId, userId });
    const { error } = await apiClient.post(url);
    if (error) throw new Error(error);
  },

  async removeUserFromProject(projectId: string, userId: string): Promise<void> {
    const url = createApiUrl(API_CONFIG.ENDPOINTS.PROJECTS.REMOVE_USER, { projectId, userId });
    const { error } = await apiClient.delete(url);
    if (error) throw new Error(error);
  }
};

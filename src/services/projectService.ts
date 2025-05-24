
import { apiClient } from '@/services/api.client';
import { Project, CreateProjectDto, UpdateProjectDto } from '@/types/project';

export const projectService = {
  async getProjects(): Promise<Project[]> {
    const { data, error } = await apiClient.get<Project[]>('/api/projects');
    if (error) throw new Error(error);
    return data ?? [];
  },

  async getUserProjects(userId: string): Promise<Project[]> {
    const { data, error } = await apiClient.get<Project[]>(`/api/projects/user/${userId}`);
    if (error) throw new Error(error);
    return data ?? [];
  },

  async getProject(id: string): Promise<Project> {
    const { data, error } = await apiClient.get<Project>(`/api/projects/${id}`);
    if (error) throw new Error(error);
    return data!;
  },

  async createProject(payload: CreateProjectDto): Promise<Project> {
    const { data, error } = await apiClient.post<Project>('/api/projects', payload);
    if (error) throw new Error(error);
    return data!;
  },

  async updateProject(id: string, payload: UpdateProjectDto): Promise<Project> {
    const { data, error } = await apiClient.put<Project>(`/api/projects/${id}`, payload);
    if (error) throw new Error(error);
    return data!;
  },

  async deleteProject(id: string): Promise<void> {
    const { error } = await apiClient.delete(`/api/projects/${id}`);
    if (error) throw new Error(error);
  },

  async assignUserToProject(projectId: string, userId: string): Promise<void> {
    const { error } = await apiClient.post(`/api/projects/${projectId}/users/${userId}`);
    if (error) throw new Error(error);
  },

  async removeUserFromProject(projectId: string, userId: string): Promise<void> {
    const { error } = await apiClient.delete(`/api/projects/${projectId}/users/${userId}`);
    if (error) throw new Error(error);
  }
};

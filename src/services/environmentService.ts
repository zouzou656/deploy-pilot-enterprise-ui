import { apiClient } from '@/services/api.client';
import { 
  Environment, 
  CreateEnvironmentDto, 
  UpdateEnvironmentDto 
} from '@/types/project';

export const environmentService = {
  async getEnvironments(): Promise<Environment[]> {
    const { data, error } = await apiClient.get<Environment[]>('/api/environments');
    if (error) throw new Error(error);
    return data ?? [];
  },

  async getEnvironment(id: string): Promise<Environment> {
    const { data, error } = await apiClient.get<Environment>(`/api/environments/${id}`);
    if (error) throw new Error(error);
    return data!;
  },

  async getEnvironmentsByProject(projectId: string): Promise<Environment[]> {
    const { data, error } = await apiClient.get<Environment[]>(`/api/projects/${projectId}/environments`);
    if (error) throw new Error(error);
    return data ?? [];
  },

  async getEnvironmentsByUser(userId: string): Promise<Environment[]> {
    const { data, error } = await apiClient.get<Environment[]>(`/api/environments/user/${userId}`);
    if (error) throw new Error(error);
    return data ?? [];
  },

  async createEnvironment(payload: CreateEnvironmentDto): Promise<Environment> {
    const { data, error } = await apiClient.post<Environment>('/api/environments', payload);
    if (error) throw new Error(error);
    return data!;
  },

  async updateEnvironment(id: string, payload: UpdateEnvironmentDto): Promise<Environment> {
    const { data, error } = await apiClient.put<Environment>(`/api/environments/${id}`, payload);
    if (error) throw new Error(error);
    return data!;
  },

  async deleteEnvironment(id: string): Promise<void> {
    const { error } = await apiClient.delete(`/api/environments/${id}`);
    if (error) throw new Error(error);
  },

  async assignUserToEnvironment(environmentId: string, userId: string): Promise<void> {
    const { error } = await apiClient.post(`/api/environments/${environmentId}/users/${userId}`, {});
    if (error) throw new Error(error);
  },

  async removeUserFromEnvironment(environmentId: string, userId: string): Promise<void> {
    const { error } = await apiClient.delete(`/api/environments/${environmentId}/users/${userId}`);
    if (error) throw new Error(error);
  },

  async getEnvironments(projectId: string): Promise<Environment[]> {
    const response = await apiClient.get(`/environments/project/${projectId}`);
    return response.data;
  }
};

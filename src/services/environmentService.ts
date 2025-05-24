
import { apiClient } from '@/services/api.client';
import { API_CONFIG, createApiUrl } from '@/config/api.config';
import { 
  Environment, 
  CreateEnvironmentDto, 
  UpdateEnvironmentDto 
} from '@/types/project';

export const environmentService = {
  async getEnvironments(): Promise<Environment[]> {
    const { data, error } = await apiClient.get<Environment[]>(
      API_CONFIG.ENDPOINTS.ENVIRONMENTS.LIST
    );
    if (error) throw new Error(error);
    return data ?? [];
  },

  async getEnvironment(id: string): Promise<Environment> {
    const url = createApiUrl(API_CONFIG.ENDPOINTS.ENVIRONMENTS.GET, { id });
    const { data, error } = await apiClient.get<Environment>(url);
    if (error) throw new Error(error);
    return data!;
  },

  async getEnvironmentsByProject(projectId: string): Promise<Environment[]> {
    const url = createApiUrl(API_CONFIG.ENDPOINTS.ENVIRONMENTS.BY_PROJECT, { projectId });
    const { data, error } = await apiClient.get<Environment[]>(url);
    if (error) throw new Error(error);
    return data ?? [];
  },

  async getEnvironmentsByUser(userId: string): Promise<Environment[]> {
    const url = createApiUrl(API_CONFIG.ENDPOINTS.ENVIRONMENTS.BY_USER, { userId });
    const { data, error } = await apiClient.get<Environment[]>(url);
    if (error) throw new Error(error);
    return data ?? [];
  },

  async createEnvironment(payload: CreateEnvironmentDto): Promise<Environment> {
    const { data, error } = await apiClient.post<Environment>(
      API_CONFIG.ENDPOINTS.ENVIRONMENTS.CREATE,
      payload
    );
    if (error) throw new Error(error);
    return data!;
  },

  async updateEnvironment(id: string, payload: UpdateEnvironmentDto): Promise<Environment> {
    const url = createApiUrl(API_CONFIG.ENDPOINTS.ENVIRONMENTS.UPDATE, { id });
    const { data, error } = await apiClient.put<Environment>(url, payload);
    if (error) throw new Error(error);
    return data!;
  },

  async deleteEnvironment(id: string): Promise<void> {
    const url = createApiUrl(API_CONFIG.ENDPOINTS.ENVIRONMENTS.DELETE, { id });
    const { error } = await apiClient.delete(url);
    if (error) throw new Error(error);
  },

  async assignUserToEnvironment(environmentId: string, userId: string): Promise<void> {
    const url = createApiUrl(API_CONFIG.ENDPOINTS.ENVIRONMENTS.ASSIGN_USER, { environmentId, userId });
    const { error } = await apiClient.post(url);
    if (error) throw new Error(error);
  },

  async removeUserFromEnvironment(environmentId: string, userId: string): Promise<void> {
    const url = createApiUrl(API_CONFIG.ENDPOINTS.ENVIRONMENTS.REMOVE_USER, { environmentId, userId });
    const { error } = await apiClient.delete(url);
    if (error) throw new Error(error);
  }
};

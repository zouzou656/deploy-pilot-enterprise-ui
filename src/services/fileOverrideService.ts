
import { apiClient } from '@/services/api.client';
import { API_CONFIG, createApiUrl } from '@/config/api.config';
import { 
  FileOverride, 
  CreateFileOverrideDto, 
  UpdateFileOverrideDto 
} from '@/types/project';

export const fileOverrideService = {
  async getFileOverridesByEnvironment(environmentId: string): Promise<FileOverride[]> {
    const url = createApiUrl(API_CONFIG.ENDPOINTS.FILE_OVERRIDES.BY_ENVIRONMENT, { environmentId });
    const { data, error } = await apiClient.get<FileOverride[]>(url);
    if (error) throw new Error(error);
    return data ?? [];
  },

  async createFileOverride(environmentId: string, payload: CreateFileOverrideDto): Promise<FileOverride> {
    const url = createApiUrl(API_CONFIG.ENDPOINTS.FILE_OVERRIDES.CREATE, { environmentId });
    const { data, error } = await apiClient.post<FileOverride>(url, payload);
    if (error) throw new Error(error);
    return data!;
  },

  async updateFileOverride(id: string, payload: UpdateFileOverrideDto): Promise<FileOverride> {
    const url = createApiUrl(API_CONFIG.ENDPOINTS.FILE_OVERRIDES.UPDATE, { id });
    const { data, error } = await apiClient.put<FileOverride>(url, payload);
    if (error) throw new Error(error);
    return data!;
  },

  async deleteFileOverride(id: string): Promise<void> {
    const url = createApiUrl(API_CONFIG.ENDPOINTS.FILE_OVERRIDES.DELETE, { id });
    const { error } = await apiClient.delete(url);
    if (error) throw new Error(error);
  }
};

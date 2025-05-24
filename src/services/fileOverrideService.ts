
import { apiClient } from '@/services/api.client';
import { 
  FileOverride, 
  CreateFileOverrideDto, 
  UpdateFileOverrideDto 
} from '@/types/project';

export const fileOverrideService = {
  async getFileOverridesByEnvironment(environmentId: string): Promise<FileOverride[]> {
    const { data, error } = await apiClient.get<FileOverride[]>(`/api/environments/${environmentId}/file-overrides`);
    if (error) throw new Error(error);
    return data ?? [];
  },

  async createFileOverride(environmentId: string, payload: CreateFileOverrideDto): Promise<FileOverride> {
    const { data, error } = await apiClient.post<FileOverride>(`/api/environments/${environmentId}/file-overrides`, payload);
    if (error) throw new Error(error);
    return data!;
  },

  async updateFileOverride(id: string, payload: UpdateFileOverrideDto): Promise<FileOverride> {
    const { data, error } = await apiClient.put<FileOverride>(`/api/file-overrides/${id}`, payload);
    if (error) throw new Error(error);
    return data!;
  },

  async deleteFileOverride(id: string): Promise<void> {
    const { error } = await apiClient.delete(`/api/file-overrides/${id}`);
    if (error) throw new Error(error);
  }
};

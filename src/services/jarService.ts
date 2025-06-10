
import { apiClient } from './api.client';
import { JarGenerationRequestDto, JarGenerationResultDto, JarStatusDto } from '@/types/jar';

export interface JarService {
  generateJar(payload: JarGenerationRequestDto): Promise<JarGenerationResultDto>;
  getStatus(jobId: string): Promise<JarStatusDto>;
}

export const jarService: JarService = {
  async generateJar(payload: JarGenerationRequestDto): Promise<JarGenerationResultDto> {
    const response = await apiClient.post('/jar/generate', payload);
    return response.data;
  },

  async getStatus(jobId: string): Promise<JarStatusDto> {
    const response = await apiClient.get(`/jar/status/${jobId}`);
    return response.data;
  }
};

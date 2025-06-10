import { apiClient } from '@/services/api.client';
import { API_CONFIG } from '@/config/api.config';
import {
  JarGenerationRequestDto,
  JarGenerationResultDto,
  JarStatusDto
} from '@/types/jar';

export const jarService = {
  /**
   * Calls POST /api/jar/generate and returns { jobId, status, createdAt }.
   */
  async generateJar(
    payload: JarGenerationRequestDto
  ): Promise<JarGenerationResultDto> {
    const { data, error } = await apiClient.post<JarGenerationResultDto>(
      API_CONFIG.ENDPOINTS.JAR.GENERATE,
      payload
    );
    if (error) throw new Error(error);
    return data!;
  },

   async getStatus(jobId: string): Promise<JarStatusDto> {
    const { data, error } = await apiClient.get<JarStatusDto>(API_CONFIG.ENDPOINTS.JAR.STATUS,{ params: { jobId} });
    if (error) throw new Error(error);
    return data!;
  }
};

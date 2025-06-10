
import { ApiClient } from './api.client';

export interface JarStatus {
  jobId: string;
  status: 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  startedAt?: string;
  completedAt?: string;
  jarUrl?: string;
  progress?: number;
  currentStep?: string;
}

class JarService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  async getStatus(jobId: string): Promise<JarStatus> {
    try {
      const response = await this.apiClient.get(`/jar/status/${jobId}`);
      return response.data;
    } catch (error) {
      // Mock response for development
      console.warn('Using mock jar status data');
      return {
        jobId,
        status: Math.random() > 0.7 ? 'SUCCESS' : Math.random() > 0.5 ? 'RUNNING' : 'QUEUED',
        startedAt: new Date(Date.now() - Math.random() * 300000).toISOString(),
        completedAt: Math.random() > 0.5 ? new Date().toISOString() : undefined,
        jarUrl: Math.random() > 0.5 ? `https://example.com/jars/${jobId}.jar` : undefined,
        progress: Math.floor(Math.random() * 100),
        currentStep: 'Compiling source code'
      };
    }
  }

  async createJar(projectId: string, config: any): Promise<{ jobId: string }> {
    try {
      const response = await this.apiClient.post('/jar/generate', {
        projectId,
        configuration: config
      });
      return response.data;
    } catch (error) {
      // Mock response for development
      console.warn('Using mock jar creation');
      return {
        jobId: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
    }
  }
}

export const jarService = new JarService();


import { apiClient } from '@/services/api.client';
import { 
  GitApiParams, 
  CommitDto, 
  FileChangeDto, 
  CommitDetailDto, 
  CompareDto, 
  CompareFilesRequest 
} from '@/types/git';

export const gitService = {
  async getBranches(projectId: string): Promise<string[]> {
    const { data, error } = await apiClient.get<string[]>('/api/git/branches', {
      params: { projectId }
    });
    if (error) throw new Error(error);
    return data ?? [];
  },

  async getCommits(params: GitApiParams): Promise<CommitDto[]> {
    const { data, error } = await apiClient.get<CommitDto[]>('/api/git/commits', {
      params: {
        projectId: params.projectId,
        branch: params.branch
      }
    });
    if (error) throw new Error(error);
    return data ?? [];
  },

  async getCommitDetail(sha: string, projectId: string): Promise<CommitDetailDto> {
    const { data, error } = await apiClient.get<CommitDetailDto>(`/api/git/commit/${sha}`, {
      params: { projectId }
    });
    if (error) throw new Error(error);
    return data!;
  },

  async compare(params: GitApiParams): Promise<CompareDto> {
    const { data, error } = await apiClient.get<CompareDto>('/api/git/compare', {
      params: {
        projectId: params.projectId,
        baseSha: params.baseSha,
        headSha: params.headSha
      }
    });
    if (error) throw new Error(error);
    return data!;
  },

  async getFull(params: GitApiParams): Promise<CompareDto> {
    const { data, error } = await apiClient.get<CompareDto>('/api/git/full', {
      params: {
        projectId: params.projectId,
        branch: params.branch
      }
    });
    if (error) throw new Error(error);
    return data!;
  },

  async getTree(params: GitApiParams): Promise<string[]> {
    const { data, error } = await apiClient.get<string[]>('/api/git/tree', {
      params: {
        projectId: params.projectId,
        branch: params.branch
      }
    });
    if (error) throw new Error(error);
    return data ?? [];
  },

  async compareFiles(request: CompareFilesRequest): Promise<CompareDto> {
    const { data, error } = await apiClient.post<CompareDto>('/api/git/compare-files', request);
    if (error) throw new Error(error);
    return data!;
  },

  async getFileContent(params: GitApiParams): Promise<string> {
    const { data, error } = await apiClient.get<string>('/api/git/file-content', {
      params: {
        projectId: params.projectId,
        branch: params.branch,
        sha: params.sha,
        path: params.path
      }
    });
    if (error) throw new Error(error);
    return data || '';
  },

  async compareCommits(projectId: string, baseSha: string, headSha: string): Promise<CompareDto> {
    return this.compare({ projectId, baseSha, headSha });
  }
};

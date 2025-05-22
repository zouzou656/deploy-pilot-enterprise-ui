
import { apiClient } from '@/services/api.client';
import { API_CONFIG } from '@/config/api.config';
import { GitCommit, GitCompareRequest, FileChange } from '@/types';

export interface CommitDto {
  sha: string;
  message: string;
  date: string;
}

export interface CompareFilesRequestWithProjectId {
  baseSha: string;
  headSha: string;
  files: string[];
  projectId: string;
}

export interface CompareDto {
  files: FileChangeDto[];
}

export interface FileChangeDto {
  filename: string;
  status: string;
  patch?: string;
}

export interface CommitDetailDto {
  files: FileChangeDto[];
}

export const gitService = {
  async getBranches(projectId: string): Promise<string[]> {
    const { data, error } = await apiClient.get<string[]>(
      API_CONFIG.ENDPOINTS.GIT.BRANCHES,
      { params: { projectId } }
    );
    if (error) throw new Error(error);
    return data ?? [];
  },

  async getCommits(projectId: string, branch: string): Promise<CommitDto[]> {
    const { data, error } = await apiClient.get<CommitDto[]>(
      API_CONFIG.ENDPOINTS.GIT.COMMITS,
      { params: { projectId, branch } }
    );
    if (error) throw new Error(error);
    return data ?? [];
  },

  async getCommitDetail(projectId: string, sha: string): Promise<CommitDetailDto> {
    const { data, error } = await apiClient.get<CommitDetailDto>(
      `${API_CONFIG.ENDPOINTS.GIT.COMMIT}/${sha}`,
      { params: { projectId } }
    );
    if (error) throw new Error(error);
    return data!;
  },

  async compare(projectId: string, baseSha: string, headSha: string): Promise<CompareDto> {
    const { data, error } = await apiClient.get<CompareDto>(
      API_CONFIG.ENDPOINTS.GIT.COMPARE,
      { params: { projectId, baseSha, headSha } }
    );
    if (error) throw new Error(error);
    return data!;
  },

  async getFull(projectId: string, branch: string): Promise<CompareDto> {
    const { data, error } = await apiClient.get<CompareDto>(
      API_CONFIG.ENDPOINTS.GIT.FULL,
      { params: { projectId, branch } }
    );
    if (error) throw new Error(error);
    return data!;
  },

  async getTree(projectId: string, branch: string): Promise<string[]> {
    const { data, error } = await apiClient.get<string[]>(
      API_CONFIG.ENDPOINTS.GIT.TREE,
      { params: { projectId, branch } }
    );
    if (error) throw new Error(error);
    return data ?? [];
  },

  async compareFiles(request: CompareFilesRequestWithProjectId): Promise<CompareDto> {
    const { data, error } = await apiClient.post<CompareDto>(
      API_CONFIG.ENDPOINTS.GIT.COMPARE_FILES,
      request
    );
    if (error) throw new Error(error);
    return data!;
  },

  async getFileContent(projectId: string, branch: string, sha: string, path: string): Promise<string> {
    const { data, error } = await apiClient.get<string>(
      API_CONFIG.ENDPOINTS.GIT.FILE_CONTENT,
      { params: { projectId, branch, sha, path } }
    );
    if (error) throw new Error(error);
    return data ?? '';
  }
};

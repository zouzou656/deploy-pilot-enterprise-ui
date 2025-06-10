// src/services/gitService.ts

import { apiClient } from '@/services/api.client';
import { API_CONFIG } from '@/config/api.config';
import {
  FileEntry,
  CommitDto,
  CompareDto,
  CompareFilesRequestWithProjectId,
} from '@/types/git';

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

  // Now accepts an optional `sha` so that the UI can re‐fetch the tree for any commit
  async tree(projectId: string, branch: string, sha?: string): Promise<string[]> {
    const params: Record<string, string> = { projectId, branch };
    if (sha) {
      params.sha = sha;
    }
    const { data, error } = await apiClient.get<string[]>(
      API_CONFIG.ENDPOINTS.GIT.TREE,
      { params }
    );
    if (error) throw new Error(error);
    return data ?? [];
  },

  async full(projectId: string, branch: string): Promise<FileEntry[]> {
    const { data, error } = await apiClient.get<CompareDto>(
      API_CONFIG.ENDPOINTS.GIT.FULL,
      { params: { projectId, branch } }
    );
    if (error) throw new Error(error);
    return data.files;
  },

  async compare(
    projectId: string,
    baseSha: string,
    headSha: string
  ): Promise<FileEntry[]> {
    const { data, error } = await apiClient.get<CompareDto>(
      API_CONFIG.ENDPOINTS.GIT.COMPARE,
      { params: { projectId, baseSha, headSha } }
    );
    if (error) throw new Error(error);
    return data.files;
  },

  async compareFiles(
    payload: CompareFilesRequestWithProjectId
  ): Promise<FileEntry[]> {
    const { data, error } = await apiClient.post<CompareDto>(
      API_CONFIG.ENDPOINTS.GIT.COMPARE_FILES,
      payload
    );
    if (error) throw new Error(error);
    return data.files;
  },

  async getFileContent(
    projectId: string,
    branch: string,
    sha: string,
    path: string
  ): Promise<string> {
    const { data, error, status } = await apiClient.get<string>(
      API_CONFIG.ENDPOINTS.GIT.FILE_CONTENT,
      {
        params: { projectId, branch, sha, path },
        responseType: 'text',
      }
    );
    if (error) {
      throw new Error(`Error fetching file content (status ${status}): ${error}`);
    }
    return data!;
  },
};

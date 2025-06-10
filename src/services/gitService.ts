
import { apiClient } from './api.client';
import { CommitDto, CompareDto, GitApiParams } from '@/types/git';
import { FileEntry } from '@/components/jar-generation/FileTree';

export const gitService = {
  async getBranches(projectId: string): Promise<string[]> {
    const response = await apiClient.get(`/git/${projectId}/branches`);
    return response.data;
  },

  async getCommits(params: GitApiParams): Promise<CommitDto[]> {
    const { projectId, branch } = params;
    const response = await apiClient.get(`/git/${projectId}/commits?branch=${branch}`);
    return response.data;
  },

  async getCommitDetail(sha: string, projectId: string): Promise<CommitDto> {
    const response = await apiClient.get(`/git/${projectId}/commits/${sha}`);
    return response.data;
  },

  async compare(projectId: string, baseSha: string, headSha: string): Promise<FileEntry[]> {
    const response = await apiClient.get(`/git/${projectId}/compare/${baseSha}...${headSha}`);
    return response.data;
  },

  async compareFiles(params: { projectId: string; baseSha: string; headSha: string; files: string[] }): Promise<FileEntry[]> {
    const response = await apiClient.post(`/git/${params.projectId}/compare-files`, {
      baseSha: params.baseSha,
      headSha: params.headSha,
      files: params.files
    });
    return response.data;
  },

  async tree(projectId: string, branch: string): Promise<string[]> {
    const response = await apiClient.get(`/git/${projectId}/tree?branch=${branch}`);
    return response.data;
  },

  async full(projectId: string, branch: string): Promise<FileEntry[]> {
    const response = await apiClient.get(`/git/${projectId}/full?branch=${branch}`);
    return response.data;
  }
};


import { apiClient } from '@/services/api.client';
import { API_CONFIG, createApiUrl } from '@/config/api.config';
import { CommitDto, CommitDetailDto, CompareDto, CompareFilesRequestWithProjectId, GitApiParams, GitCompareParams } from '@/types/git';

export const gitService = {
  async getBranches(projectId: string): Promise<string[]> {
    const { data, error } = await apiClient.get<string[]>(
      `${API_CONFIG.ENDPOINTS.GIT.BRANCHES}?projectId=${projectId}`
    );
    
    if (error) throw new Error(error);
    return data ?? [];
  },

  async getCommits(params: GitApiParams): Promise<CommitDto[]> {
    const { projectId, branch } = params;
    const url = `${API_CONFIG.ENDPOINTS.GIT.COMMITS}?projectId=${projectId}&branch=${branch}`;
    
    const { data, error } = await apiClient.get<CommitDto[]>(url);
    if (error) throw new Error(error);
    return data ?? [];
  },

  async getCommitDetail(sha: string, projectId: string): Promise<CommitDetailDto> {
    const url = `${API_CONFIG.ENDPOINTS.GIT.COMMIT_DETAIL.replace('{sha}', sha)}?projectId=${projectId}`;
    
    const { data, error } = await apiClient.get<CommitDetailDto>(url);
    if (error) throw new Error(error);
    return data!;
  },

  async compareCommits(params: GitCompareParams): Promise<CompareDto> {
    const { projectId, baseSha, headSha } = params;
    const url = `${API_CONFIG.ENDPOINTS.GIT.COMPARE}?projectId=${projectId}&baseSha=${baseSha}&headSha=${headSha}`;
    
    const { data, error } = await apiClient.get<CompareDto>(url);
    if (error) throw new Error(error);
    return data!;
  },

  async getFullTree(params: GitApiParams): Promise<CompareDto> {
    const { projectId, branch } = params;
    const url = `${API_CONFIG.ENDPOINTS.GIT.FULL_TREE}?projectId=${projectId}&branch=${branch}`;
    
    const { data, error } = await apiClient.get<CompareDto>(url);
    if (error) throw new Error(error);
    return data!;
  },

  async getTree(params: GitApiParams): Promise<string[]> {
    const { projectId, branch } = params;
    const url = `${API_CONFIG.ENDPOINTS.GIT.TREE}?projectId=${projectId}&branch=${branch}`;
    
    const { data, error } = await apiClient.get<string[]>(url);
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

  async getFileContent(params: GitApiParams): Promise<string> {
    const { projectId, branch, sha, path } = params;
    let url = `${API_CONFIG.ENDPOINTS.GIT.FILE_CONTENT}?projectId=${projectId}`;
    
    if (branch) url += `&branch=${branch}`;
    if (sha) url += `&sha=${sha}`;
    if (path) url += `&path=${encodeURIComponent(path)}`;
    
    const { data, error } = await apiClient.get<string>(url);
    if (error) throw new Error(error);
    return data ?? '';
  },
};

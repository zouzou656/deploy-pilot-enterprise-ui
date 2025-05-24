
// Project Management Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  gitRepoUrl: string;
  gitUsername?: string;
  gitPassword?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Environment {
  id: string;
  projectId: string;
  name: string;
  host: string;
  port?: number;
  username: string;
  password?: string;
  deploymentChannel?: string;
  isProduction: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FileOverride {
  id: string;
  environmentId: string;
  filePath: string;
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  gitRepoUrl: string;
  gitUsername?: string;
  gitPassword?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  gitRepoUrl?: string;
  gitUsername?: string;
  gitPassword?: string;
}

export interface CreateEnvironmentDto {
  projectId: string;
  name: string;
  host: string;
  port?: number;
  username: string;
  password?: string;
  deploymentChannel?: string;
  isProduction: boolean;
}

export interface UpdateEnvironmentDto {
  name?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  deploymentChannel?: string;
  isProduction?: boolean;
}

export interface CreateFileOverrideDto {
  environmentId: string;
  filePath: string;
  content: string;
  createdBy: string;
}

export interface UpdateFileOverrideDto {
  content: string;
}

export interface JarGenerationPayload {
  projectId: string;
  branch: string;
  version: string;
  environmentId: string;
  strategy: 'commit' | 'full' | 'manual';
  baseSha?: string;
  headSha?: string;
  applyOverrides: boolean;
  files: { filename: string; status: string }[];
}


// Project Management Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  gitRepoUrl: string;
  gitUsername?: string;
  gitPassword?: string; // This would be securely stored
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ProjectEnvironment {
  id: string;
  projectId: string;
  name: string;
  host: string;
  port: number;
  username: string;
  password?: string; // This would be securely stored
  deploymentChannel?: string;
  isProduction: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FileOverride {
  id: string;
  environmentId: string;
  filePath: string;
  fileType: 'BIX' | 'PROXY';
  content: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ProjectUser {
  projectId: string;
  userId: string;
  role: 'ADMIN' | 'DEVELOPER' | 'VIEWER';
}

export interface ProjectEnvironmentUser {
  environmentId: string;
  userId: string;
  canManageOverrides: boolean;
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

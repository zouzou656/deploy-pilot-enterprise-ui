
// User and Authentication
export type Role = 'ADMIN' | 'DEVELOPER' | 'VIEWER';

export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

// Deployment related
export type DeploymentStatus = 
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type DeploymentMode = 'onCommit' | 'onPush' | 'onStaging';

export interface Deployment {
  id: string;
  projectId: string;
  environment: string;
  status: DeploymentStatus;
  startTime: string;
  endTime?: string;
  triggeredBy: string;
  commitId: string;
  branch: string;
  jarFileName?: string;
  logs?: DeploymentLog[];
}

export interface DeploymentLog {
  id: string;
  deploymentId: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';
  message: string;
  source?: string;
}

// Git related
export interface GitInfo {
  currentBranch: string;
  branches: string[];
  commits: GitCommit[];
  lastFetch: string;
}

export interface GitCommit {
  id: string;
  message: string;
  author: string;
  date: string;
  branch: string;
}

export interface GitDiff {
  added: string[];
  removed: string[];
  modified: string[];
}

// Configuration related
export interface ProjectSettings {
  id: string;
  name: string;
  description?: string;
  artifactsPath: string;
  deployToWeblogic: boolean;
  overrideIPs: boolean;
  deploymentMode: DeploymentMode;
  environments: Environment[];
  created: string;
  updated: string;
}

export interface Environment {
  id: string;
  name: string;
  baseUrl: string;
  isProduction: boolean;
}

// WebLogic Deployment
export interface WebLogicDeploymentConfig {
  host: string;
  port: number;
  username: string;
  password?: string; // Usually stored securely
  domain: string;
  targets: string[];
}

// Theme Configuration
export interface ThemeConfig {
  primaryColor: string;
  logoUrl: string;
  darkMode: boolean;
  companyName: string;
  accentColor: string;
  borderRadius: string;
}

// Statistics and Metrics
export interface DeploymentStats {
  total: number;
  successful: number;
  failed: number;
  avgDuration: number; // in seconds
  byEnvironment: Record<string, number>;
}

export interface JarFile {
  fileName: string;
  size: number;
  created: string;
  deployedTo?: string[];
  deploymentId?: string;
  status: 'AVAILABLE' | 'DEPLOYED' | 'FAILED' | 'IN_PROGRESS';
}

export interface MetadataConfig {
  ipMappings: Record<string, string>;
  serviceEndpoints: Record<string, string>;
  environment: string;
}

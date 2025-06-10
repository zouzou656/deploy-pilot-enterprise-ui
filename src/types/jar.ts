
export interface JarGenerationFileDto {
  filename: string;
  status: string;
}

export interface JarGenerationRequestDto {
  jobId: string;
  projectId: string;
  branch: string;
  version: string;
  environmentId: string | null;
  strategy: 'commit' | 'full' | 'manual';
  baseSha: string;
  headSha: string;
  applyOverrides: boolean;
  files: JarGenerationFileDto[];
}

export interface JarGenerationResultDto {
  jobId: string;
  status: string;
  createdAt: string;
}

export interface JarStatusDto {
  jobId: string;
  status: string;
  startedAt?: string;
  completedAt?: string;
  jarUrl?: string;
}

// src/types/jar.ts

// DTO you get back from POST /api/jar/generate
export interface JarGenerationResultDto {
  jobId: string;
  status: 'QUEUED';
  createdAt: string;
}

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
  strategy: string;
  baseSha: string;
  headSha: string;
  applyOverrides: boolean;
  files: JarGenerationFileDto[];
}

export interface JarStatusDto {
  jobId: string;
  status: string;
  progress:string;
  startedAt: string;
  completedAt: string;
  jarUrl: string | null;
}
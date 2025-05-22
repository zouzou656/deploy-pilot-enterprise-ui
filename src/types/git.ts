
export interface CommitDto {
  sha: string;
  message: string;
  date: Date;
}

export interface FileChangeDto {
  filename: string;
  status: string;
  patch?: string;
}

export interface CommitDetailDto {
  files: FileChangeDto[];
}

export interface CompareDto {
  files: FileChangeDto[];
}

export interface CompareFilesRequestWithProjectId {
  baseSha: string;
  headSha: string;
  files?: string[];
  projectId: string;
}

export interface GitApiParams {
  projectId?: string;
  branch?: string;
  sha?: string;
  path?: string;
}

export interface GitCompareParams {
  projectId?: string;
  baseSha: string;
  headSha: string;
}

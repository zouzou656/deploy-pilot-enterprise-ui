
export interface CommitDto {
  sha: string;
  message: string;
  date: string;
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

export interface GitApiParams {
  projectId: string;
  branch?: string;
  sha?: string;
  path?: string;
  baseSha?: string;
  headSha?: string;
}

export interface CompareFilesRequest {
  projectId: string;
  baseSha: string;
  headSha: string;
  files: string[];
}

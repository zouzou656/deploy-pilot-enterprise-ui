
// Authentication DTOs
export interface LoginRequestDto {
  email: string | null;
  password: string | null;
}

export interface LoginResponseDto {
  user: UserInfoDto;
  token: string | null;
  refreshToken: string | null;
}

export interface RefreshRequestDto {
  refreshToken: string | null;
}

export interface LogoutRequestDto {
  refreshToken: string | null;
}

export interface UserInfoDto {
  id: string | null;
  email: string | null;
  fullName: string | null;
  role: string | null;
}

// User DTOs
export interface UserDto {
  id: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  status: string | null;
  lastLogin: string | null;
}

export interface UserDetailDto extends UserDto {
  username: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string | null;
  password: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  status: string | null;
}

export interface UpdateUserDto {
  password?: string | null;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | null;
  status?: string | null;
}

// Role DTOs
export interface RoleDto {
  id: string | null;
  name: string | null;
  description: string | null;
}

export interface RoleDetailDto extends RoleDto {
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleDto {
  name: string | null;
  description: string | null;
}

export interface UpdateRoleDto {
  name?: string | null;
  description?: string | null;
}

// Permission DTOs
export interface PermissionDto {
  id: string | null;
  name: string | null;
  description: string | null;
  groupName: string | null;
  createdAt: string;
}

export interface CreatePermissionDto {
  name: string | null;
  description: string | null;
  groupName: string | null;
}

export interface UpdatePermissionDto {
  name?: string | null;
  description?: string | null;
  groupName?: string | null;
}

// Project DTOs
export interface ProjectDto {
  id: string | null;
  name: string | null;
  description: string | null;
  gitRepoUrl: string | null;
  gitUsername: string | null;
  gitPassword: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string | null;
  description: string | null;
  gitRepoUrl: string | null;
  gitUsername: string | null;
  gitPassword: string | null;
}

export interface UpdateProjectDto {
  name?: string | null;
  description?: string | null;
  gitRepoUrl?: string | null;
  gitUsername?: string | null;
  gitPassword?: string | null;
}

// Error response
export interface ProblemDetails {
  type?: string | null;
  title?: string | null;
  status?: number | null;
  detail?: string | null;
  instance?: string | null;
  [key: string]: any;
}

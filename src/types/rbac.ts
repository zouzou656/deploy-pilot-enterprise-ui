
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: string;
  lastLogin?: string;
}

export interface UserDetail {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: string;
  lastLogin?: string;
  username?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface RoleDetail {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  groupName?: string;
  createdAt: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: string;
}

export interface UpdateUserDto {
  password?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: string;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
}

export interface CreatePermissionDto {
  name: string;
  description?: string;
  groupName?: string;
}

export interface UpdatePermissionDto {
  name?: string;
  description?: string;
  groupName?: string;
}

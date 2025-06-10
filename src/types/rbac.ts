
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserListItem {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
  role: string; // Single role ID, not array
  createdAt: string;
  updatedAt: string;
}

export interface UserDetail {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
  roleIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserDetails {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
  roleIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  group: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  status: 'active' | 'inactive' | 'pending';
  roles: string[];
  createdBy: string;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  status?: 'active' | 'inactive' | 'pending';
  roles?: string[];
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: string[];
}

export interface CreatePermissionDto {
  name: string;
  description: string;
  group: string;
}

export interface UpdatePermissionDto {
  name?: string;
  description?: string;
  group?: string;
}

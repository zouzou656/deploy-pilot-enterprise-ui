
// Define types for RBAC entities and DTOs

export interface Permission {
  id: string;
  name: string;
  description: string;
  groupName: string;
  createdAt: Date;
}

export interface Role {
  id: string;
  name: string;
  description: string;
}

export interface RoleDetail extends Role {
  createdAt: Date;
  updatedAt: Date;
  permissions?: Permission[];
}

export interface UserListItem {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: string;
  lastLogin?: Date;
}

export interface UserDetail extends UserListItem {
  username?: string;
  createdAt: Date;
  updatedAt: Date;
  permissions?: Permission[];
  roles?: Role[];
}

// DTOs for API requests
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

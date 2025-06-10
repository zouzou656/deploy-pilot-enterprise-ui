
// RBAC Types
export interface UserListItem {
  id: string;
  email: string;
  roleIds: string[]; // Changed from roleId to roleIds for multiple roles
  lastLogin: string | null;
  status: 'active' | 'inactive' | 'pending';
}

export interface UserDetails extends UserListItem {
  firstName?: string;
  lastName?: string;
  permissions?: string[]; // Direct permissions not tied to roles
}
export interface CreateRoleDto {
  name: string | null;
  description: string | null;
}

export interface UpdateRoleDto {
  name?: string | null;
  description?: string | null;
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
export interface CreateUserPayload {
  email: string;
  password: string;
  roleIds: string[]; // Changed from roleId to roleIds
  firstName?: string;
  lastName?: string;
  permissions?: string[]; // Optional direct permissions
  status?: 'active' | 'inactive' | 'pending';
}

export interface UpdateUserPayload {
  email?: string;
  password?: string; // Only if changing password
  roleIds?: string[]; // Changed from roleId to roleIds
  firstName?: string;
  lastName?: string;
  permissions?: string[]; // Optional direct permissions
  status?: 'active' | 'inactive' | 'pending';
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  group: string; // Permissions are grouped (e.g. "Users", "Roles", etc.)
}

export interface Role {
  id: string;
  name: string;
  permissions: string[]; // List of permission IDs
  description?: string;
}

export interface CreateRolePayload {
  name: string;
  permissions: string[];
  description?: string;
}

export interface UpdateRolePayload {
  name?: string;
  permissions?: string[];
  description?: string;
}

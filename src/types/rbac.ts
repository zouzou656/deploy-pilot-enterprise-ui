
// RBAC Types
export interface UserListItem {
  id: string;
  email: string;
  roleId: string;
  lastLogin: string | null;
  status: 'active' | 'inactive' | 'pending';
}

export interface UserDetails extends UserListItem {
  firstName?: string;
  lastName?: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  roleId: string;
  firstName?: string;
  lastName?: string;
  status?: 'active' | 'inactive' | 'pending';
}

export interface UpdateUserPayload {
  email?: string;
  password?: string; // Only if changing password
  roleId?: string;
  firstName?: string;
  lastName?: string;
  status?: 'active' | 'inactive' | 'pending';
}

export interface Permission {
  id: string;
  name: string;
  description: string;
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

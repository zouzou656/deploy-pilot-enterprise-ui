
import { create } from 'zustand';
import { Permission, Role, UserDetails, UserListItem } from '@/types/rbac';

interface RBACState {
  users: UserListItem[];
  roles: Role[];
  permissions: Permission[];
  isLoading: boolean;
  error: string | null;
}

interface RBACActions {
  // User actions
  fetchUsers: () => Promise<void>;
  fetchUser: (id: string) => Promise<UserDetails>;
  createUser: (userData: any) => Promise<UserDetails>;
  updateUser: (id: string, userData: any) => Promise<UserDetails>;
  deleteUser: (id: string) => Promise<void>;
  
  // Role actions
  fetchRoles: () => Promise<void>;
  fetchRole: (id: string) => Promise<Role>;
  createRole: (roleData: any) => Promise<Role>;
  updateRole: (id: string, roleData: any) => Promise<Role>;
  deleteRole: (id: string) => Promise<void>;
  
  // Permission actions
  fetchPermissions: () => Promise<void>;
}

// Mock data for permissions
const mockPermissions: Permission[] = [
  // User permissions
  { id: 'user:view', name: 'View Users', description: 'Can view user list and details', group: 'Users' },
  { id: 'user:create', name: 'Create Users', description: 'Can create new users', group: 'Users' },
  { id: 'user:edit', name: 'Edit Users', description: 'Can edit existing users', group: 'Users' },
  { id: 'user:delete', name: 'Delete Users', description: 'Can delete users', group: 'Users' },
  
  // Role permissions
  { id: 'role:view', name: 'View Roles', description: 'Can view role list and details', group: 'Roles' },
  { id: 'role:create', name: 'Create Roles', description: 'Can create new roles', group: 'Roles' },
  { id: 'role:edit', name: 'Edit Roles', description: 'Can edit existing roles', group: 'Roles' },
  { id: 'role:delete', name: 'Delete Roles', description: 'Can delete roles', group: 'Roles' },
  
  // Git permissions
  { id: 'git:view', name: 'View Git', description: 'Can view git repositories and branches', group: 'Git' },
  { id: 'git:pull', name: 'Pull Git', description: 'Can pull from git repositories', group: 'Git' },
  { id: 'git:push', name: 'Push Git', description: 'Can push to git repositories', group: 'Git' },
  
  // Deployment permissions
  { id: 'deployment:view', name: 'View Deployments', description: 'Can view deployment history', group: 'Deployment' },
  { id: 'deployment:create', name: 'Create Deployments', description: 'Can create new deployments', group: 'Deployment' },
  { id: 'deployment:cancel', name: 'Cancel Deployments', description: 'Can cancel ongoing deployments', group: 'Deployment' },
  
  // Settings permissions
  { id: 'settings:view', name: 'View Settings', description: 'Can view system settings', group: 'Settings' },
  { id: 'settings:edit', name: 'Edit Settings', description: 'Can edit system settings', group: 'Settings' },
  
  // JAR permissions
  { id: 'jar:view', name: 'View JARs', description: 'Can view JAR files', group: 'JARs' },
  { id: 'jar:create', name: 'Create JARs', description: 'Can create JAR files', group: 'JARs' },
  { id: 'jar:deploy', name: 'Deploy JARs', description: 'Can deploy JAR files', group: 'JARs' },
];

// Mock data for roles
const mockRoles: Role[] = [
  {
    id: 'role-admin',
    name: 'Administrator',
    permissions: ['user:view', 'user:create', 'user:edit', 'user:delete', 'role:view', 'role:create', 'role:edit', 'role:delete', 'git:view', 'git:pull', 'git:push', 'deployment:view', 'deployment:create', 'deployment:cancel', 'settings:view', 'settings:edit', 'jar:view', 'jar:create', 'jar:deploy'],
    description: 'Full system access'
  },
  {
    id: 'role-developer',
    name: 'Developer',
    permissions: ['user:view', 'role:view', 'git:view', 'git:pull', 'git:push', 'deployment:view', 'deployment:create', 'jar:view', 'jar:create', 'jar:deploy'],
    description: 'Development and deployment access'
  },
  {
    id: 'role-viewer',
    name: 'Viewer',
    permissions: ['user:view', 'role:view', 'git:view', 'deployment:view', 'jar:view'],
    description: 'Read-only access'
  },
  {
    id: 'role-manager',
    name: 'Project Manager',
    permissions: ['user:view', 'role:view', 'git:view', 'deployment:view', 'deployment:create', 'deployment:cancel', 'jar:view', 'jar:deploy'],
    description: 'Project management access'
  },
];

// Mock data for users
const mockUsers: UserListItem[] = [
  {
    id: 'user-1',
    email: 'admin@example.com',
    roleIds: ['role-admin'],
    lastLogin: new Date().toISOString(),
    status: 'active'
  },
  {
    id: 'user-2',
    email: 'dev@example.com',
    roleIds: ['role-developer'],
    lastLogin: new Date().toISOString(),
    status: 'active'
  },
  {
    id: 'user-3',
    email: 'viewer@example.com',
    roleIds: ['role-viewer'],
    lastLogin: null,
    status: 'pending'
  },
  {
    id: 'user-4',
    email: 'manager@example.com',
    roleIds: ['role-manager'],
    lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    status: 'active'
  },
  {
    id: 'user-5',
    email: 'hybrid@example.com',
    roleIds: ['role-developer', 'role-manager'],
    lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    status: 'active'
  },
];

// Create the RBAC store
const useRBACStore = create<RBACState & RBACActions>((set, get) => ({
  users: mockUsers, // Initialize with mock data
  roles: mockRoles, // Initialize with mock data
  permissions: mockPermissions, // Initialize with mock data
  isLoading: false,
  error: null,
  
  // User actions
  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use mock data for now, would be replaced with actual API call
      set({ users: mockUsers, isLoading: false });
      
      console.log('API request that would be made:', {
        method: 'GET',
        url: '/api/auth/users',
        headers: {
          'Authorization': 'Bearer <token>'
        }
      });
      
      console.log('Expected response:', mockUsers);
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
    }
  },
  
  fetchUser: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find user in mock data
      const user = mockUsers.find(u => u.id === id) as UserDetails;
      if (!user) throw new Error('User not found');
      
      set({ isLoading: false });
      
      console.log('API request that would be made:', {
        method: 'GET',
        url: `/api/auth/users/${id}`,
        headers: {
          'Authorization': 'Bearer <token>'
        }
      });
      
      console.log('Expected response:', user);
      
      return user;
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  createUser: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create new user with mock ID
      const newUser: UserDetails = {
        id: `user-${Date.now()}`,
        email: userData.email,
        roleIds: userData.roleIds,
        permissions: userData.permissions || [],
        firstName: userData.firstName,
        lastName: userData.lastName,
        lastLogin: null,
        status: userData.status || 'pending',
      };
      
      // Update local state
      set(state => ({ users: [...state.users, newUser], isLoading: false }));
      
      console.log('API request that would be made:', {
        method: 'POST',
        url: '/api/auth/users',
        headers: {
          'Authorization': 'Bearer <token>',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      console.log('Expected response:', newUser);
      
      return newUser;
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  updateUser: async (id: string, userData) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update user in mock data
      const updatedUsers = get().users.map(user => 
        user.id === id ? { ...user, ...userData } : user
      );
      
      // Update local state
      set({ users: updatedUsers, isLoading: false });
      
      const updatedUser = updatedUsers.find(user => user.id === id) as UserDetails;
      
      console.log('API request that would be made:', {
        method: 'PUT',
        url: `/api/auth/users/${id}`,
        headers: {
          'Authorization': 'Bearer <token>',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      console.log('Expected response:', updatedUser);
      
      return updatedUser;
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  deleteUser: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove user from mock data
      const updatedUsers = get().users.filter(user => user.id !== id);
      
      // Update local state
      set({ users: updatedUsers, isLoading: false });
      
      console.log('API request that would be made:', {
        method: 'DELETE',
        url: `/api/auth/users/${id}`,
        headers: {
          'Authorization': 'Bearer <token>'
        }
      });
      
      console.log('Expected response: 204 No Content');
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  // Role actions
  fetchRoles: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use mock data for now, would be replaced with actual API call
      set({ roles: mockRoles, isLoading: false });
      
      console.log('API request that would be made:', {
        method: 'GET',
        url: '/api/auth/roles',
        headers: {
          'Authorization': 'Bearer <token>'
        }
      });
      
      console.log('Expected response:', mockRoles);
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
    }
  },
  
  fetchRole: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find role in mock data
      const role = mockRoles.find(r => r.id === id);
      if (!role) throw new Error('Role not found');
      
      set({ isLoading: false });
      
      console.log('API request that would be made:', {
        method: 'GET',
        url: `/api/auth/roles/${id}`,
        headers: {
          'Authorization': 'Bearer <token>'
        }
      });
      
      console.log('Expected response:', role);
      
      return role;
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  createRole: async (roleData) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create new role with mock ID
      const newRole: Role = {
        id: `role-${Date.now()}`,
        name: roleData.name,
        permissions: roleData.permissions,
        description: roleData.description,
      };
      
      // Update local state
      set(state => ({ roles: [...state.roles, newRole], isLoading: false }));
      
      console.log('API request that would be made:', {
        method: 'POST',
        url: '/api/auth/roles',
        headers: {
          'Authorization': 'Bearer <token>',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roleData)
      });
      
      console.log('Expected response:', newRole);
      
      return newRole;
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  updateRole: async (id: string, roleData) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update role in mock data
      const updatedRoles = get().roles.map(role => 
        role.id === id ? { ...role, ...roleData } : role
      );
      
      // Update local state
      set({ roles: updatedRoles, isLoading: false });
      
      const updatedRole = updatedRoles.find(role => role.id === id) as Role;
      
      console.log('API request that would be made:', {
        method: 'PUT',
        url: `/api/auth/roles/${id}`,
        headers: {
          'Authorization': 'Bearer <token>',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roleData)
      });
      
      console.log('Expected response:', updatedRole);
      
      return updatedRole;
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  deleteRole: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove role from mock data
      const updatedRoles = get().roles.filter(role => role.id !== id);
      
      // Update local state
      set({ roles: updatedRoles, isLoading: false });
      
      console.log('API request that would be made:', {
        method: 'DELETE',
        url: `/api/auth/roles/${id}`,
        headers: {
          'Authorization': 'Bearer <token>'
        }
      });
      
      console.log('Expected response: 204 No Content');
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  // Permission actions
  fetchPermissions: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use mock data for now, would be replaced with actual API call
      set({ permissions: mockPermissions, isLoading: false });
      
      console.log('API request that would be made:', {
        method: 'GET',
        url: '/api/auth/permissions',
        headers: {
          'Authorization': 'Bearer <token>'
        }
      });
      
      console.log('Expected response:', mockPermissions);
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
    }
  },
}));

export default useRBACStore;
export { mockPermissions };


import { create } from 'zustand';
import { 
  User, 
  UserDetail, 
  Role, 
  Permission, 
  CreateUserDto, 
  UpdateUserDto, 
  CreateRoleDto, 
  UpdateRoleDto, 
  CreatePermissionDto, 
  UpdatePermissionDto 
} from '@/types/rbac';
import { userService } from '@/services/userService';
import { roleService } from '@/services/roleService';
import { permissionService } from '@/services/permissionService';

interface RBACState {
  // Users
  users: User[];
  selectedUser: UserDetail | null;
  isLoadingUsers: boolean;

  // Roles
  roles: Role[];
  selectedRole: Role | null;
  isLoadingRoles: boolean;

  // Permissions
  permissions: Permission[];
  isLoadingPermissions: boolean;

  // User Actions
  fetchUsers: () => Promise<void>;
  fetchUser: (id: string) => Promise<UserDetail>;
  createUser: (data: CreateUserDto) => Promise<UserDetail>;
  updateUser: (id: string, data: UpdateUserDto) => Promise<UserDetail>;
  deleteUser: (id: string) => Promise<void>;

  // Role Actions
  fetchRoles: () => Promise<void>;
  fetchRole: (id: string) => Promise<Role>;
  createRole: (data: CreateRoleDto) => Promise<Role>;
  updateRole: (id: string, data: UpdateRoleDto) => Promise<Role>;
  deleteRole: (id: string) => Promise<void>;

  // Permission Actions
  fetchPermissions: () => Promise<void>;
  createPermission: (data: CreatePermissionDto) => Promise<Permission>;
  updatePermission: (id: string, data: UpdatePermissionDto) => Promise<Permission>;
  deletePermission: (id: string) => Promise<void>;
}

const useRBACStore = create<RBACState>((set, get) => ({
  // Initial state
  users: [],
  selectedUser: null,
  isLoadingUsers: false,
  roles: [],
  selectedRole: null,
  isLoadingRoles: false,
  permissions: [],
  isLoadingPermissions: false,

  // User actions
  fetchUsers: async () => {
    set({ isLoadingUsers: true });
    try {
      const users = await userService.getUsers();
      set({ users, isLoadingUsers: false });
    } catch (error) {
      set({ isLoadingUsers: false });
      throw error;
    }
  },

  fetchUser: async (id: string) => {
    const user = await userService.getUser(id);
    set({ selectedUser: user });
    return user;
  },

  createUser: async (data: CreateUserDto) => {
    const user = await userService.createUser(data);
    const { users } = get();
    set({ users: [...users, user] });
    return user;
  },

  updateUser: async (id: string, data: UpdateUserDto) => {
    const updatedUser = await userService.updateUser(id, data);
    const { users } = get();
    set({ 
      users: users.map(u => u.id === id ? updatedUser : u),
      selectedUser: updatedUser
    });
    return updatedUser;
  },

  deleteUser: async (id: string) => {
    await userService.deleteUser(id);
    const { users } = get();
    set({ 
      users: users.filter(u => u.id !== id),
      selectedUser: null
    });
  },

  // Role actions
  fetchRoles: async () => {
    set({ isLoadingRoles: true });
    try {
      const roles = await roleService.getRoles();
      set({ roles, isLoadingRoles: false });
    } catch (error) {
      set({ isLoadingRoles: false });
      throw error;
    }
  },

  fetchRole: async (id: string) => {
    const role = await roleService.getRole(id);
    set({ selectedRole: role });
    return role;
  },

  createRole: async (data: CreateRoleDto) => {
    const role = await roleService.createRole(data);
    const { roles } = get();
    set({ roles: [...roles, role] });
    return role;
  },

  updateRole: async (id: string, data: UpdateRoleDto) => {
    const updatedRole = await roleService.updateRole(id, data);
    const { roles } = get();
    set({ 
      roles: roles.map(r => r.id === id ? updatedRole : r),
      selectedRole: updatedRole
    });
    return updatedRole;
  },

  deleteRole: async (id: string) => {
    await roleService.deleteRole(id);
    const { roles } = get();
    set({ 
      roles: roles.filter(r => r.id !== id),
      selectedRole: null
    });
  },

  // Permission actions
  fetchPermissions: async () => {
    set({ isLoadingPermissions: true });
    try {
      const permissions = await permissionService.getPermissions();
      set({ permissions, isLoadingPermissions: false });
    } catch (error) {
      set({ isLoadingPermissions: false });
      throw error;
    }
  },

  createPermission: async (data: CreatePermissionDto) => {
    const permission = await permissionService.createPermission(data);
    const { permissions } = get();
    set({ permissions: [...permissions, permission] });
    return permission;
  },

  updatePermission: async (id: string, data: UpdatePermissionDto) => {
    const updatedPermission = await permissionService.updatePermission(id, data);
    const { permissions } = get();
    set({ permissions: permissions.map(p => p.id === id ? updatedPermission : p) });
    return updatedPermission;
  },

  deletePermission: async (id: string) => {
    await permissionService.deletePermission(id);
    const { permissions } = get();
    set({ permissions: permissions.filter(p => p.id !== id) });
  },
}));

export default useRBACStore;

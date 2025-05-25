import { apiClient } from '@/services/api.client';
import { API_CONFIG, createApiUrl } from '@/config/api.config';
import { 
  User, 
  UserDetail, 
  CreateUserDto, 
  UpdateUserDto 
} from '@/types/rbac';

export const userService = {
  async getUsers(): Promise<User[]> {
    const { data, error } = await apiClient.get<User[]>(
      API_CONFIG.ENDPOINTS.USERS.LIST
    );
    if (error) throw new Error(error);
    return data ?? [];
  },

  async getUser(id: string): Promise<UserDetail> {
    const url = createApiUrl(API_CONFIG.ENDPOINTS.USERS.GET, { id });
    const { data, error } = await apiClient.get<UserDetail>(url);
    if (error) throw new Error(error);
    return data!;
  },

  async createUser(payload: CreateUserDto): Promise<UserDetail> {
    const { data, error } = await apiClient.post<UserDetail>(
      API_CONFIG.ENDPOINTS.USERS.CREATE,
      payload
    );
    if (error) throw new Error(error);
    return data!;
  },

  async updateUser(id: string, payload: UpdateUserDto): Promise<UserDetail> {
    const url = createApiUrl(API_CONFIG.ENDPOINTS.USERS.UPDATE, { id });
    const { data, error } = await apiClient.put<UserDetail>(url, payload);
    if (error) throw new Error(error);
    return data!;
  },

  async deleteUser(id: string): Promise<void> {
    const url = createApiUrl(API_CONFIG.ENDPOINTS.USERS.DELETE, { id });
    const { error } = await apiClient.delete(url);
    if (error) throw new Error(error);
  },

  async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    const url = createApiUrl(API_CONFIG.ENDPOINTS.USERS.ASSIGN_ROLE, { id: userId, roleId });
    const { error } = await apiClient.post(url, {});
    if (error) throw new Error(error);
  },

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    const url = createApiUrl(API_CONFIG.ENDPOINTS.USERS.REMOVE_ROLE, { id: userId, roleId });
    const { error } = await apiClient.delete(url);
    if (error) throw new Error(error);
  }
};

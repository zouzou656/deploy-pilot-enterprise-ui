// src/services/user.service.ts
import { apiClient } from '@/services/api.client';
import { API_CONFIG, createApiUrl } from '@/config/api.config';
import {
  CreateUserDto,
  UpdateUserDto,
  UserDetails,
  UserListItem
} from '@/types/rbac';

export const userService = {
  async getUsers(): Promise<UserListItem[]> {
    const { data, error } = await apiClient.get<UserListItem[]>(
        API_CONFIG.ENDPOINTS.USERS.LIST
    );
    if (error) throw new Error(error);
    return data ?? [];
  },

  async getUser(id: string): Promise<UserDetails> {
    const { data, error } = await apiClient.get<UserDetails>(API_CONFIG.ENDPOINTS.USERS.GET,{ params: { id } });
    if (error) throw new Error(error);
    return data!;
  },

  async createUser(payload: CreateUserDto): Promise<UserDetails> {
    const { data, error } = await apiClient.post<UserDetails>(
        API_CONFIG.ENDPOINTS.USERS.CREATE,
        payload
    );
    if (error) throw new Error(error);
    return data!;
  },

  async updateUser(id: string, payload: UpdateUserDto): Promise<UserDetails> {
    const { data, error } = await apiClient.put<UserDetails>(API_CONFIG.ENDPOINTS.USERS.UPDATE, payload ,{ params: { id } });
    if (error) throw new Error(error);
    return data!;
  },

  async deleteUser(id: string): Promise<void> {
    const { status, error } = await apiClient.delete<void>(API_CONFIG.ENDPOINTS.USERS.DELETE,{ params: { id } });
    if (status < 200 || status >= 300) throw new Error(error || `Delete failed: ${status}`);
  }
};

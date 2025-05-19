
import { CreateUserPayload, UpdateUserPayload, UserDetails, UserListItem } from '@/types/rbac';

const API_URL = '/api/auth';

export const userService = {
  getUsers: async (): Promise<UserListItem[]> => {
    const response = await fetch(`${API_URL}/users`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  getUser: async (id: string): Promise<UserDetails> => {
    const response = await fetch(`${API_URL}/users/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  createUser: async (userData: CreateUserPayload): Promise<UserDetails> => {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  updateUser: async (id: string, userData: UpdateUserPayload): Promise<UserDetails> => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update user: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  deleteUser: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.statusText}`);
    }
  }
};

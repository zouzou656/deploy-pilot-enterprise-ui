
import { CreateRolePayload, Role, UpdateRolePayload } from '@/types/rbac';

const API_URL = '/api/auth';

export const roleService = {
  getRoles: async (): Promise<Role[]> => {
    const response = await fetch(`${API_URL}/roles`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch roles: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  getRole: async (id: string): Promise<Role> => {
    const response = await fetch(`${API_URL}/roles/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch role: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  createRole: async (roleData: CreateRolePayload): Promise<Role> => {
    const response = await fetch(`${API_URL}/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(roleData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create role: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  updateRole: async (id: string, roleData: UpdateRolePayload): Promise<Role> => {
    const response = await fetch(`${API_URL}/roles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(roleData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update role: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  deleteRole: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/roles/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete role: ${response.statusText}`);
    }
  }
};

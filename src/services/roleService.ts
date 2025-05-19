
import { CreateRolePayload, Role, UpdateRolePayload } from '@/types/rbac';
import useRBACStore from '@/stores/rbacStore';

const API_URL = '/api/auth';

export const roleService = {
  getRoles: async (): Promise<Role[]> => {
    try {
      // Try to use the backend API first
      const response = await fetch(`${API_URL}/roles`);
      
      if (response.ok) {
        return response.json();
      } else {
        // Fallback to local store if API fails
        console.warn('API call failed, using local store data instead');
        // Get roles directly from the store to ensure we have data
        const roles = useRBACStore.getState().roles;
        
        if (roles.length === 0) {
          // If roles array is empty, try to fetch them
          await useRBACStore.getState().fetchRoles();
        }
        
        return useRBACStore.getState().roles;
      }
    } catch (error) {
      // Fallback to local store on error
      console.error('API error, using local store data instead:', error);
      // Get roles directly from the store to ensure we have data
      const roles = useRBACStore.getState().roles;
      
      if (roles.length === 0) {
        // If roles array is empty, try to fetch them
        await useRBACStore.getState().fetchRoles();
      }
      
      return useRBACStore.getState().roles;
    }
  },
  
  getRole: async (id: string): Promise<Role> => {
    try {
      // Try to use the backend API first
      const response = await fetch(`${API_URL}/roles/${id}`);
      
      if (response.ok) {
        return response.json();
      } else {
        // Fallback to local store if API fails
        console.warn('API call failed, using local store data instead');
        const { fetchRole } = useRBACStore.getState();
        return await fetchRole(id);
      }
    } catch (error) {
      // Fallback to local store on error
      console.error('API error, using local store data instead:', error);
      const { fetchRole } = useRBACStore.getState();
      return await fetchRole(id);
    }
  },
  
  createRole: async (roleData: CreateRolePayload): Promise<Role> => {
    try {
      // Try to use the backend API first
      const response = await fetch(`${API_URL}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleData),
      });
      
      if (response.ok) {
        return response.json();
      } else {
        // Fallback to local store if API fails
        console.warn('API call failed, using local store data instead');
        const { createRole } = useRBACStore.getState();
        return await createRole({
          name: roleData.name,  // Make sure required fields are passed
          permissions: roleData.permissions,
          description: roleData.description
        });
      }
    } catch (error) {
      // Fallback to local store on error
      console.error('API error, using local store data instead:', error);
      const { createRole } = useRBACStore.getState();
      return await createRole({
        name: roleData.name,  // Make sure required fields are passed
        permissions: roleData.permissions,
        description: roleData.description
      });
    }
  },
  
  updateRole: async (id: string, roleData: UpdateRolePayload): Promise<Role> => {
    try {
      // Try to use the backend API first
      const response = await fetch(`${API_URL}/roles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleData),
      });
      
      if (response.ok) {
        return response.json();
      } else {
        // Fallback to local store if API fails
        console.warn('API call failed, using local store data instead');
        const { updateRole } = useRBACStore.getState();
        return await updateRole(id, roleData);
      }
    } catch (error) {
      // Fallback to local store on error
      console.error('API error, using local store data instead:', error);
      const { updateRole } = useRBACStore.getState();
      return await updateRole(id, roleData);
    }
  },
  
  deleteRole: async (id: string): Promise<void> => {
    try {
      // Try to use the backend API first
      const response = await fetch(`${API_URL}/roles/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        // Fallback to local store if API fails
        console.warn('API call failed, using local store data instead');
        const { deleteRole } = useRBACStore.getState();
        await deleteRole(id);
      }
    } catch (error) {
      // Fallback to local store on error
      console.error('API error, using local store data instead:', error);
      const { deleteRole } = useRBACStore.getState();
      await deleteRole(id);
    }
  }
};

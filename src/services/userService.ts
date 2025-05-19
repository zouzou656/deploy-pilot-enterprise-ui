
import { CreateUserPayload, UpdateUserPayload, UserDetails, UserListItem } from '@/types/rbac';
import useRBACStore from '@/stores/rbacStore';

const API_URL = '/api/auth';

export const userService = {
  getUsers: async (): Promise<UserListItem[]> => {
    try {
      // Try to use the backend API first
      const response = await fetch(`${API_URL}/users`);
      
      if (response.ok) {
        return response.json();
      } else {
        // Fallback to local store if API fails
        console.warn('API call failed, using local store data instead');
        // Get users directly from the store to ensure we have data
        const users = useRBACStore.getState().users;
        
        if (users.length === 0) {
          // If users array is empty, try to fetch them
          await useRBACStore.getState().fetchUsers();
        }
        
        return useRBACStore.getState().users;
      }
    } catch (error) {
      // Fallback to local store on error
      console.error('API error, using local store data instead:', error);
      // Get users directly from the store to ensure we have data
      const users = useRBACStore.getState().users;
      
      if (users.length === 0) {
        // If users array is empty, try to fetch them
        await useRBACStore.getState().fetchUsers();
      }
      
      return useRBACStore.getState().users;
    }
  },
  
  getUser: async (id: string): Promise<UserDetails> => {
    try {
      // Try to use the backend API first
      const response = await fetch(`${API_URL}/users/${id}`);
      
      if (response.ok) {
        return response.json();
      } else {
        // Fallback to local store if API fails
        console.warn('API call failed, using local store data instead');
        const { fetchUser } = useRBACStore.getState();
        return await fetchUser(id);
      }
    } catch (error) {
      // Fallback to local store on error
      console.error('API error, using local store data instead:', error);
      const { fetchUser } = useRBACStore.getState();
      return await fetchUser(id);
    }
  },
  
  createUser: async (userData: CreateUserPayload): Promise<UserDetails> => {
    try {
      // Try to use the backend API first
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (response.ok) {
        return response.json();
      } else {
        // Fallback to local store if API fails
        console.warn('API call failed, using local store data instead');
        const { createUser } = useRBACStore.getState();
        return await createUser({
          email: userData.email,  // Make sure required fields are passed
          password: userData.password,
          roleIds: userData.roleIds,
          firstName: userData.firstName,
          lastName: userData.lastName,
          status: userData.status
        });
      }
    } catch (error) {
      // Fallback to local store on error
      console.error('API error, using local store data instead:', error);
      const { createUser } = useRBACStore.getState();
      return await createUser({
        email: userData.email,  // Make sure required fields are passed
        password: userData.password,
        roleIds: userData.roleIds,
        firstName: userData.firstName,
        lastName: userData.lastName,
        status: userData.status
      });
    }
  },
  
  updateUser: async (id: string, userData: UpdateUserPayload): Promise<UserDetails> => {
    try {
      // Try to use the backend API first
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (response.ok) {
        return response.json();
      } else {
        // Fallback to local store if API fails
        console.warn('API call failed, using local store data instead');
        const { updateUser } = useRBACStore.getState();
        return await updateUser(id, userData);
      }
    } catch (error) {
      // Fallback to local store on error
      console.error('API error, using local store data instead:', error);
      const { updateUser } = useRBACStore.getState();
      return await updateUser(id, userData);
    }
  },
  
  deleteUser: async (id: string): Promise<void> => {
    try {
      // Try to use the backend API first
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        // Fallback to local store if API fails
        console.warn('API call failed, using local store data instead');
        const { deleteUser } = useRBACStore.getState();
        await deleteUser(id);
      }
    } catch (error) {
      // Fallback to local store on error
      console.error('API error, using local store data instead:', error);
      const { deleteUser } = useRBACStore.getState();
      await deleteUser(id);
    }
  }
};

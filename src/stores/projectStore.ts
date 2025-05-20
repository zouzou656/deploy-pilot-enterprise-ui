
import { create } from 'zustand';
import { Project, ProjectEnvironment, FileOverride, ProjectUser, ProjectEnvironmentUser } from '@/types/project';

// Mock data
const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'OSB Integration',
    description: 'Main OSB integration project',
    gitRepoUrl: 'https://github.com/company/osb-integration.git',
    gitUsername: 'ci-user',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'user-1'
  },
  {
    id: 'proj-2',
    name: 'API Gateway',
    description: 'API Gateway configurations',
    gitRepoUrl: 'https://github.com/company/api-gateway.git',
    gitUsername: 'ci-user',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'user-2'
  }
];

const mockEnvironments: ProjectEnvironment[] = [
  {
    id: 'env-1',
    projectId: 'proj-1',
    name: 'DEV',
    host: 'dev-wls.example.com',
    port: 7001,
    username: 'admin',
    isProduction: false,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'env-2',
    projectId: 'proj-1',
    name: 'UAT',
    host: 'uat-wls.example.com',
    port: 7001,
    username: 'admin',
    isProduction: false,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'env-3',
    projectId: 'proj-1',
    name: 'PROD',
    host: 'prod-wls.example.com',
    port: 7001,
    username: 'admin',
    isProduction: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'env-4',
    projectId: 'proj-2',
    name: 'DEV',
    host: 'dev-api.example.com',
    port: 7001,
    username: 'admin',
    isProduction: false,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockOverrides: FileOverride[] = [
  {
    id: 'override-1',
    environmentId: 'env-1',
    filename: 'service1.bix',
    fileType: 'BIX',
    originalValue: '192.168.1.100',
    overrideValue: '10.0.0.5',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'user-1'
  },
  {
    id: 'override-2',
    environmentId: 'env-2',
    filename: 'service1.bix',
    fileType: 'BIX',
    originalValue: '192.168.1.100',
    overrideValue: '10.0.0.10',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'user-2'
  }
];

const mockProjectUsers: ProjectUser[] = [
  {
    projectId: 'proj-1',
    userId: 'user-1',
    role: 'ADMIN'
  },
  {
    projectId: 'proj-1',
    userId: 'user-2',
    role: 'DEVELOPER'
  },
  {
    projectId: 'proj-2',
    userId: 'user-1',
    role: 'DEVELOPER'
  }
];

const mockEnvironmentUsers: ProjectEnvironmentUser[] = [
  {
    environmentId: 'env-1',
    userId: 'user-1',
    canManageOverrides: true
  },
  {
    environmentId: 'env-2',
    userId: 'user-1',
    canManageOverrides: true
  },
  {
    environmentId: 'env-3',
    userId: 'user-1',
    canManageOverrides: false
  },
  {
    environmentId: 'env-1',
    userId: 'user-2',
    canManageOverrides: true
  }
];

interface ProjectState {
  projects: Project[];
  environments: ProjectEnvironment[];
  fileOverrides: FileOverride[];
  projectUsers: ProjectUser[];
  environmentUsers: ProjectEnvironmentUser[];
  selectedProject: Project | null;
  isLoading: boolean;
  error: string | null;
}

interface ProjectActions {
  fetchProjects: () => Promise<void>;
  fetchUserProjects: (userId: string) => Promise<Project[]>;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Project>;
  updateProject: (id: string, project: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  
  fetchEnvironments: (projectId: string) => Promise<ProjectEnvironment[]>;
  createEnvironment: (env: Omit<ProjectEnvironment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ProjectEnvironment>;
  updateEnvironment: (id: string, env: Partial<ProjectEnvironment>) => Promise<ProjectEnvironment>;
  deleteEnvironment: (id: string) => Promise<void>;
  
  fetchFileOverrides: (environmentId: string) => Promise<FileOverride[]>;
  createFileOverride: (override: Omit<FileOverride, 'id' | 'createdAt' | 'updatedAt'>) => Promise<FileOverride>;
  updateFileOverride: (id: string, override: Partial<FileOverride>) => Promise<FileOverride>;
  deleteFileOverride: (id: string) => Promise<void>;
  
  assignUserToProject: (projectId: string, userId: string, role: 'ADMIN' | 'DEVELOPER' | 'VIEWER') => Promise<void>;
  removeUserFromProject: (projectId: string, userId: string) => Promise<void>;
  
  assignUserToEnvironment: (environmentId: string, userId: string, canManageOverrides: boolean) => Promise<void>;
  removeUserFromEnvironment: (environmentId: string, userId: string) => Promise<void>;
  
  setSelectedProject: (project: Project | null) => void;
}

const useProjectStore = create<ProjectState & ProjectActions>()((set, get) => ({
  projects: mockProjects,
  environments: mockEnvironments,
  fileOverrides: mockOverrides,
  projectUsers: mockProjectUsers,
  environmentUsers: mockEnvironmentUsers,
  selectedProject: null,
  isLoading: false,
  error: null,
  
  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ projects: mockProjects, isLoading: false });
      console.log('API request that would be made:', {
        method: 'GET',
        url: '/api/projects',
      });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
    }
  },
  
  fetchUserProjects: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const userProjectIds = get().projectUsers
        .filter(pu => pu.userId === userId)
        .map(pu => pu.projectId);
      
      const userProjects = get().projects
        .filter(project => userProjectIds.includes(project.id));
      
      set({ isLoading: false });
      
      console.log('API request that would be made:', {
        method: 'GET',
        url: `/api/users/${userId}/projects`,
      });
      
      return userProjects;
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  createProject: async (project) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 700));
      
      const newProject: Project = {
        id: `proj-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...project
      };
      
      set(state => ({
        projects: [...state.projects, newProject],
        isLoading: false
      }));
      
      console.log('API request that would be made:', {
        method: 'POST',
        url: '/api/projects',
        body: project
      });
      
      return newProject;
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  updateProject: async (id, project) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const updatedProjects = get().projects.map(p => 
        p.id === id 
          ? { ...p, ...project, updatedAt: new Date().toISOString() } 
          : p
      );
      
      set({ projects: updatedProjects, isLoading: false });
      
      const updatedProject = updatedProjects.find(p => p.id === id);
      if (!updatedProject) throw new Error('Project not found after update');
      
      console.log('API request that would be made:', {
        method: 'PUT',
        url: `/api/projects/${id}`,
        body: project
      });
      
      return updatedProject;
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  deleteProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      set(state => ({
        projects: state.projects.filter(p => p.id !== id),
        isLoading: false
      }));
      
      console.log('API request that would be made:', {
        method: 'DELETE',
        url: `/api/projects/${id}`
      });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  fetchEnvironments: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const projectEnvironments = get().environments
        .filter(env => env.projectId === projectId);
      
      set({ isLoading: false });
      
      console.log('API request that would be made:', {
        method: 'GET',
        url: `/api/projects/${projectId}/environments`,
      });
      
      return projectEnvironments;
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  createEnvironment: async (env) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 700));
      
      const newEnvironment: ProjectEnvironment = {
        id: `env-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...env
      };
      
      set(state => ({
        environments: [...state.environments, newEnvironment],
        isLoading: false
      }));
      
      console.log('API request that would be made:', {
        method: 'POST',
        url: `/api/projects/${env.projectId}/environments`,
        body: env
      });
      
      return newEnvironment;
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  updateEnvironment: async (id, env) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const updatedEnvironments = get().environments.map(e => 
        e.id === id 
          ? { ...e, ...env, updatedAt: new Date().toISOString() } 
          : e
      );
      
      set({ environments: updatedEnvironments, isLoading: false });
      
      const updatedEnvironment = updatedEnvironments.find(e => e.id === id);
      if (!updatedEnvironment) throw new Error('Environment not found after update');
      
      console.log('API request that would be made:', {
        method: 'PUT',
        url: `/api/environments/${id}`,
        body: env
      });
      
      return updatedEnvironment;
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  deleteEnvironment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      set(state => ({
        environments: state.environments.filter(e => e.id !== id),
        isLoading: false
      }));
      
      console.log('API request that would be made:', {
        method: 'DELETE',
        url: `/api/environments/${id}`
      });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  fetchFileOverrides: async (environmentId) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const envOverrides = get().fileOverrides
        .filter(override => override.environmentId === environmentId);
      
      set({ isLoading: false });
      
      console.log('API request that would be made:', {
        method: 'GET',
        url: `/api/environments/${environmentId}/overrides`,
      });
      
      return envOverrides;
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  createFileOverride: async (override) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 700));
      
      const newOverride: FileOverride = {
        id: `override-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...override
      };
      
      set(state => ({
        fileOverrides: [...state.fileOverrides, newOverride],
        isLoading: false
      }));
      
      console.log('API request that would be made:', {
        method: 'POST',
        url: `/api/environments/${override.environmentId}/overrides`,
        body: override
      });
      
      return newOverride;
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  updateFileOverride: async (id, override) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const updatedOverrides = get().fileOverrides.map(o => 
        o.id === id 
          ? { ...o, ...override, updatedAt: new Date().toISOString() } 
          : o
      );
      
      set({ fileOverrides: updatedOverrides, isLoading: false });
      
      const updatedOverride = updatedOverrides.find(o => o.id === id);
      if (!updatedOverride) throw new Error('File override not found after update');
      
      console.log('API request that would be made:', {
        method: 'PUT',
        url: `/api/overrides/${id}`,
        body: override
      });
      
      return updatedOverride;
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  deleteFileOverride: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      set(state => ({
        fileOverrides: state.fileOverrides.filter(o => o.id !== id),
        isLoading: false
      }));
      
      console.log('API request that would be made:', {
        method: 'DELETE',
        url: `/api/overrides/${id}`
      });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  assignUserToProject: async (projectId, userId, role) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Check if assignment already exists
      const existingAssignment = get().projectUsers.find(
        pu => pu.projectId === projectId && pu.userId === userId
      );
      
      if (existingAssignment) {
        // Update role
        const updatedProjectUsers = get().projectUsers.map(pu => 
          pu.projectId === projectId && pu.userId === userId
            ? { ...pu, role }
            : pu
        );
        
        set({ projectUsers: updatedProjectUsers, isLoading: false });
        
        console.log('API request that would be made:', {
          method: 'PUT',
          url: `/api/projects/${projectId}/users/${userId}`,
          body: { role }
        });
      } else {
        // Create new assignment
        const newProjectUser: ProjectUser = {
          projectId,
          userId,
          role
        };
        
        set(state => ({
          projectUsers: [...state.projectUsers, newProjectUser],
          isLoading: false
        }));
        
        console.log('API request that would be made:', {
          method: 'POST',
          url: `/api/projects/${projectId}/users`,
          body: { userId, role }
        });
      }
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  removeUserFromProject: async (projectId, userId) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      set(state => ({
        projectUsers: state.projectUsers.filter(
          pu => !(pu.projectId === projectId && pu.userId === userId)
        ),
        isLoading: false
      }));
      
      console.log('API request that would be made:', {
        method: 'DELETE',
        url: `/api/projects/${projectId}/users/${userId}`
      });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  assignUserToEnvironment: async (environmentId, userId, canManageOverrides) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Check if assignment already exists
      const existingAssignment = get().environmentUsers.find(
        eu => eu.environmentId === environmentId && eu.userId === userId
      );
      
      if (existingAssignment) {
        // Update permissions
        const updatedEnvironmentUsers = get().environmentUsers.map(eu => 
          eu.environmentId === environmentId && eu.userId === userId
            ? { ...eu, canManageOverrides }
            : eu
        );
        
        set({ environmentUsers: updatedEnvironmentUsers, isLoading: false });
        
        console.log('API request that would be made:', {
          method: 'PUT',
          url: `/api/environments/${environmentId}/users/${userId}`,
          body: { canManageOverrides }
        });
      } else {
        // Create new assignment
        const newEnvironmentUser: ProjectEnvironmentUser = {
          environmentId,
          userId,
          canManageOverrides
        };
        
        set(state => ({
          environmentUsers: [...state.environmentUsers, newEnvironmentUser],
          isLoading: false
        }));
        
        console.log('API request that would be made:', {
          method: 'POST',
          url: `/api/environments/${environmentId}/users`,
          body: { userId, canManageOverrides }
        });
      }
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  removeUserFromEnvironment: async (environmentId, userId) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      set(state => ({
        environmentUsers: state.environmentUsers.filter(
          eu => !(eu.environmentId === environmentId && eu.userId === userId)
        ),
        isLoading: false
      }));
      
      console.log('API request that would be made:', {
        method: 'DELETE',
        url: `/api/environments/${environmentId}/users/${userId}`
      });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  setSelectedProject: (project) => {
    set({ selectedProject: project });
  }
}));

export default useProjectStore;

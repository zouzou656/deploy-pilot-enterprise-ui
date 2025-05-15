
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProjectSettings, Environment, DeploymentMode, MetadataConfig, WebLogicDeploymentConfig } from '../types';

interface SettingsStore {
  projectSettings: ProjectSettings | null;
  metadataConfig: MetadataConfig | null;
  weblogicConfig: WebLogicDeploymentConfig | null;
  isLoading: boolean;
  error: string | null;
  
  fetchProjectSettings: () => Promise<void>;
  updateProjectSettings: (settings: Partial<ProjectSettings>) => Promise<void>;
  fetchMetadataConfig: () => Promise<void>;
  updateMetadataConfig: (config: Partial<MetadataConfig>) => Promise<void>;
  fetchWeblogicConfig: () => Promise<void>;
  updateWeblogicConfig: (config: Partial<WebLogicDeploymentConfig>) => Promise<void>;
  setDeploymentMode: (mode: DeploymentMode) => Promise<void>;
  addEnvironment: (env: Environment) => Promise<void>;
  removeEnvironment: (envId: string) => Promise<void>;
  updateEnvironment: (envId: string, env: Partial<Environment>) => Promise<void>;
  exportAllSettings: () => string;
  importAllSettings: (jsonStr: string) => Promise<void>;
}

// Mock initial data
const mockProjectSettings: ProjectSettings = {
  id: 'project-1',
  name: 'OSB Integration Platform',
  description: 'Enterprise Oracle Service Bus CI/CD platform',
  artifactsPath: 'C:\\OSB\\artifacts',
  deployToWeblogic: true,
  overrideIPs: false,
  deploymentMode: 'onCommit',
  environments: [
    { id: 'env-1', name: 'DEV', baseUrl: 'https://dev-api.example.com', isProduction: false },
    { id: 'env-2', name: 'QA', baseUrl: 'https://qa-api.example.com', isProduction: false },
    { id: 'env-3', name: 'STAGING', baseUrl: 'https://staging-api.example.com', isProduction: false },
    { id: 'env-4', name: 'PROD', baseUrl: 'https://api.example.com', isProduction: true }
  ],
  created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  updated: new Date().toISOString()
};

const mockMetadataConfig: MetadataConfig = {
  ipMappings: {
    'dev.internal.ip': '192.168.0.100',
    'qa.internal.ip': '192.168.0.101',
    'staging.internal.ip': '192.168.0.102',
    'prod.internal.ip': '10.0.0.50'
  },
  serviceEndpoints: {
    'auth-service': '/api/auth',
    'user-service': '/api/users',
    'payment-service': '/api/payments',
    'notification-service': '/api/notifications'
  },
  environment: 'DEV'
};

const mockWeblogicConfig: WebLogicDeploymentConfig = {
  host: 'weblogic-server.example.com',
  port: 7001,
  username: 'weblogic_admin',
  domain: 'osb_domain',
  targets: ['AdminServer', 'osb_cluster']
};

const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      projectSettings: null,
      metadataConfig: null,
      weblogicConfig: null,
      isLoading: false,
      error: null,
      
      fetchProjectSettings: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 800));
          set({ projectSettings: mockProjectSettings, isLoading: false });
        } catch (error: any) {
          set({ error: error.message || 'Failed to fetch project settings', isLoading: false });
        }
      },
      
      updateProjectSettings: async (settings: Partial<ProjectSettings>) => {
        set({ isLoading: true, error: null });
        
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set(state => ({
            projectSettings: state.projectSettings 
              ? { 
                  ...state.projectSettings, 
                  ...settings,
                  updated: new Date().toISOString()
                }
              : null,
            isLoading: false
          }));
        } catch (error: any) {
          set({ error: error.message || 'Failed to update project settings', isLoading: false });
        }
      },
      
      fetchMetadataConfig: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 600));
          set({ metadataConfig: mockMetadataConfig, isLoading: false });
        } catch (error: any) {
          set({ error: error.message || 'Failed to fetch metadata config', isLoading: false });
        }
      },
      
      updateMetadataConfig: async (config: Partial<MetadataConfig>) => {
        set({ isLoading: true, error: null });
        
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 800));
          
          set(state => ({
            metadataConfig: state.metadataConfig 
              ? { ...state.metadataConfig, ...config }
              : null,
            isLoading: false
          }));
        } catch (error: any) {
          set({ error: error.message || 'Failed to update metadata config', isLoading: false });
        }
      },
      
      fetchWeblogicConfig: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 700));
          set({ weblogicConfig: mockWeblogicConfig, isLoading: false });
        } catch (error: any) {
          set({ error: error.message || 'Failed to fetch WebLogic config', isLoading: false });
        }
      },
      
      updateWeblogicConfig: async (config: Partial<WebLogicDeploymentConfig>) => {
        set({ isLoading: true, error: null });
        
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 900));
          
          set(state => ({
            weblogicConfig: state.weblogicConfig 
              ? { ...state.weblogicConfig, ...config }
              : null,
            isLoading: false
          }));
        } catch (error: any) {
          set({ error: error.message || 'Failed to update WebLogic config', isLoading: false });
        }
      },
      
      setDeploymentMode: async (mode: DeploymentMode) => {
        set({ isLoading: true, error: null });
        
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set(state => ({
            projectSettings: state.projectSettings 
              ? { 
                  ...state.projectSettings, 
                  deploymentMode: mode,
                  updated: new Date().toISOString()
                }
              : null,
            isLoading: false
          }));
        } catch (error: any) {
          set({ error: error.message || 'Failed to set deployment mode', isLoading: false });
        }
      },
      
      addEnvironment: async (env: Environment) => {
        set({ isLoading: true, error: null });
        
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 800));
          
          set(state => ({
            projectSettings: state.projectSettings 
              ? { 
                  ...state.projectSettings, 
                  environments: [...state.projectSettings.environments, env],
                  updated: new Date().toISOString()
                }
              : null,
            isLoading: false
          }));
        } catch (error: any) {
          set({ error: error.message || 'Failed to add environment', isLoading: false });
        }
      },
      
      removeEnvironment: async (envId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 700));
          
          set(state => ({
            projectSettings: state.projectSettings 
              ? { 
                  ...state.projectSettings, 
                  environments: state.projectSettings.environments.filter(e => e.id !== envId),
                  updated: new Date().toISOString()
                }
              : null,
            isLoading: false
          }));
        } catch (error: any) {
          set({ error: error.message || 'Failed to remove environment', isLoading: false });
        }
      },
      
      updateEnvironment: async (envId: string, env: Partial<Environment>) => {
        set({ isLoading: true, error: null });
        
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 600));
          
          set(state => ({
            projectSettings: state.projectSettings 
              ? { 
                  ...state.projectSettings, 
                  environments: state.projectSettings.environments.map(e => 
                    e.id === envId ? { ...e, ...env } : e  
                  ),
                  updated: new Date().toISOString()
                }
              : null,
            isLoading: false
          }));
        } catch (error: any) {
          set({ error: error.message || 'Failed to update environment', isLoading: false });
        }
      },
      
      exportAllSettings: () => {
        const { projectSettings, metadataConfig, weblogicConfig } = get();
        return JSON.stringify({
          projectSettings,
          metadataConfig,
          weblogicConfig,
          exportDate: new Date().toISOString()
        }, null, 2);
      },
      
      importAllSettings: async (jsonStr: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const settings = JSON.parse(jsonStr);
          
          // Validate structure
          if (!settings.projectSettings) {
            throw new Error('Invalid settings file: missing projectSettings');
          }
          
          // Mock API call for server validation
          await new Promise(resolve => setTimeout(resolve, 1200));
          
          set({ 
            projectSettings: settings.projectSettings,
            metadataConfig: settings.metadataConfig || null,
            weblogicConfig: settings.weblogicConfig || null,
            isLoading: false
          });
        } catch (error: any) {
          set({ 
            error: `Failed to import settings: ${error.message || 'Invalid JSON'}`, 
            isLoading: false 
          });
        }
      }
    }),
    {
      name: 'osb-ci-settings-storage',
    }
  )
);

export default useSettingsStore;

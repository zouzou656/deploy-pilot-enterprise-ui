
import { create } from 'zustand';
import { Deployment, DeploymentLog, DeploymentStatus, JarFile } from '../types';

interface DeploymentStore {
  deployments: Deployment[];
  currentDeployment: Deployment | null;
  logs: DeploymentLog[];
  jarFiles: JarFile[];
  isDeploying: boolean;
  fetchingLogs: boolean;
  
  fetchDeployments: () => Promise<void>;
  fetchDeploymentById: (id: string) => Promise<void>;
  createDeployment: (projectId: string, environment: string, branch: string) => Promise<void>;
  cancelDeployment: (id: string) => Promise<void>;
  fetchLogs: (deploymentId: string, lastLogId?: string) => Promise<void>;
  clearCurrentDeployment: () => void;
  fetchJarFiles: () => Promise<void>;
  generateJar: (projectId: string, branch: string) => Promise<void>;
}

// Mock data generators
const generateMockDeployments = (): Deployment[] => {
  const environments = ['DEV', 'QA', 'STAGING', 'PROD'];
  const statuses: DeploymentStatus[] = ['COMPLETED', 'FAILED', 'IN_PROGRESS', 'PENDING'];
  
  return Array.from({ length: 10 }).map((_, i) => ({
    id: `deploy-${i + 1}`,
    projectId: 'proj-1',
    environment: environments[Math.floor(Math.random() * environments.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    startTime: new Date(Date.now() - Math.floor(Math.random() * 10000000)).toISOString(),
    endTime: Math.random() > 0.2 
      ? new Date(Date.now() - Math.floor(Math.random() * 1000000)).toISOString() 
      : undefined,
    triggeredBy: ['admin', 'developer', 'automation'][Math.floor(Math.random() * 3)],
    commitId: `${Math.random().toString(36).substring(2, 8)}`,
    branch: ['main', 'develop', 'feature/new-api'][Math.floor(Math.random() * 3)],
    jarFileName: `osb-app-${Math.floor(Math.random() * 100)}.jar`
  }));
};

const generateMockLogs = (deploymentId: string): DeploymentLog[] => {
  const levels = ['INFO', 'WARNING', 'ERROR', 'DEBUG'] as const;
  const messages = [
    'Starting deployment process',
    'Cloning repository',
    'Building application',
    'Running tests',
    'Generating JAR',
    'Deploying to WebLogic',
    'Encountered error during compilation',
    'Successfully deployed to server',
    'Failed to connect to WebLogic server',
    'Deployment completed'
  ];
  
  return Array.from({ length: 50 }).map((_, i) => ({
    id: `log-${deploymentId}-${i}`,
    deploymentId,
    timestamp: new Date(Date.now() - (50 - i) * 10000).toISOString(),
    level: levels[Math.floor(Math.random() * levels.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
    source: ['git', 'maven', 'weblogic', 'system'][Math.floor(Math.random() * 4)]
  }));
};

const generateMockJarFiles = (): JarFile[] => {
  const environments = ['DEV', 'QA', 'STAGING', 'PROD'];
  const statuses = ['AVAILABLE', 'DEPLOYED', 'FAILED', 'IN_PROGRESS'] as const;
  
  return Array.from({ length: 5 }).map((_, i) => ({
    fileName: `osb-app-${new Date().getTime() - i * 86400000}.jar`,
    size: Math.floor(Math.random() * 10000000),
    created: new Date(Date.now() - i * 86400000).toISOString(),
    deployedTo: Math.random() > 0.3 
      ? [environments[Math.floor(Math.random() * environments.length)]] 
      : undefined,
    deploymentId: Math.random() > 0.3 ? `deploy-${i + 1}` : undefined,
    status: statuses[Math.floor(Math.random() * statuses.length)]
  }));
};

const useDeploymentStore = create<DeploymentStore>((set, get) => ({
  deployments: [],
  currentDeployment: null,
  logs: [],
  jarFiles: [],
  isDeploying: false,
  fetchingLogs: false,
  
  fetchDeployments: async () => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    set({ deployments: generateMockDeployments() });
  },
  
  fetchDeploymentById: async (id: string) => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 800));
    const mockDeployments = generateMockDeployments();
    const deployment = mockDeployments.find(d => d.id === id) || mockDeployments[0];
    set({ currentDeployment: deployment });
    
    // Also fetch logs
    get().fetchLogs(deployment.id);
  },
  
  createDeployment: async (projectId: string, environment: string, branch: string) => {
    set({ isDeploying: true });
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newDeployment: Deployment = {
      id: `deploy-${Date.now()}`,
      projectId,
      environment,
      status: 'IN_PROGRESS',
      startTime: new Date().toISOString(),
      triggeredBy: 'admin',
      commitId: Math.random().toString(36).substring(2, 8),
      branch
    };
    
    set(state => ({ 
      deployments: [newDeployment, ...state.deployments],
      currentDeployment: newDeployment,
      isDeploying: false
    }));
    
    // Start streaming logs
    get().fetchLogs(newDeployment.id);
    
    // Mock deployment progression
    setTimeout(() => {
      const success = Math.random() > 0.3;
      set(state => ({
        deployments: state.deployments.map(d => 
          d.id === newDeployment.id
            ? { 
                ...d, 
                status: success ? 'COMPLETED' : 'FAILED',
                endTime: new Date().toISOString(),
                jarFileName: success ? `osb-app-${Date.now()}.jar` : undefined
              }
            : d
        ),
        currentDeployment: state.currentDeployment && state.currentDeployment.id === newDeployment.id
          ? { 
              ...state.currentDeployment, 
              status: success ? 'COMPLETED' : 'FAILED',
              endTime: new Date().toISOString(),
              jarFileName: success ? `osb-app-${Date.now()}.jar` : undefined
            }
          : state.currentDeployment
      }));
    }, 15000);
  },
  
  cancelDeployment: async (id: string) => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    set(state => ({
      deployments: state.deployments.map(d => 
        d.id === id ? { ...d, status: 'CANCELLED', endTime: new Date().toISOString() } : d
      ),
      currentDeployment: state.currentDeployment && state.currentDeployment.id === id
        ? { ...state.currentDeployment, status: 'CANCELLED', endTime: new Date().toISOString() }
        : state.currentDeployment
    }));
  },
  
  fetchLogs: async (deploymentId: string, lastLogId?: string) => {
    set({ fetchingLogs: true });
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockLogs = generateMockLogs(deploymentId);
    
    if (lastLogId) {
      // Simulate real-time log streaming by getting only newer logs
      const lastIndex = mockLogs.findIndex(log => log.id === lastLogId);
      if (lastIndex !== -1 && lastIndex < mockLogs.length - 1) {
        set(state => ({ 
          logs: [...state.logs, ...mockLogs.slice(lastIndex + 1)],
          fetchingLogs: false
        }));
        return;
      }
    }
    
    set({ logs: mockLogs, fetchingLogs: false });
  },
  
  clearCurrentDeployment: () => {
    set({ currentDeployment: null, logs: [] });
  },
  
  fetchJarFiles: async () => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 800));
    set({ jarFiles: generateMockJarFiles() });
  },
  
  generateJar: async (projectId: string, branch: string) => {
    set({ isDeploying: true });
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newJarFile: JarFile = {
      fileName: `osb-app-${Date.now()}.jar`,
      size: Math.floor(Math.random() * 10000000),
      created: new Date().toISOString(),
      status: 'AVAILABLE'
    };
    
    set(state => ({ 
      jarFiles: [newJarFile, ...state.jarFiles],
      isDeploying: false
    }));
  }
}));

export default useDeploymentStore;

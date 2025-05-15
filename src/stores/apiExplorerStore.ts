
import { create } from 'zustand';

export type ApiExplorerTheme = 'light' | 'dark';

interface ApiExplorerState {
  selectedBranch: string;
  branches: string[];
  specUrl: string;
  isLoading: boolean;
  error: string | null;
  baseEndpoint: string;
  defaultBranch: string;
  theme: ApiExplorerTheme;
  remoteUrlOverride: string;
  
  // Actions
  setSelectedBranch: (branch: string) => void;
  setBranches: (branches: string[]) => void;
  setBaseEndpoint: (endpoint: string) => void;
  setDefaultBranch: (branch: string) => void;
  setTheme: (theme: ApiExplorerTheme) => void;
  setRemoteUrlOverride: (url: string) => void;
  fetchBranches: () => Promise<void>;
  fetchOpenApiSpec: () => Promise<void>;
  setError: (error: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

const useApiExplorerStore = create<ApiExplorerState>((set, get) => ({
  selectedBranch: 'main',
  branches: [],
  specUrl: '',
  isLoading: false,
  error: null,
  baseEndpoint: '/api/openapi',
  defaultBranch: 'main',
  theme: 'light',
  remoteUrlOverride: '',
  
  setSelectedBranch: (branch) => set({ selectedBranch: branch }),
  setBranches: (branches) => set({ branches }),
  setBaseEndpoint: (endpoint) => set({ baseEndpoint: endpoint }),
  setDefaultBranch: (branch) => set({ defaultBranch: branch, selectedBranch: branch }),
  setTheme: (theme) => set({ theme }),
  setRemoteUrlOverride: (url) => set({ remoteUrlOverride: url }),
  setError: (error) => set({ error }),
  setIsLoading: (isLoading) => set({ isLoading }),
  
  fetchBranches: async () => {
    const { baseEndpoint } = get();
    try {
      set({ isLoading: true, error: null });
      
      // In a real app, this would be an actual API call
      // For demo, we'll simulate with a timeout
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data for branches
      const mockBranches = ['main', 'develop', 'feature/api-updates', 'hotfix/auth-fix'];
      set({ branches: mockBranches, isLoading: false });
    } catch (error) {
      console.error('Error fetching branches:', error);
      set({ 
        error: 'Failed to fetch branches. Please try again later.', 
        isLoading: false 
      });
    }
  },
  
  fetchOpenApiSpec: async () => {
    const { baseEndpoint, selectedBranch, remoteUrlOverride } = get();
    try {
      set({ isLoading: true, error: null });
      
      const url = remoteUrlOverride || `${baseEndpoint}?branch=${selectedBranch}`;
      
      // For demo, we'll create a URL to a sample OpenAPI spec
      // In a real app, this would be the actual API URL
      const specUrl = selectedBranch === 'main' 
        ? 'https://petstore3.swagger.io/api/v3/openapi.json'
        : 'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/examples/v3.0/petstore.json';
      
      set({ specUrl, isLoading: false });
    } catch (error) {
      console.error('Error fetching OpenAPI spec:', error);
      set({ 
        error: 'Failed to fetch OpenAPI specification. Please try again later.', 
        isLoading: false 
      });
    }
  }
}));

export default useApiExplorerStore;

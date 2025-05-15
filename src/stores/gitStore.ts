
import { create } from 'zustand';
import { GitInfo, GitCommit, GitDiff } from '../types';

interface GitStore {
  gitInfo: GitInfo | null;
  isLoading: boolean;
  error: string | null;
  selectedBranch: string | null;
  selectedCommit: string | null;
  diffInfo: GitDiff | null;
  
  fetchGitInfo: () => Promise<void>;
  fetchBranches: () => Promise<string[]>;
  fetchCommits: (branch: string) => Promise<GitCommit[]>;
  fetchDiff: (commitId: string) => Promise<void>;
  checkoutBranch: (branch: string) => Promise<void>;
  selectBranch: (branch: string) => void;
  selectCommit: (commit: string) => void;
  pullLatestChanges: () => Promise<void>;
}

// Mock data
const mockBranches = ['main', 'develop', 'feature/osb-123', 'feature/new-api', 'hotfix/critical-bug'];

const generateMockCommits = (branch: string): GitCommit[] => {
  const authors = ['John Doe', 'Jane Smith', 'Alex Johnson', 'Sam Wilson'];
  const messagePrefixes = ['Add', 'Update', 'Fix', 'Refactor', 'Remove', 'Implement'];
  const messageComponents = [
    'user authentication',
    'deployment pipeline',
    'WebLogic integration',
    'settings UI',
    'error handling',
    'OSB configuration',
    'metadata parsing',
    'JAR generation',
    'environment variables',
    'API endpoints'
  ];
  
  return Array.from({ length: 20 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    return {
      id: `${branch.substring(0, 4)}${Math.random().toString(36).substring(2, 7)}`,
      message: `${messagePrefixes[Math.floor(Math.random() * messagePrefixes.length)]} ${messageComponents[Math.floor(Math.random() * messageComponents.length)]}`,
      author: authors[Math.floor(Math.random() * authors.length)],
      date: date.toISOString(),
      branch
    };
  });
};

const mockGitInfo: GitInfo = {
  currentBranch: 'develop',
  branches: mockBranches,
  commits: generateMockCommits('develop'),
  lastFetch: new Date().toISOString()
};

const useGitStore = create<GitStore>((set, get) => ({
  gitInfo: null,
  isLoading: false,
  error: null,
  selectedBranch: null,
  selectedCommit: null,
  diffInfo: null,
  
  fetchGitInfo: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 800));
      set({ 
        gitInfo: mockGitInfo,
        selectedBranch: mockGitInfo.currentBranch,
        isLoading: false
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch Git info', isLoading: false });
    }
  },
  
  fetchBranches: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 600));
      return mockBranches;
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch branches', isLoading: false });
      return [];
    } finally {
      set({ isLoading: false });
    }
  },
  
  fetchCommits: async (branch: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 700));
      const commits = generateMockCommits(branch);
      
      set(state => ({
        gitInfo: state.gitInfo ? {
          ...state.gitInfo,
          commits
        } : null
      }));
      
      return commits;
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch commits', isLoading: false });
      return [];
    } finally {
      set({ isLoading: false });
    }
  },
  
  fetchDiff: async (commitId: string) => {
    set({ isLoading: true, error: null, diffInfo: null });
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock diff
      const mockDiff: GitDiff = {
        added: [
          'src/components/DeploymentPanel.tsx',
          'src/utils/weblogic-helpers.ts'
        ],
        removed: [
          'src/legacy/old-deployment.ts'
        ],
        modified: [
          'src/components/Dashboard.tsx',
          'src/stores/deploymentStore.ts',
          'README.md'
        ]
      };
      
      set({ diffInfo: mockDiff, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch diff', isLoading: false });
    }
  },
  
  checkoutBranch: async (branch: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const commits = generateMockCommits(branch);
      
      set(state => ({
        gitInfo: state.gitInfo ? {
          ...state.gitInfo,
          currentBranch: branch,
          commits
        } : null,
        selectedBranch: branch,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to checkout branch', isLoading: false });
    }
  },
  
  selectBranch: (branch: string) => {
    set({ selectedBranch: branch });
    
    // Also fetch commits for this branch
    get().fetchCommits(branch);
  },
  
  selectCommit: (commit: string) => {
    set({ selectedCommit: commit });
    
    // Also fetch diff for this commit
    get().fetchDiff(commit);
  },
  
  pullLatestChanges: async () => {
    const { selectedBranch } = get();
    if (!selectedBranch) return;
    
    set({ isLoading: true, error: null });
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate new mock commits to simulate pull
      const newCommits = [
        {
          id: `${selectedBranch.substring(0, 4)}${Math.random().toString(36).substring(2, 7)}`,
          message: 'New commit from remote',
          author: 'Remote User',
          date: new Date().toISOString(),
          branch: selectedBranch
        },
        ...generateMockCommits(selectedBranch).slice(0, -1)
      ];
      
      set(state => ({
        gitInfo: state.gitInfo ? {
          ...state.gitInfo,
          commits: newCommits,
          lastFetch: new Date().toISOString()
        } : null,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to pull latest changes', isLoading: false });
    }
  }
}));

export default useGitStore;

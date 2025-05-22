import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode
} from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createApiUrl, API_CONFIG } from '@/config/api.config';
import useAuthStore from '@/stores/authStore';
import { Project } from '@/types/project';

interface ProjectContextType {
  projects: Project[];
  selectedProject: Project | null;
  loading: boolean;
  error: string | null;
  selectProject: (projectId: string) => void;
  fetchProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const {
    token,
    refreshToken,
    isAuthenticated,
    loading: authLoading,
    refreshTokens
  } = useAuthStore();
  const navigate = useNavigate();

  // Memoized fetchProjects
  const fetchProjects = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
          createApiUrl(API_CONFIG.ENDPOINTS.PROJECTS.USER_PROJECTS),
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Project[] = await res.json();
      setProjects(data);

      // restore or pick selectedProject
      const savedId = localStorage.getItem('selectedProjectId');
      const pick =
          data.find(p => p.id === savedId) ||
          data[0] ||
          null;
      setSelectedProject(pick);
      if (pick) localStorage.setItem('selectedProjectId', pick.id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      toast.error('Failed to load projects');
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Run once when auth state resolves (login or silent refresh)
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchProjects();
    } else if (!token && refreshToken && !authLoading) {
      refreshTokens().catch(err => {
        console.error('Silent token refresh failed', err);
      });
    }
  }, [isAuthenticated, token, refreshToken, authLoading, fetchProjects, refreshTokens]);

  const selectProject = (projectId: string) => {
    const p = projects.find(x => x.id === projectId);
    if (p) {
      setSelectedProject(p);
      localStorage.setItem('selectedProjectId', projectId);
      toast.success(`Switched to project: ${p.name}`);
    }
  };

  return (
      <ProjectContext.Provider
          value={{
            projects,
            selectedProject,
            loading,
            error,
            selectProject,
            fetchProjects
          }}
      >
        {children}
      </ProjectContext.Provider>
  );
};

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

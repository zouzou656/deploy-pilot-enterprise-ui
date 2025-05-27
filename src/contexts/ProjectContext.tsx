// src/contexts/ProjectContext.tsx

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
import useAuthStore from '@/stores/authStore';
import { Project } from '@/types/project';
import { projectService } from '@/services/projectService';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    token,
    refreshToken,
    isAuthenticated,
    loading: authLoading,
    user,
    refreshTokens
  } = useAuthStore();
  const navigate = useNavigate();

  const fetchProjects = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const userId = user?.id;
      const data = await projectService.getProjects(userId);
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

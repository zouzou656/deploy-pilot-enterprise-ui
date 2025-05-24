import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react';
import { projectService } from '@/services/projectService';
import useAuthStore from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { Project } from '@/types/project';

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: Error | null;
  selectedProject: Project | null;
  selectProject: (projectId: string) => void;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuthStore();
  const { toast } = useToast();

  // Stable function to load all projects
  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const fetched = await projectService.getProjects();
      setProjects(fetched);

      // restore or pick default
      const savedId = localStorage.getItem('selectedProjectId');
      const found = fetched.find(p => p.id === savedId) ?? fetched[0] ?? null;
      setSelectedProject(found);
      if (found) {
        localStorage.setItem('selectedProjectId', found.id as string);
      }
    } catch (err: any) {
      setError(err);
      toast({
        title: 'Error loading projects',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Expose as refreshProjects
  const refreshProjects = loadProjects;

  // When user changes, load projects once
  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user, loadProjects]);

  // Stable function to select a project
  const selectProject = useCallback((projectId: string) => {
    const proj = projects.find(p => p.id === projectId) ?? null;
    setSelectedProject(proj);
    if (proj) {
      localStorage.setItem('selectedProjectId', proj.id as string);
    }
  }, [projects]);

  // Memoize the context value so callbacks stay stable
  const ctxValue = useMemo(() => ({
    projects,
    loading,
    error,
    selectedProject,
    selectProject,
    refreshProjects
  }), [projects, loading, error, selectedProject, selectProject, refreshProjects]);

  return (
      <ProjectContext.Provider value={ctxValue}>
        {children}
      </ProjectContext.Provider>
  );
};

export const useProject = (): ProjectContextType => {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return ctx;
};

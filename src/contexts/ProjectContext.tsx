
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Project } from '@/types/project';
import { projectService } from '@/services/projectService';
import useAuthStore from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuthStore();
  const { toast } = useToast();

  // Load projects when component mounts or user changes
  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  // Function to load projects from API
  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load all projects (we can filter by user later if needed)
      const fetchedProjects = await projectService.getProjects();
      setProjects(fetchedProjects);
      
      // Set selected project from localStorage or first project
      const savedProjectId = localStorage.getItem('selectedProjectId');
      
      if (savedProjectId && fetchedProjects.some(p => p.id === savedProjectId)) {
        const project = fetchedProjects.find(p => p.id === savedProjectId) || null;
        setSelectedProject(project);
      } else if (fetchedProjects.length > 0) {
        setSelectedProject(fetchedProjects[0]);
        localStorage.setItem('selectedProjectId', fetchedProjects[0].id as string);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
      setError(err instanceof Error ? err : new Error('Failed to load projects'));
      toast({
        title: "Error loading projects",
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const refreshProjects = async () => {
    await loadProjects();
  };
  
  // Function to select a project
  const selectProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId) || null;
    setSelectedProject(project);
    if (project) {
      localStorage.setItem('selectedProjectId', projectId);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        loading,
        error,
        selectedProject,
        selectProject,
        refreshProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

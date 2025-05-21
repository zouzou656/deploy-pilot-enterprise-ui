
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '@/types/project';
import { toast } from "sonner";
import { createApiUrl, API_CONFIG } from '@/config/api.config';
import useAuthStore from '@/stores/authStore';

interface ProjectContextType {
  projects: Project[];
  selectedProject: Project | null;
  loading: boolean;
  error: string | null;
  selectProject: (projectId: string) => void;
  fetchProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthStore();
  const navigate = useNavigate();

  // Fetch user's projects
  const fetchProjects = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(createApiUrl(API_CONFIG.ENDPOINTS.PROJECTS.USER_PROJECTS), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching projects: ${response.status}`);
      }
      
      const data = await response.json();
      setProjects(data);
      
      // Load saved project from localStorage if available
      const savedProjectId = localStorage.getItem('selectedProjectId');
      if (savedProjectId) {
        const savedProject = data.find(p => p.id === savedProjectId);
        if (savedProject) {
          setSelectedProject(savedProject);
        } else if (data.length > 0) {
          // If saved project doesn't exist anymore, select first available
          setSelectedProject(data[0]);
          localStorage.setItem('selectedProjectId', data[0].id);
        }
      } else if (data.length > 0) {
        // No saved project, select first available
        setSelectedProject(data[0]);
        localStorage.setItem('selectedProjectId', data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error("Failed to load projects");
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  };

  // Select a project and save to localStorage
  const selectProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      localStorage.setItem('selectedProjectId', projectId);
      toast.success(`Switched to project: ${project.name}`);
    }
  };

  // Initial fetch of projects
  useEffect(() => {
    if (token) {
      fetchProjects();
    }
  }, [token]);

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
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

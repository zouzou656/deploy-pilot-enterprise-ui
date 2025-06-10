
import { apiClient } from './api.client';
import { Project, CreateProjectDto, UpdateProjectDto } from '@/types/project';

export interface ProjectService {
  createProject(project: CreateProjectDto): Promise<Project>;
  getProject(id: string): Promise<Project>;
  updateProject(id: string, project: UpdateProjectDto): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  getUserProjects(userId: string): Promise<Project[]>;
  getProjects(): Promise<Project[]>;
}

export const projectService: ProjectService = {
  async createProject(project: CreateProjectDto): Promise<Project> {
    const response = await apiClient.post('/projects', project);
    return response.data;
  },

  async getProject(id: string): Promise<Project> {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },

  async updateProject(id: string, project: UpdateProjectDto): Promise<Project> {
    const response = await apiClient.put(`/projects/${id}`, project);
    return response.data;
  },

  async deleteProject(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  },

  async getUserProjects(userId: string): Promise<Project[]> {
    const response = await apiClient.get(`/projects/user/${userId}`);
    return response.data;
  },

  async getProjects(): Promise<Project[]> {
    const response = await apiClient.get('/projects');
    return response.data;
  }
};

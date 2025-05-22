
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProject } from '@/contexts/ProjectContext';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ProjectSelector: React.FC = () => {
  const { projects, selectedProject, selectProject, loading } = useProject();

  const handleProjectChange = (projectId: string) => {
    selectProject(projectId);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading projects...</span>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground">
          No projects available
        </div>
        <Link to="/projects">
          <Button variant="link" size="sm" className="text-primary">
            Create a project
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Project:</span>
      <Select
        value={selectedProject?.id || ''}
        onValueChange={handleProjectChange}
        disabled={loading}
      >
        <SelectTrigger className="w-[200px] h-9">
          <SelectValue placeholder="Select a project" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id || ''}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProjectSelector;

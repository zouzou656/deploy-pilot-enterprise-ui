import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { projectService } from "@/services/projectService";
import { environmentService } from "@/services/environmentService";
import { fileOverrideService } from "@/services/fileOverrideService";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, ChevronDown, ChevronRight, FolderOpen, Settings, Server, FileText } from "lucide-react";

import PageHeader from "@/components/ui-custom/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

import { Project, Environment, FileOverride } from "@/types/project";
import useAuthStore, { PERMISSIONS } from "@/stores/authStore";

const ProjectManagement: React.FC = () => {
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();

  const [projectSearch, setProjectSearch] = useState("");
  const [environmentSearch, setEnvironmentSearch] = useState("");
  const [fileOverrideSearch, setFileOverrideSearch] = useState("");
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [environmentsOpen, setEnvironmentsOpen] = useState(false);
  const [fileOverridesOpen, setFileOverridesOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>("");

  // Queries
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: projectService.getAllProjects,
  });

  const { data: allEnvironments = [] } = useQuery({
    queryKey: ["environments"],
    queryFn: () => environmentService.getEnvironmentsByProject(""),
    enabled: false, // We'll handle this manually
  });

  const { data: fileOverrides = [] } = useQuery({
    queryKey: ["fileOverrides", selectedProject],
    queryFn: () => fileOverrideService.getFileOverridesByEnvironment(selectedProject),
    enabled: !!selectedProject,
  });

  // Filter data
  const filteredProjects = Array.isArray(projects) ? projects.filter((p: Project) =>
    p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(projectSearch.toLowerCase())
  ) : [];

  const filteredEnvironments = Array.isArray(allEnvironments) ? allEnvironments.filter((e: Environment) =>
    e.name.toLowerCase().includes(environmentSearch.toLowerCase()) ||
    e.host.toLowerCase().includes(environmentSearch.toLowerCase())
  ) : [];

  const filteredFileOverrides = Array.isArray(fileOverrides) ? fileOverrides.filter((f: FileOverride) =>
    f.filePath.toLowerCase().includes(fileOverrideSearch.toLowerCase()) ||
    f.fileType.toLowerCase().includes(fileOverrideSearch.toLowerCase())
  ) : [];

  const canCreate = hasPermission(PERMISSIONS.PROJECT_CREATE);
  const canEdit = hasPermission(PERMISSIONS.PROJECT_UPDATE);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Project Management"
        description="Manage projects, environments, and file overrides"
      />

      {/* Projects Section */}
      <Collapsible open={projectsOpen} onOpenChange={setProjectsOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Projects ({filteredProjects.length})
                </div>
                {projectsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search projects..."
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {canCreate && (
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" /> Add Project
                  </Button>
                )}
              </div>

              {isLoadingProjects ? (
                <div className="text-center py-8 text-muted-foreground">Loading projects...</div>
              ) : filteredProjects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No projects found</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProjects.map((project) => (
                    <Card key={project.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <FolderOpen className="h-4 w-4 text-primary" />
                          {project.name}
                        </CardTitle>
                        {project.description && (
                          <p className="text-sm text-muted-foreground">{project.description}</p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-xs text-muted-foreground">
                            Created: {new Date(project.createdAt).toLocaleDateString()}
                          </div>
                          {canEdit && (
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="flex-1">
                                Edit
                              </Button>
                              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                Delete
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Environments Section */}
      <Collapsible open={environmentsOpen} onOpenChange={setEnvironmentsOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Environments ({filteredEnvironments.length})
                </div>
                {environmentsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search environments..."
                    value={environmentSearch}
                    onChange={(e) => setEnvironmentSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {canCreate && (
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" /> Add Environment
                  </Button>
                )}
              </div>

              <div className="text-center py-8 text-muted-foreground">
                Select a project to view its environments
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* File Overrides Section */}
      <Collapsible open={fileOverridesOpen} onOpenChange={setFileOverridesOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  File Overrides ({filteredFileOverrides.length})
                </div>
                {fileOverridesOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search file overrides..."
                    value={fileOverrideSearch}
                    onChange={(e) => setFileOverrideSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {canCreate && (
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" /> Add Override
                  </Button>
                )}
              </div>

              <div className="text-center py-8 text-muted-foreground">
                Select an environment to view its file overrides
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};

export default ProjectManagement;

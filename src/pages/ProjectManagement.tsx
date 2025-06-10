
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';
import { environmentService } from '@/services/environmentService';
import { fileOverrideService } from '@/services/fileOverrideService';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, ChevronDown, ChevronRight, Folder, FolderOpen } from 'lucide-react';

import PageHeader from '@/components/ui-custom/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Project, ProjectEnvironment, FileOverride } from '@/types/project';
import useAuthStore, { PERMISSIONS } from '@/stores/authStore';

const ProjectManagement: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { hasPermission, user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'projects' | 'environments' | 'overrides'>('projects');
  
  // Search states
  const [projectSearch, setProjectSearch] = useState('');
  const [environmentSearch, setEnvironmentSearch] = useState('');
  const [overrideSearch, setOverrideSearch] = useState('');
  
  // Collapsible states
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [environmentsOpen, setEnvironmentsOpen] = useState(false);
  const [overridesOpen, setOverridesOpen] = useState(false);

  // Fetch data
  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
  });

  const { data: environments = [], isLoading: loadingEnvironments } = useQuery({
    queryKey: ['environments'],
    queryFn: environmentService.getEnvironments,
  });

  const { data: overrides = [], isLoading: loadingOverrides } = useQuery({
    queryKey: ['overrides'],
    queryFn: fileOverrideService.getFileOverrides,
  });

  // Mutations
  const createProject = useMutation({
    mutationFn: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => 
      projectService.createProject({ ...data, createdBy: user?.id || '' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'Success', description: 'Project created successfully' });
    },
  });

  const createEnvironment = useMutation({
    mutationFn: (data: Omit<ProjectEnvironment, 'id' | 'createdAt' | 'updatedAt'>) => 
      environmentService.createEnvironment({ ...data, projectId: data.projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environments'] });
      toast({ title: 'Success', description: 'Environment created successfully' });
    },
  });

  const createOverride = useMutation({
    mutationFn: (data: Omit<FileOverride, 'id' | 'createdAt' | 'updatedAt'>) => 
      fileOverrideService.createFileOverride({ ...data, createdBy: user?.id || '' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overrides'] });
      toast({ title: 'Success', description: 'File override created successfully' });
    },
  });

  // Filter data
  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(projectSearch.toLowerCase())
  );

  const filteredEnvironments = environments.filter(e => 
    e.name.toLowerCase().includes(environmentSearch.toLowerCase()) ||
    e.host.toLowerCase().includes(environmentSearch.toLowerCase())
  );

  const filteredOverrides = overrides.filter(o => 
    o.filePath.toLowerCase().includes(overrideSearch.toLowerCase()) ||
    o.content.toLowerCase().includes(overrideSearch.toLowerCase())
  );

  const canCreate = hasPermission(PERMISSIONS.PROJECT_CREATE);

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Project Management" 
        description="Manage projects, environments, and file overrides"
      />

      <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="environments">Environments</TabsTrigger>
          <TabsTrigger value="overrides">File Overrides</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <Collapsible open={projectsOpen} onOpenChange={setProjectsOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {projectsOpen ? <FolderOpen className="h-5 w-5" /> : <Folder className="h-5 w-5" />}
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

                  {loadingProjects ? (
                    <div className="text-center py-8 text-muted-foreground">Loading projects...</div>
                  ) : filteredProjects.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No projects found</div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {filteredProjects.map((project) => (
                        <Card key={project.id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">{project.name}</CardTitle>
                            {project.description && (
                              <p className="text-sm text-muted-foreground">{project.description}</p>
                            )}
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium">Repository:</span>
                                <p className="font-mono text-xs bg-muted p-1 rounded mt-1">{project.gitRepoUrl}</p>
                              </div>
                              {project.gitUsername && (
                                <div>
                                  <span className="font-medium">Username:</span> {project.gitUsername}
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
        </TabsContent>

        <TabsContent value="environments" className="space-y-4">
          <Collapsible open={environmentsOpen} onOpenChange={setEnvironmentsOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {environmentsOpen ? <FolderOpen className="h-5 w-5" /> : <Folder className="h-5 w-5" />}
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

                  {loadingEnvironments ? (
                    <div className="text-center py-8 text-muted-foreground">Loading environments...</div>
                  ) : filteredEnvironments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No environments found</div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {filteredEnvironments.map((env) => (
                        <Card key={env.id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center justify-between">
                              {env.name}
                              <Badge variant={env.isProduction ? "destructive" : "secondary"}>
                                {env.isProduction ? "Production" : "Development"}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium">Host:</span> {env.host}:{env.port}
                              </div>
                              {env.deploymentChannel && (
                                <div>
                                  <span className="font-medium">Channel:</span> {env.deploymentChannel}
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
        </TabsContent>

        <TabsContent value="overrides" className="space-y-4">
          <Collapsible open={overridesOpen} onOpenChange={setOverridesOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {overridesOpen ? <FolderOpen className="h-5 w-5" /> : <Folder className="h-5 w-5" />}
                      File Overrides ({filteredOverrides.length})
                    </div>
                    {overridesOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
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
                        value={overrideSearch}
                        onChange={(e) => setOverrideSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {canCreate && (
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Add Override
                      </Button>
                    )}
                  </div>

                  {loadingOverrides ? (
                    <div className="text-center py-8 text-muted-foreground">Loading overrides...</div>
                  ) : filteredOverrides.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No file overrides found</div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {filteredOverrides.map((override) => (
                        <Card key={override.id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center justify-between text-base">
                              <code className="text-sm">{override.filePath}</code>
                              <Badge variant="outline">{override.fileType}</Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="bg-muted p-3 rounded text-sm font-mono">
                              {override.content}
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectManagement;


import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Edit, Trash, RefreshCcw, Search, Server } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AuthGuard from '@/components/auth/AuthGuard';
import PageHeader from '@/components/ui-custom/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import CreateProjectDialog from '@/components/dialogs/CreateProjectDialog';
import CreateEnvironmentDialog from '@/components/dialogs/CreateEnvironmentDialog';

import { projectService } from '@/services/projectService';
import { environmentService } from '@/services/environmentService';
import { fileOverrideService } from '@/services/fileOverrideService';
import { Project, Environment, FileOverride } from '@/types/project';
import { useProject } from '@/contexts/ProjectContext';

const ProjectManagement = () => {
  const { toast } = useToast();
  const { refreshProjects } = useProject();
  const [activeTab, setActiveTab] = useState('projects');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateEnvironment, setShowCreateEnvironment] = useState(false);

  // Queries
  const { data: projects = [], isLoading: loadingProjects, refetch: refetchProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getProjects(),
  });

  const { data: environments = [], isLoading: loadingEnvironments, refetch: refetchEnvironments } = useQuery({
    queryKey: ['environments', selectedProject?.id],
    enabled: !!selectedProject?.id,
    queryFn: () => environmentService.getEnvironmentsByProject(selectedProject!.id),
  });

  const { data: fileOverrides = [], isLoading: loadingFileOverrides, refetch: refetchFileOverrides } = useQuery({
    queryKey: ['fileOverrides', selectedEnvironment?.id],
    enabled: !!selectedEnvironment?.id,
    queryFn: () => fileOverrideService.getFileOverridesByEnvironment(selectedEnvironment!.id),
  });

  // Filter data based on search term
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredEnvironments = environments.filter(env =>
    env.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    env.host.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFileOverrides = fileOverrides.filter(override =>
    override.filePath.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = () => {
    if (activeTab === 'projects') {
      refetchProjects();
      refreshProjects();
    } else if (activeTab === 'environments') {
      refetchEnvironments();
    } else if (activeTab === 'overrides') {
      refetchFileOverrides();
    }
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setSelectedEnvironment(null);
    setActiveTab('environments');
  };

  const handleEnvironmentSelect = (environment: Environment) => {
    setSelectedEnvironment(environment);
    setActiveTab('overrides');
  };

  const handleCreateProjectSuccess = () => {
    refetchProjects();
    refreshProjects();
  };

  const handleCreateEnvironmentSuccess = () => {
    refetchEnvironments();
  };

  return (
    <AuthGuard requiredPermission="user:view">
      <div className="space-y-6 p-6">
        <PageHeader 
          title="Project Management" 
          description="Manage projects, environments, and file overrides"
        />

        {/* Global Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loadingProjects || loadingEnvironments || loadingFileOverrides}
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="projects">
              Projects ({filteredProjects.length})
            </TabsTrigger>
            <TabsTrigger value="environments" disabled={!selectedProject}>
              Environments ({filteredEnvironments.length})
            </TabsTrigger>
            <TabsTrigger value="overrides" disabled={!selectedEnvironment}>
              File Overrides ({filteredFileOverrides.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Projects</CardTitle>
                  <CardDescription>Manage your OSB integration projects</CardDescription>
                </div>
                <Button onClick={() => setShowCreateProject(true)}>
                  <Plus className="mr-2 h-4 w-4" /> 
                  Add Project
                </Button>
              </CardHeader>
              
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Git Repository</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProjects.map((project) => (
                        <TableRow 
                          key={project.id} 
                          className={selectedProject?.id === project.id ? 'bg-muted/50' : 'cursor-pointer hover:bg-muted/30'}
                          onClick={() => handleProjectSelect(project)}
                        >
                          <TableCell>
                            <div className="font-medium">{project.name}</div>
                            {project.description && (
                              <div className="text-xs text-muted-foreground">{project.description}</div>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs">{project.gitRepoUrl}</TableCell>
                          <TableCell>{new Date(project.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {filteredProjects.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-10">
                            {searchTerm ? 'No projects found matching your search.' : 'No projects found. Create your first project.'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="environments">
            {selectedProject ? (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Environments for {selectedProject.name}</CardTitle>
                    <CardDescription>Manage environments for this project</CardDescription>
                  </div>
                  <Button onClick={() => setShowCreateEnvironment(true)}>
                    <Plus className="mr-2 h-4 w-4" /> 
                    Add Environment
                  </Button>
                </CardHeader>
                
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Host</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEnvironments.map((env) => (
                          <TableRow 
                            key={env.id} 
                            className={selectedEnvironment?.id === env.id ? 'bg-muted/50' : 'cursor-pointer hover:bg-muted/30'}
                            onClick={() => handleEnvironmentSelect(env)}
                          >
                            <TableCell>
                              <div className="font-medium">{env.name}</div>
                            </TableCell>
                            <TableCell>{`${env.host}:${env.port || 7001}`}</TableCell>
                            <TableCell>{env.username}</TableCell>
                            <TableCell>
                              {env.isProduction ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                  Production
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                  Development
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        
                        {filteredEnvironments.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-10">
                              {searchTerm ? 'No environments found matching your search.' : 'No environments found for this project.'}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : (
              <Card className="text-center py-10">
                <CardContent>
                  <Server className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Please select a project first.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setActiveTab('projects')}
                  >
                    Go to Projects
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="overrides">
            {selectedEnvironment ? (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>File Overrides for {selectedEnvironment.name}</CardTitle>
                    <CardDescription>Manage file overrides for this environment</CardDescription>
                  </div>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> 
                    Add Override
                  </Button>
                </CardHeader>
                
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>File Path</TableHead>
                          <TableHead>Created By</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredFileOverrides.map((override) => (
                          <TableRow key={override.id}>
                            <TableCell>
                              <div className="font-medium font-mono text-sm">{override.filePath}</div>
                            </TableCell>
                            <TableCell>{override.createdBy}</TableCell>
                            <TableCell>{new Date(override.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        
                        {filteredFileOverrides.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-10">
                              {searchTerm ? 'No file overrides found matching your search.' : 'No file overrides found for this environment.'}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : (
              <Card className="text-center py-10">
                <CardContent>
                  <p className="text-muted-foreground">Please select an environment first.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setActiveTab('environments')}
                  >
                    Go to Environments
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <CreateProjectDialog
          open={showCreateProject}
          onOpenChange={setShowCreateProject}
          onSuccess={handleCreateProjectSuccess}
        />

        {selectedProject && (
          <CreateEnvironmentDialog
            open={showCreateEnvironment}
            onOpenChange={setShowCreateEnvironment}
            onSuccess={handleCreateEnvironmentSuccess}
            projectId={selectedProject.id}
          />
        )}
      </div>
    </AuthGuard>
  );
};

export default ProjectManagement;


import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash, Edit, Server, FileText, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AuthGuard from '@/components/auth/AuthGuard';
import PageHeader from '@/components/ui-custom/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import useProjectStore from '@/stores/projectStore';
import useAuthStore from '@/stores/authStore';
import { Project, ProjectEnvironment, FileOverride } from '@/types/project';
import { ScrollArea } from '@/components/ui/scroll-area';

const ProjectManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const {
    projects,
    environments,
    fileOverrides,
    fetchProjects,
    fetchEnvironments,
    fetchFileOverrides,
    createProject,
    updateProject,
    deleteProject,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    createFileOverride,
    updateFileOverride,
    deleteFileOverride,
  } = useProjectStore();
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<ProjectEnvironment | null>(null);
  const [activeTab, setActiveTab] = useState('projects');
  
  // Form states
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showEnvironmentForm, setShowEnvironmentForm] = useState(false);
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    description: '',
    gitRepoUrl: '',
    gitUsername: '',
  });
  
  const [newEnvironment, setNewEnvironment] = useState<Partial<ProjectEnvironment>>({
    name: '',
    host: '',
    port: 7001,
    username: '',
    isProduction: false,
  });
  
  const [newOverride, setNewOverride] = useState<Partial<FileOverride>>({
    filename: '',
    fileType: 'BIX',
    originalValue: '',
    overrideValue: '',
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string>('');

  // Queries
  const { data: projectEnvironments = [], refetch: refetchEnvironments } = useQuery({
    queryKey: ['environments', selectedProject?.id],
    enabled: !!selectedProject?.id,
    queryFn: () => fetchEnvironments(selectedProject!.id),
  });
  
  const { data: environmentOverrides = [], refetch: refetchOverrides } = useQuery({
    queryKey: ['overrides', selectedEnvironment?.id],
    enabled: !!selectedEnvironment?.id,
    queryFn: () => fetchFileOverrides(selectedEnvironment!.id),
  });

  // Load projects on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Project CRUD functions
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!user) throw new Error('User not authenticated');
      
      if (isEditing && editingId) {
        await updateProject(editingId, newProject);
        toast({ title: 'Project updated successfully' });
      } else {
        if (!newProject.name || !newProject.gitRepoUrl) {
          throw new Error('Project name and Git URL are required');
        }
        
        await createProject({
          name: newProject.name!,
          description: newProject.description,
          gitRepoUrl: newProject.gitRepoUrl!,
          gitUsername: newProject.gitUsername,
          createdBy: user.id,
        });
        toast({ title: 'Project created successfully' });
      }
      
      setShowProjectForm(false);
      setNewProject({ name: '', description: '', gitRepoUrl: '', gitUsername: '' });
      setIsEditing(false);
      setEditingId('');
    } catch (error: any) {
      toast({ 
        title: 'Error',
        description: error.message,
        variant: 'destructive' 
      });
    }
  };
  
  const handleEditProject = (project: Project) => {
    setNewProject({
      name: project.name,
      description: project.description,
      gitRepoUrl: project.gitRepoUrl,
      gitUsername: project.gitUsername,
    });
    setIsEditing(true);
    setEditingId(project.id);
    setShowProjectForm(true);
  };
  
  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject(id);
      toast({ title: 'Project deleted successfully' });
      
      if (selectedProject?.id === id) {
        setSelectedProject(null);
      }
    } catch (error: any) {
      toast({ 
        title: 'Error',
        description: error.message,
        variant: 'destructive' 
      });
    }
  };

  // Environment CRUD functions
  const handleEnvironmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!selectedProject) throw new Error('No project selected');
      
      if (isEditing && editingId) {
        await updateEnvironment(editingId, newEnvironment);
        toast({ title: 'Environment updated successfully' });
      } else {
        if (!newEnvironment.name || !newEnvironment.host || !newEnvironment.username) {
          throw new Error('Name, host and username are required');
        }
        
        await createEnvironment({
          projectId: selectedProject.id,
          name: newEnvironment.name!,
          host: newEnvironment.host!,
          port: newEnvironment.port || 7001,
          username: newEnvironment.username!,
          isProduction: newEnvironment.isProduction || false,
        });
        toast({ title: 'Environment created successfully' });
      }
      
      refetchEnvironments();
      setShowEnvironmentForm(false);
      setNewEnvironment({ name: '', host: '', port: 7001, username: '', isProduction: false });
      setIsEditing(false);
      setEditingId('');
    } catch (error: any) {
      toast({ 
        title: 'Error',
        description: error.message,
        variant: 'destructive' 
      });
    }
  };
  
  const handleEditEnvironment = (env: ProjectEnvironment) => {
    setNewEnvironment({
      name: env.name,
      host: env.host,
      port: env.port,
      username: env.username,
      password: env.password,
      isProduction: env.isProduction,
    });
    setIsEditing(true);
    setEditingId(env.id);
    setShowEnvironmentForm(true);
  };
  
  const handleDeleteEnvironment = async (id: string) => {
    try {
      await deleteEnvironment(id);
      toast({ title: 'Environment deleted successfully' });
      refetchEnvironments();
      
      if (selectedEnvironment?.id === id) {
        setSelectedEnvironment(null);
      }
    } catch (error: any) {
      toast({ 
        title: 'Error',
        description: error.message,
        variant: 'destructive' 
      });
    }
  };

  // File Override CRUD functions
  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!selectedEnvironment) throw new Error('No environment selected');
      if (!user) throw new Error('User not authenticated');
      
      if (isEditing && editingId) {
        await updateFileOverride(editingId, newOverride);
        toast({ title: 'File override updated successfully' });
      } else {
        if (!newOverride.filename || !newOverride.originalValue || !newOverride.overrideValue) {
          throw new Error('Filename, original value and override value are required');
        }
        
        await createFileOverride({
          environmentId: selectedEnvironment.id,
          filename: newOverride.filename!,
          fileType: newOverride.fileType as 'BIX' | 'PROXY',
          originalValue: newOverride.originalValue!,
          overrideValue: newOverride.overrideValue!,
          createdBy: user.id,
        });
        toast({ title: 'File override created successfully' });
      }
      
      refetchOverrides();
      setShowOverrideForm(false);
      setNewOverride({ filename: '', fileType: 'BIX', originalValue: '', overrideValue: '' });
      setIsEditing(false);
      setEditingId('');
    } catch (error: any) {
      toast({ 
        title: 'Error',
        description: error.message,
        variant: 'destructive' 
      });
    }
  };
  
  const handleEditOverride = (override: FileOverride) => {
    setNewOverride({
      filename: override.filename,
      fileType: override.fileType,
      originalValue: override.originalValue,
      overrideValue: override.overrideValue,
    });
    setIsEditing(true);
    setEditingId(override.id);
    setShowOverrideForm(true);
  };
  
  const handleDeleteOverride = async (id: string) => {
    try {
      await deleteFileOverride(id);
      toast({ title: 'File override deleted successfully' });
      refetchOverrides();
    } catch (error: any) {
      toast({ 
        title: 'Error',
        description: error.message,
        variant: 'destructive' 
      });
    }
  };

  return (
    <AuthGuard requiredPermission="user:view">
      <div className="space-y-6 p-6">
        <PageHeader 
          title="Project Management" 
          description="Manage projects, environments, and file overrides"
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="environments" disabled={!selectedProject}>Environments</TabsTrigger>
            <TabsTrigger value="overrides" disabled={!selectedEnvironment}>File Overrides</TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Projects</CardTitle>
                  <CardDescription>Manage your OSB integration projects</CardDescription>
                </div>

                <Dialog open={showProjectForm} onOpenChange={setShowProjectForm}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setIsEditing(false);
                      setNewProject({ name: '', description: '', gitRepoUrl: '', gitUsername: '' });
                    }}>
                      <Plus className="mr-2 h-4 w-4" /> Add Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{isEditing ? 'Edit' : 'Add'} Project</DialogTitle>
                      <DialogDescription>
                        Enter the details for your project.
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleProjectSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Project Name</Label>
                        <Input
                          id="name"
                          value={newProject.name || ''}
                          onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                          placeholder="Enter project name"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newProject.description || ''}
                          onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                          placeholder="Enter project description"
                          rows={3}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="gitRepo">Git Repository URL</Label>
                        <Input
                          id="gitRepo"
                          value={newProject.gitRepoUrl || ''}
                          onChange={e => setNewProject({ ...newProject, gitRepoUrl: e.target.value })}
                          placeholder="https://github.com/user/repo.git"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="gitUsername">Git Username</Label>
                        <Input
                          id="gitUsername"
                          value={newProject.gitUsername || ''}
                          onChange={e => setNewProject({ ...newProject, gitUsername: e.target.value })}
                          placeholder="Enter Git username"
                        />
                      </div>

                      <DialogFooter>
                        <Button type="submit">{isEditing ? 'Update' : 'Create'}</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
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
                      {projects.map((project) => (
                        <TableRow 
                          key={project.id} 
                          className={selectedProject?.id === project.id ? 'bg-muted/50' : ''}
                          onClick={() => {
                            setSelectedProject(project);
                            setActiveTab('environments');
                          }}
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
                              <Button
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditProject(project);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteProject(project.id);
                                }}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {projects.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-10">
                            <p className="text-muted-foreground">No projects found. Create your first project.</p>
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

                  <Dialog open={showEnvironmentForm} onOpenChange={setShowEnvironmentForm}>
                    <DialogTrigger asChild>
                      <Button onClick={() => {
                        setIsEditing(false);
                        setNewEnvironment({ name: '', host: '', port: 7001, username: '', isProduction: false });
                      }}>
                        <Plus className="mr-2 h-4 w-4" /> Add Environment
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit' : 'Add'} Environment</DialogTitle>
                        <DialogDescription>
                          Configure environment connection details.
                        </DialogDescription>
                      </DialogHeader>

                      <form onSubmit={handleEnvironmentSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="env-name">Environment Name</Label>
                          <Input
                            id="env-name"
                            value={newEnvironment.name || ''}
                            onChange={e => setNewEnvironment({ ...newEnvironment, name: e.target.value })}
                            placeholder="DEV, QA, PROD, etc."
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="host">Host</Label>
                          <Input
                            id="host"
                            value={newEnvironment.host || ''}
                            onChange={e => setNewEnvironment({ ...newEnvironment, host: e.target.value })}
                            placeholder="weblogic-host.example.com"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="port">Port</Label>
                          <Input
                            id="port"
                            type="number"
                            value={newEnvironment.port || 7001}
                            onChange={e => setNewEnvironment({ ...newEnvironment, port: parseInt(e.target.value) })}
                            placeholder="7001"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={newEnvironment.username || ''}
                            onChange={e => setNewEnvironment({ ...newEnvironment, username: e.target.value })}
                            placeholder="admin"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={newEnvironment.password || ''}
                            onChange={e => setNewEnvironment({ ...newEnvironment, password: e.target.value })}
                            placeholder="••••••••"
                          />
                          <p className="text-xs text-muted-foreground">Leave empty to keep current password.</p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="isProduction"
                            checked={newEnvironment.isProduction || false}
                            onCheckedChange={(checked) => setNewEnvironment({ ...newEnvironment, isProduction: checked })}
                          />
                          <Label htmlFor="isProduction">Production Environment</Label>
                        </div>

                        <DialogFooter>
                          <Button type="submit">{isEditing ? 'Update' : 'Create'}</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
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
                        {projectEnvironments.map((env) => (
                          <TableRow 
                            key={env.id} 
                            className={selectedEnvironment?.id === env.id ? 'bg-muted/50' : ''}
                            onClick={() => {
                              setSelectedEnvironment(env);
                              setActiveTab('overrides');
                            }}
                          >
                            <TableCell>
                              <div className="font-medium">{env.name}</div>
                            </TableCell>
                            <TableCell>{`${env.host}:${env.port}`}</TableCell>
                            <TableCell>{env.username}</TableCell>
                            <TableCell>
                              {env.isProduction ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                  Production
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                  Non-Production
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditEnvironment(env);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteEnvironment(env.id);
                                  }}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        
                        {projectEnvironments.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-10">
                              <p className="text-muted-foreground">No environments found. Create your first environment.</p>
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
                    <CardDescription>Manage BIX and Proxy override settings</CardDescription>
                  </div>

                  <Dialog open={showOverrideForm} onOpenChange={setShowOverrideForm}>
                    <DialogTrigger asChild>
                      <Button onClick={() => {
                        setIsEditing(false);
                        setNewOverride({ filename: '', fileType: 'BIX', originalValue: '', overrideValue: '' });
                      }}>
                        <Plus className="mr-2 h-4 w-4" /> Add Override
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit' : 'Add'} File Override</DialogTitle>
                        <DialogDescription>
                          Configure file override settings.
                        </DialogDescription>
                      </DialogHeader>

                      <form onSubmit={handleOverrideSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="filename">Filename</Label>
                          <Input
                            id="filename"
                            value={newOverride.filename || ''}
                            onChange={e => setNewOverride({ ...newOverride, filename: e.target.value })}
                            placeholder="service.bix"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="fileType">File Type</Label>
                          <Select 
                            value={newOverride.fileType} 
                            onValueChange={(value) => setNewOverride({ ...newOverride, fileType: value as 'BIX' | 'PROXY' })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select file type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="BIX">BIX</SelectItem>
                                <SelectItem value="PROXY">PROXY</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="originalValue">Original Value</Label>
                          <Input
                            id="originalValue"
                            value={newOverride.originalValue || ''}
                            onChange={e => setNewOverride({ ...newOverride, originalValue: e.target.value })}
                            placeholder="192.168.1.1"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="overrideValue">Override Value</Label>
                          <Input
                            id="overrideValue"
                            value={newOverride.overrideValue || ''}
                            onChange={e => setNewOverride({ ...newOverride, overrideValue: e.target.value })}
                            placeholder="10.0.0.1"
                            required
                          />
                        </div>

                        <DialogFooter>
                          <Button type="submit">{isEditing ? 'Update' : 'Create'}</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Filename</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Original Value</TableHead>
                          <TableHead>Override Value</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {environmentOverrides.map((override) => (
                          <TableRow key={override.id}>
                            <TableCell>
                              <div className="font-medium">{override.filename}</div>
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium
                                ${override.fileType === 'BIX' 
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}
                              >
                                {override.fileType}
                              </span>
                            </TableCell>
                            <TableCell className="font-mono text-xs">{override.originalValue}</TableCell>
                            <TableCell className="font-mono text-xs">{override.overrideValue}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditOverride(override)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteOverride(override.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        
                        {environmentOverrides.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-10">
                              <p className="text-muted-foreground">No file overrides found.</p>
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
      </div>
    </AuthGuard>
  );
};

export default ProjectManagement;

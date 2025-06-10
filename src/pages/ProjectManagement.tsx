import React, { useState,useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AuthGuard from '@/components/auth/AuthGuard';
import PageHeader from '@/components/ui-custom/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

import useAuthStore from '@/stores/authStore';
import { Project, ProjectEnvironment, FileOverride } from '@/types/project';
import { projectService } from '@/services/projectService';
import { environmentsService } from '@/services/environmentsService';
import { fileOverridesService } from '@/services/fileOverridesService';
import { EnvironmentDefinitionDto } from '@/types/environment';
import {definitionsService} from "@/services/definitionsService.ts";

const ProjectManagement: React.FC = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Tabs & selection
  const [activeTab, setActiveTab] = useState<'projects' | 'environments' | 'overrides'>('projects');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<ProjectEnvironment | null>(null);

  // Dialog & form state
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showEnvironmentForm, setShowEnvironmentForm] = useState(false);
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string>('');
  const [formDefs, setFormDefs] = useState<EnvironmentDefinitionDto | null>(null);
  const [innerTab, setInnerTab] = useState<'definitions'|'overrides'>('definitions');

  // Form values
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    description: '',
    gitRepoUrl: '',
    gitUsername: ''
  });
  const [newEnvironment, setNewEnvironment] = useState<Partial<ProjectEnvironment>>({
    name: '',
    host: '',
    port: 7001,
    username: '',
    deploymentChannel:'',
    isProduction: false
  });
  const [newOverride, setNewOverride] = useState<Partial<FileOverride>>({
    filePath: '',
    fileType: 'BIX',
    content: ''
  });

  // Queries
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getAllProjects(),
    enabled: !!user
  });

  const { data: projectEnvironments = [] } = useQuery({
    queryKey: ['environments', selectedProject?.id],
    queryFn: () => environmentsService.getEnvironments(selectedProject!.id!),
    enabled: !!selectedProject
  });

  const {
    data: environmentOverrides = [],
    refetch: refetchOverrides
  } = useQuery({
    queryKey: ['overrides', selectedEnvironment?.id],
    queryFn: () => fileOverridesService.getFileOverrides(selectedEnvironment!.id!),
    enabled: !!selectedEnvironment
  });
  const {
    data: defs,
    isLoading: loadingDefs,
    refetch: refetchDefs
  } = useQuery({
    queryKey: ['definitions', selectedEnvironment?.id],
    queryFn: () => definitionsService.getDefinitions(selectedEnvironment!.id!),
    enabled: !!selectedEnvironment
  });


  const updateDefs = useMutation({
    mutationFn: (payload: EnvironmentDefinitionDto) =>
        definitionsService.updateDefinitions(selectedEnvironment!.id!, payload),
    onSuccess: () => {
      toast({ title: 'Definitions saved' });
      refetchDefs();
    }
  });
  // Mutations (v5 object signature)
  const createProject = useMutation({
    mutationFn: (payload: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) =>
        projectService.createProject(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', user?.id] });
      toast({ title: 'Project created' });
      setShowProjectForm(false);
    }
  });

  const updateProject = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Project> }) =>
        projectService.updateProject(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', user?.id] });
      toast({ title: 'Project updated' });
      setShowProjectForm(false);
    }
  });

  const deleteProject = useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', user?.id] });
      toast({ title: 'Project deleted' });
      setSelectedProject(null);
    }
  });

  const createEnvironment = useMutation({
    mutationFn: (payload: Omit<ProjectEnvironment, 'id' | 'createdAt' | 'updatedAt'>) =>
        environmentsService.createEnvironment(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['environments', selectedProject?.id] });
      toast({ title: 'Environment created' });
      setShowEnvironmentForm(false);
    }
  });

  const updateEnvironment = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ProjectEnvironment> }) =>
        environmentsService.updateEnvironment(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['environments', selectedProject?.id] });
      toast({ title: 'Environment updated' });
      setShowEnvironmentForm(false);
    }
  });

  const deleteEnvironment = useMutation({
    mutationFn: (id: string) => environmentsService.deleteEnvironment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['environments', selectedProject?.id] });
      toast({ title: 'Environment deleted' });
      setSelectedEnvironment(null);
    }
  });

  const createOverride = useMutation({
    mutationFn: (payload: Omit<FileOverride, 'id' | 'createdAt' | 'updatedAt'>) =>
        fileOverridesService.createFileOverride(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['overrides', selectedEnvironment?.id] });
      toast({ title: 'Override created' });
      setShowOverrideForm(false);
    }
  });

  const updateOverride = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<FileOverride> }) =>
        fileOverridesService.updateFileOverride(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['overrides', selectedEnvironment?.id] });
      toast({ title: 'Override updated' });
      setShowOverrideForm(false);
    }
  });

  const deleteOverride = useMutation({
    mutationFn: (id: string) => fileOverridesService.deleteFileOverride(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['overrides', selectedEnvironment?.id] });
      toast({ title: 'Override deleted' });
    }
  });

  // Handlers
  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && editingId) {
      updateProject.mutate({ id: editingId, payload: newProject });
    } else {
      createProject.mutate({ ...newProject, createdBy: user!.id });
    }
  };

  const handleEditProject = (proj: Project) => {
    setIsEditing(true);
    setEditingId(proj.id);
    setNewProject({
      name: proj.name,
      description: proj.description,
      gitRepoUrl: proj.gitRepoUrl,
      gitUsername: proj.gitUsername
    });
    setShowProjectForm(true);
  };

  const handleDeleteProject = (id: string) => {
    deleteProject.mutate(id);
  };

  const handleEnvironmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && editingId) {
      updateEnvironment.mutate({ id: editingId, payload: newEnvironment });
    } else {
      createEnvironment.mutate({
        ...newEnvironment,
        projectId: selectedProject!.id
      });
    }
  };

  const handleEditEnvironment = (env: ProjectEnvironment) => {
    setIsEditing(true);
    setEditingId(env.id);
    setNewEnvironment({
      name: env.name,
      host: env.host,
      port: env.port,
      username: env.username,
      password: env.password,
      deploymentChannel: env.deploymentChannel,
      isProduction: env.isProduction
    });
    setShowEnvironmentForm(true);
  };

  const handleDeleteEnvironment = (id: string) => {
    deleteEnvironment.mutate(id);
  };

  const handleOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && editingId) {
      updateOverride.mutate({ id: editingId, payload: newOverride });
    } else {
      createOverride.mutate({
        ...newOverride,
        environmentId: selectedEnvironment!.id,
        createdBy: user!.id
      });
    }
  };

  const handleEditOverride = (ov: FileOverride) => {
    setIsEditing(true);
    setEditingId(ov.id);
    setNewOverride({
      filePath: ov.filePath,
      fileType: ov.fileType,
      content: ov.content
    });
    setShowOverrideForm(true);
  };

  const handleDeleteOverride = (id: string) => {
    deleteOverride.mutate(id);
  };
  useEffect(() => {
    if (defs) setFormDefs(defs);
  }, [defs]);
  useEffect(() => {
    setSelectedEnvironment(null);
  }, [selectedProject]);

  useEffect(() => {
    if (selectedEnvironment) {
      refetchDefs();
      refetchOverrides();
    }
  }, [selectedEnvironment, refetchDefs, refetchOverrides]);
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
              <TabsTrigger value="environments" disabled={!selectedProject}>
                Environments
              </TabsTrigger>
            </TabsList>

            {/* === Projects === */}
            <TabsContent value="projects">
              <Card>
                <CardHeader className="flex justify-between items-center">
                  <div className="w-full text-center">
                    <CardTitle>Projects</CardTitle>
                    <CardDescription>
                      Manage your OSB integration projects
                    </CardDescription>
                  </div>
                  <Dialog
                      open={showProjectForm}
                      onOpenChange={setShowProjectForm}
                  >
                    <DialogTrigger asChild>
                      <Button
                          onClick={() => {
                            setIsEditing(false);
                            setNewProject({
                              name: '',
                              description: '',
                              gitRepoUrl: '',
                              gitUsername: ''
                            });
                          }}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add Project
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {isEditing ? 'Edit' : 'Add'} Project
                        </DialogTitle>
                        <DialogDescription>
                          Enter the project details
                        </DialogDescription>
                      </DialogHeader>
                      <form
                          onSubmit={handleProjectSubmit}
                          className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="proj-name">Name</Label>
                          <Input
                              id="proj-name"
                              value={newProject.name || ''}
                              required
                              onChange={(e) =>
                                  setNewProject({
                                    ...newProject,
                                    name: e.target.value
                                  })
                              }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="proj-desc">Description</Label>
                          <Textarea
                              id="proj-desc"
                              value={newProject.description || ''}
                              onChange={(e) =>
                                  setNewProject({
                                    ...newProject,
                                    description: e.target.value
                                  })
                              }
                              rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="proj-git">Git Repo URL</Label>
                          <Input
                              id="proj-git"
                              value={newProject.gitRepoUrl || ''}
                              required
                              onChange={(e) =>
                                  setNewProject({
                                    ...newProject,
                                    gitRepoUrl: e.target.value
                                  })
                              }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="proj-user">Git Username</Label>
                          <Input
                              id="proj-user"
                              value={newProject.gitUsername || ''}
                              onChange={(e) =>
                                  setNewProject({
                                    ...newProject,
                                    gitUsername: e.target.value
                                  })
                              }
                          />
                        </div>
                        <DialogFooter>
                          <Button type="submit">
                            {isEditing ? 'Update' : 'Create'}
                          </Button>
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
                          <TableHead>Git Repo</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {projects.map((proj) => (
                            <TableRow
                                key={proj.id}
                                className={
                                  selectedProject?.id === proj.id
                                      ? 'bg-muted/50'
                                      : ''
                                }
                                onClick={() => {
                                  setSelectedProject(proj);
                                  setActiveTab('environments');
                                }}
                            >
                              <TableCell>{proj.name}</TableCell>
                              <TableCell className="font-mono text-xs">
                                {proj.gitRepoUrl}
                              </TableCell>
                              <TableCell>
                                {new Date(proj.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditProject(proj);
                                      }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteProject(proj.id);
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
                              <TableCell
                                  colSpan={4}
                                  className="text-center py-10"
                              >
                                <p className="text-muted-foreground">
                                  No projects found.
                                </p>
                              </TableCell>
                            </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* === Environments === */}
            {/* === Environments === */}
            {/* === Environments === */}
            <TabsContent value="environments">
              {selectedProject ? (
                  <>
                    {/* — List + Add Environment — */}
                    <Card className="mb-6">
                      <CardHeader className="flex justify-between items-center">
                        <div className="w-full text-center">
                          <CardTitle>Environments for {selectedProject.name}</CardTitle>
                          <CardDescription>Manage environments for this project</CardDescription>
                        </div>
                        <Dialog open={showEnvironmentForm} onOpenChange={setShowEnvironmentForm}>
                          <DialogTrigger asChild>
                            <Button
                                onClick={() => {
                                  setIsEditing(false);
                                  setNewEnvironment({
                                    name: '',
                                    host: '',
                                    port: 7001,
                                    username: '',
                                    deploymentChannel: '',
                                    isProduction: false
                                  });
                                }}
                            >
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
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="env-name">Name</Label>
                                  <Input
                                      id="env-name"
                                      value={newEnvironment.name || ''}
                                      required
                                      onChange={e =>
                                          setNewEnvironment({ ...newEnvironment, name: e.target.value })
                                      }
                                      placeholder="DEV, QA, PROD"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="env-channel">Deployment Channel</Label>
                                  <Input
                                      id="env-channel"
                                      value={newEnvironment.deploymentChannel || ''}
                                      required
                                      onChange={e =>
                                          setNewEnvironment({ ...newEnvironment, deploymentChannel: e.target.value })
                                      }
                                      placeholder="t3"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="env-host">Host</Label>
                                  <Input
                                      id="env-host"
                                      value={newEnvironment.host || ''}
                                      required
                                      onChange={e =>
                                          setNewEnvironment({ ...newEnvironment, host: e.target.value })
                                      }
                                      placeholder="weblogic-host.example.com"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="env-port">Port</Label>
                                  <Input
                                      id="env-port"
                                      type="number"
                                      value={newEnvironment.port || 7001}
                                      required
                                      onChange={e =>
                                          setNewEnvironment({ ...newEnvironment, port: Number(e.target.value) })
                                      }
                                      placeholder="7001"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="env-user">Username</Label>
                                  <Input
                                      id="env-user"
                                      value={newEnvironment.username || ''}
                                      required
                                      onChange={e =>
                                          setNewEnvironment({ ...newEnvironment, username: e.target.value })
                                      }
                                      placeholder="admin"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="env-pass">Password</Label>
                                  <Input
                                      id="env-pass"
                                      type="password"
                                      value={newEnvironment.password || ''}
                                      onChange={e =>
                                          setNewEnvironment({ ...newEnvironment, password: e.target.value })
                                      }
                                      placeholder="••••••••"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Leave blank to keep current password.
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2 col-span-2">
                                  <Switch
                                      id="env-prod"
                                      checked={newEnvironment.isProduction || false}
                                      onCheckedChange={v =>
                                          setNewEnvironment({ ...newEnvironment, isProduction: v })
                                      }
                                  />
                                  <Label htmlFor="env-prod">Production Environment</Label>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="submit">{isEditing ? 'Update' : 'Create'}</Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </CardHeader>

                      <CardContent>
                        <ScrollArea className="h-[200px]">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Host</TableHead>
                                <TableHead>Port</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {projectEnvironments.map(env => (
                                  <TableRow
                                      key={env.id}
                                      onClick={() => setSelectedEnvironment(env)}
                                      className={selectedEnvironment?.id === env.id ? 'bg-muted/50' : ''}
                                      style={{ cursor: 'pointer' }}
                                  >
                                    <TableCell>{env.name}</TableCell>
                                    <TableCell>{env.host}</TableCell>
                                    <TableCell>{env.port}</TableCell>
                                  </TableRow>
                              ))}
                              {projectEnvironments.length === 0 && (
                                  <TableRow>
                                    <TableCell colSpan={3} className="text-center py-10">
                                      <p className="text-muted-foreground">No environments found.</p>
                                    </TableCell>
                                  </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    {selectedEnvironment ? (
                        <Card>
                          <CardHeader className="flex justify-between items-center">
                            <div className="w-full text-center">
                              <CardTitle>Configure {selectedEnvironment.name}</CardTitle>
                              <CardDescription>Definitions & Overrides</CardDescription>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <Tabs
                                value={innerTab}
                                onValueChange={value => setInnerTab(value as 'definitions' | 'overrides')}
                            >
                              <TabsList>
                                <TabsTrigger value="definitions">Definitions</TabsTrigger>
                                <TabsTrigger value="overrides">Overrides</TabsTrigger>
                              </TabsList>

                              {/* Definitions Pane */}
                              <TabsContent value="definitions" className="space-y-6">
                                {loadingDefs || !formDefs ? (
                                    <p>Loading definitions…</p>
                                ) : (
                                    <form
                                        onSubmit={e => {
                                          e.preventDefault();
                                          updateDefs.mutate(formDefs);
                                        }}
                                        className="space-y-4"
                                    >
                                      {/* Artifacts & WLST */}
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label>Artifacts Folder</Label>
                                          <Input
                                              value={formDefs.artifactsFolder || ''}
                                              onChange={e =>
                                                  setFormDefs({ ...formDefs, artifactsFolder: e.target.value })
                                              }
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label>WLST Tool Path</Label>
                                          <Input
                                              value={formDefs.wlstToolPath || ''}
                                              onChange={e =>
                                                  setFormDefs({ ...formDefs, wlstToolPath: e.target.value })
                                              }
                                          />
                                        </div>
                                      </div>

                                      {/* Notify Switch */}
                                      <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={formDefs.notifyOnComplete}
                                            onCheckedChange={v =>
                                                setFormDefs({ ...formDefs, notifyOnComplete: v })
                                            }
                                        />
                                        <Label>Notify on Complete</Label>
                                      </div>

                                      {/* SMTP Settings */}
                                      <div className="grid grid-cols-3 gap-4">
                                        <div>
                                          <Label>SMTP Host</Label>
                                          <Input
                                              value={formDefs.smtpHost || ''}
                                              onChange={e =>
                                                  setFormDefs({ ...formDefs, smtpHost: e.target.value })
                                              }
                                          />
                                        </div>
                                        <div>
                                          <Label>SMTP Port</Label>
                                          <Input
                                              type="number"
                                              value={formDefs.smtpPort || ''}
                                              onChange={e =>
                                                  setFormDefs({ ...formDefs, smtpPort: Number(e.target.value) })
                                              }
                                          />
                                        </div>
                                        <div>
                                          <Label>SMTP Username</Label>
                                          <Input
                                              value={formDefs.smtpUsername || ''}
                                              onChange={e =>
                                                  setFormDefs({ ...formDefs, smtpUsername: e.target.value })
                                              }
                                          />
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <Label>SMTP Password</Label>
                                        <Input
                                            type="password"
                                            value={formDefs.smtpPassword || ''}
                                            onChange={e =>
                                                setFormDefs({ ...formDefs, smtpPassword: e.target.value })
                                            }
                                        />
                                      </div>

                                      {/* Success Recipients */}
                                      <div className="space-y-2">
                                        <Label>Success Email Subject</Label>
                                        <Input
                                            value={formDefs.successEmailSubject || ''}
                                            onChange={e =>
                                                setFormDefs({ ...formDefs, successEmailSubject: e.target.value })
                                            }
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Success Recipients</Label>
                                        <div className="flex flex-wrap gap-2">
                                          {formDefs.successRecipients.map(email => (
                                              <Badge
                                                  key={email}
                                                  onClick={() =>
                                                      setFormDefs({
                                                        ...formDefs,
                                                        successRecipients: formDefs.successRecipients.filter(e => e !== email)
                                                      })
                                                  }
                                              >
                                                {email}
                                              </Badge>
                                          ))}
                                          <Input
                                              placeholder="Type and press Enter"
                                              onKeyDown={e => {
                                                if (e.key === 'Enter' && e.currentTarget.value) {
                                                  e.preventDefault();
                                                  setFormDefs({
                                                    ...formDefs,
                                                    successRecipients: [...formDefs.successRecipients, e.currentTarget.value]
                                                  });
                                                  e.currentTarget.value = '';
                                                }
                                              }}
                                          />
                                        </div>
                                      </div>

                                      {/* Failure Recipients */}
                                      <div className="space-y-2">
                                        <Label>Failure Recipients</Label>
                                        <div className="flex flex-wrap gap-2">
                                          {formDefs.failureRecipients.map(email => (
                                              <Badge
                                                  key={email}
                                                  onClick={() =>
                                                      setFormDefs({
                                                        ...formDefs,
                                                        failureRecipients: formDefs.failureRecipients.filter(e => e !== email)
                                                      })
                                                  }
                                              >
                                                {email}
                                              </Badge>
                                          ))}
                                          <Input
                                              placeholder="Type and press Enter"
                                              onKeyDown={e => {
                                                if (e.key === 'Enter' && e.currentTarget.value) {
                                                  e.preventDefault();
                                                  setFormDefs({
                                                    ...formDefs,
                                                    failureRecipients: [...formDefs.failureRecipients, e.currentTarget.value]
                                                  });
                                                  e.currentTarget.value = '';
                                                }
                                              }}
                                          />
                                        </div>
                                      </div>

                                      <DialogFooter>
                                        <Button type="submit" disabled={updateDefs.status === 'loading'}>
                                          {updateDefs.status === 'loading' ? 'Saving…' : 'Save Definitions'}
                                        </Button>
                                      </DialogFooter>
                                    </form>
                                )}
                              </TabsContent>

                              {/* Overrides Pane */}
                              <TabsContent value="overrides">
                                <ScrollArea className="h-[400px]">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>File Path</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Content</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {environmentOverrides.map(ov => (
                                          <TableRow key={ov.id}>
                                            <TableCell>{ov.filePath}</TableCell>
                                            <TableCell>
                            <span
                                className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                                    ov.fileType === 'BIX'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-blue-100 text-blue-800'
                                }`}
                            >
                              {ov.fileType}
                            </span>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">{ov.content}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                              <Button variant="ghost" size="sm" onClick={() => handleEditOverride(ov)}>
                                                <Edit className="h-4 w-4" />
                                              </Button>
                                              <Button variant="ghost" size="sm" onClick={() => handleDeleteOverride(ov.id)}>
                                                <Trash className="h-4 w-4" />
                                              </Button>
                                            </TableCell>
                                          </TableRow>
                                      ))}
                                      {environmentOverrides.length === 0 && (
                                          <TableRow>
                                            <TableCell colSpan={4} className="text-center py-10">
                                              <p className="text-muted-foreground">No overrides found.</p>
                                            </TableCell>
                                          </TableRow>
                                      )}
                                    </TableBody>
                                  </Table>
                                </ScrollArea>
                              </TabsContent>
                            </Tabs>
                          </CardContent>
                        </Card>
                    ) : (
                        <Card className="text-center py-10">
                          <CardContent>
                            <p className="text-muted-foreground">Please select an environment first.</p>
                            <Button variant="outline" onClick={() => setActiveTab('environments')}>
                              Go to Environments
                            </Button>
                          </CardContent>
                        </Card>
                    )}
                  </>
              ) : (
                  <Card className="text-center py-10">
                    <CardContent>
                      <p className="text-muted-foreground">Please select a project first.</p>
                      <Button variant="outline" onClick={() => setActiveTab('projects')}>
                        Go to Projects
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

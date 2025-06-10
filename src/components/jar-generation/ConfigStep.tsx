
import React, { useState, useMemo } from 'react';
import { GitBranch, Search, ChevronDown, ChevronRight, FolderOpen, Settings, Database } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Project, Environment } from '@/types/project';

type ConfigStepProps = {
  branches: string[];
  branch: string;
  setBranch: (branch: string) => void;
  commits: { sha: string; message: string }[];
  version: string;
  setVersion: (version: string) => void;
  strategy: 'full' | 'commit' | 'manual';
  setStrategy: (strategy: 'full' | 'commit' | 'manual') => void;
  selectedCommit: string;
  setSelectedCommit: (commit: string) => void;
  loadingBranches: boolean;
  loadingCommits: boolean;
  
  projects: Project[];
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  environments: Environment[];
  selectedEnvironment: Environment | null;
  setSelectedEnvironment: (environment: Environment | null) => void;
};

const ConfigStep: React.FC<ConfigStepProps> = ({
  branches,
  branch,
  setBranch,
  commits,
  version,
  setVersion,
  strategy,
  setStrategy,
  selectedCommit,
  setSelectedCommit,
  loadingBranches,
  loadingCommits,
  projects,
  selectedProject,
  setSelectedProject,
  environments,
  selectedEnvironment,
  setSelectedEnvironment,
}) => {
  const [projectOpen, setProjectOpen] = useState(true);
  const [gitOpen, setGitOpen] = useState(true);
  const [buildOpen, setBuildOpen] = useState(true);
  
  const [projectSearch, setProjectSearch] = useState('');
  const [environmentSearch, setEnvironmentSearch] = useState('');
  const [branchSearch, setBranchSearch] = useState('');
  const [commitSearch, setCommitSearch] = useState('');

  // Filter projects based on search
  const filteredProjects = useMemo(() => {
    if (!projectSearch.trim()) return projects;
    const searchLower = projectSearch.toLowerCase();
    return projects.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      (p.description && p.description.toLowerCase().includes(searchLower))
    );
  }, [projects, projectSearch]);

  // Filter environments based on search
  const filteredEnvironments = useMemo(() => {
    if (!environmentSearch.trim()) return environments;
    const searchLower = environmentSearch.toLowerCase();
    return environments.filter(env =>
      env.name.toLowerCase().includes(searchLower) ||
      env.host.toLowerCase().includes(searchLower)
    );
  }, [environments, environmentSearch]);

  // Filter branches based on search
  const filteredBranches = useMemo(() => {
    if (!branchSearch.trim()) return branches;
    const searchLower = branchSearch.toLowerCase();
    return branches.filter(b => b.toLowerCase().includes(searchLower));
  }, [branches, branchSearch]);

  // Filter commits based on search
  const filteredCommits = useMemo(() => {
    if (!commitSearch.trim()) return commits;
    const searchLower = commitSearch.toLowerCase();
    return commits.filter(c => 
      c.message.toLowerCase().includes(searchLower) ||
      c.sha.toLowerCase().includes(searchLower)
    );
  }, [commits, commitSearch]);

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 text-white rounded-lg">
              <GitBranch className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Configuration</h2>
              <p className="text-sm text-muted-foreground font-normal">
                Select project, environment, branch, and build strategy
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Project & Environment Selection */}
      <Card>
        <Collapsible open={projectOpen} onOpenChange={setProjectOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 text-white rounded-lg">
                    <FolderOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Project & Environment</h3>
                    <p className="text-sm text-muted-foreground font-normal">
                      Choose your project and target environment
                    </p>
                  </div>
                </div>
                {projectOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Project Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Required
                    </Badge>
                    Project
                  </Label>
                  
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search projects..."
                        value={projectSearch}
                        onChange={(e) => setProjectSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    
                    <Select 
                      value={selectedProject?.id || ''} 
                      onValueChange={(value) => {
                        const project = projects.find(p => p.id === value) || null;
                        setSelectedProject(project);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {filteredProjects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {filteredProjects.length === 0 && projectSearch && (
                    <p className="text-sm text-muted-foreground">
                      No projects match your search criteria.
                    </p>
                  )}
                  
                  {selectedProject && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        {selectedProject.description || 'No description available.'}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Environment Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Badge variant="outline" className="bg-purple-100 text-purple-800">
                      Optional
                    </Badge>
                    Environment
                  </Label>
                  
                  {selectedProject ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search environments..."
                          value={environmentSearch}
                          onChange={(e) => setEnvironmentSearch(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      
                      <Select 
                        value={selectedEnvironment?.id || ''} 
                        onValueChange={(value) => {
                          const env = environments.find(e => e.id === value) || null;
                          setSelectedEnvironment(env);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select an environment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {filteredEnvironments.map((env) => (
                              <SelectItem key={env.id} value={env.id}>
                                {env.name} {env.isProduction && '(Production)'}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      
                      {filteredEnvironments.length === 0 && environmentSearch && (
                        <p className="text-sm text-muted-foreground">
                          No environments match your search criteria.
                        </p>
                      )}
                      
                      {selectedEnvironment && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            Host: {selectedEnvironment.host}:{selectedEnvironment.port}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-muted/30 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">
                        Select a project first to view environments
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Git Configuration */}
      {selectedProject && (
        <Card>
          <Collapsible open={gitOpen} onOpenChange={setGitOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500 text-white rounded-lg">
                      <GitBranch className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Git Configuration</h3>
                      <p className="text-sm text-muted-foreground font-normal">
                        Select branch and version settings
                      </p>
                    </div>
                  </div>
                  {gitOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Branch Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Required
                      </Badge>
                      Branch
                    </Label>
                    
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search branches..."
                          value={branchSearch}
                          onChange={(e) => setBranchSearch(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      
                      <Select value={branch} onValueChange={setBranch} disabled={loadingBranches}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a branch" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {loadingBranches ? (
                              <SelectItem value="loading">Loading...</SelectItem>
                            ) : (
                              filteredBranches.map((b) => (
                                <SelectItem key={b} value={b}>
                                  {b}
                                </SelectItem>
                              ))
                            )}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Version Number */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Version
                      </Badge>
                      Version Number
                    </Label>
                    <Input
                      type="text"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      placeholder="1.0.0"
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Build Strategy */}
      {selectedProject && branch && (
        <Card>
          <Collapsible open={buildOpen} onOpenChange={setBuildOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500 text-white rounded-lg">
                      <Settings className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Build Strategy</h3>
                      <p className="text-sm text-muted-foreground font-normal">
                        Choose how to select files for the JAR
                      </p>
                    </div>
                  </div>
                  {buildOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-4">
                <RadioGroup value={strategy} onValueChange={(v) => setStrategy(v as 'full' | 'commit' | 'manual')}>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                      <RadioGroupItem value="full" id="full" className="mt-1" />
                      <Label htmlFor="full" className="cursor-pointer flex-1">
                        <div className="font-semibold">Full Build</div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Includes all files in the repository at the selected HEAD commit
                        </p>
                      </Label>
                    </div>

                    <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                      <RadioGroupItem value="commit" id="commit" className="mt-1" />
                      <Label htmlFor="commit" className="cursor-pointer flex-1">
                        <div className="font-semibold">Single Commit</div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Only includes files changed in the selected commit
                        </p>
                      </Label>
                    </div>

                    <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                      <RadioGroupItem value="manual" id="manual" className="mt-1" />
                      <Label htmlFor="manual" className="cursor-pointer flex-1">
                        <div className="font-semibold">Manual Selection</div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Manually select individual files from the repository
                        </p>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                {/* Commit Selector (only show if strategy is 'commit') */}
                {strategy === 'commit' && (
                  <div className="space-y-3 mt-4 p-4 bg-muted/20 rounded-lg">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        Required
                      </Badge>
                      Select Commit
                    </Label>
                    
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search commits..."
                          value={commitSearch}
                          onChange={(e) => setCommitSearch(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      
                      <Select value={selectedCommit} onValueChange={setSelectedCommit} disabled={loadingCommits}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a commit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {loadingCommits ? (
                              <SelectItem value="loading">Loading...</SelectItem>
                            ) : (
                              filteredCommits.map((c) => (
                                <SelectItem key={c.sha} value={c.sha}>
                                  {c.sha.slice(0, 7)} — {c.message}
                                </SelectItem>
                              ))
                            )}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}
    </div>
  );
};

export default ConfigStep;

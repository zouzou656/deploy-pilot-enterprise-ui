
import React from 'react';
import { GitBranch, Server, Package, Settings } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
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
  return (
    <div className="space-y-6">
      {/* Project Selection Card */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            Project Selection
          </CardTitle>
          <CardDescription className="text-base">
            Choose your project and deployment environment
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Project Selection */}
          <div className="space-y-3">
            <Label htmlFor="project" className="text-base font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" />
              Project
            </Label>
            <Select 
              value={selectedProject?.id || ''} 
              onValueChange={(value) => {
                const project = projects.find(p => p.id === value) || null;
                setSelectedProject(project);
              }}
            >
              <SelectTrigger className="w-full h-12 bg-white dark:bg-gray-800 border-2">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id} className="py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{project.name}</span>
                        {project.description && (
                          <span className="text-sm text-muted-foreground">
                            {project.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            
            {projects.length === 0 && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  No projects available. Please create a project first.
                </p>
              </div>
            )}
          </div>
          
          {/* Environment Selection */}
          {selectedProject && (
            <div className="space-y-3">
              <Label htmlFor="environment" className="text-base font-semibold flex items-center gap-2">
                <Server className="h-4 w-4" />
                Environment
              </Label>
              <Select 
                value={selectedEnvironment?.id || ''} 
                onValueChange={(value) => {
                  const env = environments.find(e => e.id === value) || null;
                  setSelectedEnvironment(env);
                }}
              >
                <SelectTrigger className="w-full h-12 bg-white dark:bg-gray-800 border-2">
                  <SelectValue placeholder="Select an environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {environments.map((env) => (
                      <SelectItem key={env.id} value={env.id} className="py-3">
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{env.name}</span>
                          {env.isProduction && (
                            <Badge variant="destructive" className="ml-2">Production</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              
              {environments.length === 0 && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    No environments available. Please create an environment first.
                  </p>
                </div>
              )}
              
              {selectedEnvironment && (
                <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>Target:</strong> {selectedEnvironment.host}:{selectedEnvironment.port}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Git Configuration Card */}
      {selectedProject && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-green-500 rounded-lg">
                <GitBranch className="h-6 w-6 text-white" />
              </div>
              Git Configuration
            </CardTitle>
            <CardDescription className="text-base">
              Configure branch, version, and build strategy
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Branch and Version Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Branch Selection */}
              <div className="space-y-3">
                <Label htmlFor="branch" className="text-base font-semibold">Branch</Label>
                <Select value={branch} onValueChange={setBranch} disabled={loadingBranches}>
                  <SelectTrigger className="w-full h-12 bg-white dark:bg-gray-800 border-2">
                    <SelectValue placeholder="Select a branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {loadingBranches ? (
                        <SelectItem value="loading">Loading...</SelectItem>
                      ) : (
                        branches.map((b) => (
                          <SelectItem key={b} value={b}>
                            <div className="flex items-center gap-2">
                              <GitBranch className="h-4 w-4" />
                              {b}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Version */}
              {branch && (
                <div className="space-y-3">
                  <Label htmlFor="version" className="text-base font-semibold">Version</Label>
                  <Input
                    type="text"
                    id="version"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="1.0.0"
                    className="h-12 bg-white dark:bg-gray-800 border-2"
                  />
                </div>
              )}
            </div>

            {/* Build Strategy */}
            {branch && (
              <div className="space-y-4">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Build Strategy
                </Label>
                
                <RadioGroup 
                  value={strategy} 
                  onValueChange={(v) => setStrategy(v as 'full' | 'commit' | 'manual')}
                  className="space-y-4"
                >
                  <div className="flex items-start space-x-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                    <RadioGroupItem value="full" id="full" className="mt-1" />
                    <Label htmlFor="full" className="cursor-pointer flex-1">
                      <div className="space-y-1">
                        <span className="font-semibold text-base">Full Build</span>
                        <p className="text-sm text-muted-foreground">
                          Includes all files in the repository at the selected HEAD commit
                        </p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                    <RadioGroupItem value="commit" id="commit" className="mt-1" />
                    <Label htmlFor="commit" className="cursor-pointer flex-1">
                      <div className="space-y-1">
                        <span className="font-semibold text-base">Single Commit</span>
                        <p className="text-sm text-muted-foreground">
                          Only includes files changed in the selected commit
                        </p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                    <RadioGroupItem value="manual" id="manual" className="mt-1" />
                    <Label htmlFor="manual" className="cursor-pointer flex-1">
                      <div className="space-y-1">
                        <span className="font-semibold text-base">Manual Selection</span>
                        <p className="text-sm text-muted-foreground">
                          Manually select individual files from the repository
                        </p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Commit Selector */}
            {branch && strategy === 'commit' && (
              <div className="space-y-3">
                <Label htmlFor="commit" className="text-base font-semibold">Select Commit</Label>
                <Select value={selectedCommit} onValueChange={setSelectedCommit} disabled={loadingCommits}>
                  <SelectTrigger className="w-full h-12 bg-white dark:bg-gray-800 border-2">
                    <SelectValue placeholder="Select a commit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {loadingCommits ? (
                        <SelectItem value="loading">Loading...</SelectItem>
                      ) : (
                        commits.map((c) => (
                          <SelectItem key={c.sha} value={c.sha}>
                            <div className="flex flex-col">
                              <span className="font-mono text-sm">{c.sha.slice(0, 7)}</span>
                              <span className="text-sm">{c.message}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConfigStep;

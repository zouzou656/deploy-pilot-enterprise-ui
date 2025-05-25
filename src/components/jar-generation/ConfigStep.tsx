
import React from 'react';
import { GitBranch } from 'lucide-react';
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
  
  // Environment selection
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
  environments,
  selectedEnvironment,
  setSelectedEnvironment,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <GitBranch className="inline-block mr-2" />
          Configuration
        </CardTitle>
        <CardDescription>Select environment, branch, and build strategy</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Environment Selection */}
        <div className="space-y-2">
          <Label htmlFor="environment" className="text-base font-semibold">Environment</Label>
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
                {environments.map((env) => (
                  <SelectItem key={env.id} value={env.id}>
                    {env.name} {env.isProduction && '(Production)'}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {environments.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No environments available. Please create an environment first.
            </p>
          )}
          
          {selectedEnvironment && (
            <div className="text-sm text-muted-foreground mt-1">
              Host: {selectedEnvironment.host}:{selectedEnvironment.port}
            </div>
          )}
        </div>

        {/* Branch Selection */}
        <div className="space-y-2">
          <Label htmlFor="branch" className="text-base font-semibold">Branch</Label>
          <Select value={branch} onValueChange={setBranch} disabled={loadingBranches}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {loadingBranches ? (
                  <SelectItem value="loading">Loading...</SelectItem>
                ) : (
                  branches.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Version Number */}
        {branch && (
          <div className="space-y-2">
            <Label htmlFor="version" className="text-base font-semibold">Version</Label>
            <Input
              type="text"
              id="version"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.0.0"
            />
          </div>
        )}

        {/* Build Strategy */}
        {branch && (
          <div className="space-y-2">
            <Label className="text-base font-semibold">Build Strategy</Label>
            <RadioGroup value={strategy} onValueChange={(v) => setStrategy(v as 'full' | 'commit' | 'manual')}>
              <div className="flex items-center space-x-2 my-2">
                <RadioGroupItem value="full" id="full" />
                <Label htmlFor="full" className="cursor-pointer">
                  <span className="font-semibold">Full Build</span>
                  <p className="text-sm text-muted-foreground">
                    Includes all files in the repository at the selected HEAD commit
                  </p>
                </Label>
              </div>

              <div className="flex items-center space-x-2 my-2">
                <RadioGroupItem value="commit" id="commit" />
                <Label htmlFor="commit" className="cursor-pointer">
                  <span className="font-semibold">Single Commit</span>
                  <p className="text-sm text-muted-foreground">
                    Only includes files changed in the selected commit
                  </p>
                </Label>
              </div>

              <div className="flex items-center space-x-2 my-2">
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual" className="cursor-pointer">
                  <span className="font-semibold">Manual Selection</span>
                  <p className="text-sm text-muted-foreground">
                    Manually select individual files from the repository
                  </p>
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Commit Selector (only show if strategy is 'commit') */}
        {branch && strategy === 'commit' && (
          <div className="space-y-2">
            <Label htmlFor="commit" className="text-base font-semibold">Select Commit</Label>
            <Select value={selectedCommit} onValueChange={setSelectedCommit} disabled={loadingCommits}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a commit" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {loadingCommits ? (
                    <SelectItem value="loading">Loading...</SelectItem>
                  ) : (
                    commits.map((c) => (
                      <SelectItem key={c.sha} value={c.sha}>
                        {c.sha.slice(0, 7)} — {c.message}
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
  );
};

export default ConfigStep;

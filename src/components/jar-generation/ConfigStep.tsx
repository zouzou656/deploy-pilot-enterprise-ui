
import React from 'react';
import { GitBranch, Eye } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

export type Strategy = 'commit' | 'full' | 'manual';

type ConfigStepProps = {
  branches: string[];
  branch: string;
  setBranch: (branch: string) => void;
  commits: { sha: string; message: string }[];
  version: string;
  setVersion: (version: string) => void;
  strategy: Strategy;
  setStrategy: (strategy: Strategy) => void;
  selectedCommit: string;
  setSelectedCommit: (commit: string) => void;
  loadingBranches: boolean;
  loadingCommits: boolean;
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
}) => {
  // Whenever you change branch, blow away any prior commit
  const onBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBranch(e.target.value);
    setSelectedCommit('');
  };

  // Whenever you switch out of 'commit' mode, clear the SHA
  const onStrategyChange = (val: string) => {
    const strat = val as Strategy;
    setStrategy(strat);
    if (strat !== 'commit') {
      setSelectedCommit('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <GitBranch className="inline-block mr-2"/>
          Repo &amp; Mode
        </CardTitle>
        <CardDescription>
          Branch, version, strategy &amp; (if commit) SHA
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Branch Picker */}
        <div>
          <Label>
            Branch{' '}
            <Tooltip>
              <TooltipTrigger asChild>
                <Eye className="inline-block mr-2 cursor-pointer"/>
              </TooltipTrigger>
              <TooltipContent side="top">Git branch to package</TooltipContent>
            </Tooltip>
          </Label>
          <select
            className="w-full p-2 border rounded bg-white text-gray-900
                     dark:bg-gray-800 dark:text-gray-100
                     border-gray-300 dark:border-gray-700
                     focus:ring-2 focus:ring-blue-500"
            value={branch}
            onChange={onBranchChange}
          >
            {loadingBranches ? (
              <option>Loading branches…</option>
            ) : (
              branches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Version */}
        <div>
          <Label>
            Version{' '}
            <Tooltip>
              <TooltipTrigger asChild>
                <Eye className="inline-block mr-2 cursor-pointer"/>
              </TooltipTrigger>
              <TooltipContent side="top">Semantic Version</TooltipContent>
            </Tooltip>
          </Label>
          <input
            className="w-full p-2 border rounded bg-white text-gray-900
                     dark:bg-gray-800 dark:text-gray-100
                     border-gray-300 dark:border-gray-700
                     focus:ring-2 focus:ring-blue-500"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
          />
        </div>

        {/* Strategy */}
        <div>
          <Label>
            Mode{' '}
            <Tooltip>
              <TooltipTrigger asChild>
                <Eye className="inline-block mr-2 cursor-pointer"/>
              </TooltipTrigger>
              <TooltipContent side="top">How to pick your files</TooltipContent>
            </Tooltip>
          </Label>
          <RadioGroup
            className="flex flex-col space-y-2 mt-2"
            value={strategy}
            onValueChange={onStrategyChange}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="commit" id="cmt" />
              <Label htmlFor="cmt">Single-Commit</Label>
            </div>
            {strategy === 'commit' && (
              <select
                className="mt-1 p-2 border rounded w-full bg-white text-gray-900
                         dark:bg-gray-800 dark:text-gray-100
                         border-gray-300 dark:border-gray-700
                         focus:ring-2 focus:ring-blue-500"
                value={selectedCommit}
                onChange={(e) => setSelectedCommit(e.target.value)}
              >
                <option disabled value="">
                  — pick commit —
                </option>
                {loadingCommits ? (
                  <option>Loading…</option>
                ) : (
                  commits.map((c) => (
                    <option key={c.sha} value={c.sha}>
                      {c.sha.slice(0, 7)} — {c.message}
                    </option>
                  ))
                )}
              </select>
            )}
            <div className="flex items-center gap-2">
              <RadioGroupItem value="full" id="full" />
              <Label htmlFor="full">Full-Build</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="manual" id="man" />
              <Label htmlFor="man">Manual</Label>
            </div>
          </RadioGroup>
        </div>

      </CardContent>
    </Card>
  );
};

export default ConfigStep;

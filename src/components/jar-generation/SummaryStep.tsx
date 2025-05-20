
import React from 'react';
import { CheckCircle } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Project, ProjectEnvironment, FileOverride } from '@/types/project';
import { FileEntry } from './FileTree';

type SummaryStepProps = {
  branch: string;
  version: string;
  strategy: 'commit' | 'full' | 'manual';
  selectedFiles: string[];
  filesToShow: {filename: string, status: string}[];
  project: Project | null;
  environment: ProjectEnvironment | null;
  applyOverrides: boolean;
  fileOverrides: FileOverride[];
  onConfirm: () => void;
  onBack: () => void;
};

const SummaryStep: React.FC<SummaryStepProps> = ({
  branch,
  version,
  strategy,
  selectedFiles,
  filesToShow,
  project,
  environment,
  applyOverrides,
  fileOverrides,
  onConfirm,
  onBack,
}) => {
  const statusCounts = selectedFiles.reduce<Record<string, number>>(
    (acc, filename) => {
      const file = filesToShow.find(f => f.filename === filename);
      const status = file?.status || 'unchanged';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <CheckCircle className="inline-block mr-2" />
          Summary
        </CardTitle>
        <CardDescription>Review your JAR generation settings before confirming</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Project and Environment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 bg-card">
            <h3 className="text-lg font-semibold mb-2">Project</h3>
            {project ? (
              <div className="space-y-1">
                <p><span className="font-medium">Name:</span> {project.name}</p>
                {project.description && (
                  <p><span className="font-medium">Description:</span> {project.description}</p>
                )}
                <p><span className="font-medium">Repository:</span> <span className="font-mono text-xs">{project.gitRepoUrl}</span></p>
              </div>
            ) : (
              <p className="text-muted-foreground">No project selected</p>
            )}
          </div>
          
          <div className="border rounded-lg p-4 bg-card">
            <h3 className="text-lg font-semibold mb-2">Environment</h3>
            {environment ? (
              <div className="space-y-1">
                <p><span className="font-medium">Name:</span> {environment.name}</p>
                <p><span className="font-medium">Host:</span> {environment.host}:{environment.port}</p>
                <p><span className="font-medium">Type:</span> {environment.isProduction ? 'Production' : 'Non-Production'}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">No environment selected</p>
            )}
          </div>
        </div>
        
        {/* Build Settings */}
        <div className="border rounded-lg p-4 bg-card">
          <h3 className="text-lg font-semibold mb-2">Build Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><span className="font-medium">Branch:</span> {branch}</p>
              <p><span className="font-medium">Build Strategy:</span> {strategy === 'full' ? 'Full Build' : strategy === 'commit' ? 'Single Commit' : 'Manual Selection'}</p>
              <p><span className="font-medium">Version:</span> {version}</p>
            </div>
            <div>
              <p><span className="font-medium">Total Files:</span> {selectedFiles.length}</p>
              {Object.entries(statusCounts).map(([status, count]) => (
                <p key={status}><span className="font-medium">{status === 'modify' ? 'Modified' : status === 'add' ? 'Added' : status === 'delete' ? 'Deleted' : 'Unchanged'}:</span> {count}</p>
              ))}
            </div>
          </div>
        </div>
        
        {/* File Overrides */}
        <div className="border rounded-lg p-4 bg-card">
          <h3 className="text-lg font-semibold mb-2">File Overrides</h3>
          {environment && fileOverrides.length > 0 ? (
            <div className="space-y-2">
              <p>
                <span className="font-medium">Status:</span> 
                {applyOverrides ? (
                  <span className="text-green-600 ml-1">Will apply {fileOverrides.length} file overrides</span>
                ) : (
                  <span className="text-amber-600 ml-1">Overrides disabled</span>
                )}
              </p>
              
              {applyOverrides && (
                <div>
                  <p className="font-medium mb-1">Overrides to be applied:</p>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {fileOverrides.map((override) => (
                      <li key={override.id}>
                        {override.filename}: <span className="font-mono">{override.originalValue}</span> → <span className="font-mono">{override.overrideValue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">No file overrides available</p>
          )}
        </div>
        
        {/* Selected Files */}
        <div className="border rounded-lg p-4 bg-card">
          <h3 className="text-lg font-semibold mb-2">Selected Files</h3>
          {selectedFiles.length > 0 ? (
            <div className="max-h-40 overflow-auto">
              <ul className="list-disc pl-5 text-sm">
                {selectedFiles.slice(0, 10).map((filename) => (
                  <li key={filename} className="mb-1">
                    <code className="text-xs font-mono">{filename}</code>
                  </li>
                ))}
                {selectedFiles.length > 10 && (
                  <li className="text-muted-foreground">
                    ...and {selectedFiles.length - 10} more files
                  </li>
                )}
              </ul>
            </div>
          ) : (
            <p className="text-muted-foreground">No files selected</p>
          )}
        </div>
        
        <Alert className="mt-6">
          <AlertTitle>Ready to generate JAR?</AlertTitle>
          <AlertDescription>
            This will generate a JAR file with {selectedFiles.length} files for {project?.name || 'the selected project'}
            {environment && ` targeting the ${environment.name} environment`}.
            {applyOverrides && fileOverrides.length > 0 && ` ${fileOverrides.length} file overrides will be applied.`}
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onConfirm}>
          Generate JAR
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SummaryStep;

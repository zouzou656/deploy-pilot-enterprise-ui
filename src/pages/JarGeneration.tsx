
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Package, 
  RefreshCw, 
  AlertCircle 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AuthGuard from '@/components/auth/AuthGuard';
import PageHeader from '@/components/ui-custom/PageHeader';
import PipelineNav from '@/components/jar-generation/PipelineNav';
import ConfigStep from '@/components/jar-generation/ConfigStep';
import FileSelectionStep from '@/components/jar-generation/FileSelectionStep';
import PreviewStep from '@/components/jar-generation/PreviewStep';
import SummaryStep from '@/components/jar-generation/SummaryStep';
import { useProject } from '@/contexts/ProjectContext';
import { gitService } from '@/services/gitService';
import { environmentService } from '@/services/environmentService';
import { fileOverrideService } from '@/services/fileOverrideService';
import { Environment, FileOverride } from '@/types/project';
import { FileChangeDto } from '@/types/git';

export type GenerationStrategy = 'commit' | 'full' | 'manual';

export interface JarConfig {
  branch: string;
  strategy: GenerationStrategy;
  version: string;
  environment: Environment | null;
  baseSha?: string;
  headSha?: string;
  applyOverrides: boolean;
}

export interface PipelineStep {
  number: number;
  title: string;
  description: string;
}

const JarGeneration = () => {
  const { selectedProject } = useProject();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [branch, setBranch] = useState('main');
  const [version, setVersion] = useState('1.0.0');
  const [strategy, setStrategy] = useState<GenerationStrategy>('commit');
  const [selectedCommit, setSelectedCommit] = useState('');
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileChangeDto[]>([]);
  const [fileOverrides, setFileOverrides] = useState<FileOverride[]>([]);
  const [applyOverrides, setApplyOverrides] = useState(false);

  // Fetch branches
  const { data: branches = [], isLoading: loadingBranches } = useQuery({
    queryKey: ['branches', selectedProject?.id],
    queryFn: () => selectedProject ? gitService.getBranches(selectedProject.id) : Promise.resolve([]),
    enabled: !!selectedProject?.id,
  });

  // Fetch environments for selected project
  const { data: environments = [], isLoading: loadingEnvironments } = useQuery({
    queryKey: ['environments', selectedProject?.id],
    queryFn: () => selectedProject ? environmentService.getEnvironmentsByProject(selectedProject.id) : Promise.resolve([]),
    enabled: !!selectedProject?.id,
  });

  // Fetch commits when branch changes
  const { data: commits = [], isLoading: loadingCommits, refetch: refetchCommits } = useQuery({
    queryKey: ['commits', selectedProject?.id, branch],
    queryFn: () => selectedProject ? gitService.getCommits({
      projectId: selectedProject.id,
      branch: branch
    }) : Promise.resolve([]),
    enabled: !!selectedProject?.id && !!branch,
  });

  // Fetch file overrides when environment changes
  const { data: envFileOverrides = [], refetch: refetchOverrides } = useQuery({
    queryKey: ['file-overrides', selectedEnvironment?.id],
    queryFn: () => selectedEnvironment ? fileOverrideService.getFileOverridesByEnvironment(selectedEnvironment.id) : Promise.resolve([]),
    enabled: !!selectedEnvironment?.id,
  });

  useEffect(() => {
    setFileOverrides(envFileOverrides);
  }, [envFileOverrides]);

  // Set default branch when branches are loaded
  useEffect(() => {
    if (branches.length > 0 && !branches.includes(branch)) {
      setBranch(branches[0]);
    }
  }, [branches, branch]);

  const handleFetchFiles = async () => {
    if (!selectedProject) return;

    try {
      let files: FileChangeDto[] = [];
      
      if (strategy === 'full') {
        const response = await gitService.getFull({
          projectId: selectedProject.id,
          branch: branch
        });
        files = response.files || [];
      } else if (strategy === 'commit' && selectedCommit) {
        const response = await gitService.getCommitDetail(selectedCommit, selectedProject.id);
        files = response.files || [];
      }
      
      setSelectedFiles(files);
      setCurrentStep(2);
    } catch (error: any) {
      toast({
        title: 'Error fetching files',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps: PipelineStep[] = [
    { number: 1, title: 'Configuration', description: 'Set branch, strategy and environment' },
    { number: 2, title: 'File Selection', description: 'Choose files to include' },
    { number: 3, title: 'Preview', description: 'Review changes and overrides' },
    { number: 4, title: 'Summary', description: 'Generate JAR file' }
  ];

  if (!selectedProject) {
    return (
      <AuthGuard requiredPermission="deployment:create">
        <div className="flex items-center justify-center h-screen">
          <Card className="text-center p-8">
            <CardContent>
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Please select a project to generate JAR files.</p>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredPermission="deployment:create">
      <div className="container mx-auto py-6 space-y-6">
        <PageHeader
          title="JAR Generation"
          description={`Generate deployment packages for ${selectedProject.name}`}
        />

        <PipelineNav 
          steps={steps} 
          currentStep={currentStep} 
          onStepClick={setCurrentStep}
        />

        {currentStep === 1 && (
          <ConfigStep
            branches={branches}
            branch={branch}
            setBranch={setBranch}
            commits={commits}
            version={version}
            setVersion={setVersion}
            strategy={strategy}
            setStrategy={setStrategy}
            selectedCommit={selectedCommit}
            setSelectedCommit={setSelectedCommit}
            loadingBranches={loadingBranches}
            loadingCommits={loadingCommits}
            environments={environments}
            selectedEnvironment={selectedEnvironment}
            setSelectedEnvironment={setSelectedEnvironment}
          />
        )}

        {currentStep === 2 && (
          <div className="flex justify-between">
            <Button variant="outline" onClick={handlePrevious}>
              Back
            </Button>
            <Button onClick={handleNext}>
              Next
            </Button>
          </div>
        )}

        {currentStep === 3 && (
          <div className="flex justify-between">
            <Button variant="outline" onClick={handlePrevious}>
              Back
            </Button>
            <Button onClick={handleNext}>
              Next
            </Button>
          </div>
        )}

        {currentStep === 4 && (
          <SummaryStep
            branch={branch}
            version={version}
            strategy={strategy}
            selectedFiles={selectedFiles.map(f => f.filename)}
            filesToShow={selectedFiles.map(f => ({ filename: f.filename, status: f.status }))}
            project={selectedProject}
            environment={selectedEnvironment}
            applyOverrides={applyOverrides}
            fileOverrides={fileOverrides}
            onConfirm={() => {
              toast({
                title: 'JAR Generation Started',
                description: 'Your JAR file is being generated...'
              });
            }}
            onBack={handlePrevious}
          />
        )}
      </div>
    </AuthGuard>
  );
};

export default JarGeneration;

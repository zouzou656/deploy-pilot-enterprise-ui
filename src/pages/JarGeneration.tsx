
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

export interface FileChange {
  filename: string;
  status: string;
  patch?: string;
}

const JarGeneration = () => {
  const { selectedProject } = useProject();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [jarConfig, setJarConfig] = useState<JarConfig>({
    branch: 'main',
    strategy: 'commit',
    version: '1.0.0',
    environment: null,
    applyOverrides: false
  });
  const [selectedFiles, setSelectedFiles] = useState<FileChange[]>([]);
  const [fileOverrides, setFileOverrides] = useState<FileOverride[]>([]);

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
    queryKey: ['commits', selectedProject?.id, jarConfig.branch],
    queryFn: () => selectedProject ? gitService.getCommits({
      projectId: selectedProject.id,
      branch: jarConfig.branch
    }) : Promise.resolve([]),
    enabled: !!selectedProject?.id && !!jarConfig.branch,
  });

  // Fetch file overrides when environment changes
  const { data: envFileOverrides = [], refetch: refetchOverrides } = useQuery({
    queryKey: ['file-overrides', jarConfig.environment?.id],
    queryFn: () => jarConfig.environment ? fileOverrideService.getFileOverridesByEnvironment(jarConfig.environment.id) : Promise.resolve([]),
    enabled: !!jarConfig.environment?.id,
  });

  useEffect(() => {
    setFileOverrides(envFileOverrides);
  }, [envFileOverrides]);

  // Set default branch when branches are loaded
  useEffect(() => {
    if (branches.length > 0 && !branches.includes(jarConfig.branch)) {
      setJarConfig(prev => ({ ...prev, branch: branches[0] }));
    }
  }, [branches, jarConfig.branch]);

  const handleFetchFiles = async () => {
    if (!selectedProject) return;

    try {
      let files: FileChange[] = [];
      
      if (jarConfig.strategy === 'full') {
        const response = await gitService.getFull({
          projectId: selectedProject.id,
          branch: jarConfig.branch
        });
        files = response.files || [];
      } else if (jarConfig.strategy === 'commit' && jarConfig.baseSha && jarConfig.headSha) {
        const response = await gitService.compare({
          projectId: selectedProject.id,
          baseSha: jarConfig.baseSha,
          headSha: jarConfig.headSha
        });
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

  const steps = [
    { number: 1, title: 'Configuration', description: 'Set branch, strategy and environment' },
    { number: 2, title: 'File Selection', description: 'Choose files to include' },
    { number: 3, title: 'Preview', description: 'Review changes and overrides' },
    { number: 4, title: 'Summary', description: 'Generate JAR file' }
  ];

  if (!selectedProject) {
    return (
      <AuthGuard requiredPermission="jar:generate">
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
    <AuthGuard requiredPermission="jar:generate">
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
            config={jarConfig}
            onConfigChange={setJarConfig}
            branches={branches}
            environments={environments}
            commits={commits}
            onNext={handleNext}
            onFetchFiles={handleFetchFiles}
            isLoading={loadingBranches || loadingEnvironments || loadingCommits}
          />
        )}

        {currentStep === 2 && (
          <FileSelectionStep
            files={selectedFiles}
            onFilesChange={setSelectedFiles}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}

        {currentStep === 3 && (
          <PreviewStep
            config={jarConfig}
            files={selectedFiles}
            fileOverrides={fileOverrides}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}

        {currentStep === 4 && (
          <SummaryStep
            config={jarConfig}
            files={selectedFiles}
            fileOverrides={fileOverrides}
            onPrevious={handlePrevious}
            projectId={selectedProject.id}
          />
        )}
      </div>
    </AuthGuard>
  );
};

export default JarGeneration;

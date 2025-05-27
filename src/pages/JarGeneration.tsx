import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useProject } from '@/contexts/ProjectContext';
import useAuthStore from '@/stores/authStore';

import PipelineNav from '@/components/jar-generation/PipelineNav';
import FileSelectionStep from '@/components/jar-generation/FileSelectionStep';
import ConfigStep from '@/components/jar-generation/ConfigStep';
import PreviewStep from '@/components/jar-generation/PreviewStep';
import SummaryStep from '@/components/jar-generation/SummaryStep';

type PipelineStep = 'files' | 'config' | 'preview' | 'summary';

interface JarRequest {
  projectId: string;
  files: string[];
  configuration: {
    environment: string;
    buildType: string;
    includeTests: boolean;
  };
}

const JarGeneration = () => {
  const [currentStep, setCurrentStep] = useState<PipelineStep>('files');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [configuration, setConfiguration] = useState({
    environment: 'development',
    buildType: 'release',
    includeTests: false,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedJarInfo, setGeneratedJarInfo] = useState<any>(null);

  const { selectedProject } = useProject();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const handleStepChange = (step: string) => {
    setCurrentStep(step as PipelineStep);
  };

  const handleNext = () => {
    const steps: PipelineStep[] = ['files', 'config', 'preview', 'summary'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const steps: PipelineStep[] = ['files', 'config', 'preview', 'summary'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleGenerateJar = async () => {
    if (!selectedProject) {
      toast({
        title: 'No Project Selected',
        description: 'Please select a project to generate JAR file.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const jarRequest: JarRequest = {
        projectId: selectedProject.id,
        files: selectedFiles,
        configuration,
      };

      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setGeneratedJarInfo({
        fileName: `${selectedProject.name}-${Date.now()}.jar`,
        size: '2.3 MB',
        generatedAt: new Date().toISOString(),
      });

      toast({
        title: 'JAR Generated Successfully',
        description: 'Your JAR file has been generated and is ready for deployment.',
      });

      setCurrentStep('summary');
    } catch (error) {
      console.error('JAR generation failed:', error);
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate JAR file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!selectedProject) {
    return (
      <div className="container py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">No Project Selected</h2>
            <p className="text-muted-foreground">Please select a project to generate JAR files.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">JAR Generation</h1>
          <p className="text-muted-foreground">
            Generate deployment artifacts for {selectedProject.name}
          </p>
        </div>
        <Badge variant="secondary">{selectedProject.name}</Badge>
      </div>

      <PipelineNav 
        currentStep={currentStep} 
        onStepChange={handleStepChange}
        isGenerating={isGenerating}
      />

      <div className="grid gap-6">
        {currentStep === 'files' && (
          <FileSelectionStep
            selectedFiles={selectedFiles}
            onFilesChange={setSelectedFiles}
            projectId={selectedProject.id}
          />
        )}

        {currentStep === 'config' && (
          <ConfigStep
            configuration={configuration}
            onConfigurationChange={setConfiguration}
          />
        )}

        {currentStep === 'preview' && (
          <PreviewStep
            selectedFiles={selectedFiles}
            configuration={configuration}
            projectName={selectedProject.name}
          />
        )}

        {currentStep === 'summary' && (
          <SummaryStep
            jarInfo={generatedJarInfo}
            selectedFiles={selectedFiles}
            configuration={configuration}
            projectName={selectedProject.name}
          />
        )}
      </div>

      <Separator />

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 'files' || isGenerating}
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {currentStep === 'preview' && (
            <Button
              onClick={handleGenerateJar}
              disabled={selectedFiles.length === 0 || isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate JAR'}
            </Button>
          )}

          {currentStep !== 'preview' && currentStep !== 'summary' && (
            <Button
              onClick={handleNext}
              disabled={
                (currentStep === 'files' && selectedFiles.length === 0) ||
                isGenerating
              }
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JarGeneration;

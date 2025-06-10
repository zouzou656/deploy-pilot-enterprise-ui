import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { useToast } from "@/components/ui/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Project } from '@/types/project';
import { projectService } from '@/services/projectService';
import { gitService } from '@/services/gitService';
import { environmentService } from '@/services/environmentService';
import { Environment } from '@/types/project';
import { FileEntry } from '@/components/jar-generation/FileTree';
import { JarGenerationRequestDto } from '@/types/jar';
import { jarService } from '@/services/jarService';
import { v4 as uuidv4 } from 'uuid';
import { Steps, Step } from '@/components/Steps';
import ProjectSelectionStep from '@/components/jar-generation/ProjectSelectionStep';
import GitConfigurationStep from '@/components/jar-generation/GitConfigurationStep';
import ProjectDetailsStep from '@/components/jar-generation/ProjectDetailsStep';
import TargetEnvironmentStep from '@/components/jar-generation/TargetEnvironmentStep';
import PreviewStep from '@/components/jar-generation/PreviewStep';
import SummaryStep from '@/components/jar-generation/SummaryStep';

const EMPTY_PROJECT_ARRAY: Project[] = [];
const EMPTY_ENVIRONMENT_ARRAY: Environment[] = [];
const EMPTY_FILE_ENTRY_ARRAY: FileEntry[] = [];
const EMPTY_COMMIT_ARRAY: { sha: string; message: string }[] = [];

export default function JarGeneration() {
  const router = useRouter();
  const { toast } = useToast()

  const [activeStep, setActiveStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [branch, setBranch] = useState('');
  const [version, setVersion] = useState('');
  const [environmentId, setEnvironmentId] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<'commit' | 'full' | 'manual'>('commit');
  const [initialBase, setInitialBase] = useState('');
  const [initialHead, setInitialHead] = useState('');
  const [previewBase, setPreviewBase] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [previewExpanded, setPreviewExpanded] = useState<Set<string>>(new Set());

  const previewTabDisabled = strategy === 'manual';

  const toggleFile = useCallback((path: string) => {
    setSelectedFiles(curr => {
      if (curr.includes(path)) {
        return curr.filter(p => p !== path);
      } else {
        return [...curr, path];
      }
    });
  }, []);

  const { data: projects = EMPTY_PROJECT_ARRAY } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getProjects()
  });

  const { data: environments = EMPTY_ENVIRONMENT_ARRAY } = useQuery({
    queryKey: ['environments', selectedProject?.id],
    queryFn: () => environmentService.getEnvironmentsByProject(selectedProject!.id!),
    enabled: !!selectedProject?.id
  });

  const { data: branches = [] } = useQuery({
    queryKey: ['branches', selectedProject?.id],
    queryFn: () => gitService.getBranches(selectedProject!.id!),
    enabled: !!selectedProject?.id
  });

  const { data: commits = EMPTY_COMMIT_ARRAY } = useQuery({
    queryKey: ['commits', selectedProject?.id, branch],
    queryFn: () => gitService.getCommits({ projectId: selectedProject!.id!, branch }),
    enabled: !!selectedProject?.id && !!branch
  });

  useEffect(() => {
    if (commits.length > 0) {
      setInitialBase(commits[1]?.sha || commits[0]?.sha);
      setInitialHead(commits[0]?.sha);
      setPreviewBase(commits[1]?.sha || commits[0]?.sha);
    }
  }, [commits]);

  const { data: comparedFiles = EMPTY_FILE_ENTRY_ARRAY } = useQuery({
    queryKey: ['compare', selectedProject?.id, initialBase, initialHead],
    queryFn: () => gitService.compare(selectedProject!.id!, initialBase, initialHead),
    enabled:
      strategy === 'commit' &&
      !!selectedProject?.id &&
      !!initialBase &&
      !!initialHead
  });

  const { data: fullFiles = EMPTY_FILE_ENTRY_ARRAY } = useQuery({
    queryKey: ['fullCompare', selectedProject?.id, branch],
    queryFn: async () => {
      const result = await gitService.full(selectedProject!.id!, branch);
      return Array.isArray(result) ? result : [];
    },
    enabled:
        strategy === 'full' &&
        !!selectedProject?.id &&
        !!branch &&
        !!initialBase &&
        !!initialHead
  });

  const allFiles = strategy === 'full' ? fullFiles : comparedFiles;

  const [highlighted, setHighlighted] = useState<FileEntry | null>(null);

  const handleNext = () => {
    setActiveStep((curr) => Math.min(curr + 1, 4));
  };

  const handleBack = () => {
    setActiveStep((curr) => Math.max(curr - 1, 0));
  };

  const handleGenerate = async () => {
    if (!selectedProject || !branch || !version) {
      toast({
        variant: "destructive",
        title: "Missing required fields",
        description: "Please fill in all required fields before generating the JAR.",
      })
      return;
    }

    setIsGenerating(true);
    const jobId = uuidv4();

    const payload: JarGenerationRequestDto = {
      jobId: jobId,
      projectId: selectedProject.id!,
      branch: branch,
      version: version,
      environmentId: environmentId,
      strategy: strategy,
      baseSha: initialBase,
      headSha: initialHead,
      applyOverrides: true, // TODO: connect to file overrides
      files: selectedFiles.map(filename => {
        const file = allFiles.find(f => f.filename === filename);
        return {
          filename: filename,
          status: file?.status || 'modified' // Default to 'modified' if status is undefined
        };
      })
    };

    try {
      const result = await jarService.generateJar(payload);
      toast({
        title: "Generation started",
        description: `Your JAR generation has started. You will be redirected to the status page.`,
      })
      router.push(`/status/${result.jobId}`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error starting generation",
        description: error.message || "Failed to start JAR generation.",
      })
    } finally {
      setIsGenerating(false);
    }
  };

  const steps = [
    { label: 'Project Selection' },
    { label: 'Git Configuration' },
    { label: 'Project Details' },
    { label: 'Target Environment' },
    { label: 'Preview & Generate' },
    { label: 'Summary' },
  ];

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">JAR Generation</h1>

      <Steps steps={steps} activeStep={activeStep} />

      <div className="mt-6">
        {activeStep === 0 && (
          <ProjectSelectionStep
            projects={projects}
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
            handleNext={handleNext}
          />
        )}

        {activeStep === 1 && (
          <GitConfigurationStep
            selectedProject={selectedProject}
            branch={branch}
            setBranch={setBranch}
            branches={branches}
            strategy={strategy}
            setStrategy={setStrategy}
            initialBase={initialBase}
            setInitialBase={setInitialBase}
            initialHead={initialHead}
            setInitialHead={setInitialHead}
            commits={commits}
            handleNext={handleNext}
            handleBack={handleBack}
          />
        )}

        {activeStep === 2 && (
          <ProjectDetailsStep
            version={version}
            setVersion={setVersion}
            handleNext={handleNext}
            handleBack={handleBack}
          />
        )}

        {activeStep === 3 && (
          <TargetEnvironmentStep
            selectedProject={selectedProject}
            environmentId={environmentId}
            setEnvironmentId={setEnvironmentId}
            environments={environments}
            handleNext={handleNext}
            handleBack={handleBack}
          />
        )}

        {activeStep === 4 && selectedProject ? (
          <PreviewStep
            previewTabDisabled={previewTabDisabled}
            initialHead={initialHead}
            previewBase={previewBase}
            setPreviewBase={setPreviewBase}
            commits={commits}
            loadingCommits={false} // TODO: connect to loading state
            previewTree={[]} // TODO: connect to file tree
            previewExpanded={previewExpanded}
            toggleExp={(isPreview, path) => {
              setPreviewExpanded(s => {
                const ns = new Set(s);
                ns.has(path) ? ns.delete(path) : ns.add(path);
                return ns;
              });
            }}
            selectedFiles={selectedFiles}
            highlighted={highlighted}
            setHighlighted={setHighlighted}
            projectId={selectedProject.id!}
            environmentId={environmentId}
            fileOverrides={[]} // TODO: connect to file overrides
            applyOverrides={true} // TODO: connect to file overrides
            setApplyOverrides={(apply: boolean) => {}} // TODO: connect to file overrides
            handleGenerate={handleGenerate}
            handleBack={handleBack}
          />
        ) : null}

        {activeStep === 5 && (
          <SummaryStep
            selectedProject={selectedProject}
            branch={branch}
            version={version}
            environmentId={environmentId}
            strategy={strategy}
            initialBase={initialBase}
            initialHead={initialHead}
            selectedFiles={selectedFiles}
            handleGenerate={handleGenerate}
            handleBack={handleBack}
          />
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Settings, Zap, Package, Code, Eye } from 'lucide-react';
import PageHeader from '@/components/ui-custom/PageHeader';
import AuthGuard from '@/components/auth/AuthGuard';
import PipelineNav, { PipelineStep } from '@/components/jar-generation/PipelineNav';
import ConfigStep from '@/components/jar-generation/ConfigStep';
import FileSelectionStep from '@/components/jar-generation/FileSelectionStep';
import PreviewStep from '@/components/jar-generation/PreviewStep';
import SummaryStep from '@/components/jar-generation/SummaryStep';
import { buildTree, collectFolders } from '@/components/jar-generation/TreeUtils';
import { FileEntry } from '@/components/jar-generation/FileTree';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import useAuthStore from '@/stores/authStore';
import { Project, Environment, FileOverride } from '@/types/project';
import { CommitDto } from '@/types/git';
import { projectService } from '@/services/projectService';
import { gitService } from '@/services/gitService';
import { environmentsService } from '@/services/environmentsService';
import { fileOverridesService } from '@/services/fileOverridesService';
import { jarService } from '@/services/jarService';
import { JarGenerationFileDto, JarGenerationRequestDto, JarGenerationResultDto } from '@/types/jar';

// Stable empty arrays to avoid re-creating defaults on every render
const EMPTY_STRING_ARRAY: string[] = [];
const EMPTY_COMMIT_ARRAY: CommitDto[] = [];
const EMPTY_FILE_ENTRY_ARRAY: FileEntry[] = [];

export default function JarGeneration() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  // --- Project / Environment selection ---
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(null);
  const [applyOverrides, setApplyOverrides] = useState<boolean>(true);

  const { data: userProjects = EMPTY_STRING_ARRAY as any } = useQuery({
    queryKey: ['userProjects', user?.id],
    queryFn: () => projectService.getUserProjects(user!.id),
    enabled: !!user?.id
  });

  const { data: projectEnvironments = EMPTY_STRING_ARRAY as any } = useQuery({
    queryKey: ['environments', selectedProject?.id],
    queryFn: () => environmentsService.getEnvironments(selectedProject!.id!),
    enabled: !!selectedProject?.id
  });

  const { data: fileOverrides = [] as FileOverride[] } = useQuery({
    queryKey: ['fileOverrides', selectedEnvironment?.id],
    queryFn: () => fileOverridesService.getFileOverrides(selectedEnvironment!.id!),
    enabled: !!selectedEnvironment?.id
  });

  // --- Pipeline state ---
  const [currentStep, setCurrentStep] = useState<PipelineStep>('config');
  const [branch, setBranch] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [strategy, setStrategy] = useState<'commit' | 'full' | 'manual'>('manual');
  const [selectedCommit, setSelectedCommit] = useState('');

  const [initialBase, setInitialBase] = useState('');
  const [initialHead, setInitialHead] = useState('');
  const [previewBase, setPreviewBase] = useState('');

  const [filesExpanded, setFilesExpanded] = useState<Set<string>>(new Set());
  const [previewExpanded, setPreviewExpanded] = useState<Set<string>>(new Set());
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [highlighted, setHighlighted] = useState<FileEntry | null>(null);

  // --- Git data via gitService ---
  const { data: branches = EMPTY_STRING_ARRAY } = useQuery({
    queryKey: ['branches', selectedProject?.id],
    queryFn: () => gitService.getBranches(selectedProject!.id!),
    enabled: !!selectedProject?.id
  });

  const { data: commits = EMPTY_COMMIT_ARRAY } = useQuery({
    queryKey: ['commits', selectedProject?.id, branch],
    queryFn: () => gitService.getCommits(selectedProject!.id!, branch),
    enabled: !!selectedProject?.id && !!branch
  });

  const { data: allFiles = EMPTY_STRING_ARRAY } = useQuery({
    queryKey: ['allFiles', selectedProject?.id, branch],
    queryFn: () => gitService.tree(selectedProject!.id!, branch),
    enabled: !!selectedProject?.id && !!branch && strategy === 'manual'
  });

  const manualFiles = useMemo(
      () =>
          strategy === 'manual'
              ? allFiles.map(fn => ({ filename: fn, status: 'unmodified' as const }))
              : EMPTY_FILE_ENTRY_ARRAY,
      [allFiles, strategy]
  );

  // Compute base/head SHAs
  useEffect(() => {
    if (!commits.length) return;
    const oldest = commits[commits.length - 1].sha;
    const newest = commits[0].sha;

    if (strategy === 'full') {
      setInitialBase(oldest);
      setInitialHead(newest);
    } else if (strategy === 'commit' && selectedCommit) {
      const idx = commits.findIndex(c => c.sha === selectedCommit);
      const parent = idx < commits.length - 1 ? commits[idx + 1].sha : oldest;
      setInitialBase(parent);
      setInitialHead(selectedCommit);
    }
  }, [commits, strategy, selectedCommit]);

  // Sync previewBase to initialBase
  useEffect(() => {
    setPreviewBase(initialBase);
  }, [initialBase]);

  const { data: fullFiles = EMPTY_FILE_ENTRY_ARRAY } = useQuery({
    queryKey: ['fullCompare', selectedProject?.id, branch],
    queryFn: () => gitService.full(selectedProject!.id!, branch),
    enabled:
        strategy === 'full' &&
        !!selectedProject?.id &&
        !!branch &&
        !!initialBase &&
        !!initialHead
  });

  const { data: commitFiles = EMPTY_FILE_ENTRY_ARRAY } = useQuery({
    queryKey: ['commitCompare', selectedProject?.id, initialBase, initialHead],
    queryFn: () => gitService.compare(selectedProject!.id!, initialBase, initialHead),
    enabled:
        strategy === 'commit' &&
        !!selectedProject?.id &&
        !!initialBase &&
        !!initialHead
  });

  const { data: previewFiles = EMPTY_FILE_ENTRY_ARRAY } = useQuery({
    queryKey: ['previewCompare', selectedProject?.id, previewBase, initialHead, selectedFiles],
    queryFn: () =>
        gitService.compareFiles({
          projectId: selectedProject!.id!,
          baseSha: previewBase,
          headSha: initialHead,
          files: selectedFiles
        }),
    enabled:
        strategy !== 'manual' &&
        !!selectedProject?.id &&
        !!previewBase &&
        !!initialHead &&
        selectedFiles.length > 0
  });

  const initialFiles =
      strategy === 'full'
          ? fullFiles
          : strategy === 'commit'
              ? commitFiles
              : EMPTY_FILE_ENTRY_ARRAY;

  const filesToShow = strategy === 'manual' ? manualFiles : initialFiles;

  // Build and expand trees once per stable filesToShow
  const treeData = useMemo(() => buildTree(filesToShow), [filesToShow]);
  const previewTree = useMemo(
      () => buildTree(strategy === 'manual' ? EMPTY_FILE_ENTRY_ARRAY : previewFiles),
      [previewFiles, strategy]
  );

  useEffect(() => {
    setFilesExpanded(new Set(collectFolders(treeData)));
  }, [treeData]);

  useEffect(() => {
    setPreviewExpanded(new Set(collectFolders(previewTree)));
  }, [previewTree]);

  const toggleExp = useCallback((isPreview: boolean, path: string) => {
    const fn = isPreview ? setPreviewExpanded : setFilesExpanded;
    fn(s => {
      const ns = new Set(s);
      ns.has(path) ? ns.delete(path) : ns.add(path);
      return ns;
    });
  }, []);

  const toggleFile = useCallback((path: string) => {
    setSelectedFiles(s => (s.includes(path) ? s.filter(x => x !== path) : [...s, path]));
  }, []);

  // Generate the JAR
  // src/pages/JarGeneration.tsx
// (inside the handleGenerate function)

const handleGenerate = async () => {
  if (!selectedProject) {
    toast({
      title: 'No project selected',
      variant: 'destructive'
    });
    return;
  }
  if (!selectedFiles.length) {
    toast({
      title: 'No files selected',
      description: 'Pick at least one.',
      variant: 'destructive'
    });
    return;
  }

  const filesPayload: JarGenerationFileDto[] = selectedFiles.map((filename) => {
    const f = filesToShow.find((f) => f.filename === filename)!;
    return {
      filename,
      status: f.status
    };
  });
const jobId = crypto.randomUUID();

  const payload: JarGenerationRequestDto = {
    jobId ,
    projectId: selectedProject.id,
    branch,
    version,
    environmentId: selectedEnvironment?.id || null,
    strategy,
    baseSha: initialBase,
    headSha: initialHead,
    applyOverrides,
    files: filesPayload
  };

  try {
    // 1) Call the POST and get back { jobId, status, createdAt }
    jarService.generateJar(payload);

    // 2) Show a toast (optional)
    toast({
      title: 'Job queued',
      description: `Job ID: ${jobId}`
    });

    // 3) Navigate to the new status page
    navigate(`/jar-status/${encodeURIComponent(jobId)}`);
  } catch (err) {
    toast({ title: 'Generation failed', variant: 'destructive' });
  }
};


  // Step & selection handlers
  const handleProjectChange = (proj: Project | null) => {
    setSelectedProject(proj);
    setSelectedEnvironment(null);
    setCurrentStep('config');
    setBranch('');
    setStrategy('manual');
    setSelectedCommit('');
    setInitialBase('');
    setInitialHead('');
    setPreviewBase('');
    setSelectedFiles([]);
    setHighlighted(null);
  };

  const handleEnvironmentChange = (env: Environment | null) => {
    setSelectedEnvironment(env);
  };

  const handleBranchSelection = (b: string) => {
    setBranch(b);
    setSelectedFiles([]);
    setHighlighted(null);
  };

  const handleStrategySelection = (s: 'commit' | 'full' | 'manual') => {
    setStrategy(s);
    setSelectedFiles([]);
    setHighlighted(null);
  };

  const previewTabDisabled = strategy === 'manual';

  return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="container mx-auto py-8 space-y-8">
            {/* Enhanced Header */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  JAR Generation Wizard
                </h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Create deployment-ready JAR files with our intelligent build pipeline
              </p>
              
              {/* Progress indicators */}
              <div className="flex justify-center items-center gap-4 mt-6">
                <Badge variant="outline" className="px-4 py-2">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Badge>
                <div className="h-px w-8 bg-border"></div>
                <Badge variant="outline" className="px-4 py-2">
                  <Code className="h-4 w-4 mr-2" />
                  Select Files
                </Badge>
                <div className="h-px w-8 bg-border"></div>
                <Badge variant="outline" className="px-4 py-2">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Badge>
                <div className="h-px w-8 bg-border"></div>
                <Badge variant="outline" className="px-4 py-2">
                  <Zap className="h-4 w-4 mr-2" />
                  Generate
                </Badge>
              </div>
            </div>

            {/* Enhanced Pipeline Navigation */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
              <CardContent className="p-6">
                <PipelineNav 
                  currentStep={currentStep} 
                  onStepChange={setCurrentStep} 
                  previewDisabled={previewTabDisabled} 
                />
              </CardContent>
            </Card>

            {/* Main Content Area */}
            <div className="relative">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl"></div>
              
              <div className="relative z-10">
                {currentStep === 'config' && (
                    <ConfigStep
                        projects={userProjects}
                        selectedProject={selectedProject}
                        setSelectedProject={handleProjectChange}
                        environments={projectEnvironments}
                        selectedEnvironment={selectedEnvironment}
                        setSelectedEnvironment={handleEnvironmentChange}
                        branches={branches}
                        branch={branch}
                        setBranch={handleBranchSelection}
                        commits={commits}
                        version={version}
                        setVersion={setVersion}
                        strategy={strategy}
                        setStrategy={handleStrategySelection}
                        selectedCommit={selectedCommit}
                        setSelectedCommit={setSelectedCommit}
                        loadingBranches={false}
                        loadingCommits={false}
                    />
                )}
                
                {currentStep === 'files' && (
                    <FileSelectionStep
                        treeData={treeData}
                        filesExpanded={filesExpanded}
                        setFilesExpanded={setFilesExpanded}
                        selectedFiles={selectedFiles}
                        toggleFile={toggleFile}
                        setHighlighted={setHighlighted}
                        filesToShow={filesToShow}
                    />
                )}
                
                {currentStep === 'preview' && (
                    <PreviewStep
                        previewTabDisabled={previewTabDisabled}
                        initialHead={initialHead}
                        previewBase={previewBase}
                        setPreviewBase={setPreviewBase}
                        commits={commits}
                        loadingCommits={false}
                        previewTree={previewTree}
                        previewExpanded={previewExpanded}
                        toggleExp={toggleExp}
                        selectedFiles={selectedFiles}
                        highlighted={highlighted}
                        setHighlighted={setHighlighted}
                        projectId={selectedProject?.id!}
                        environmentId={selectedEnvironment?.id!}
                        fileOverrides={fileOverrides}
                        applyOverrides={applyOverrides}
                        setApplyOverrides={setApplyOverrides}
                        handleGenerate={() => setCurrentStep('summary')}
                    />
                )}
                
                {currentStep === 'summary' && (
                    <SummaryStep
                        branch={branch}
                        version={version}
                        strategy={strategy}
                        selectedFiles={selectedFiles}
                        filesToShow={filesToShow}
                        onConfirm={handleGenerate}
                        onBack={() => setCurrentStep('preview')}
                        project={selectedProject}
                        environment={selectedEnvironment}
                        applyOverrides={applyOverrides}
                        fileOverrides={fileOverrides}
                    />
                )}
              </div>
            </div>

            {/* Enhanced Navigation Controls */}
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm dark:bg-gray-900/90">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  {currentStep !== 'config' ? (
                      <Button
                          variant="outline"
                          size="lg"
                          onClick={() => {
                            const steps: PipelineStep[] = ['config', 'files', 'preview', 'summary'];
                            const currentIndex = steps.indexOf(currentStep);
                            setCurrentStep(steps[Math.max(0, currentIndex - 1)]);
                          }}
                          className="px-8"
                      >
                        Previous
                      </Button>
                  ) : <div></div>}
                  
                  {selectedFiles.length > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                      <Badge variant="secondary">{selectedFiles.length} files selected</Badge>
                    </div>
                  )}
                  
                  {currentStep !== 'summary' && (
                      <Button
                          size="lg"
                          onClick={() => {
                            const steps: PipelineStep[] = ['config', 'files', 'preview', 'summary'];
                            const currentIndex = steps.indexOf(currentStep);
                            let nextStep = steps[currentIndex + 1];
                            
                            if (nextStep === 'preview' && previewTabDisabled) {
                              nextStep = 'summary';
                            }
                            
                            if (currentStep === 'config' && !selectedProject) {
                              toast({ title: 'Please select a project first', variant: 'destructive' });
                              return;
                            }
                            
                            setCurrentStep(nextStep);
                          }}
                          disabled={currentStep === 'files' && selectedFiles.length === 0}
                          className="px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        Next Step
                      </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AuthGuard>
  );
}

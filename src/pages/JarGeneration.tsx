
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/ui-custom/PageHeader';

// Import the new components
import PipelineNav, { PipelineStep } from '@/components/jar-generation/PipelineNav';
import ConfigStep from '@/components/jar-generation/ConfigStep';
import FileSelectionStep from '@/components/jar-generation/FileSelectionStep';
import PreviewStep from '@/components/jar-generation/PreviewStep';
import SummaryStep from '@/components/jar-generation/SummaryStep';
import { buildTree, collectFolders } from '@/components/jar-generation/TreeUtils';
import { FileEntry } from '@/components/jar-generation/FileTree';
import useSettingsStore from '@/stores/settingsStore';

// API config
const API = 'http://localhost:5020/api/git';

export default function JarGeneration() {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState<PipelineStep>('config');
  const [branch, setBranch] = useState('main');
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

  // Get environments from settings store
  const { projectSettings } = useSettingsStore();
  const environments = projectSettings?.environments || [];

  // --- load branches & commits
  const {
    data: branches = [],
    isLoading: loadingBranches,
  } = useQuery({
    queryKey: ['branches'],
    queryFn: () =>
      fetch(API + '/branches').then((r) => r.json() as Promise<string[]>),
  });

  const {
    data: commits = [],
    isLoading: loadingCommits,
  } = useQuery({
    queryKey: ['commits', branch],
    enabled: !!branch,
    queryFn: () =>
      fetch(`${API}/commits?branch=${branch}`).then(
        (r) => r.json() as Promise<{ sha: string; message: string }[]>
      ),
  });

  // --- fetch all files at HEAD (manual mode)
  const {
    data: allFiles = [],
    isLoading: loadingAllFiles,
  } = useQuery({
    queryKey: ['allFiles', branch],
    enabled: strategy === 'manual' && !!branch,
    queryFn: () =>
      fetch(`${API}/tree?branch=${branch}`).then(r =>
        r.json() as Promise<string[]>
      ),
  });

  // Only build file list for manual mode
  const manualFiles = useMemo(() => {
    if (strategy !== 'manual') return [];
    return allFiles.map(filename => ({
      filename,
      status: 'unmodified',
      patch: undefined,
    }));
  }, [allFiles, strategy]);

  // compute initialBase/Head
  useEffect(() => {
    if (!commits.length) return;
    const first = commits[commits.length - 1].sha;
    const last = commits[0].sha;
    if (strategy === 'commit' && selectedCommit) {
      const idx = commits.findIndex((c) => c.sha === selectedCommit);
      const parent =
        idx >= 0 && idx < commits.length - 1
          ? commits[idx + 1].sha
          : first;
      setInitialBase(parent);
      setInitialHead(selectedCommit);
    } else {
      setInitialBase(first);
      setInitialHead(last);
    }
  }, [commits, strategy, selectedCommit]);

  useEffect(() => {
    setPreviewBase(initialBase);
  }, [initialBase]);

  // initial compare
  const { data: initialCmp } = useQuery({
    queryKey: ['compareInit', initialBase, initialHead],
    enabled: strategy !== 'manual' && !!initialBase && !!initialHead,
    queryFn: () =>
      fetch(
        `${API}/compare?baseSha=${initialBase}&headSha=${initialHead}`
      ).then((r) =>
        r.json() as Promise<{ files: FileEntry[] }>
      ),
  });
  const initialFiles = initialCmp?.files || [];

  // preview compare-files
  const { data: previewCmp } = useQuery({
    queryKey: ['compareFiles', previewBase, initialHead, selectedFiles],
    enabled: strategy !== 'manual' && !!previewBase && !!initialHead && selectedFiles.length > 0,
    queryFn: () =>
      fetch(`${API}/compare-files`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          baseSha: previewBase,
          headSha: initialHead,
          files: selectedFiles,
        }),
      }).then((r) => {
        if (!r.ok) throw new Error('Preview diff failed');
        return r.json() as Promise<{ files: FileEntry[] }>;
      }),
  });
  const previewFiles = previewCmp?.files || [];

  // Choose which files to display (manual or diff mode)
  const filesToShow = strategy === 'manual' ? manualFiles : initialFiles;
  const treeData = useMemo(
    () => buildTree(filesToShow),
    [filesToShow]
  );
  const previewTree = useMemo(
    () => buildTree(strategy === 'manual' ? [] : previewFiles),
    [previewFiles, strategy]
  );

  useEffect(
    () => setFilesExpanded(new Set(collectFolders(treeData))),
    [treeData]
  );
  useEffect(
    () => setPreviewExpanded(new Set(collectFolders(previewTree))),
    [previewTree]
  );

  const toggleExp = useCallback(
    (isPreview: boolean, path: string) => {
      const fn = isPreview
        ? setPreviewExpanded
        : setFilesExpanded;
      fn((s) => {
        const ns = new Set(s);
        ns.has(path) ? ns.delete(path) : ns.add(path);
        return ns;
      });
    },
    []
  );
  
  const toggleFile = useCallback((path: string) => {
    setSelectedFiles((s) =>
      s.includes(path) ? s.filter((x) => x !== path) : [...s, path]
    );
  }, []);
  
  // --- JAR generation
  const handleGenerate = async () => {
    if (!selectedFiles.length) {
      return toast({
        title: 'No files selected',
        description: 'Please pick at least one file.',
        variant: 'destructive',
      });
    }
    const payload = {
      branch,
      version,
      strategy,
      baseSha: initialBase,
      headSha: initialHead,
      files: selectedFiles.map((fn) => {
        const f = filesToShow.find((x) => x.filename === fn)!;
        return {filename: fn, status: f.status};
      }),
    };
    try {
      const r = await fetch('/api/jar', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error();
      const {jarPath} = await r.json();
      toast({title: 'JAR generated', description: jarPath});
      navigate(`/jar-viewer/${encodeURIComponent(jarPath)}`);
    } catch {
      toast({
        title: 'Generation failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Move to the next step after selection
  const handleBranchSelection = (newBranch: string) => {
    setBranch(newBranch);
    setSelectedFiles([]);
    setHighlighted(null);
  };

  const handleStrategySelection = (newStrategy: 'commit' | 'full' | 'manual') => {
    setStrategy(newStrategy);
    setSelectedFiles([]);
    setHighlighted(null);
  };

  // Disable preview in manual mode
  const previewTabDisabled = strategy === 'manual';

  return (
    <div className="space-y-6">
      <PageHeader
        title="JAR Generation"
        description="Select settings → pick files → preview diffs → review → generate"
      />

      {/* Stats bar */}
      <div className="flex flex-wrap gap-6 px-4 py-2 bg-muted/10 rounded text-sm">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Info className="h-4 w-4"/> Total:{' '}
          <strong>{filesToShow.length}</strong>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Info className="h-4 w-4"/> Selected:{' '}
          <strong>{selectedFiles.length}</strong>
        </div>
        {strategy === 'commit' && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Info className="h-4 w-4"/> Commits:{' '}
            <strong>{commits.length}</strong>
          </div>
        )}
        <div className="flex items-center gap-1 text-muted-foreground">
          <Info className="h-4 w-4"/> Mode:{' '}
          <strong>
            {strategy === 'commit'
              ? 'Single-Commit'
              : strategy === 'full'
                ? 'Full-Build'
                : 'Manual'}
          </strong>
        </div>
      </div>

      {/* Pipeline Navigation */}
      <PipelineNav
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        previewDisabled={previewTabDisabled}
      />

      {/* Step Content */}
      <div className="mt-8">
        {currentStep === 'config' && (
          <ConfigStep
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
            loadingBranches={loadingBranches}
            loadingCommits={loadingCommits}
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
            loadingCommits={loadingCommits}
            previewTree={previewTree}
            previewExpanded={previewExpanded}
            toggleExp={toggleExp}
            selectedFiles={selectedFiles}
            highlighted={highlighted}
            setHighlighted={setHighlighted}
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
          />
        )}
      </div>

      {/* Step Navigation */}
      <div className="flex justify-between mt-6">
        {currentStep !== 'config' && (
          <Button
            variant="outline"
            onClick={() => {
              const steps: PipelineStep[] = ['config', 'files', 'preview', 'summary'];
              const currentIndex = steps.indexOf(currentStep);
              if (currentIndex > 0) {
                setCurrentStep(steps[currentIndex - 1]);
              }
            }}
          >
            Previous
          </Button>
        )}

        {currentStep !== 'summary' && (
          <Button
            className="ml-auto"
            onClick={() => {
              const steps: PipelineStep[] = ['config', 'files', 'preview', 'summary'];
              const currentIndex = steps.indexOf(currentStep);
              if (currentIndex < steps.length - 1) {
                const nextStep = steps[currentIndex + 1];
                if (nextStep === 'preview' && previewTabDisabled) {
                  setCurrentStep('summary');
                } else {
                  setCurrentStep(nextStep);
                }
              }
            }}
            disabled={currentStep === 'files' && selectedFiles.length === 0}
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
}

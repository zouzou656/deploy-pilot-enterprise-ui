import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/ui-custom/PageHeader';

import PipelineNav, { PipelineStep } from '@/components/jar-generation/PipelineNav';
import { Button } from '@/components/ui/button';
import ConfigStep from '@/components/jar-generation/ConfigStep';
import FileSelectionStep from '@/components/jar-generation/FileSelectionStep';
import PreviewStep from '@/components/jar-generation/PreviewStep';
import SummaryStep from '@/components/jar-generation/SummaryStep';
import { buildTree, collectFolders } from '@/components/jar-generation/TreeUtils';
import { FileEntry } from '@/components/jar-generation/FileTree';

type ProjectInfo = { id: number; name: string };

export default function JarGeneration() {
  const API = 'http://localhost:5020/api';  // ↖ move to top

  const { toast } = useToast();
  const navigate = useNavigate();

  // Projects
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  useEffect(() => {
    fetch(`${API}/projects`)
        .then(r => r.json() as Promise<ProjectInfo[]>)
        .then(setProjects)
        .catch(() => toast({ title: 'Failed to load projects', variant: 'destructive' }));
  }, [API, toast]);

  // UI state
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
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

  // 1) Branch list
  const { data: branches = [], isLoading: loadingBranches } = useQuery({
    queryKey: ['branches', selectedProjectId],
    enabled: !!selectedProjectId,
    queryFn: () =>
        fetch(`${API}/git/branches?projectId=${selectedProjectId}`)
            .then(r => r.json() as Promise<string[]>),
  });

  // 2) Commits list
  const { data: commits = [], isLoading: loadingCommits } = useQuery({
    queryKey: ['commits', selectedProjectId, branch],
    enabled: !!selectedProjectId && !!branch,
    queryFn: () =>
        fetch(`${API}/git/commits?projectId=${selectedProjectId}&branch=${encodeURIComponent(branch)}`)
            .then(r => r.json() as Promise<{ sha: string; message: string }[]>),
  });

  // 3) Manual‐mode file list
  const { data: allFiles = [] } = useQuery({
    queryKey: ['allFiles', selectedProjectId, branch],
    enabled: strategy === 'manual' && !!selectedProjectId && !!branch,
    queryFn: () =>
        fetch(`${API}/git/tree?projectId=${selectedProjectId}&branch=${encodeURIComponent(branch)}`)
            .then(r => r.json() as Promise<string[]>),
  });
  const manualFiles = useMemo(() => {
    if (strategy !== 'manual') return [];
    return allFiles.map(filename => ({ filename, status: 'unmodified' as const }));
  }, [allFiles, strategy]);

  // 4) Compute initialBase/Head on strategy or selection change
  useEffect(() => {
    if (!commits.length) return;
    const oldest = commits[commits.length - 1].sha;
    const newest = commits[0].sha;

    if (strategy === 'full') {
      setInitialBase(oldest);
      setInitialHead(newest);
    } else if (strategy === 'commit' && selectedCommit) {
      const idx = commits.findIndex(c => c.sha === selectedCommit);
      const parent = idx >= 0 && idx < commits.length - 1 ? commits[idx + 1].sha : oldest;
      setInitialBase(parent);
      setInitialHead(selectedCommit);
    }
  }, [commits, strategy, selectedCommit]);

  // keep previewBase in sync
  useEffect(() => void setPreviewBase(initialBase), [initialBase]);

  // 5) Full‐build fetch
  const { data: fullCmp, isFetching: loadingFull } = useQuery({
    queryKey: ['full', selectedProjectId, branch],
    enabled: strategy === 'full' && !!selectedProjectId && !!branch,
    queryFn: () =>
        fetch(`${API}/git/full?projectId=${selectedProjectId}&branch=${encodeURIComponent(branch)}`)
            .then(r => { if (!r.ok) throw new Error(); return r.json() as Promise<{ files: FileEntry[] }>; }),
  });

  // 6) Single‐commit compare fetch
  const { data: commitCmp, isFetching: loadingCommitCmp } = useQuery({
    queryKey: ['compare', selectedProjectId, initialBase, initialHead],
    enabled:
        strategy === 'commit' &&
        !!selectedProjectId &&
        !!initialBase &&
        !!initialHead,
    queryFn: () =>
        fetch(`${API}/git/compare?projectId=${selectedProjectId}&baseSha=${initialBase}&headSha=${initialHead}`)
            .then(r => { if (!r.ok) throw new Error(); return r.json() as Promise<{ files: FileEntry[] }>; }),
  });

  // 7) Preview (post‐filter) compare‐files
  const { data: previewCmp } = useQuery({
    queryKey: ['compareFiles', selectedProjectId, previewBase, initialHead, selectedFiles],
    enabled:
        strategy !== 'manual' &&
        !!selectedProjectId &&
        !!previewBase &&
        !!initialHead &&
        selectedFiles.length > 0,
    queryFn: () =>
        fetch(`${API}/git/compare-files`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId: selectedProjectId, baseSha: previewBase, headSha: initialHead, files: selectedFiles }),
        }).then(r => { if (!r.ok) throw new Error(); return r.json() as Promise<{ files: FileEntry[] }>; }),
  });

  // 8) Choose the right initialFiles
  const initialFiles =
      strategy === 'full'
          ? fullCmp?.files || []
          : strategy === 'commit'
              ? commitCmp?.files || []
              : [];

  const previewFiles = previewCmp?.files || [];

  // 9) Build tree & expand sets
  const filesToShow = strategy === 'manual' ? manualFiles : initialFiles;
  const treeData = useMemo(() => buildTree(filesToShow), [filesToShow]);
  const previewTree = useMemo(() => buildTree(strategy === 'manual' ? [] : previewFiles), [previewFiles, strategy]);

  useEffect(() => setFilesExpanded(new Set(collectFolders(treeData))), [treeData]);
  useEffect(() => setPreviewExpanded(new Set(collectFolders(previewTree))), [previewTree]);

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

  // 10) Generate JAR
  const handleGenerate = async () => {
    if (!selectedProjectId) {
      toast({ title: 'No project selected', variant: 'destructive' });
      return;
    }
    if (!selectedFiles.length) {
      toast({ title: 'No files selected', description: 'Please pick at least one file.', variant: 'destructive' });
      return;
    }
    const payload = { projectId: selectedProjectId, branch, version, strategy, baseSha: initialBase, headSha: initialHead, files: selectedFiles.map(fn => ({ filename: fn, status: filesToShow.find(f => f.filename === fn)!.status })) };
    try {
      const r = await fetch('/api/jar', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) });
      if (!r.ok) throw new Error();
      const { jarPath } = await r.json();
      toast({ title: 'JAR generated', description: jarPath });
      navigate(`/jar-viewer/${encodeURIComponent(jarPath)}`);
    } catch {
      toast({ title: 'Generation failed', description: 'Please try again.', variant: 'destructive' });
    }
  };

  // Reset on project change
  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pid = Number(e.target.value) || null;
    setSelectedProjectId(pid);
    setCurrentStep('config');
    setBranch(''); setStrategy('manual'); setSelectedCommit('');
    setInitialBase(''); setInitialHead(''); setPreviewBase('');
    setSelectedFiles([]); setHighlighted(null);
  };

  const handleBranchSelection = (b: string) => { setBranch(b); setSelectedFiles([]); setHighlighted(null); };
  const handleStrategySelection = (s: 'commit'|'full'|'manual') => { setStrategy(s); setSelectedFiles([]); setHighlighted(null); };

  const previewTabDisabled = strategy === 'manual';

  return (
      <div className="space-y-6">
        <PageHeader title="JAR Generation" description="Select settings → pick files → preview diffs → review → generate" />

        {/* Project selector */}
        <div className="px-4">
          <label className="block mb-2 font-medium">Project</label>
          <select className="w-full p-2 border rounded" value={selectedProjectId ?? ''} onChange={handleProjectChange}>
            <option value="">— Select a Project —</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap gap-6 px-4 py-2 bg-muted/10 rounded text-sm">
          <Info className="h-4 w-4 text-muted-foreground"/> Total: <strong>{filesToShow.length}</strong>
          <Info className="h-4 w-4 text-muted-foreground"/> Selected: <strong>{selectedFiles.length}</strong>
          {strategy === 'commit' && <><Info className="h-4 w-4 text-muted-foreground"/> Commits: <strong>{commits.length}</strong></>}
          <Info className="h-4 w-4 text-muted-foreground"/> Mode: <strong>{strategy==='commit'?'Single-Commit':strategy==='full'?'Full-Build':'Manual'}</strong>
        </div>

        {/* Pipeline Navigation */}
        <PipelineNav currentStep={currentStep} onStepChange={setCurrentStep} previewDisabled={previewTabDisabled} />

        {/* Step Content */}
        <div className="mt-8">
          {currentStep==='config' && (
              <ConfigStep
                  projectId={selectedProjectId}
                  branches={branches} branch={branch} setBranch={handleBranchSelection}
                  commits={commits} version={version} setVersion={setVersion}
                  strategy={strategy} setStrategy={handleStrategySelection}
                  selectedCommit={selectedCommit} setSelectedCommit={setSelectedCommit}
                  loadingBranches={loadingBranches} loadingCommits={loadingCommits}
              />
          )}
          {currentStep==='files' && (
              <FileSelectionStep
                  treeData={treeData} filesExpanded={filesExpanded} setFilesExpanded={setFilesExpanded}
                  selectedFiles={selectedFiles} toggleFile={toggleFile}
                  setHighlighted={setHighlighted} filesToShow={filesToShow}
              />
          )}
          {currentStep==='preview' && (
              <PreviewStep
                  previewTabDisabled={previewTabDisabled}
                  initialHead={initialHead} previewBase={previewBase} setPreviewBase={setPreviewBase}
                  commits={commits} loadingCommits={loadingCommits}
                  previewTree={previewTree} previewExpanded={previewExpanded}
                  toggleExp={toggleExp} selectedFiles={selectedFiles}
                  highlighted={highlighted} setHighlighted={setHighlighted}
                  handleGenerate={()=>setCurrentStep('summary')}
              />
          )}
          {currentStep==='summary' && (
              <SummaryStep
                  branch={branch} version={version} strategy={strategy}
                  selectedFiles={selectedFiles} filesToShow={filesToShow}
                  onConfirm={handleGenerate} onBack={()=>setCurrentStep('preview')}
              />
          )}
        </div>

        {/* Prev/Next */}
        <div className="flex justify-between mt-6 px-4">
          {currentStep!=='config' && <Button variant="outline" onClick={()=>{
            const steps:PipelineStep[]=['config','files','preview','summary'];
            const idx=steps.indexOf(currentStep);
            if(idx>0) setCurrentStep(steps[idx-1]);
          }}>Previous</Button>}
          {currentStep!=='summary' && <Button className="ml-auto" onClick={()=>{
            const steps:PipelineStep[]=['config','files','preview','summary'];
            const idx=steps.indexOf(currentStep);
            const next=steps[idx+1];
            if(next==='preview'&&previewTabDisabled) setCurrentStep('summary');
            else setCurrentStep(next);
          }} disabled={currentStep==='files'&&selectedFiles.length===0}>Next</Button>}
        </div>
      </div>
  );
}

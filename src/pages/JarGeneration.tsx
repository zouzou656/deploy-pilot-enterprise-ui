import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/ui-custom/PageHeader';
import AuthGuard from '@/components/auth/AuthGuard';

import PipelineNav, { PipelineStep } from '@/components/jar-generation/PipelineNav';
import { Button } from '@/components/ui/button';
import ConfigStep from '@/components/jar-generation/ConfigStep';
import FileSelectionStep from '@/components/jar-generation/FileSelectionStep';
import PreviewStep from '@/components/jar-generation/PreviewStep';
import SummaryStep from '@/components/jar-generation/SummaryStep';
import { buildTree, collectFolders } from '@/components/jar-generation/TreeUtils';
import { FileEntry } from '@/components/jar-generation/FileTree';

import useProjectStore from '@/stores/projectStore';
import useAuthStore from '@/stores/authStore';
import { Project, ProjectEnvironment, FileOverride } from '@/types/project';
import { useProject } from '@/contexts/ProjectContext';
import { gitService } from '@/services/gitService';

export default function JarGeneration() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { selectedProject } = useProject();
  const { 
    environments,
    fetchEnvironments, 
    fetchFileOverrides
  } = useProjectStore();

  // UI state
  const [projectEnvironments, setProjectEnvironments] = useState<ProjectEnvironment[]>([]);
  const [selectedEnvironment, setSelectedEnvironment] = useState<ProjectEnvironment | null>(null);
  const [fileOverrides, setFileOverrides] = useState<FileOverride[]>([]);
  const [applyOverrides, setApplyOverrides] = useState(true);
  
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

  const API = 'http://localhost:5020/api';

  // Load environments when project changes
  useEffect(() => {
    const loadEnvironments = async () => {
      if (selectedProject) {
        try {
          const envs = await fetchEnvironments(selectedProject.id);
          setProjectEnvironments(envs);
        } catch (error) {
          console.error("Failed to load environments:", error);
        }
      } else {
        setProjectEnvironments([]);
      }
    };
    
    loadEnvironments();
  }, [selectedProject, fetchEnvironments]);

  // Load file overrides when environment changes
  useEffect(() => {
    const loadFileOverrides = async () => {
      if (selectedEnvironment) {
        try {
          const overrides = await fetchFileOverrides(selectedEnvironment.id);
          setFileOverrides(overrides);
        } catch (error) {
          console.error("Failed to load file overrides:", error);
        }
      } else {
        setFileOverrides([]);
      }
    };
    
    loadFileOverrides();
  }, [selectedEnvironment, fetchFileOverrides]);

  // 1) Branch list
  const { data: branches = [], isLoading: loadingBranches } = useQuery({
    queryKey: ['branches', selectedProject?.id],
    enabled: !!selectedProject?.id,
    queryFn: async () => {
      if (!selectedProject?.id) return [];
      return await gitService.getBranches(selectedProject.id);
    }
  });

  // 2) Commits list
  const { data: commits = [], isLoading: loadingCommits } = useQuery({
    queryKey: ['commits', selectedProject?.id, branch],
    enabled: !!selectedProject?.id && !!branch,
    queryFn: async () => {
      if (!selectedProject?.id || !branch) return [];
      const commitData = await gitService.getCommits(selectedProject.id, branch);
      return commitData.map(c => ({ 
        sha: c.sha, 
        message: c.message 
      }));
    }
  });

  // 3) Manual‐mode file list
  const { data: allFiles = [] } = useQuery({
    queryKey: ['allFiles', selectedProject?.id, branch],
    enabled: !!selectedProject?.id && !!branch && strategy === 'manual',
    queryFn: async () => {
      if (!selectedProject?.id || !branch) return [];
      return await gitService.getTree(selectedProject.id, branch);
    }
  });
  
  // Map files for manual mode
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
    queryKey: ['full', selectedProject?.id, branch, strategy],
    enabled: strategy === 'full' && !!selectedProject?.id && !!branch && !!initialBase && !!initialHead,
    queryFn: async () => {
      if (!selectedProject?.id || !branch) 
        throw new Error('Project or branch not selected');
      
      const data = await gitService.getFull(selectedProject.id, branch);
      return { files: data.files.map(f => ({ 
        filename: f.filename, 
        status: f.status 
      }))};
    }
  });

  // 6) Single‐commit compare fetch
  const { data: commitCmp, isFetching: loadingCommitCmp } = useQuery({
    queryKey: ['compare', selectedProject?.id, initialBase, initialHead, strategy],
    enabled:
        strategy === 'commit' &&
        !!selectedProject?.id &&
        !!initialBase &&
        !!initialHead,
    queryFn: async () => {
      if (!selectedProject?.id || !initialBase || !initialHead) 
        throw new Error('Project or commits not selected');
      
      const data = await gitService.compare(selectedProject.id, initialBase, initialHead);
      return { files: data.files.map(f => ({ 
        filename: f.filename, 
        status: f.status 
      }))};
    }
  });

  // 7) Preview (post‐filter) compare‐files
  const { data: previewCmp } = useQuery({
    queryKey: ['compareFiles', selectedProject?.id, previewBase, initialHead, selectedFiles],
    enabled:
        strategy !== 'manual' &&
        !!selectedProject?.id &&
        !!previewBase &&
        !!initialHead &&
        selectedFiles.length > 0,
    queryFn: async () => {
      if (!selectedProject?.id || !previewBase || !initialHead || !selectedFiles.length) 
        throw new Error('Project, commits, or files not selected');
      
      const data = await gitService.compareFiles({
        projectId: selectedProject.id,
        baseSha: previewBase,
        headSha: initialHead,
        files: selectedFiles
      });
      
      return { files: data.files.map(f => ({ 
        filename: f.filename, 
        status: f.status 
      }))};
    }
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
    if (!selectedProject) {
      toast({ title: 'No project selected', variant: 'destructive' });
      return;
    }
    if (!selectedFiles.length) {
      toast({ title: 'No files selected', description: 'Please pick at least one file.', variant: 'destructive' });
      return;
    }
    
    // Create payload
    const payload = { 
      projectId: selectedProject.id, 
      branch, 
      version, 
      environmentId: selectedEnvironment?.id || null,
      strategy, 
      baseSha: initialBase, 
      headSha: initialHead, 
      applyOverrides,
      files: selectedFiles.map(fn => ({ 
        filename: fn, 
        status: filesToShow.find(f => f.filename === fn)!.status 
      })) 
    };
    
    // Log the payload to console for debugging
    console.log("JAR Generation Payload:", payload);
    
    try {
      const r = await fetch(`${API}/jar/generate`, { 
        method: 'POST', 
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(payload) 
      });
      
      if (!r.ok) throw new Error();
      
      const { jarPath } = await r.json();
      toast({ title: 'JAR generated', description: jarPath });
      navigate(`/jar-viewer/${encodeURIComponent(jarPath)}`);
    } catch {
      toast({ title: 'Generation failed', description: 'Please try again.', variant: 'destructive' });
    }
  };

  const handleEnvironmentChange = (env: ProjectEnvironment | null) => {
    setSelectedEnvironment(env);
  };

  const handleBranchSelection = (b: string) => { 
    setBranch(b); 
    setSelectedFiles([]); 
    setHighlighted(null); 
  };
  
  const handleStrategySelection = (s: 'commit'|'full'|'manual') => { 
    setStrategy(s); 
    setSelectedFiles([]); 
    setHighlighted(null); 
  };

  const previewTabDisabled = strategy === 'manual';

  return (
    <AuthGuard>
      <div className="space-y-6">
        <PageHeader title="JAR Generation" description="Select settings → pick files → preview diffs → review → generate" />

        {/* Pipeline Navigation */}
        <PipelineNav currentStep={currentStep} onStepChange={setCurrentStep} previewDisabled={previewTabDisabled} />

        {/* Step Content */}
        <div className="mt-8">
          {currentStep==='config' && (
              <ConfigStep
                  branches={branches} branch={branch} setBranch={handleBranchSelection}
                  commits={commits} version={version} setVersion={setVersion}
                  strategy={strategy} setStrategy={handleStrategySelection}
                  selectedCommit={selectedCommit} setSelectedCommit={setSelectedCommit}
                  loadingBranches={loadingBranches} loadingCommits={loadingCommits}
                  projects={[]}
                  selectedProject={selectedProject}
                  setSelectedProject={()=>{}} // We're using the global project selector now
                  environments={projectEnvironments}
                  selectedEnvironment={selectedEnvironment}
                  setSelectedEnvironment={handleEnvironmentChange}
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
                  projectId={selectedProject?.id || ''}
                  environmentId={selectedEnvironment?.id || null}
                  fileOverrides={fileOverrides}
                  applyOverrides={applyOverrides}
                  setApplyOverrides={setApplyOverrides}
                  handleGenerate={()=>setCurrentStep('summary')}
              />
          )}
          {currentStep==='summary' && (
              <SummaryStep
                  branch={branch} version={version} strategy={strategy}
                  selectedFiles={selectedFiles} filesToShow={filesToShow}
                  onConfirm={handleGenerate} onBack={()=>setCurrentStep('preview')}
                  project={selectedProject}
                  environment={selectedEnvironment}
                  applyOverrides={applyOverrides}
                  fileOverrides={fileOverrides}
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
            else if(currentStep==='config' && !selectedProject) {
              toast({ title: 'Please select a project first', variant: 'destructive' });
            }
            else setCurrentStep(next);
          }} disabled={currentStep==='files'&&selectedFiles.length===0}>Next</Button>}
        </div>
      </div>
    </AuthGuard>
  );
}

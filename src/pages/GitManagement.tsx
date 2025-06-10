// src/pages/GitManagement.tsx

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/ui-custom/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Code as CodeIcon,
  ChevronDown,
  ChevronRight,
  Folder,
  Maximize2,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
  DialogTitle,
} from '@/components/ui/dialog';
import { Diff, Hunk, parseDiff } from 'react-diff-view';
import 'react-diff-view/style/index.css';
import CodeEditor from '@/components/ui-custom/CodeEditor';
import Spinner from '@/components/ui/spinner';

import useAuthStore from '@/stores/authStore';
import { projectService } from '@/services/projectService';
import { gitService } from '@/services/gitService';

import type { Project } from '@/types/project';
import type { CommitDto } from '@/types/git';

/**
 * A single file entry returned by the “commitDetail” endpoint.
 */
interface FileEntry {
  filename: string;
  status?: string;
  patch?: string;
}

/**
 * A nested‐tree node shape for file paths.
 */
type TreeNode = {
  name: string;
  path: string;
  isFile: boolean;
  children: TreeNode[];
  status?: string;
  patch?: string;
};

/**
 * Build a nested TreeNode[] from a flat list of file paths (e.g. from fileListAtCommit).
 */
function buildFileTree(files: string[]): TreeNode[] {
  const tree: TreeNode[] = [];
  const lookup: Record<string, TreeNode> = {};

  files.forEach((fullPath) => {
    const parts = fullPath.split('/');
    parts.reduce((acc, part, idx) => {
      const currPath = parts.slice(0, idx + 1).join('/');
      if (!lookup[currPath]) {
        const node: TreeNode = {
          name: part,
          path: currPath,
          isFile: idx === parts.length - 1,
          children: [],
        };
        lookup[currPath] = node;
        acc.push(node);
      }
      return lookup[currPath].children;
    }, tree);
  });

  return tree;
}

/**
 * Build a nested TreeNode[] from a flat FileEntry[] (i.e. commitDetail.files).
 */
function buildChangedTree(files: FileEntry[]): TreeNode[] {
  const roots: TreeNode[] = [];
  const map = new Map<string, TreeNode>();

  files.forEach(({ filename, status, patch }) => {
    const parts = filename.split('/');
    let nodes = roots;
    let prefix = '';
    parts.forEach((part, idx) => {
      prefix = prefix ? `${prefix}/${part}` : part;
      let node = map.get(prefix);
      const isFile = idx === parts.length - 1;
      if (!node) {
        node = {
          name: part,
          path: prefix,
          isFile,
          children: [],
          status: isFile ? status : undefined,
          patch: isFile ? patch : undefined,
        };
        map.set(prefix, node);
        nodes.push(node);
      }
      nodes = node.children;
    });
  });

  return roots;
}

/**
 * Recursively collect folder‐paths so that we can “Expand All.”
 */
function collectFolders(nodes: TreeNode[]): string[] {
  let out: string[] = [];
  nodes.forEach((n) => {
    if (!n.isFile) {
      out.push(n.path);
      out = out.concat(collectFolders(n.children));
    }
  });
  return out;
}

/**
 * Filter a TreeNode[] by `searchTerm` (case‐insensitive substring match on name).
 */
function filterTree(nodes: TreeNode[], searchTerm: string): TreeNode[] {
  if (!searchTerm.trim()) return nodes;
  const lower = searchTerm.toLowerCase();
  const result: TreeNode[] = [];

  nodes.forEach((node) => {
    if (node.isFile && node.name.toLowerCase().includes(lower)) {
      result.push({ ...node });
    } else if (!node.isFile) {
      const filteredChildren = filterTree(node.children, searchTerm);
      if (filteredChildren.length > 0) {
        result.push({ ...node, children: filteredChildren });
      } else if (node.name.toLowerCase().includes(lower)) {
        result.push({ ...node, children: node.children });
      }
    }
  });

  return result;
}

/**
 * Map OSB‐related file extensions (and general code extensions) to specific icons.
 */
function getIconForExtension(filename: string): React.ReactNode {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'alert':
      return <Bell className="h-4 w-4 text-red-500" />;
    case 'bix':
      return <Briefcase className="h-4 w-4 text-indigo-600" />;
    case 'xref':
      return <Link2 className="h-4 w-4 text-blue-600" />;
    case 'dvm':
      return <Tag className="h-4 w-4 text-teal-600" />;
    case 'jndi':
      return <Key className="h-4 w-4 text-yellow-600" />;
    case 'mfl':
      return <Cpu className="h-4 w-4 text-orange-600" />;
    case 'mq':
    case 'mqconn':
      return <HardDrive className="h-4 w-4 text-pink-600" />;
    case 'pom':
      return <Archive className="h-4 w-4 text-violet-600" />;
    case 'nxsd':
      return <Grid className="h-4 w-4 text-green-700" />;
    case 'pipeline':
      return <GitMerge className="h-4 w-4 text-green-600" />;
    case 'ptx':
    case 'pipeline-template':
      return <Anchor className="h-4 w-4 text-blue-700" />;
    case 'proxy':
      return <Server className="h-4 w-4 text-indigo-600" />;
    case 'smtp':
      return <Mail className="h-4 w-4 text-red-600" />;
    case 'sa':
      return <User className="h-4 w-4 text-red-600" />;
    case 'skp':
      return <ShieldCheck className="h-4 w-4 text-blue-800" />;
    case 'splitjoin':
      return <GitMerge className="h-4 w-4 text-green-800" />;
    case 'tgx':
      return <Settings2 className="h-4 w-4 text-yellow-800" />;
    case 'uddi':
      return <Globe className="h-4 w-4 text-blue-400" />;
    case 'wsp':
      return <Shield className="h-4 w-4 text-teal-800" />;
    case 'wsdl':
      return <BookOpen className="h-4 w-4 text-blue-600" />;
    case 'wadl':
      return <BookOpen className="h-4 w-4 text-blue-500" />;
    case 'xsd':
    case 'schema':
      return <CodeIcon className="h-4 w-4 text-purple-600" />;
    case 'xqy':
    case 'xquery':
      return <Search className="h-4 w-4 text-yellow-600" />;
    case 'xqlib':
      return <Search className="h-4 w-4 text-yellow-500" />;
    case 'xslmap':
      return <Box className="h-4 w-4 text-orange-700" />;
    case 'xslt':
    case 'xsl':
      return <Box className="h-4 w-4 text-orange-600" />;
    case 'js':
      return <CodeIcon className="h-4 w-4 text-green-500" />;
    case 'json':
      return <CodeIcon className="h-4 w-4 text-blue-300" />;
    case 'bpel':
      return <Activity className="h-4 w-4 text-red-500" />;
    case 'jca':
      return <Layers className="h-4 w-4 text-teal-600" />;
    default:
      return <FileIcon className="h-4 w-4 text-gray-600" />;
  }
}

/**
 * Renders a split‐view diff of a single file. If `patch` is missing
 * or parse fails, falls back to a <pre> block.
 */
function DiffViewer({ filename, patch }: { filename: string; patch?: string }) {
  if (!patch) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No changes</p>;
  }

  // Build the unified header
  const header = [
    `diff --git a/${filename} b/${filename}`,
    `--- a/${filename}`,
    `+++ b/${filename}`,
  ].join('\n');

  // If patch already contains “diff --git …”, don’t prepend header
  const unified = patch.startsWith('diff --git') ? patch : header + '\n' + patch;

  let files;
  try {
    files = parseDiff(unified);
  } catch (err) {
    console.error('parseDiff error', err);
    return (
      <pre className="p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-auto text-sm whitespace-pre-wrap">
        {unified}
      </pre>
    );
  }

  if (!files.length) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Empty diff</p>;
  }

  // Show the first file with hunks (or the first if none has hunks)
  const file = files.find((f) => f.hunks.length) || files[0];

  return (
    <Diff viewType="split" diffType="modify" hunks={file.hunks} filePath={file.newPath}>
      {(hunks) => hunks.map((h, idx) => <Hunk key={idx} hunk={h} />)}
    </Diff>
  );
}

/**
 * Combined GitManagement + CodeExplorer page.
 */
export default function GitManagement() {
  const { user } = useAuthStore(); // assume user.id is available

  // ─── Local state ───────────────────────────────────────────────────────────────
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [branch, setBranch] = useState<string>('');
  const [selectedCommitSha, setSelectedCommitSha] = useState<string>();

  // For “Files & Diff” tree:
  const [filesExpanded, setFilesExpanded] = useState<Set<string>>(new Set());
  const [changedFilesSelected, setChangedFilesSelected] = useState<string[]>([]);
  const [highlightedChange, setHighlightedChange] = useState<FileEntry | null>(null);

  // For “File Explorer” tree + code viewer:
  const [searchTermChanged, setSearchTermChanged] = useState<string>('');
  const [searchTermFullTree, setSearchTermFullTree] = useState<string>('');
  const [editorFileSelected, setEditorFileSelected] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [loadingFileContent, setLoadingFileContent] = useState<boolean>(false);

  // ─── 1) Fetch user projects ─────────────────────────────────────────────────────
  const {
    data: userProjects = [],
    isLoading: loadingProjects,
    isError: projectsError,
  } = useQuery<Project[]>({
    queryKey: ['userProjects', user?.id],
    queryFn: () => projectService.getUserProjects(user!.id),
    enabled: !!user?.id,
  });

  // ─── 2) Fetch branches for selected project ─────────────────────────────────────
  const {
    data: branchesData = [],
    isLoading: loadingBranches,
    isError: branchesError,
  } = useQuery<string[]>({
    queryKey: ['branches', selectedProject?.id],
    enabled: !!selectedProject?.id,
    queryFn: () => gitService.getBranches(selectedProject!.id!),
  });

  // ─── 3) Fetch commits for (project, branch) ─────────────────────────────────────
  const {
    data: commits = [],
    isLoading: loadingCommits,
    isError: commitsError,
  } = useQuery<CommitDto[]>({
    queryKey: ['commits', selectedProject?.id, branch],
    enabled: !!selectedProject?.id && !!branch,
    queryFn: () => gitService.getCommits(selectedProject!.id!, branch),
  });

  // ─── 4) Fetch “commitDetail” (changed files) ────────────────────────────────────
  const {
    data: commitDetail,
    isLoading: loadingDetail,
    isError: detailError,
  } = useQuery<{ files: FileEntry[] }>({
    queryKey: ['commitDetail', selectedProject?.id, selectedCommitSha],
    enabled: !!selectedProject?.id && !!selectedCommitSha,
    queryFn: () =>
      fetch(`${API}/commit/${selectedProject!.id}/${selectedCommitSha}`)
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then((json) => json as { files: FileEntry[] }),
  });

  // ─── 5) Fetch “fileListAtCommit” (all paths at that commit SHA) ────────────────
  const {
    data: fileListAtCommit = [],
    isLoading: loadingFullTree,
    isError: fullTreeError,
  } = useQuery<string[]>({
    queryKey: ['fileListAtCommit', selectedProject?.id, branch, selectedCommitSha],
    enabled: !!selectedProject?.id && !!branch && !!selectedCommitSha,
    queryFn: () => gitService.tree(selectedProject!.id!, branch, selectedCommitSha),
  });

  // ─── 6) Whenever (project OR branch) changes, reset commit + all downstream state ─
  useEffect(() => {
    setBranch('');
    setSelectedCommitSha(undefined);
    setChangedFilesSelected([]);
    setHighlightedChange(null);
    setSearchTermChanged('');
    setSearchTermFullTree('');
    setEditorFileSelected(null);
    setFileContent('');
    setLoadingFileContent(false);
  }, [selectedProject]);

  useEffect(() => {
    setSelectedCommitSha(undefined);
    setChangedFilesSelected([]);
    setHighlightedChange(null);
    setSearchTermChanged('');
    setSearchTermFullTree('');
    setEditorFileSelected(null);
    setFileContent('');
    setLoadingFileContent(false);
  }, [branch]);

  // ─── 7) Only auto‐pick newest commit if we do not already have one set ──────────
  useEffect(() => {
    if (!selectedCommitSha && commits.length > 0) {
      setSelectedCommitSha(commits[0].sha);
    }
  }, [commits, selectedCommitSha]);

  // ─── 8) Whenever `selectedCommitSha` changes, clear selections & trees ─────────
  useEffect(() => {
    setChangedFilesSelected([]);
    setHighlightedChange(null);
    setSearchTermChanged('');
    setSearchTermFullTree('');
    setEditorFileSelected(null);
    setFileContent('');
    setLoadingFileContent(false);
    setFilesExpanded(new Set());
    setFullTreeExpanded(new Set());
  }, [selectedCommitSha]);

  // ─── 9) Build the two trees: changedTree & fullTree ───────────────────────────
  const changedTree = useMemo<TreeNode[]>(() => {
    if (!commitDetail?.files?.length) return [];
    return buildChangedTree(commitDetail.files);
  }, [commitDetail]);

  const fullTree = useMemo<TreeNode[]>(() => {
    if (!fileListAtCommit?.length) return [];
    return buildFileTree(fileListAtCommit);
  }, [fileListAtCommit]);

  // ─── 10) Expand all when changedTree arrives ──────────────────────────────────
  useEffect(() => {
    setFilesExpanded(new Set(collectFolders(changedTree)));
  }, [changedTree]);

  // ─── 11) Expand all for fullTree ─────────────────────────────────────────────
  const [fullTreeExpanded, setFullTreeExpanded] = useState<Set<string>>(new Set());
  useEffect(() => {
    setFullTreeExpanded(new Set(collectFolders(fullTree)));
  }, [fullTree]);

  // ─── 12) File viewer: load raw contents for `editorFileSelected` ─────────────
  useEffect(() => {
    if (
      selectedProject &&
      branch &&
      selectedCommitSha &&
      editorFileSelected
    ) {
      setLoadingFileContent(true);
      gitService
        .getFileContent(
          selectedProject.id,
          branch,
          selectedCommitSha,
          editorFileSelected
        )
        .then((text) => {
          setFileContent(text);
          setLoadingFileContent(false);
        })
        .catch(() => {
          setFileContent('Failed to load file.');
          setLoadingFileContent(false);
        });
    } else {
      setFileContent('');
    }
  }, [
    selectedProject,
    branch,
    selectedCommitSha,
    editorFileSelected,
  ]);

  // ─── 13) Filtered trees for search boxes ───────────────────────────────────────
  const filteredChangedTree = useMemo<TreeNode[]>(
    () => filterTree(changedTree, searchTermChanged),
    [changedTree, searchTermChanged]
  );

  const filteredFullTree = useMemo<TreeNode[]>(
    () => filterTree(fullTree, searchTermFullTree),
    [fullTree, searchTermFullTree]
  );

  // ─── 14) Callbacks for expand/collapse and selection toggles ──────────────────
  const toggleChangedExpand = useCallback((path: string) => {
    setFilesExpanded((prev) => {
      const nxt = new Set(prev);
      if (nxt.has(path)) nxt.delete(path);
      else nxt.add(path);
      return nxt;
    });
  }, []);

  const toggleFullExpand = useCallback((path: string) => {
    setFullTreeExpanded((prev) => {
      const nxt = new Set(prev);
      if (nxt.has(path)) nxt.delete(path);
      else nxt.add(path);
      return nxt;
    });
  }, []);

  const expandChangedAll = useCallback(() => {
    setFilesExpanded(new Set(collectFolders(changedTree)));
  }, [changedTree]);

  const collapseChangedAll = useCallback(() => {
    setFilesExpanded(new Set());
  }, []);

  const expandFullAll = useCallback(() => {
    setFullTreeExpanded(new Set(collectFolders(fullTree)));
  }, [fullTree]);

  const collapseFullAll = useCallback(() => {
    setFullTreeExpanded(new Set());
  }, []);

  const toggleChangedFileSelection = useCallback((path: string) => {
    setChangedFilesSelected((prev) =>
      prev.includes(path) ? prev.filter((x) => x !== path) : [...prev, path]
    );
  }, []);

  const selectAllChangedFiles = useCallback(() => {
    if (!commitDetail?.files?.length) return;
    setChangedFilesSelected(commitDetail.files.map((f) => f.filename));
  }, [commitDetail]);

  const clearChangedFiles = useCallback(() => {
    setChangedFilesSelected([]);
  }, []);

  // ─── 15) Determine CodeEditor language by extension ───────────────────────────
  function getLanguageFromFile(filename: string | null): string {
    if (!filename) return 'plaintext';
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'xml':
      case 'wsdl':
      case 'xsd':
      case 'wadl':
      case 'bix':
      case 'pipeline':
      case 'proxy':
      case 'splitjoin':
        return 'xml';
      case 'xqy':
      case 'xquery':
        return 'xquery';
      case 'json':
        return 'json';
      case 'jca':
        return 'xml';
      case 'java':
        return 'java';
      case 'js':
        return 'javascript';
      case 'ts':
        return 'typescript';
      case 'jsx':
        return 'javascript';
      case 'tsx':
        return 'typescript';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'scss':
        return 'scss';
      case 'less':
        return 'less';
      case 'yml':
      case 'yaml':
        return 'yaml';
      case 'sh':
        return 'shell';
      case 'md':
        return 'markdown';
      case 'sql':
        return 'sql';
      default:
        return 'plaintext';
    }
  }

  const editorLanguage = useMemo(
    () => getLanguageFromFile(editorFileSelected),
    [editorFileSelected]
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* ─── PAGE HEADER ───────────────────────────────────────────────────────────── */}
      <PageHeader
        title="Git Management"
        description="Combine file explorer, code viewer, and diff‐viewer in one place"
      />

      {/* ─── Project / Branch / Commit SELECTION ───────────────────────────────────── */}
      <Card className="mx-4 mb-4">
        <CardHeader>
          <CardTitle>Repository &amp; Branch</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-6 pb-4">
          {/* Project */}
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Project
            </label>
            {loadingProjects ? (
              <div className="flex items-center gap-2">
                <Spinner /> Loading projects…
              </div>
            ) : projectsError ? (
              <p className="text-sm text-red-500">Error loading projects</p>
            ) : (
              <select
                className="
                  w-full sm:w-64 px-3 py-2 border rounded
                  bg-white dark:bg-gray-700 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  border-gray-300 dark:border-gray-600
                  truncate
                "
                value={selectedProject?.id || ''}
                onChange={(e) => {
                  const proj =
                    userProjects.find((p) => p.id === e.target.value) || null;
                  setSelectedProject(proj);
                }}
              >
                <option value="">— Select project —</option>
                {userProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Branch */}
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Branch
            </label>
            {loadingBranches ? (
              <div className="flex items-center gap-2">
                <Spinner /> Loading branches…
              </div>
            ) : branchesError ? (
              <p className="text-sm text-red-500">Error loading branches</p>
            ) : (
              <select
                className="
                  w-full sm:w-48 px-3 py-2 border rounded
                  bg-white dark:bg-gray-700 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  border-gray-300 dark:border-gray-600
                  truncate
                "
                value={branch}
                onChange={(e) => {
                  setBranch(e.target.value);
                }}
                disabled={!selectedProject}
              >
                <option value="">— Select branch —</option>
                {branchesData.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Commit */}
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Commit
            </label>
            {loadingCommits ? (
              <div className="flex items-center gap-2">
                <Spinner /> Loading commits…
              </div>
            ) : commitsError ? (
              <p className="text-sm text-red-500">Error loading commits</p>
            ) : (
              <select
                className="
                  w-full sm:w-64 px-3 py-2 border rounded
                  bg-white dark:bg-gray-700 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  border-gray-300 dark:border-gray-600
                  truncate
                "
                value={selectedCommitSha || ''}
                onChange={(e) => setSelectedCommitSha(e.target.value)}
                disabled={!branch}
              >
                <option value="">— pick commit —</option>
                {commits.map((c) => (
                  <option key={c.sha} value={c.sha}>
                    {c.sha.slice(0, 7)} — {(c.message || '').split('\n')[0]}
                  </option>
                ))}
              </select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ─── TABS: (1) Files & Diff  (2) File Explorer ─────────────────────────────── */}
      <Tabs defaultValue="files" className="flex-1 flex flex-col mx-4">
        <TabsList className="border-b dark:border-gray-700">
          <TabsTrigger value="files">
            <CodeIcon className="inline-block mr-2 h-4 w-4" /> Files & Diff
          </TabsTrigger>
          <TabsTrigger value="explorer">
            <Folder className="inline-block mr-2 h-4 w-4" /> File Explorer
          </TabsTrigger>
        </TabsList>

        {/* ─── Tab #1: Files & Diff ───────────────────────────────────────────── */}
        <TabsContent
          value="files"
          className="flex-1 overflow-hidden"
        >
          <Card className="h-full overflow-hidden">
            <CardHeader>
              <CardTitle>
                Changed Files in{' '}
                {selectedCommitSha ? selectedCommitSha.slice(0, 7) : '…'}
              </CardTitle>
            </CardHeader>

            <CardContent className="h-full flex gap-6 p-0">
              {/* ─── Left Pane: Changed‐File Tree & Controls ────────────────────────── */}
              <div className="w-1/3 flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                {/* Search bar */}
                <div className="px-4 py-3 border-b dark:border-gray-700">
                  <input
                    type="text"
                    placeholder="Search changed files…"
                    className="
                      w-full px-3 py-2 border rounded
                      bg-gray-50 dark:bg-gray-700 dark:text-gray-100
                      focus:outline-none focus:ring-2 focus:ring-blue-500
                      border-gray-300 dark:border-gray-600
                    "
                    value={searchTermChanged}
                    onChange={(e) => setSearchTermChanged(e.target.value)}
                    disabled={!commitDetail?.files?.length}
                  />
                </div>

                {/* Expand / Collapse All buttons */}
                <div className="flex gap-2 px-4 py-2 border-b dark:border-gray-700">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={expandChangedAll}
                    disabled={!changedTree.length}
                  >
                    Expand All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={collapseChangedAll}
                    disabled={!changedTree.length}
                  >
                    Collapse All
                  </Button>
                </div>

                {/* Changed file list (scrollable) */}
                <div className="flex-1 overflow-auto px-2 py-2">
                  {loadingDetail ? (
                    <div className="flex items-center justify-center h-full">
                      <Spinner sizeClassName="h-10 w-10" borderWidthClassName="border-4" />
                    </div>
                  ) : detailError ? (
                    <p className="text-center text-red-500">Error loading changed files</p>
                  ) : commitDetail?.files?.length ? (
                    <ScrollArea className="h-full">
                      <TreeView
                        nodes={filteredChangedTree}
                        expanded={filesExpanded}
                        onToggle={toggleChangedExpand}
                        selected={changedFilesSelected}
                        toggleFile={toggleChangedFileSelection}
                        onHighlight={(fe) => {
                          setHighlightedChange(fe);
                          // Also clear the code‐viewer selection below:
                          setEditorFileSelected(null);
                        }}
                        searchTerm={searchTermChanged}
                      />
                    </ScrollArea>
                  ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400">
                      {selectedCommitSha
                        ? 'No changed files in this commit.'
                        : 'Select a commit to view changed files.'}
                    </p>
                  )}
                </div>

                {/* Select All / Clear buttons */}
                <div className="px-4 py-2 border-t dark:border-gray-700 flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={selectAllChangedFiles}
                    disabled={!commitDetail?.files?.length}
                  >
                    Select All
                  </Button>
                  <Button size="sm" variant="outline" onClick={clearChangedFiles}>
                    Clear
                  </Button>
                </div>
              </div>

              {/* ─── Right Pane: Diff Viewer ────────────────────────────────── */}
              <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
                {/* Header + Expand to Full Screen */}
                <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700">
                  <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100">
                    Diff
                  </h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="Expand diff"
                        disabled={!highlightedChange}
                      >
                        <Maximize2 className="h-5 w-5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      className="
                        fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                        bg-white dark:bg-gray-900 rounded-2xl shadow-lg
                        w-[90vw] max-w-[1200px]
                        max-h-[90vh]
                        overflow-auto
                        flex flex-col
                      "
                    >
                      <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
                        <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                          Full‐Screen Diff: {highlightedChange?.filename || ''}
                        </DialogTitle>
                        <DialogClose
                          aria-label="Close"
                          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        />
                      </div>
                      <div
                        className="
                          flex-1 h-80 overflow-auto border rounded p-4
                          bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100
                          [&_.dv-content-add]:text-gray-900 dark:[&_.dv-content-add]:text-gray-100
                          [&_.dv-content-del]:text-gray-900 dark:[&_.dv-content-del]:text-gray-100
                        "
                      >
                        {highlightedChange ? (
                          <DiffViewer {...highlightedChange} />
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400">
                            Select a file to view its diff
                          </p>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Inline Diff Content */}
                <div className="flex-1 h-full overflow-auto px-4 py-4">
                  {loadingDetail ? (
                    <div className="flex items-center justify-center h-full">
                      <Spinner sizeClassName="h-10 w-10" borderWidthClassName="border-4" />
                    </div>
                  ) : highlightedChange ? (
                    <div
                      className="
                        h-full overflow-auto border rounded p-4
                        bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100
                        [&_.dv-content-add]:text-gray-900 dark:[&_.dv-content-add]:text-gray-100
                        [&_.dv-content-del]:text-gray-900 dark:[&_.dv-content-del]:text-gray-100
                      "
                    >
                      <DiffViewer {...highlightedChange} />
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400">
                      Select a changed file above to view its diff.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Tab #2: File Explorer & Code Viewer ───────────────────────────────── */}
        <TabsContent
          value="explorer"
          className="flex-1 overflow-hidden"
        >
          <Card className="h-full overflow-hidden">
            <CardHeader>
              <CardTitle>
                File Explorer at {selectedCommitSha ? selectedCommitSha.slice(0, 7) : '…'}
              </CardTitle>
            </CardHeader>

            <CardContent className="h-full flex gap-6 p-0">
              {/* ─── Left Pane: Full‐Repo File Tree + Controls ─────────────────────── */}
              <div className="w-1/3 flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                {/* Search bar */}
                <div className="px-4 py-3 border-b dark:border-gray-700">
                  <input
                    type="text"
                    placeholder="Search all files…"
                    className="
                      w-full px-3 py-2 border rounded
                      bg-gray-50 dark:bg-gray-700 dark:text-gray-100
                      focus:outline-none focus:ring-2 focus:ring-blue-500
                      border-gray-300 dark:border-gray-600
                    "
                    value={searchTermFullTree}
                    onChange={(e) => setSearchTermFullTree(e.target.value)}
                    disabled={!fileListAtCommit?.length}
                  />
                </div>

                {/* Expand / Collapse all */}
                <div className="flex gap-2 px-4 py-2 border-b dark:border-gray-700">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={expandFullAll}
                    disabled={!fullTree.length}
                  >
                    Expand All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={collapseFullAll}
                    disabled={!fullTree.length}
                  >
                    Collapse All
                  </Button>
                </div>

                {/* File tree (scrollable) */}
                <div className="flex-1 overflow-auto px-2 py-2">
                  {loadingFullTree ? (
                    <div className="flex items-center justify-center h-full">
                      <Spinner sizeClassName="h-10 w-10" borderWidthClassName="border-4" />
                    </div>
                  ) : fullTreeError ? (
                    <p className="text-center text-red-500">
                      Error loading file tree at this commit
                    </p>
                  ) : fullTree.length ? (
                    <ScrollArea className="h-full">
                      <TreeView
                        nodes={filteredFullTree}
                        expanded={fullTreeExpanded}
                        onToggle={toggleFullExpand}
                        selected={[]}
                        toggleFile={(path) => setEditorFileSelected(path)}
                        onHighlight={(_) => {}}
                      />
                    </ScrollArea>
                  ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400">
                      {selectedCommitSha
                        ? 'No files found in this commit.'
                        : 'Select a commit to load full file tree.'}
                    </p>
                  )}
                </div>
              </div>

              {/* ─── Right Pane: Code Viewer ──────────────────────────────────────── */}
              <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
                {/* Header */}
                <div className="px-4 py-3 border-b dark:border-gray-700 flex items-center justify-between">
                  <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100 truncate">
                    {editorFileSelected || 'Select a file to view its content'}
                  </h3>
                </div>

                {/* Editor + Loading Overlay */}
                <div className="relative flex-1">
                  {editorFileSelected ? (
                    <CodeEditor
                      className="w-full h-full"
                      value={fileContent}
                      onChange={() => {}}
                      language={editorLanguage}
                      readOnly={true}
                      theme="vs-light"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                      {selectedCommitSha
                        ? 'Click any file on the left to load its content.'
                        : 'Select a commit to explore files.'}
                    </div>
                  )}

                  {/* Loading spinner overlay */}
                  {loadingFileContent && (
                    <div
                      className="
                        absolute inset-0 flex items-center justify-center
                        bg-white bg-opacity-75 dark:bg-gray-800 dark:bg-opacity-75
                      "
                    >
                      <div className="animate-spin h-10 w-10 border-4 border-t-blue-500 border-gray-300 dark:border-gray-600 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Simple TreeView component (unchanged). Accepts props:
 * - nodes: TreeNode[]
 * - expanded: Set<string>
 * - onToggle(path)
 * - selected: string[]
 * - toggleFile(path)
 * - onHighlight(FileEntry)
 * - searchTerm (for highlighting in the input, not strictly used here)
 */
function TreeView({
  nodes,
  expanded,
  onToggle,
  selected,
  toggleFile,
  onHighlight,
}: {
  nodes: TreeNode[];
  expanded: Set<string>;
  onToggle: (path: string) => void;
  selected: string[];
  toggleFile: (path: string) => void;
  onHighlight: (fe: FileEntry) => void;
}) {
  return (
    <ul className="pl-4 space-y-1">
      {nodes.map((n) => (
        <li key={n.path}>
          {n.isFile ? (
            <div className="flex justify-between items-center p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selected.includes(n.path)}
                  onCheckedChange={() => toggleFile(n.path)}
                />
                <button
                  className="text-left hover:underline text-sm"
                  onClick={() =>
                    onHighlight({
                      filename: n.path,
                      status: n.status!,
                      patch: n.patch!,
                    })
                  }
                >
                  {n.name}
                </button>
              </div>
              <span className="text-xs uppercase text-gray-500 dark:text-gray-400">
                {n.status}
              </span>
            </div>
          ) : (
            <div className="mb-1">
              <div
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => onToggle(n.path)}
              >
                {expanded.has(n.path) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <Folder className="h-4 w-4" />
                <span className="font-medium">{n.name}</span>
              </div>
              {expanded.has(n.path) && (
                <TreeView
                  nodes={n.children}
                  expanded={expanded}
                  onToggle={onToggle}
                  selected={selected}
                  toggleFile={toggleFile}
                  onHighlight={onHighlight}
                />
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

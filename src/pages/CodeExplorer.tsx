// src/pages/CodeExplorer.tsx

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from '@/stores/authStore';
import { projectService } from '@/services/projectService';
import { gitService } from '@/services/gitService';
import PageHeader from '@/components/ui-custom/PageHeader';
import {
  ChevronDown,
  ChevronRight,
  Folder,
  File as FileIcon,
  Code as CodeIcon,
  User,
  Server,
  GitMerge,
  Search,
  BookOpen,
  Database,
  Layers,
  Activity,
  Box,
  FileText,
  Bell,            // alert
  Briefcase,      // business service (*.bix)
  Link2,          // cross reference (*.xref)
  Tag,            // domain value map (*.dvm)
  Key,            // JNDI (*.jndi)
  Cpu,            // MFL (*.mfl)
  HardDrive,      // MQ Connection (*.mqconn, *.mq)
  Archive,        // Maven POM (*.pom)
  Grid,           // NXSD Schema (*.nxsd)
  Anchor,         // Pipeline Template (*.ptx or *.pipeline-template)
  Mail,           // SMTP Server (*.smtp)
  ShieldCheck,    // Service Key Provider (*.skp)
  Settings2,      // Throttling Group (*.tgx)
  Globe,          // UDDI Registry (*.uddi)
  Shield,         // WS-Policy File (*.wsp)
} from 'lucide-react';
import CodeEditor from '@/components/ui-custom/CodeEditor';
import { ScrollArea } from '@/components/ui/scroll-area';

import type { Project } from '@/types/project';
import type { CommitDto } from '@/types/git';

/**
 * A simple recursive tree node shape for file paths.
 */
type FileNode = {
  name: string;
  path: string;
  isFile: boolean;
  children?: FileNode[];
};

/**
 * Build a nested tree from a flat array of file paths.
 */
function buildTree(files: string[]): FileNode[] {
  const tree: FileNode[] = [];
  const lookup: Record<string, FileNode> = {};

  files.forEach((path) => {
    const parts = path.split('/');
    parts.reduce((acc, name, idx) => {
      const currPath = parts.slice(0, idx + 1).join('/');
      if (!lookup[currPath]) {
        const newNode: FileNode = {
          name,
          path: currPath,
          isFile: idx === parts.length - 1,
          children: [],
        };
        lookup[currPath] = newNode;
        acc.push(newNode);
      }
      return lookup[currPath].children!;
    }, tree);
  });

  return tree;
}

/**
 * Map certain OSB‐related file extensions to specific icons.
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

export default function CodeExplorer() {
  const { user } = useAuthStore(); // assume user.id is available

  // ─── Local state ─────────────────────────────────────────────────────────────────
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [branch, setBranch] = useState<string>('');
  const [commit, setCommit] = useState<string>(''); // re-introduced
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loadingFileContent, setLoadingFileContent] = useState<boolean>(false);

  // Hold a reference to the Monaco editor instance
  const editorInstanceRef = useRef<any>(null);

  // ─── 1) Fetch user projects ───────────────────────────────────────────────────────
  const {
    data: userProjects = [],
    isLoading: loadingProjects,
    isError: projectsError,
  } = useQuery<Project[]>({
    queryKey: ['userProjects', user?.id],
    queryFn: () => projectService.getUserProjects(user!.id),
    enabled: !!user?.id,
  });

  // ─── 2) Fetch branches for selected project ───────────────────────────────────────
  const {
    data: branches = [],
    isLoading: loadingBranches,
    isError: branchesError,
  } = useQuery<string[]>({
    queryKey: ['branches', selectedProject?.id],
    queryFn: () => gitService.getBranches(selectedProject!.id!),
    enabled: !!selectedProject?.id,
  });

  // ─── 3) Fetch commits for selected branch ─────────────────────────────────────────
  const {
    data: commits = [],
    isLoading: loadingCommits,
    isError: commitsError,
  } = useQuery<CommitDto[]>({
    queryKey: ['commits', selectedProject?.id, branch],
    queryFn: () => gitService.getCommits(selectedProject!.id!, branch),
    enabled: !!selectedProject?.id && !!branch,
  });

  // ─── 4) Fetch file list (tree) for selected branch (HEAD only) ──────────────────
  const {
    data: fileList = [],
    isLoading: loadingFiles,
    isError: filesError,
  } = useQuery<string[]>({
    queryKey: ['fileList', selectedProject?.id, branch],
    enabled: !!selectedProject?.id && !!branch,
    queryFn: () => gitService.tree(selectedProject!.id!, branch),
  });

  // ─── 5) Whenever `branch` changes, reset commit / clear state ────────────────────
  useEffect(() => {
    if (branch) {
      setCommit('');
      setSelectedFile(null);
      setFileContent('');
      setExpanded(new Set());
      setSearchTerm('');
    }
  }, [branch]);

  // ─── 6) Automatically pick the newest (HEAD) commit as soon as commits load ──────
  useEffect(() => {
    if (commits.length > 0) {
      setCommit(commits[0].sha);
    }
  }, [commits]);

  // ─── 7) Whenever `commit` changes, reset file selection / content ────────────────
  useEffect(() => {
    if (commit) {
      setSelectedFile(null);
      setFileContent('');
      setExpanded(new Set());
      setSearchTerm('');
    }
  }, [commit]);

  // ─── 8) Fetch file content (using project + branch + commit + path) ─────────────
  useEffect(() => {
    if (selectedProject && selectedFile && branch && commit) {
      setLoadingFileContent(true);
      gitService
        .getFileContent(selectedProject.id, branch, commit, selectedFile)
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
  }, [selectedProject, branch, commit, selectedFile]);

  // ─── 9) Build nested tree, then filter it by searchTerm ───────────────────────────
  const treeData = useMemo<FileNode[]>(() => buildTree(fileList), [fileList]);

  function filterTree(nodes: FileNode[]): FileNode[] {
    if (!searchTerm.trim()) return nodes;
    const lowerSearch = searchTerm.toLowerCase();
    const filtered: FileNode[] = [];

    nodes.forEach((node) => {
      if (node.isFile && node.name.toLowerCase().includes(lowerSearch)) {
        filtered.push({ ...node });
      } else if (!node.isFile) {
        const childMatches = filterTree(node.children!);
        if (childMatches.length > 0) {
          filtered.push({ ...node, children: childMatches });
        } else if (node.name.toLowerCase().includes(lowerSearch)) {
          filtered.push({
            ...node,
            children: node.children,
          });
        }
      }
    });

    return filtered;
  }

  const filteredTree = useMemo<FileNode[]>(() => filterTree(treeData), [
    treeData,
    searchTerm,
  ]);

  // ─── 10) Expand/collapse logic for folders ───────────────────────────────────────
  const toggleExpand = useCallback((path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  // ─── 11) Determine editor language based on file extension ───────────────────────
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
        return 'xml';
    }
  }

  // ─── 12) Recursively render each node in the file tree ───────────────────────────
  const renderFileTree = useCallback(
    (nodes: FileNode[]) =>
      nodes.map((node) => {
        const isExpanded = expanded.has(node.path);
        const isSelected = node.path === selectedFile;
        const icon = node.isFile
          ? getIconForExtension(node.name)
          : <Folder className="h-4 w-4 text-gray-600 dark:text-gray-300" />;

        return (
          <div key={node.path} className="ml-4">
            <div
              className={`
                flex items-center gap-2 px-2 py-1 rounded 
                cursor-pointer
                ${node.isFile
                  ? isSelected
                    ? 'bg-blue-100 dark:bg-blue-900 font-medium'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }
                transition-colors duration-150
              `}
              onClick={() => {
                if (node.isFile) {
                  setSelectedFile(node.path);
                } else {
                  toggleExpand(node.path);
                }
              }}
            >
              {!node.isFile ? (
                <div
                  className={`
                    transform transition-transform duration-150 
                    ${isExpanded ? 'rotate-90' : 'rotate-0'}
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(node.path);
                  }}
                >
                  <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </div>
              ) : (
                <span className="h-4 w-4" />
              )}

              {icon}

              <span
                className={`
                  text-sm 
                  ${node.isFile
                    ? isSelected
                      ? 'text-blue-800 dark:text-blue-200'
                      : 'text-gray-800 dark:text-gray-200'
                    : 'text-gray-700 dark:text-gray-300'
                  }
                `}
              >
                {node.name}
              </span>
            </div>

            {!node.isFile && isExpanded && renderFileTree(node.children!)}
          </div>
        );
      }),
    [expanded, toggleExpand, selectedFile]
  );

  // ─── 13) Compute editor language whenever selectedFile changes ─────────────────
  const editorLanguage = useMemo(
    () => getLanguageFromFile(selectedFile),
    [selectedFile]
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* ─── Page Header ────────────────────────────────────────────────────────────── */}
      <PageHeader
        title="Code Explorer"
        description="Browse any branch/commit of your repo"
      />

      {/* ─── Dropdown & Search Row ──────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-4 px-4 py-3 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        {/* Left: Project / Branch / Commit */}
        <div className="flex gap-6 flex-wrap">
          {/* Project selector */}
          <div className="w-full lg:w-auto max-w-xs">
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Project
            </label>
            <select
              className="
                w-full px-3 py-2 border rounded 
                bg-white dark:bg-gray-700 dark:text-gray-100
                focus:outline-none focus:ring-2 focus:ring-blue-500
                border-gray-300 dark:border-gray-600
              "
              value={selectedProject?.id || ''}
              onChange={(e) => {
                const proj =
                  userProjects.find((p) => p.id === e.target.value) || null;
                setSelectedProject(proj);
                setBranch('');
                setCommit('');
                setSelectedFile(null);
              }}
            >
              <option value="">— Select project —</option>
              {loadingProjects ? (
                <option disabled>Loading projects…</option>
              ) : projectsError ? (
                <option disabled>Error loading projects</option>
              ) : (
                userProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Branch selector */}
          <div className="w-full lg:w-auto max-w-xs">
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Branch
            </label>
            <select
              className="
                w-full px-3 py-2 border rounded 
                bg-white dark:bg-gray-700 dark:text-gray-100
                focus:outline-none focus:ring-2 focus:ring-blue-500
                border-gray-300 dark:border-gray-600
              "
              value={branch}
              onChange={(e) => {
                setBranch(e.target.value);
                setCommit('');
                setSelectedFile(null);
              }}
              disabled={!selectedProject}
            >
              <option value="">— Select branch —</option>
              {loadingBranches ? (
                <option disabled>Loading branches…</option>
              ) : branchesError ? (
                <option disabled>Error loading branches</option>
              ) : (
                branches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Commit selector */}
          <div className="w-full lg:w-auto max-w-xs">
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Commit
            </label>
            <select
              className="
                w-full px-3 py-2 border rounded 
                bg-white dark:bg-gray-700 dark:text-gray-100
                focus:outline-none focus:ring-2 focus:ring-blue-500
                border-gray-300 dark:border-gray-600
              "
              value={commit}
              onChange={(e) => setCommit(e.target.value)}
              disabled={!selectedProject || !branch}
            >
              <option value="">— Select commit —</option>
              {loadingCommits ? (
                <option disabled>Loading commits…</option>
              ) : commitsError ? (
                <option disabled>Error loading commits</option>
              ) : (
                commits.map((c) => (
                  <option key={c.sha} value={c.sha}>
                    {c.sha.slice(0, 7)} — {c.message}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Right: File search */}
        <div className="mt-2 lg:mt-0 lg:ml-auto w-full lg:w-1/3 max-w-md">
          <label
            htmlFor="file-search"
            className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Search files
          </label>
          <input
            id="file-search"
            type="text"
            placeholder="Type to filter…"
            className="
              w-full px-3 py-2 border rounded 
              bg-white dark:bg-gray-700 dark:text-gray-100
              focus:outline-none focus:ring-2 focus:ring-blue-500
              border-gray-300 dark:border-gray-600
            "
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={!fileList.length}
          />
        </div>
      </div>

      {/* ─── Two‐Pane Area ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden px-4 py-4">
        {/* Left pane: Project Files */}
        <div className="w-1/4 flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100">
              Project Files
            </h3>
          </div>
          {/* Tree + Search results */}
          <div className="flex-1 overflow-auto px-2 py-2">
            {loadingFiles ? (
              <div className="text-center text-gray-500 dark:text-gray-400">
                Loading files…
              </div>
            ) : filesError ? (
              <div className="text-center text-red-500">Error loading files</div>
            ) : filteredTree.length === 0 && searchTerm.trim() ? (
              <div className="text-center text-gray-500 dark:text-gray-400">
                No results for “{searchTerm}”
              </div>
            ) : (
              <ScrollArea className="h-full">
                {renderFileTree(filteredTree)}
              </ScrollArea>
            )}
          </div>
        </div>

        {/* Right pane: Code Editor */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ml-6">
          {/* Header */}
          <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
            <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100 truncate">
              {selectedFile || 'Select a file'}
            </h3>
          </div>
          {/* Editor + Loading Overlay */}
          <div className="relative flex-1">
            {selectedFile && commit ? (
              <CodeEditor
                className="w-full h-full"
                value={fileContent}
                onChange={() => {
                  /* read-only */
                }}
                language={editorLanguage}
                readOnly={true}
                theme="vs-light"
                // Pass editor instance back up so we can add more actions if desired
                onEditorMount={(editorInstance) => {
                  editorInstanceRef.current = editorInstance;
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                {selectedFile
                  ? 'Select a commit to load this file’s content'
                  : 'Select a file from the explorer to view its content'}
              </div>
            )}

            {/* Loading Overlay */}
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
      </div>
    </div>
  );
}

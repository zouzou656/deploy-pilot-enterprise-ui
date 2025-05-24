
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import PageHeader from '@/components/ui-custom/PageHeader';
import { ChevronDown, ChevronRight, Folder, File, RefreshCcw, Search } from 'lucide-react';
import CodeEditor from '@/components/ui-custom/CodeEditor';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { gitService } from '@/services/gitService';
import { useProject } from '@/contexts/ProjectContext';
import { CommitDto } from '@/types/git';

type FileNode = {
  name: string;
  path: string;
  isFile: boolean;
  children?: FileNode[];
};

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

export default function CodeExplorer() {
  const { selectedProject } = useProject();
  const [branch, setBranch] = useState('');
  const [commit, setCommit] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // Branches
  const { data: branches = [], isLoading: loadingBranches, refetch: refetchBranches } = useQuery({
    queryKey: ['branches', selectedProject?.id],
    enabled: !!selectedProject?.id,
    queryFn: () => gitService.getBranches(selectedProject!.id),
  });

  // Commits for branch
  const { data: commits = [], isLoading: loadingCommits, refetch: refetchCommits } = useQuery({
    queryKey: ['commits', selectedProject?.id, branch],
    enabled: !!selectedProject?.id && !!branch,
    queryFn: () => gitService.getCommits({ projectId: selectedProject!.id, branch }),
  });

  // File list for tree
  const { data: fileList = [], isLoading: loadingFiles, refetch: refetchFiles } = useQuery({
    queryKey: ['fileList', selectedProject?.id, branch, commit],
    enabled: !!selectedProject?.id && !!branch && !!commit,
    queryFn: () => gitService.getTree({ projectId: selectedProject!.id, branch }),
  });

  function getLanguageFromFile(filename: string | null): string {
    if (!filename) return 'plaintext';
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'xml':
      case 'wsdl':
      case 'xsd':
      case 'wadl':
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

  // Fetch file content when a file is clicked
  useEffect(() => {
    if (selectedFile && commit && selectedProject) {
      gitService.getFileContent({
        projectId: selectedProject.id,
        sha: commit,
        path: selectedFile,
        branch
      })
        .then(setFileContent)
        .catch(() => setFileContent('Failed to load file.'));
    } else {
      setFileContent('');
    }
  }, [selectedFile, commit, selectedProject, branch]);

  // Build file tree with search filtering
  const fileTree = useMemo(() => {
    const filteredFiles = searchTerm 
      ? fileList.filter(file => file.toLowerCase().includes(searchTerm.toLowerCase()))
      : fileList;
    return buildTree(filteredFiles);
  }, [fileList, searchTerm]);

  // Tree expand/collapse
  const toggleExpand = useCallback((path: string) => {
    setExpanded((prev) => {
      const ns = new Set(prev);
      ns.has(path) ? ns.delete(path) : ns.add(path);
      return ns;
    });
  }, []);

  // File tree renderer
  const renderFileTree = useCallback(
    (nodes: FileNode[]) =>
      nodes.map((node) => (
        <div key={node.path} className="ml-4">
          <div
            className="flex items-center gap-2 p-1 rounded hover:bg-muted cursor-pointer"
            onClick={() => {
              if (node.isFile) {
                setSelectedFile(node.path);
              } else {
                toggleExpand(node.path);
              }
            }}
          >
            {!node.isFile &&
              (expanded.has(node.path) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              ))}
            {node.isFile ? <File className="h-4 w-4" /> : <Folder className="h-4 w-4" />}
            <span className="text-sm hover:text-primary">{node.name}</span>
          </div>
          {!node.isFile && expanded.has(node.path) && renderFileTree(node.children!)}
        </div>
      )),
    [expanded, toggleExpand]
  );

  // Reset states when project or branch changes
  useEffect(() => {
    setSelectedFile(null);
    setFileContent('');
    setExpanded(new Set());
    setCommit('');
  }, [selectedProject, branch]);

  useEffect(() => {
    setBranch('');
    setCommit('');
  }, [selectedProject]);

  const handleRefresh = () => {
    if (branch) {
      refetchBranches();
      refetchCommits();
      if (commit) {
        refetchFiles();
      }
    }
  };

  if (!selectedProject) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader title="Code Explorer" description="Browse any branch/commit of your repo" />
        <Card className="text-center py-10">
          <CardContent>
            <p className="text-muted-foreground">Please select a project from the dropdown above to explore code.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Code Explorer" description="Browse any branch/commit of your repo" />

      {/* Controls */}
      <div className="flex gap-4 items-end">
        <div>
          <label className="block mb-1 font-medium">Branch</label>
          <Select value={branch} onValueChange={(value) => setBranch(value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              {loadingBranches ? (
                <SelectItem value="loading">Loading...</SelectItem>
              ) : (
                branches.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Commit</label>
          <Select value={commit} onValueChange={(value) => setCommit(value)} disabled={!branch}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select commit" />
            </SelectTrigger>
            <SelectContent>
              {loadingCommits ? (
                <SelectItem value="loading">Loading...</SelectItem>
              ) : (
                commits.map((c) => (
                  <SelectItem key={c.sha} value={c.sha}>
                    {c.sha.slice(0, 7)} — {c.message}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loadingBranches || loadingCommits || loadingFiles}
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* File tree and editor */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Project Files</h3>
            </div>
            
            {/* Search input */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <ScrollArea className="border rounded-md p-2 bg-muted/30 h-[500px] overflow-auto">
              {loadingFiles ? (
                <div className="text-center py-4 text-muted-foreground">Loading...</div>
              ) : fileTree.length > 0 ? (
                renderFileTree(fileTree)
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  {searchTerm ? 'No files found matching your search.' : 'No files available.'}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardContent className="p-4">
            <h3 className="font-medium mb-4">{selectedFile || 'Select a file'}</h3>
            <div className="h-[500px] border rounded-md overflow-hidden bg-muted/10">
              {selectedFile ? (
                <CodeEditor
                  value={fileContent}
                  onChange={() => {}}
                  language={getLanguageFromFile(selectedFile)}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Select a file from the explorer to view its content
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

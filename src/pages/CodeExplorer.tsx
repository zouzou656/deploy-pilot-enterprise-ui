import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import PageHeader from '@/components/ui-custom/PageHeader';
import { ChevronDown, ChevronRight, Folder, File } from 'lucide-react';
import CodeEditor from '@/components/ui-custom/CodeEditor';
import { ScrollArea } from '@/components/ui/scroll-area';

type FileNode = {
  name: string;
  path: string;
  isFile: boolean;
  children?: FileNode[];
};

const API = 'http://localhost:5020/api/git';

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
  // Dropdown state
  const [branch, setBranch] = useState('');
  const [commit, setCommit] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Branches
  const { data: branches = [], isLoading: loadingBranches } = useQuery({
    queryKey: ['branches'],
    queryFn: () =>
        fetch(`${API}/branches`).then((r) => r.json() as Promise<string[]>),
  });

  // Commits for branch
  const { data: commits = [], isLoading: loadingCommits } = useQuery({
    queryKey: ['commits', branch],
    enabled: !!branch,
    queryFn: () =>
        fetch(`${API}/commits?branch=${branch}`).then((r) =>
            r.json() as Promise<{ sha: string; message: string }[]>
        ),
  });

  // File list for tree (from latest commit on branch)
  const { data: fileList = [], isLoading: loadingFiles } = useQuery({
    queryKey: ['fileList', branch, commit],
    enabled: !!branch && !!commit,
    queryFn: () =>
        fetch(`${API}/tree?branch=${branch}`).then((res) => res.json()) as Promise<string[]>,
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
        return 'xquery'; // if supported, else fallback to xml
      case 'json':
        return 'json';
      case 'jca':
        return 'xml'; // No dedicated support; best as xml
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

  // Fetch file content when a file is clicked and branch/commit are selected
  useEffect(() => {
    if (selectedFile && commit) {
      fetch(
          `${API}/file-content?sha=${commit}&path=${encodeURIComponent(selectedFile)}&branch=${branch}`
      )
          .then((res) => res.ok ? res.text() : Promise.reject(res))
          .then(setFileContent)
          .catch(() => setFileContent('Failed to load file.'));
    } else {
      setFileContent('');
    }
  }, [selectedFile, commit]);

  // Build file tree
  const fileTree = useMemo(() => buildTree(fileList), [fileList]);

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
                    onClick={() => node.isFile && setSelectedFile(node.path)}
                >
                  {!node.isFile &&
                      (expanded.has(node.path) ? (
                          <ChevronDown className="h-4 w-4" onClick={() => toggleExpand(node.path)} />
                      ) : (
                          <ChevronRight className="h-4 w-4" onClick={() => toggleExpand(node.path)} />
                      ))}
                  {node.isFile ? <File className="h-4 w-4" /> : <Folder className="h-4 w-4" />}
                  <span className="text-sm hover:text-primary">{node.name}</span>
                </div>
                {!node.isFile && expanded.has(node.path) && renderFileTree(node.children!)}
              </div>
          )),
      [expanded, toggleExpand]
  );

  // Reset file selection when branch or commit changes
  useEffect(() => {
    setSelectedFile(null);
    setFileContent('');
    setExpanded(new Set());
  }, [branch, commit]);

  return (
      <div className="space-y-6">
        <PageHeader title="Code Explorer" description="Browse any branch/commit of your repo" />

        {/* Dropdowns */}
        <div className="flex gap-4 items-end">
          <div>
            <label className="block mb-1 font-medium">Branch</label>
            <select
                className="p-2 border rounded bg-white dark:bg-gray-800 dark:text-gray-100"
                value={branch}
                onChange={(e) => {
                  setBranch(e.target.value);
                  setCommit('');
                }}
            >
              <option value="">— Select branch —</option>
              {loadingBranches ? (
                  <option>Loading...</option>
              ) : (
                  branches.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                  ))
              )}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Commit</label>
            <select
                className="p-2 border rounded bg-white dark:bg-gray-800 dark:text-gray-100"
                value={commit}
                onChange={(e) => setCommit(e.target.value)}
                disabled={!branch}
            >
              <option value="">— Select commit —</option>
              {loadingCommits ? (
                  <option>Loading...</option>
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

        {/* File tree and editor */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1">
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">Project Files</h3>
              <ScrollArea className="border rounded-md p-2 bg-muted/30 h-[500px] overflow-auto">
                {loadingFiles ? "Loading..." : renderFileTree(fileTree)}
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
                        theme="vs-dark"
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

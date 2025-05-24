
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Folder, 
  File, 
  Search, 
  RefreshCw, 
  ChevronRight, 
  ChevronDown,
  Code,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import CodeEditor from '@/components/ui-custom/CodeEditor';
import PageHeader from '@/components/ui-custom/PageHeader';
import AuthGuard from '@/components/auth/AuthGuard';
import { useProject } from '@/contexts/ProjectContext';
import { gitService } from '@/services/gitService';
import { useToast } from '@/hooks/use-toast';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

const CodeExplorer = () => {
  const { selectedProject } = useProject();
  const { toast } = useToast();
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Fetch branches
  const { data: branches = [], isLoading: loadingBranches, refetch: refetchBranches } = useQuery({
    queryKey: ['branches', selectedProject?.id],
    queryFn: () => selectedProject ? gitService.getBranches(selectedProject.id) : Promise.resolve([]),
    enabled: !!selectedProject?.id,
  });

  // Fetch file tree
  const { data: files = [], isLoading: loadingFiles, refetch: refetchFiles } = useQuery({
    queryKey: ['git-tree', selectedProject?.id, selectedBranch],
    queryFn: () => selectedProject ? gitService.getTree({
      projectId: selectedProject.id,
      branch: selectedBranch
    }) : Promise.resolve([]),
    enabled: !!selectedProject?.id && !!selectedBranch,
  });

  // Fetch file content
  const { data: fileContent = '', isLoading: loadingContent } = useQuery({
    queryKey: ['file-content', selectedProject?.id, selectedBranch, selectedFile],
    queryFn: () => selectedProject && selectedFile ? gitService.getFileContent({
      projectId: selectedProject.id,
      branch: selectedBranch,
      path: selectedFile
    }) : Promise.resolve(''),
    enabled: !!selectedProject?.id && !!selectedFile,
  });

  // Set default branch when branches are loaded
  useEffect(() => {
    if (branches.length > 0 && !branches.includes(selectedBranch)) {
      setSelectedBranch(branches[0]);
    }
  }, [branches, selectedBranch]);

  // Build file tree from flat file list
  const buildFileTree = (filePaths: string[]): FileNode[] => {
    const tree: FileNode[] = [];
    const pathMap = new Map<string, FileNode>();

    filePaths.forEach(filePath => {
      const parts = filePath.split('/');
      let currentPath = '';

      parts.forEach((part, index) => {
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        if (!pathMap.has(currentPath)) {
          const node: FileNode = {
            name: part,
            path: currentPath,
            type: index === parts.length - 1 ? 'file' : 'folder',
            children: []
          };

          pathMap.set(currentPath, node);

          if (parentPath) {
            const parent = pathMap.get(parentPath);
            if (parent) {
              parent.children!.push(node);
            }
          } else {
            tree.push(node);
          }
        }
      });
    });

    return tree;
  };

  const fileTree = buildFileTree(files);

  // Filter files based on search
  const filterFiles = (nodes: FileNode[], term: string): FileNode[] => {
    if (!term) return nodes;

    return nodes.reduce<FileNode[]>((acc, node) => {
      if (node.type === 'file' && node.name.toLowerCase().includes(term.toLowerCase())) {
        acc.push(node);
      } else if (node.type === 'folder' && node.children) {
        const filteredChildren = filterFiles(node.children, term);
        if (filteredChildren.length > 0 || node.name.toLowerCase().includes(term.toLowerCase())) {
          acc.push({
            ...node,
            children: filteredChildren
          });
        }
      }
      return acc;
    }, []);
  };

  const filteredTree = filterFiles(fileTree, searchTerm);

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js': return 'javascript';
      case 'ts': return 'typescript';
      case 'jsx': return 'javascript';
      case 'tsx': return 'typescript';
      case 'json': return 'json';
      case 'xml': return 'xml';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'java': return 'java';
      case 'py': return 'python';
      case 'sql': return 'sql';
      default: return 'text';
    }
  };

  const renderFileNode = (node: FileNode, depth = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedFile === node.path;

    return (
      <div key={node.path}>
        <div
          className={`flex items-center py-1 px-2 cursor-pointer hover:bg-muted/50 ${
            isSelected ? 'bg-muted' : ''
          }`}
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
          onClick={() => {
            if (node.type === 'folder') {
              toggleFolder(node.path);
            } else {
              setSelectedFile(node.path);
            }
          }}
        >
          {node.type === 'folder' ? (
            <>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 mr-1" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-1" />
              )}
              <Folder className="h-4 w-4 mr-2 text-blue-500" />
            </>
          ) : (
            <>
              <div className="w-5" />
              {node.name.includes('.') ? (
                <Code className="h-4 w-4 mr-2 text-green-500" />
              ) : (
                <FileText className="h-4 w-4 mr-2 text-gray-500" />
              )}
            </>
          )}
          <span className="text-sm truncate">{node.name}</span>
        </div>
        
        {node.type === 'folder' && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderFileNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleRefresh = () => {
    refetchBranches();
    refetchFiles();
  };

  if (!selectedProject) {
    return (
      <AuthGuard requiredPermission="git:view">
        <div className="flex items-center justify-center h-screen">
          <Card className="text-center p-8">
            <CardContent>
              <Code className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Please select a project to explore its code.</p>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredPermission="git:view">
      <div className="h-screen flex flex-col">
        <div className="p-6 border-b">
          <PageHeader
            title="Code Explorer"
            description={`Explore code for ${selectedProject.name}`}
          />
          
          <div className="flex items-center space-x-4 mt-4">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-3 py-2 border rounded-md"
              disabled={loadingBranches}
            >
              {branches.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loadingBranches || loadingFiles}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            <Badge variant="secondary">
              {files.length} files
            </Badge>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* File Tree */}
          <div className="w-80 border-r bg-muted/10">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <ScrollArea className="h-full">
              <div className="p-2">
                {loadingFiles ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Loading files...
                  </div>
                ) : filteredTree.length > 0 ? (
                  filteredTree.map(node => renderFileNode(node))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'No files found matching your search.' : 'No files found.'}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* File Content */}
          <div className="flex-1 flex flex-col">
            {selectedFile ? (
              <>
                <div className="p-4 border-b bg-muted/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <File className="h-4 w-4" />
                      <span className="font-medium">{selectedFile}</span>
                    </div>
                    <Badge variant="outline">
                      {getFileLanguage(selectedFile)}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex-1 overflow-hidden">
                  {loadingContent ? (
                    <div className="flex items-center justify-center h-full">
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Loading file content...
                    </div>
                  ) : (
                    <CodeEditor
                      value={fileContent}
                      onChange={() => {}} // Read-only
                      language={getFileLanguage(selectedFile)}
                      readOnly
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <File className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Select a file to view its content</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default CodeExplorer;

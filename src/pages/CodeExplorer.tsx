
import React, { useState, useEffect } from 'react';
import { Code, FileText, FolderOpen, Folder, Search, RefreshCw, GitBranch } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import AuthGuard from '@/components/auth/AuthGuard';
import PageHeader from '@/components/ui-custom/PageHeader';
import CodeEditor from '@/components/ui-custom/CodeEditor';
import { useProject } from '@/contexts/ProjectContext';
import { gitService } from '@/services/gitService';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

const CodeExplorer = () => {
  const { selectedProject } = useProject();
  const { toast } = useToast();
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('main');
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Load branches when project changes
  useEffect(() => {
    if (selectedProject?.id) {
      loadBranches();
    }
  }, [selectedProject]);

  // Load file tree when branch changes
  useEffect(() => {
    if (selectedProject?.id && selectedBranch) {
      loadFileTree();
    }
  }, [selectedProject, selectedBranch]);

  const loadBranches = async () => {
    if (!selectedProject?.id) return;
    
    setLoading(true);
    try {
      const branchList = await gitService.getBranches(selectedProject.id);
      setBranches(branchList);
      if (branchList.length > 0 && !branchList.includes(selectedBranch)) {
        setSelectedBranch(branchList[0]);
      }
    } catch (error: any) {
      toast({
        title: 'Error loading branches',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFileTree = async () => {
    if (!selectedProject?.id || !selectedBranch) return;
    
    setLoading(true);
    try {
      const files = await gitService.getTree({
        projectId: selectedProject.id,
        branch: selectedBranch
      });
      
      // Convert flat file list to tree structure
      const tree = buildFileTree(files);
      setFileTree(tree);
    } catch (error: any) {
      toast({
        title: 'Error loading file tree',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const buildFileTree = (files: string[]): FileNode[] => {
    const tree: FileNode[] = [];
    const nodeMap = new Map<string, FileNode>();

    files.forEach(filePath => {
      const parts = filePath.split('/');
      let currentPath = '';
      
      parts.forEach((part, index) => {
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        if (!nodeMap.has(currentPath)) {
          const node: FileNode = {
            name: part,
            path: currentPath,
            type: index === parts.length - 1 ? 'file' : 'directory',
            children: index === parts.length - 1 ? undefined : []
          };
          
          nodeMap.set(currentPath, node);
          
          if (parentPath && nodeMap.has(parentPath)) {
            const parent = nodeMap.get(parentPath)!;
            if (parent.children) {
              parent.children.push(node);
            }
          } else if (!parentPath) {
            tree.push(node);
          }
        }
      });
    });

    return tree;
  };

  const loadFileContent = async (filePath: string) => {
    if (!selectedProject?.id) return;
    
    setSelectedFile(filePath);
    setLoading(true);
    try {
      const content = await gitService.getFileContent({
        projectId: selectedProject.id,
        branch: selectedBranch,
        path: filePath
      });
      setFileContent(content);
    } catch (error: any) {
      toast({
        title: 'Error loading file content',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleDirectory = (path: string) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedDirs(newExpanded);
  };

  const renderFileNode = (node: FileNode, level: number = 0): React.ReactNode => {
    const isExpanded = expandedDirs.has(node.path);
    const paddingLeft = level * 20;
    
    if (node.type === 'directory') {
      return (
        <div key={node.path}>
          <div
            className="flex items-center py-1 px-2 hover:bg-muted/50 cursor-pointer"
            style={{ paddingLeft }}
            onClick={() => toggleDirectory(node.path)}
          >
            {isExpanded ? <FolderOpen className="h-4 w-4 mr-2" /> : <Folder className="h-4 w-4 mr-2" />}
            <span className="text-sm">{node.name}</span>
          </div>
          {isExpanded && node.children && (
            <div>
              {node.children.map(child => renderFileNode(child, level + 1))}
            </div>
          )}
        </div>
      );
    } else {
      const isSelected = selectedFile === node.path;
      return (
        <div
          key={node.path}
          className={`flex items-center py-1 px-2 cursor-pointer ${
            isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'
          }`}
          style={{ paddingLeft }}
          onClick={() => loadFileContent(node.path)}
        >
          <FileText className="h-4 w-4 mr-2" />
          <span className="text-sm">{node.name}</span>
        </div>
      );
    }
  };

  const filteredTree = (nodes: FileNode[]): FileNode[] => {
    if (!searchTerm) return nodes;
    
    return nodes.filter(node => {
      if (node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return true;
      }
      if (node.children) {
        const filteredChildren = filteredTree(node.children);
        return filteredChildren.length > 0;
      }
      return false;
    }).map(node => ({
      ...node,
      children: node.children ? filteredTree(node.children) : undefined
    }));
  };

  if (!selectedProject) {
    return (
      <AuthGuard requiredPermission="project:view">
        <div className="flex items-center justify-center h-screen">
          <Card className="text-center p-8">
            <CardContent>
              <Code className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Please select a project to explore code.</p>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredPermission="project:view">
      <div className="container mx-auto py-6 space-y-6">
        <PageHeader
          title="Code Explorer"
          description={`Browse and view source code for ${selectedProject.name}`}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File Tree */}
          <div className="space-y-4">
            {/* Branch Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Branch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={loadBranches} size="icon" variant="outline">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* File Tree */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading files...
                    </div>
                  ) : filteredTree(fileTree).length > 0 ? (
                    <div>
                      {filteredTree(fileTree).map(node => renderFileNode(node))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No files match your search' : 'No files found'}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* File Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  {selectedFile || 'Select a file to view'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedFile ? (
                  <div className="h-96">
                    <CodeEditor
                      value={fileContent}
                      language={getLanguageFromPath(selectedFile)}
                      readOnly
                    />
                  </div>
                ) : (
                  <div className="h-96 flex items-center justify-center text-muted-foreground">
                    Select a file from the tree to view its content
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

const getLanguageFromPath = (path: string): string => {
  const extension = path.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'java':
      return 'java';
    case 'py':
      return 'python';
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'scss':
    case 'sass':
      return 'scss';
    case 'json':
      return 'json';
    case 'xml':
      return 'xml';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'md':
      return 'markdown';
    case 'sql':
      return 'sql';
    case 'sh':
      return 'shell';
    case 'dockerfile':
      return 'dockerfile';
    default:
      return 'text';
  }
};

export default CodeExplorer;

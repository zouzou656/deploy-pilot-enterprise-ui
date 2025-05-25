
import React, { useState, useEffect } from 'react';
import { Git, GitBranch, GitCommit, FileText, Search, RefreshCw, Eye, GitCompare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import AuthGuard from '@/components/auth/AuthGuard';
import PageHeader from '@/components/ui-custom/PageHeader';
import { useProject } from '@/contexts/ProjectContext';
import { gitService } from '@/services/gitService';
import { CommitDto, FileChangeDto } from '@/types/git';

const GitManagement = () => {
  const { selectedProject } = useProject();
  const { toast } = useToast();
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('main');
  const [commits, setCommits] = useState<CommitDto[]>([]);
  const [selectedCommit, setSelectedCommit] = useState<CommitDto | null>(null);
  const [commitFiles, setCommitFiles] = useState<FileChangeDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileContent, setFileContent] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [baseSha, setBaseSha] = useState<string>('');
  const [headSha, setHeadSha] = useState<string>('');
  const [compareFiles, setCompareFiles] = useState<FileChangeDto[]>([]);

  // Load branches when project changes
  useEffect(() => {
    if (selectedProject?.id) {
      loadBranches();
    }
  }, [selectedProject]);

  // Load commits when branch changes
  useEffect(() => {
    if (selectedProject?.id && selectedBranch) {
      loadCommits();
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

  const loadCommits = async () => {
    if (!selectedProject?.id || !selectedBranch) return;
    
    setLoading(true);
    try {
      const commitList = await gitService.getCommits({
        projectId: selectedProject.id,
        branch: selectedBranch
      });
      setCommits(commitList);
    } catch (error: any) {
      toast({
        title: 'Error loading commits',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCommitDetails = async (commit: CommitDto) => {
    if (!selectedProject?.id) return;
    
    setSelectedCommit(commit);
    setLoading(true);
    try {
      const details = await gitService.getCommitDetail(commit.sha, selectedProject.id);
      setCommitFiles(details.files || []);
    } catch (error: any) {
      toast({
        title: 'Error loading commit details',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFileContent = async (filePath: string, sha?: string) => {
    if (!selectedProject?.id) return;
    
    setSelectedFile(filePath);
    setLoading(true);
    try {
      const content = await gitService.getFileContent({
        projectId: selectedProject.id,
        branch: selectedBranch,
        sha: sha || selectedCommit?.sha,
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

  const handleCompareCommits = async () => {
    if (!selectedProject?.id || !baseSha || !headSha) return;
    
    setLoading(true);
    try {
      const comparison = await gitService.compareCommits(selectedProject.id, baseSha, headSha);
      setCompareFiles(comparison.files || []);
    } catch (error: any) {
      toast({
        title: 'Error comparing commits',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCommits = commits.filter(commit =>
    commit.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    commit.sha.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'added': return 'bg-green-100 text-green-800';
      case 'modified': return 'bg-yellow-100 text-yellow-800';
      case 'deleted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!selectedProject) {
    return (
      <AuthGuard requiredPermission="project:view">
        <div className="flex items-center justify-center h-screen">
          <Card className="text-center p-8">
            <CardContent>
              <Git className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Please select a project to manage Git repositories.</p>
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
          title="Git Management"
          description={`Manage Git repositories for ${selectedProject.name}`}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Branch and Commit Selection */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Branch Selection
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

            {/* Commit Comparison */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <GitCompare className="h-5 w-5" />
                  Compare Commits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Select value={baseSha} onValueChange={setBaseSha}>
                    <SelectTrigger>
                      <SelectValue placeholder="Base commit" />
                    </SelectTrigger>
                    <SelectContent>
                      {commits.map((commit) => (
                        <SelectItem key={commit.sha} value={commit.sha}>
                          {commit.sha.slice(0, 7)} - {commit.message.slice(0, 30)}...
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={headSha} onValueChange={setHeadSha}>
                    <SelectTrigger>
                      <SelectValue placeholder="Head commit" />
                    </SelectTrigger>
                    <SelectContent>
                      {commits.map((commit) => (
                        <SelectItem key={commit.sha} value={commit.sha}>
                          {commit.sha.slice(0, 7)} - {commit.message.slice(0, 30)}...
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button onClick={handleCompareCommits} className="w-full" disabled={!baseSha || !headSha}>
                    Compare
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search commits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Commits List */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <GitCommit className="h-5 w-5" />
                  Commits ({filteredCommits.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {filteredCommits.map((commit) => (
                      <div
                        key={commit.sha}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedCommit?.sha === commit.sha ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => loadCommitDetails(commit)}
                      >
                        <div className="font-mono text-sm text-primary">{commit.sha.slice(0, 7)}</div>
                        <div className="text-sm font-medium">{commit.message}</div>
                        <div className="text-xs text-muted-foreground">{new Date(commit.date).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Files in Selected Commit */}
          <div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {selectedCommit ? `Files in ${selectedCommit.sha.slice(0, 7)}` : 'Select a commit'}
                  {compareFiles.length > 0 && ' (Comparison)'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-1">
                    {(compareFiles.length > 0 ? compareFiles : commitFiles).map((file) => (
                      <div
                        key={file.filename}
                        className={`p-2 rounded cursor-pointer transition-colors flex items-center justify-between ${
                          selectedFile === file.filename ? 'bg-primary/10' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => loadFileContent(file.filename)}
                      >
                        <span className="text-sm font-mono truncate">{file.filename}</span>
                        <Badge className={getStatusColor(file.status)} variant="secondary">
                          {file.status}
                        </Badge>
                      </div>
                    ))}
                    
                    {commitFiles.length === 0 && compareFiles.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        {selectedCommit ? 'No files in this commit' : 'Select a commit to view files'}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* File Content Viewer */}
          <div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  {selectedFile ? `Content: ${selectedFile}` : 'Select a file'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {fileContent ? (
                    <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                      {fileContent}
                    </pre>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {selectedFile ? 'Loading file content...' : 'Select a file to view its content'}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default GitManagement;

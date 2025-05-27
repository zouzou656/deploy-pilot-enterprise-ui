import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { GitBranch, RefreshCw, Search, GitCommit, GitCompare, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useProject } from '@/contexts/ProjectContext';
import { projectService } from '@/services/projectService';
import { gitService } from '@/services/gitService';
import { CommitDto, FileChangeDto } from '@/types/git';
import CommitList from '@/components/git/CommitList';
import FileChangesList from '@/components/git/FileChangesList';
import DiffViewer from '@/components/git/DiffViewer';
import useAuthStore from '@/stores/authStore';

const GitManagement = () => {
  const [branches, setBranches] = useState<string[]>([]);
  const [currentBranch, setCurrentBranch] = useState<string>('main');
  const [commits, setCommits] = useState<CommitDto[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCommit, setSelectedCommit] = useState<CommitDto | null>(null);
  const [commitDetails, setCommitDetails] = useState<FileChangeDto[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [baseCommit, setBaseCommit] = useState<string>('');
  const [headCommit, setHeadCommit] = useState<string>('');
  const [compareResults, setCompareResults] = useState<FileChangeDto[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileChangeDto | null>(null);

  const { selectedProject, refreshProject } = useProject();
  const { toast } = useToast();
  const { user } = useAuthStore();

  useEffect(() => {
    if (selectedProject) {
      fetchBranches();
      fetchCommits();
    }
  }, [selectedProject, currentBranch]);

  const fetchBranches = async () => {
    if (!selectedProject) return;
    setIsFetching(true);
    try {
      const data = await gitService.getBranches(selectedProject.id);
      setBranches(data);
    } catch (error: any) {
      toast({
        title: 'Error fetching branches',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsFetching(false);
    }
  };

  const fetchCommits = async () => {
    if (!selectedProject) return;
    setIsFetching(true);
    try {
      const data = await gitService.getCommits({
        projectId: selectedProject.id,
        branch: currentBranch,
      });
      setCommits(data);
    } catch (error: any) {
      toast({
        title: 'Error fetching commits',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleBranchChange = (branch: string) => {
    setCurrentBranch(branch);
    fetchCommits();
  };

  const handleCommitSelect = async (commit: CommitDto) => {
    setSelectedCommit(commit);
    if (!selectedProject) return;
    setIsFetching(true);
    try {
      const data = await gitService.getCommitDetails(selectedProject.id, commit.sha);
      setCommitDetails(data.files);
    } catch (error: any) {
      toast({
        title: 'Error fetching commit details',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleCompare = async () => {
    if (!selectedProject || !baseCommit || !headCommit) {
      toast({
        title: 'Missing Information',
        description: 'Please select a project and provide both base and head commit SHAs.',
        variant: 'destructive',
      });
      return;
    }

    setIsComparing(true);
    try {
      const data = await gitService.compareCommits(selectedProject.id, baseCommit, headCommit);
      setCompareResults(data.files);
    } catch (error: any) {
      toast({
        title: 'Error comparing commits',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsComparing(false);
    }
  };

  const handleRefresh = async () => {
    if (!selectedProject) return;
    setIsFetching(true);
    try {
      await projectService.updateProject(selectedProject.id, {
        gitRepoUrl: selectedProject.gitRepoUrl,
      });
      await refreshProject();
      toast({
        title: 'Project Refreshed',
        description: 'Project has been successfully refreshed.',
      });
    } catch (error: any) {
      toast({
        title: 'Error refreshing project',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsFetching(false);
    }
  };

  const filteredCommits = commits.filter((commit) =>
    commit.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!selectedProject) {
    return (
      <div className="container py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">No Project Selected</h2>
            <p className="text-muted-foreground">Please select a project to view Git Management features.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Git Management</h1>
          <p className="text-muted-foreground">
            Manage and explore Git repository for {selectedProject.name}
          </p>
        </div>
        <Badge variant="secondary">{selectedProject.name}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Repository Actions</CardTitle>
          <CardDescription>Perform common Git repository tasks.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isFetching}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Project
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Branch Selection */}
        <Card className="col-span-1 md:col-span-1">
          <CardHeader>
            <CardTitle>Select Branch</CardTitle>
            <CardDescription>Choose a branch to view commits.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <GitBranch className="h-4 w-4" />
              <select
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={currentBranch}
                onChange={(e) => handleBranchChange(e.target.value)}
                disabled={isFetching}
              >
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Commit Comparison */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Compare Commits</CardTitle>
            <CardDescription>Compare changes between two commit SHAs.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                type="text"
                placeholder="Base Commit SHA"
                value={baseCommit}
                onChange={(e) => setBaseCommit(e.target.value)}
                disabled={isComparing}
              />
            </div>
            <div>
              <Input
                type="text"
                placeholder="Head Commit SHA"
                value={headCommit}
                onChange={(e) => setHeadCommit(e.target.value)}
                disabled={isComparing}
              />
            </div>
            <Button onClick={handleCompare} disabled={isComparing}>
              {isComparing ? 'Comparing...' : 'Compare'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commit List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Commit History</CardTitle>
            <CardDescription>View the commit history for the selected branch.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search commits..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isFetching}
              />
            </div>
            <Separator />
            <ScrollArea className="h-[300px]">
              <CommitList
                commits={filteredCommits}
                onCommitSelect={handleCommitSelect}
                isLoading={isFetching}
              />
            </ScrollArea>
          </CardContent>
        </Card>

        {/* File Changes List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>File Changes</CardTitle>
            <CardDescription>
              {isComparing
                ? 'Changes between the selected commits.'
                : 'Files changed in the selected commit.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <FileChangesList
                files={isComparing ? compareResults : commitDetails}
                onFileSelect={setSelectedFile}
                isLoading={isFetching}
              />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Diff Viewer */}
      {selectedFile && (
        <Card>
          <CardHeader>
            <CardTitle>Diff Viewer</CardTitle>
            <CardDescription>View the diff for the selected file.</CardDescription>
          </CardHeader>
          <CardContent>
            <DiffViewer file={selectedFile} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GitManagement;

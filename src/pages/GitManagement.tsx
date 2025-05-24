
import React, { useEffect, useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { gitService } from '@/services/gitService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { CommitDto } from '@/types/git';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { GitBranch, GitCommit, Loader2, RefreshCcw, Search, GitCompare, Copy, ExternalLink } from 'lucide-react';
import PageHeader from '@/components/ui-custom/PageHeader';

const GitManagement = () => {
  const { selectedProject } = useProject();
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [commits, setCommits] = useState<CommitDto[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCommits, setSelectedCommits] = useState<string[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState<boolean>(false);
  const [isLoadingCommits, setIsLoadingCommits] = useState<boolean>(false);
  const { toast } = useToast();

  // Load branches when selected project changes
  useEffect(() => {
    if (selectedProject?.id) {
      loadBranches();
    } else {
      setBranches([]);
      setCommits([]);
      setSelectedBranch("");
    }
  }, [selectedProject]);

  // Load commits when selected branch changes
  useEffect(() => {
    if (selectedProject?.id && selectedBranch) {
      loadCommits();
    } else {
      setCommits([]);
    }
  }, [selectedBranch]);

  const loadBranches = async () => {
    if (!selectedProject?.id) return;

    setIsLoadingBranches(true);
    try {
      const data = await gitService.getBranches(selectedProject.id);
      setBranches(data);
      
      // Select main or master branch by default
      const defaultBranch = data.find(b => b === 'main' || b === 'master') || data[0];
      if (defaultBranch) {
        setSelectedBranch(defaultBranch);
      }
    } catch (error) {
      toast({
        title: 'Error loading branches',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      console.error('Error loading branches:', error);
    } finally {
      setIsLoadingBranches(false);
    }
  };

  const loadCommits = async () => {
    if (!selectedProject?.id || !selectedBranch) return;

    setIsLoadingCommits(true);
    try {
      const data = await gitService.getCommits({
        projectId: selectedProject.id,
        branch: selectedBranch
      });
      setCommits(data);
    } catch (error) {
      toast({
        title: 'Error loading commits',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      console.error('Error loading commits:', error);
    } finally {
      setIsLoadingCommits(false);
    }
  };

  const handleRefreshBranches = () => {
    loadBranches();
  };

  const handleRefreshCommits = () => {
    loadCommits();
  };

  const handleCommitToggle = (sha: string) => {
    setSelectedCommits(prev => 
      prev.includes(sha) 
        ? prev.filter(s => s !== sha)
        : [...prev, sha]
    );
  };

  const handleSelectAllCommits = () => {
    setSelectedCommits(filteredCommits.map(c => c.sha));
  };

  const handleDeselectAllCommits = () => {
    setSelectedCommits([]);
  };

  const handleCompareCommits = async () => {
    if (selectedCommits.length !== 2) {
      toast({
        title: 'Invalid selection',
        description: 'Please select exactly 2 commits to compare.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const [baseSha, headSha] = selectedCommits.sort();
      const comparison = await gitService.compareCommits({
        projectId: selectedProject!.id,
        baseSha,
        headSha
      });
      
      toast({
        title: 'Comparison ready',
        description: `Found ${comparison.files?.length || 0} changed files between commits.`,
      });
    } catch (error) {
      toast({
        title: 'Error comparing commits',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  const copyCommitHash = (sha: string) => {
    navigator.clipboard.writeText(sha);
    toast({
      title: 'Copied',
      description: 'Commit hash copied to clipboard.',
    });
  };

  const openInGitRepo = () => {
    if (selectedProject?.gitRepoUrl) {
      window.open(selectedProject.gitRepoUrl, '_blank');
    }
  };

  // Filter commits based on search term
  const filteredCommits = commits.filter(commit =>
    commit.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    commit.sha.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!selectedProject) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader
          title="Git Management"
          description="View and manage Git repository information"
        />
        <Card className="text-center py-10">
          <CardContent>
            <GitBranch className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Please select a project from the dropdown above to view Git information.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Git Management"
        description="View and manage Git repository information"
      />

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Repository: {selectedProject.name}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={openInGitRepo}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in Git
              </Button>
            </div>
            <p className="text-sm text-muted-foreground font-mono">{selectedProject.gitRepoUrl}</p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="commits">
              <TabsList className="mb-4">
                <TabsTrigger value="branches">
                  <GitBranch className="mr-2 h-4 w-4" />
                  Branches ({branches.length})
                </TabsTrigger>
                <TabsTrigger value="commits">
                  <GitCommit className="mr-2 h-4 w-4" />
                  Commits ({filteredCommits.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="branches" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search branches..."
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefreshBranches}
                    disabled={isLoadingBranches}
                  >
                    {isLoadingBranches && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                {isLoadingBranches ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : branches.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Branch Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {branches.map((branch) => (
                        <TableRow key={branch}>
                          <TableCell className="font-mono">{branch}</TableCell>
                          <TableCell>
                            {branch === selectedBranch && (
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                Selected
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedBranch(branch)}
                              >
                                <GitCommit className="h-4 w-4 mr-1" />
                                View Commits
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No branches found
                  </div>
                )}
              </TabsContent>

              <TabsContent value="commits" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-4">
                    <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map(branch => (
                          <SelectItem key={branch} value={branch}>
                            {branch}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search commits..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {selectedCommits.length > 0 && (
                      <>
                        <span className="text-sm text-muted-foreground">
                          {selectedCommits.length} selected
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCompareCommits}
                          disabled={selectedCommits.length !== 2}
                        >
                          <GitCompare className="h-4 w-4 mr-2" />
                          Compare
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDeselectAllCommits}
                        >
                          Deselect All
                        </Button>
                      </>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAllCommits}
                      disabled={filteredCommits.length === 0}
                    >
                      Select All
                    </Button>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRefreshCommits}
                      disabled={isLoadingCommits}
                    >
                      {isLoadingCommits && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <RefreshCcw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>

                {isLoadingCommits ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : selectedBranch ? (
                  filteredCommits.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">Select</TableHead>
                          <TableHead>SHA</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCommits.map((commit) => (
                          <TableRow 
                            key={commit.sha}
                            className={selectedCommits.includes(commit.sha) ? 'bg-muted/50' : ''}
                          >
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedCommits.includes(commit.sha)}
                                onChange={() => handleCommitToggle(commit.sha)}
                                className="rounded"
                              />
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {commit.sha.substring(0, 7)}
                            </TableCell>
                            <TableCell className="max-w-md truncate">
                              {commit.message}
                            </TableCell>
                            <TableCell>
                              {new Date(commit.date).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyCommitHash(commit.sha)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No commits found matching your search.' : 'No commits found'}
                    </div>
                  )
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Select a branch to view commits
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GitManagement;

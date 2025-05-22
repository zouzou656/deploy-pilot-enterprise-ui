
import React, { useEffect, useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { gitService } from '@/services/gitService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CommitDto } from '@/types/git';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { GitBranch, GitCommit, Loader2 } from 'lucide-react';
import PageHeader from '@/components/ui-custom/PageHeader';

const GitManagement = () => {
  const { selectedProject } = useProject();
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [commits, setCommits] = useState<CommitDto[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState<boolean>(false);
  const [isLoadingCommits, setIsLoadingCommits] = useState<boolean>(false);
  const { toast } = useToast();

  // Load branches when selected project changes
  useEffect(() => {
    if (selectedProject?.id) {
      loadBranches();
    }
  }, [selectedProject]);

  // Load commits when selected branch changes
  useEffect(() => {
    if (selectedProject?.id && selectedBranch) {
      loadCommits();
    }
  }, [selectedBranch]);

  const loadBranches = async () => {
    if (!selectedProject?.id) return;

    setIsLoadingBranches(true);
    try {
      const data = await gitService.getBranches(selectedProject.id);
      setBranches(data);
      
      // Select first branch if available
      if (data.length > 0 && !selectedBranch) {
        setSelectedBranch(data[0]);
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

  return (
    <>
      <PageHeader
        title="Git Management"
        description="View and manage Git repository information"
      />

      {!selectedProject ? (
        <div className="flex justify-center items-center h-64">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <p>Please select a project to view Git information.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Repository: {selectedProject.gitRepoUrl}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="branches">
                <TabsList>
                  <TabsTrigger value="branches">
                    <GitBranch className="mr-2 h-4 w-4" />
                    Branches
                  </TabsTrigger>
                  <TabsTrigger value="commits">
                    <GitCommit className="mr-2 h-4 w-4" />
                    Commits
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="branches" className="space-y-4 mt-4">
                  <div className="flex justify-end mb-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRefreshBranches}
                      disabled={isLoadingBranches}
                    >
                      {isLoadingBranches && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Refresh Branches
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
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {branches.map((branch) => (
                          <TableRow key={branch}>
                            <TableCell>{branch}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedBranch(branch)}
                              >
                                View Commits
                              </Button>
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

                <TabsContent value="commits" className="space-y-4 mt-4">
                  <div className="flex justify-between items-center mb-4">
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

                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRefreshCommits}
                      disabled={isLoadingCommits}
                    >
                      {isLoadingCommits && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Refresh Commits
                    </Button>
                  </div>

                  {isLoadingCommits ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : selectedBranch ? (
                    commits.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>SHA</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {commits.map((commit) => (
                            <TableRow key={commit.sha}>
                              <TableCell className="font-mono text-xs">
                                {commit.sha.substring(0, 7)}
                              </TableCell>
                              <TableCell>{commit.message}</TableCell>
                              <TableCell>{new Date(commit.date).toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No commits found
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
      )}
    </>
  );
};

export default GitManagement;

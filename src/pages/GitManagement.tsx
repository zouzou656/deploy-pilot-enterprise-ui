
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { gitService } from '@/services/gitService';
import { Search, ChevronDown, ChevronRight, Folder, FolderOpen } from 'lucide-react';

import PageHeader from '@/components/ui-custom/PageHeader';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const GitManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'commits' | 'branches' | 'files'>('commits');
  const [commitSearch, setCommitSearch] = useState('');
  const [branchSearch, setBranchSearch] = useState('');
  const [fileSearch, setFileSearch] = useState('');
  
  const [commitsOpen, setCommitsOpen] = useState(true);
  const [branchesOpen, setBranchesOpen] = useState(false);
  const [filesOpen, setFilesOpen] = useState(false);

  // Mock data - replace with actual queries
  const commits = [
    { sha: 'abc123', message: 'Fix authentication bug', author: 'John Doe', date: '2024-01-15' },
    { sha: 'def456', message: 'Add new feature', author: 'Jane Smith', date: '2024-01-14' },
  ];

  const branches = [
    { name: 'main', isDefault: true, lastCommit: '2024-01-15' },
    { name: 'feature/new-auth', isDefault: false, lastCommit: '2024-01-14' },
    { name: 'hotfix/security-patch', isDefault: false, lastCommit: '2024-01-13' },
  ];

  const files = [
    { path: 'src/components/Auth.tsx', status: 'modified', size: '2.1KB' },
    { path: 'src/services/api.ts', status: 'added', size: '1.5KB' },
    { path: 'package.json', status: 'modified', size: '3.2KB' },
  ];

  const filteredCommits = commits.filter(c => 
    c.message.toLowerCase().includes(commitSearch.toLowerCase()) ||
    c.author.toLowerCase().includes(commitSearch.toLowerCase())
  );

  const filteredBranches = branches.filter(b => 
    b.name.toLowerCase().includes(branchSearch.toLowerCase())
  );

  const filteredFiles = files.filter(f => 
    f.path.toLowerCase().includes(fileSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Git Management" 
        description="Manage repositories, branches, and commits"
      />

      <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="commits">Commits</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>

        <TabsContent value="commits" className="space-y-4">
          <Collapsible open={commitsOpen} onOpenChange={setCommitsOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {commitsOpen ? <FolderOpen className="h-5 w-5" /> : <Folder className="h-5 w-5" />}
                      Recent Commits ({filteredCommits.length})
                    </div>
                    {commitsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search commits..."
                      value={commitSearch}
                      onChange={(e) => setCommitSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {filteredCommits.map((commit) => (
                        <Card key={commit.sha} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">{commit.message}</h4>
                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                  <code className="bg-muted px-1.5 py-0.5 rounded">{commit.sha.substring(0, 7)}</code>
                                  <span>by {commit.author}</span>
                                  <span>on {commit.date}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </TabsContent>

        <TabsContent value="branches" className="space-y-4">
          <Collapsible open={branchesOpen} onOpenChange={setBranchesOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {branchesOpen ? <FolderOpen className="h-5 w-5" /> : <Folder className="h-5 w-5" />}
                      Branches ({filteredBranches.length})
                    </div>
                    {branchesOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search branches..."
                      value={branchSearch}
                      onChange={(e) => setBranchSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredBranches.map((branch) => (
                      <Card key={branch.name} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-medium">{branch.name}</code>
                              {branch.isDefault && (
                                <Badge variant="default" className="text-xs">Default</Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {branch.lastCommit}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <Collapsible open={filesOpen} onOpenChange={setFilesOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {filesOpen ? <FolderOpen className="h-5 w-5" /> : <Folder className="h-5 w-5" />}
                      Changed Files ({filteredFiles.length})
                    </div>
                    {filesOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search files..."
                      value={fileSearch}
                      onChange={(e) => setFileSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="space-y-2">
                    {filteredFiles.map((file) => (
                      <Card key={file.path} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <code className="text-sm truncate">{file.path}</code>
                              <Badge 
                                variant={file.status === 'added' ? 'default' : file.status === 'modified' ? 'secondary' : 'destructive'}
                                className="text-xs"
                              >
                                {file.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {file.size}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GitManagement;

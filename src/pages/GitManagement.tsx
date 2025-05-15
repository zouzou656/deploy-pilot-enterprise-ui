
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui-custom/PageHeader';
import { GitBranch, RefreshCw, GitPullRequest } from 'lucide-react';

const GitManagement = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Git Management" 
        description="Manage your Git repositories and branches"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Repository Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Branch</span>
                <span className="font-mono text-sm bg-muted py-1 px-2 rounded">main</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Commit</span>
                <span className="font-mono text-sm bg-muted py-1 px-2 rounded">a1b2c3d</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Update</span>
                <span className="text-sm">2 hours ago</span>
              </div>
              
              <Button className="w-full mt-4" variant="default">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Status
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitPullRequest className="h-5 w-5" />
              Pull Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Pull latest changes from the remote repository to update your local workspace.
              </p>
              
              <Button className="w-full" variant="default">
                <GitPullRequest className="mr-2 h-4 w-4" />
                Pull Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GitManagement;

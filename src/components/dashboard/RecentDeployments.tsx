
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Deployment } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { GitBranch } from 'lucide-react';

interface RecentDeploymentsProps {
  deployments: Deployment[];
}

const RecentDeployments: React.FC<RecentDeploymentsProps> = ({ deployments }) => {
  // Helper to get status badge type
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      case 'FAILED':
        return <Badge className="bg-destructive text-destructive-foreground">Failed</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-warning text-warning-foreground">In Progress</Badge>;
      case 'PENDING':
        return <Badge variant="outline">Pending</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline" className="bg-muted">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Deployments</CardTitle>
        <Button asChild variant="outline" size="sm">
          <Link to="/logs">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deployments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No deployments found
            </div>
          ) : (
            deployments.map((deployment) => (
              <div 
                key={deployment.id} 
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(deployment.status)}
                    <span className="font-medium">
                      {deployment.environment}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <GitBranch className="h-3.5 w-3.5" />
                    <span className="font-mono text-xs">
                      {deployment.branch}
                    </span>
                    <span className="mx-1">•</span>
                    <span>
                      {deployment.jarFileName || 'No JAR file'}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(deployment.startTime), { addSuffix: true })} by {deployment.triggeredBy}
                  </div>
                </div>
                <Button asChild size="sm" variant="ghost">
                  <Link to={`/logs/${deployment.id}`}>
                    Details
                  </Link>
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentDeployments;

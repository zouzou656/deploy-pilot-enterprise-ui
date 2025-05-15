
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Check, 
  AlertTriangle, 
  X, 
  Clock, 
  Package, 
  Server 
} from 'lucide-react';
import PageHeader from '@/components/ui-custom/PageHeader';

const LogsHistory = () => {
  // Sample log data
  const logs = [
    { 
      id: 'deploy-1', 
      type: 'deploy', 
      status: 'success', 
      date: 'May 15, 2023 - 14:32', 
      target: 'Development Server', 
      user: 'admin', 
      description: 'OSB Integration deployed successfully' 
    },
    { 
      id: 'build-1', 
      type: 'build', 
      status: 'error', 
      date: 'May 15, 2023 - 13:45', 
      target: 'JAR Generation', 
      user: 'developer', 
      description: 'Build failed due to compilation errors' 
    },
    { 
      id: 'git-1', 
      type: 'git', 
      status: 'success', 
      date: 'May 15, 2023 - 11:20', 
      target: 'main branch', 
      user: 'developer', 
      description: 'Successfully pulled latest changes' 
    },
    { 
      id: 'deploy-2', 
      type: 'deploy', 
      status: 'warning', 
      date: 'May 14, 2023 - 16:05', 
      target: 'Testing Server', 
      user: 'admin', 
      description: 'Deployment completed with warnings' 
    },
    { 
      id: 'build-2', 
      type: 'build', 
      status: 'success', 
      date: 'May 14, 2023 - 14:30', 
      target: 'JAR Generation', 
      user: 'developer', 
      description: 'Successfully built JAR file' 
    },
  ];

  // Helper for status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  // Helper for operation icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deploy':
        return <Server className="h-5 w-5" />;
      case 'build':
        return <Package className="h-5 w-5" />;
      case 'git':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3.41L4.41 8H9V3.41z"/><path d="M16 3.41L20.59 8H16V3.41z"/><path d="M9 20.59L4.41 16H9V20.59z"/><path d="M16 20.59L20.59 16H16V20.59z"/><path d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M22 12h-4"/><path d="M6 12H2"/></svg>;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Logs & History" 
        description="View application deployment and build logs"
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-4 border rounded hover:bg-muted/40">
                <div className="h-8 w-8 flex items-center justify-center rounded-full bg-muted">
                  {getStatusIcon(log.status)}
                </div>
                
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <h4 className="font-medium flex items-center gap-2">
                      {getTypeIcon(log.type)}
                      {log.description}
                    </h4>
                    <span className="text-xs text-muted-foreground">{log.date}</span>
                  </div>
                  
                  <div className="flex gap-4 mt-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Target:</span> {log.target}
                    </div>
                    <div>
                      <span className="text-muted-foreground">User:</span> {log.user}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogsHistory;

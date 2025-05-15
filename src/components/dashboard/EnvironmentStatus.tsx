
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Environment } from '@/types';

interface EnvironmentStatusProps {
  environments: Environment[];
}

const EnvironmentStatus: React.FC<EnvironmentStatusProps> = ({ environments }) => {
  // For demo purposes, let's simulate some environments having issues
  const getRandomStatus = (env: Environment) => {
    if (env.name === 'PROD') return 'healthy'; // Prod always healthy for demo
    
    const statuses = ['healthy', 'warning', 'error'];
    const weights = [0.8, 0.15, 0.05]; // 80% healthy, 15% warning, 5% error
    
    const random = Math.random();
    let threshold = 0;
    
    for (let i = 0; i < statuses.length; i++) {
      threshold += weights[i];
      if (random <= threshold) {
        return statuses[i];
      }
    }
    
    return 'healthy';
  };
  
  // Assign a status to each environment
  const envWithStatus = environments.map(env => ({
    ...env,
    status: getRandomStatus(env),
    uptime: `${Math.floor(Math.random() * 30) + 1}d ${Math.floor(Math.random() * 24)}h`,
    lastDeployment: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString()
  }));
  
  const getStatusDot = (status: string) => {
    switch (status) {
      case 'healthy':
        return <div className="status-dot active"></div>;
      case 'warning':
        return <div className="status-dot pending"></div>;
      case 'error':
        return <div className="status-dot inactive"></div>;
      default:
        return <div className="status-dot"></div>;
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
        return <span className="text-success">Healthy</span>;
      case 'warning':
        return <span className="text-warning">Warning</span>;
      case 'error':
        return <span className="text-destructive">Error</span>;
      default:
        return <span>Unknown</span>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Environment Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {envWithStatus.map((env) => (
            <div key={env.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-4">
                {getStatusDot(env.status)}
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {env.name}
                    {env.isProduction && (
                      <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                        PROD
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {env.baseUrl}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="font-medium">
                  {getStatusText(env.status)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Uptime: {env.uptime}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnvironmentStatus;

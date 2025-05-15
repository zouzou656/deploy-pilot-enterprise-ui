
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import ActionCards from '@/components/dashboard/ActionCards';
import DeploymentStats from '@/components/dashboard/DeploymentStats';
import RecentDeployments from '@/components/dashboard/RecentDeployments';
import EnvironmentStatus from '@/components/dashboard/EnvironmentStatus';
import { DeploymentStats as DeploymentStatsType } from '@/types';
import useDeploymentStore from '@/stores/deploymentStore';
import useSettingsStore from '@/stores/settingsStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Plus } from 'lucide-react';

const Dashboard = () => {
  // Fetch data from stores
  const { deployments, fetchDeployments } = useDeploymentStore();
  const { projectSettings, fetchProjectSettings } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // Mock stats
  const [stats, setStats] = useState<DeploymentStatsType>({
    total: 0,
    successful: 0,
    failed: 0,
    avgDuration: 0,
    byEnvironment: {}
  });

  const calculateStats = (deployments: typeof useDeploymentStore.getState().deployments) => {
    if (!deployments.length) return stats;
    
    const successful = deployments.filter(d => d.status === 'COMPLETED').length;
    const failed = deployments.filter(d => d.status === 'FAILED').length;
    
    // Calculate average duration for completed deployments
    const completedDeployments = deployments.filter(d => d.status === 'COMPLETED' && d.endTime);
    const totalDuration = completedDeployments.reduce((total, d) => {
      if (!d.endTime) return total;
      const start = new Date(d.startTime).getTime();
      const end = new Date(d.endTime).getTime();
      return total + (end - start) / 1000; // convert to seconds
    }, 0);
    const avgDuration = completedDeployments.length ? Math.round(totalDuration / completedDeployments.length) : 0;
    
    // Count by environment
    const byEnvironment = deployments.reduce((acc, d) => {
      acc[d.environment] = (acc[d.environment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: deployments.length,
      successful,
      failed,
      avgDuration,
      byEnvironment
    };
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchDeployments(),
        fetchProjectSettings()
      ]);
      setIsLoading(false);
      setLastRefresh(new Date());
    };
    
    loadData();
  }, [fetchDeployments, fetchProjectSettings]);
  
  // Update stats when deployments change
  useEffect(() => {
    setStats(calculateStats(deployments));
  }, [deployments]);

  const handleRefresh = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchDeployments(),
      fetchProjectSettings()
    ]);
    setIsLoading(false);
    setLastRefresh(new Date());
  };

  return (
    <>
      <Helmet>
        <title>Dashboard | OSB CI/CD Platform</title>
      </Helmet>
      
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your OSB CI/CD deployments and environments.
            </p>
          </div>
          <div className="flex items-center gap-2 self-end">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Deployment
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid place-items-center py-16">
            <div className="animate-pulse text-center">
              <div className="h-12 w-12 mx-auto rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              <p className="mt-4 text-lg">Loading dashboard data...</p>
            </div>
          </div>
        ) : (
          <>
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>{projectSettings?.name || 'OSB Integration Platform'}</CardTitle>
                <CardDescription>
                  {projectSettings?.description || 'Enterprise Oracle Service Bus CI/CD platform'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ActionCards />
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground border-t pt-4">
                Last refreshed {lastRefresh.toLocaleTimeString()}
              </CardFooter>
            </Card>
            
            <DeploymentStats stats={stats} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentDeployments deployments={deployments.slice(0, 5)} />
              {projectSettings?.environments ? (
                <EnvironmentStatus environments={projectSettings.environments} />
              ) : (
                <div className="grid place-items-center py-16">
                  <p className="text-muted-foreground">No environments configured</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;

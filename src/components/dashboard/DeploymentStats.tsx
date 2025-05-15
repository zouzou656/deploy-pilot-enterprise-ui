
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { DeploymentStats as DeploymentStatsType } from '@/types';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DeploymentStatsProps {
  stats: DeploymentStatsType;
}

const DeploymentStats: React.FC<DeploymentStatsProps> = ({ stats }) => {
  // Prepare environment data for bar chart
  const envLabels = Object.keys(stats.byEnvironment);
  const envData = Object.values(stats.byEnvironment);
  
  // Bar chart data
  const barData = {
    labels: envLabels,
    datasets: [
      {
        label: 'Deployments',
        data: envData,
        backgroundColor: 'rgba(37, 99, 235, 0.7)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  // Doughnut chart data
  const doughnutData = {
    labels: ['Successful', 'Failed'],
    datasets: [
      {
        data: [stats.successful, stats.failed],
        backgroundColor: [
          'rgba(34, 197, 94, 0.6)', // success
          'rgba(239, 68, 68, 0.6)', // error
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Chart options
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
  };
  
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
    cutout: '70%',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Deployments by Environment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Bar data={barData} options={barOptions} />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Deployment Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Deployment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/30 rounded-md p-4">
              <div className="text-sm font-medium text-muted-foreground mb-1">Total Deployments</div>
              <div className="text-3xl font-bold">{stats.total}</div>
            </div>
            <div className="bg-muted/30 rounded-md p-4">
              <div className="text-sm font-medium text-muted-foreground mb-1">Success Rate</div>
              <div className="text-3xl font-bold">
                {Math.round((stats.successful / stats.total) * 100)}%
              </div>
            </div>
            <div className="bg-muted/30 rounded-md p-4">
              <div className="text-sm font-medium text-muted-foreground mb-1">Average Duration</div>
              <div className="text-3xl font-bold">
                {stats.avgDuration < 60 
                  ? `${stats.avgDuration}s` 
                  : `${Math.floor(stats.avgDuration / 60)}m ${stats.avgDuration % 60}s`}
              </div>
            </div>
            <div className="bg-muted/30 rounded-md p-4">
              <div className="text-sm font-medium text-muted-foreground mb-1">Environments</div>
              <div className="text-3xl font-bold">{envLabels.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeploymentStats;

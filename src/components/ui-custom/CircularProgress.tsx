
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle, Clock, Loader2 } from 'lucide-react';

interface CircularProgressProps {
  progress: number;
  status: string;
  currentStep?: string;
  steps?: string[];
  size?: number;
  strokeWidth?: number;
}

export default function CircularProgress({
  progress,
  status,
  currentStep,
  steps = [],
  size = 120,
  strokeWidth = 8
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getStatusIcon = () => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-8 w-8 text-red-500" />;
      case 'RUNNING':
        return <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-8 w-8 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'SUCCESS':
        return 'stroke-green-500';
      case 'FAILED':
        return 'stroke-red-500';
      case 'RUNNING':
        return 'stroke-blue-500';
      default:
        return 'stroke-gray-400';
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'QUEUED':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">Queued</Badge>;
      case 'RUNNING':
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">Running</Badge>;
      case 'SUCCESS':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Success</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">Failed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-center gap-6">
      {/* Circular Progress */}
      <div className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-500 ease-in-out ${getStatusColor()}`}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {getStatusIcon()}
          <span className="text-2xl font-bold mt-1">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Status Info */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Status</h3>
          {getStatusBadge()}
        </div>
        
        {currentStep && (
          <div>
            <p className="text-sm text-muted-foreground">Current Step</p>
            <p className="font-medium">{currentStep}</p>
          </div>
        )}

        {steps.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Progress Steps</p>
            <div className="space-y-1">
              {steps.map((step, index) => {
                const stepProgress = ((index + 1) / steps.length) * 100;
                const isCompleted = progress >= stepProgress;
                const isCurrent = currentStep === step;
                
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-2 p-2 rounded text-sm ${
                      isCurrent 
                        ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800' 
                        : isCompleted 
                        ? 'bg-green-50 dark:bg-green-900/20' 
                        : 'bg-gray-50 dark:bg-gray-900/20'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-400" />
                    )}
                    <span className={isCompleted ? 'text-green-700 dark:text-green-300' : ''}">
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

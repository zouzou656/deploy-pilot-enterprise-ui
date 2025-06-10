
import React from 'react';
import { Package, GitBranch, Code, Eye, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PipelineStep = 'config' | 'files' | 'preview' | 'summary';

type StepInfo = {
  id: PipelineStep;
  label: string;
  icon: React.ReactNode;
  description: string;
};

type PipelineNavProps = {
  currentStep: PipelineStep;
  onStepChange: (step: PipelineStep) => void;
  previewDisabled?: boolean;
};

const PipelineNav: React.FC<PipelineNavProps> = ({ 
  currentStep, 
  onStepChange,
  previewDisabled = false
}) => {
  const steps: StepInfo[] = [
    { 
      id: 'config', 
      label: 'Configuration', 
      icon: <GitBranch className="h-6 w-6" />,
      description: 'Set up project and build options'
    },
    { 
      id: 'files', 
      label: 'File Selection', 
      icon: <Code className="h-6 w-6" />,
      description: 'Choose files to include'
    },
    { 
      id: 'preview', 
      label: 'Preview', 
      icon: <Eye className="h-6 w-6" />,
      description: 'Review changes and overrides'
    },
    { 
      id: 'summary', 
      label: 'Generate', 
      icon: <CheckCircle className="h-6 w-6" />,
      description: 'Create your JAR file'
    }
  ];

  const currentIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between relative">
          {/* Progress Line Background */}
          <div className="absolute top-12 left-16 right-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          
          {/* Progress Line Active */}
          <div 
            className="absolute top-12 left-16 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `calc(${(currentIndex / (steps.length - 1)) * 100}% - 2rem)`
            }}
          ></div>

          {steps.map((step, index) => {
            const isComplete = index < currentIndex;
            const isActive = index === currentIndex;
            const isDisabled = step.id === 'preview' && previewDisabled;

            return (
              <div key={step.id} className="flex flex-col items-center relative z-10">
                <button
                  onClick={() => !isDisabled && onStepChange(step.id)}
                  disabled={isDisabled}
                  className={cn(
                    "flex items-center justify-center rounded-full w-24 h-24 mb-4 transition-all duration-300 transform hover:scale-105",
                    "border-4 shadow-lg",
                    isActive && "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-white scale-110 shadow-xl",
                    isComplete && "bg-green-500 text-white border-green-200",
                    !isActive && !isComplete && "bg-white dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-600",
                    isDisabled && "opacity-50 cursor-not-allowed transform-none"
                  )}
                >
                  {step.icon}
                </button>
                
                <div className="text-center max-w-32">
                  <h3 className={cn(
                    "font-semibold text-sm mb-1",
                    isActive && "text-blue-600 dark:text-blue-400",
                    isComplete && "text-green-600 dark:text-green-400",
                    !isActive && !isComplete && "text-gray-500"
                  )}>
                    {step.label}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isComplete = index < currentIndex;
            const isActive = index === currentIndex;
            const isDisabled = step.id === 'preview' && previewDisabled;

            return (
              <div key={step.id} className="flex items-center space-x-4">
                <button
                  onClick={() => !isDisabled && onStepChange(step.id)}
                  disabled={isDisabled}
                  className={cn(
                    "flex items-center justify-center rounded-full w-12 h-12 transition-all",
                    "border-2",
                    isActive && "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-white",
                    isComplete && "bg-green-500 text-white border-green-200",
                    !isActive && !isComplete && "bg-white dark:bg-gray-800 text-gray-400 border-gray-200",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {step.icon}
                </button>
                
                <div className="flex-1">
                  <h3 className={cn(
                    "font-semibold",
                    isActive && "text-blue-600",
                    isComplete && "text-green-600",
                    !isActive && !isComplete && "text-gray-500"
                  )}>
                    {step.label}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PipelineNav;

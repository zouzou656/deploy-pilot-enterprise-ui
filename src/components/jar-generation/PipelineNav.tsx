
import React from 'react';
import { Package, GitBranch, Code, Eye, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PipelineStep = 'config' | 'files' | 'preview' | 'summary';

type StepInfo = {
  id: PipelineStep;
  label: string;
  icon: React.ReactNode;
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
    { id: 'config', label: 'Configuration', icon: <GitBranch className="h-5 w-5" /> },
    { id: 'files', label: 'File Selection', icon: <Code className="h-5 w-5" /> },
    { id: 'preview', label: 'Preview', icon: <Eye className="h-5 w-5" /> },
    { id: 'summary', label: 'Summary', icon: <CheckCircle className="h-5 w-5" /> }
  ];

  // Find the index of the current step
  const currentIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          // Calculate if this step is completed, active, or upcoming
          const isComplete = index < currentIndex;
          const isActive = index === currentIndex;
          const isDisabled = step.id === 'preview' && previewDisabled;

          // Create the connector line between steps
          const showConnector = index < steps.length - 1;
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <button
                  onClick={() => !isDisabled && onStepChange(step.id)}
                  disabled={isDisabled}
                  className={cn(
                    "flex items-center justify-center rounded-full w-12 h-12 mb-2 transition-all",
                    isActive && "bg-primary text-white scale-110 shadow-md",
                    isComplete && "bg-green-500 text-white",
                    !isActive && !isComplete && "bg-muted text-muted-foreground",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {step.icon}
                </button>
                <span className={cn(
                  "text-xs font-medium",
                  isActive && "text-primary font-semibold",
                  isComplete && "text-green-500",
                  !isActive && !isComplete && "text-muted-foreground"
                )}>
                  {step.label}
                </span>
              </div>
              
              {showConnector && (
                <div 
                  className={cn(
                    "flex-1 h-0.5 mx-2", 
                    index < currentIndex ? "bg-green-500" : "bg-muted"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineNav;

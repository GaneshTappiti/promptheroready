import React from "react";
import { Check, Circle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepperStep {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  status: 'pending' | 'current' | 'completed' | 'error';
}

interface StepperProps {
  steps: StepperStep[];
  currentStep: string;
  onStepClick?: (stepId: string) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  showConnectors?: boolean;
}

const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  orientation = 'horizontal',
  className,
  showConnectors = true
}) => {
  const getStepIndex = (stepId: string) => steps.findIndex(step => step.id === stepId);
  const currentIndex = getStepIndex(currentStep);

  const getStepStatus = (step: StepperStep, index: number): StepperStep['status'] => {
    if (step.status === 'error') return 'error';
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'pending';
  };

  const getStepIcon = (step: StepperStep, index: number) => {
    const status = getStepStatus(step, index);
    
    if (step.icon && (status === 'pending' || status === 'current')) {
      return step.icon;
    }
    
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4" />;
      case 'error':
        return <Circle className="h-4 w-4" />;
      case 'current':
        return step.icon || <Circle className="h-4 w-4 fill-current" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const getStepColors = (step: StepperStep, index: number) => {
    const status = getStepStatus(step, index);
    
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-green-600',
          text: 'text-white',
          border: 'border-green-600',
          description: 'text-green-400'
        };
      case 'current':
        return {
          bg: 'bg-blue-600',
          text: 'text-white',
          border: 'border-blue-600',
          description: 'text-blue-400'
        };
      case 'error':
        return {
          bg: 'bg-red-600',
          text: 'text-white',
          border: 'border-red-600',
          description: 'text-red-400'
        };
      default:
        return {
          bg: 'bg-gray-700',
          text: 'text-gray-400',
          border: 'border-gray-600',
          description: 'text-gray-500'
        };
    }
  };

  const getConnectorColors = (fromIndex: number, toIndex: number) => {
    const fromStatus = getStepStatus(steps[fromIndex], fromIndex);
    const toStatus = getStepStatus(steps[toIndex], toIndex);
    
    if (fromStatus === 'completed' && (toStatus === 'completed' || toStatus === 'current')) {
      return 'bg-green-600';
    }
    if (fromStatus === 'completed' || fromStatus === 'current') {
      return 'bg-blue-600';
    }
    return 'bg-gray-600';
  };

  if (orientation === 'vertical') {
    return (
      <div className={cn("space-y-4", className)}>
        {steps.map((step, index) => {
          const colors = getStepColors(step, index);
          const isClickable = onStepClick && (getStepStatus(step, index) === 'completed' || getStepStatus(step, index) === 'current');
          
          return (
            <div key={step.id} className="relative">
              <div
                className={cn(
                  "flex items-start gap-4",
                  isClickable && "cursor-pointer hover:opacity-80 transition-opacity"
                )}
                onClick={() => isClickable && onStepClick(step.id)}
              >
                {/* Step Icon */}
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                  colors.bg,
                  colors.border
                )}>
                  <div className={colors.text}>
                    {getStepIcon(step, index)}
                  </div>
                </div>
                
                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    "font-medium transition-colors",
                    getStepStatus(step, index) === 'current' ? 'text-white' : 'text-gray-300'
                  )}>
                    {step.title}
                  </h3>
                  {step.description && (
                    <p className={cn("text-sm mt-1", colors.description)}>
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Vertical Connector */}
              {showConnectors && index < steps.length - 1 && (
                <div className="absolute left-5 top-10 w-0.5 h-6 -translate-x-0.5">
                  <div className={cn(
                    "w-full h-full transition-colors",
                    getConnectorColors(index, index + 1)
                  )} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal orientation
  return (
    <div className={cn("flex items-center", className)}>
      {steps.map((step, index) => {
        const colors = getStepColors(step, index);
        const isClickable = onStepClick && (getStepStatus(step, index) === 'completed' || getStepStatus(step, index) === 'current');
        
        return (
          <React.Fragment key={step.id}>
            <div
              className={cn(
                "flex flex-col items-center text-center",
                isClickable && "cursor-pointer hover:opacity-80 transition-opacity"
              )}
              onClick={() => isClickable && onStepClick(step.id)}
            >
              {/* Step Icon */}
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors mb-2",
                colors.bg,
                colors.border
              )}>
                <div className={colors.text}>
                  {getStepIcon(step, index)}
                </div>
              </div>
              
              {/* Step Content */}
              <div className="max-w-24">
                <h3 className={cn(
                  "text-sm font-medium transition-colors",
                  getStepStatus(step, index) === 'current' ? 'text-white' : 'text-gray-300'
                )}>
                  {step.title}
                </h3>
                {step.description && (
                  <p className={cn("text-xs mt-1", colors.description)}>
                    {step.description}
                  </p>
                )}
              </div>
            </div>
            
            {/* Horizontal Connector */}
            {showConnectors && index < steps.length - 1 && (
              <div className="flex items-center mx-4">
                <ArrowRight className={cn(
                  "h-4 w-4 transition-colors",
                  getConnectorColors(index, index + 1) === 'bg-green-600' ? 'text-green-600' :
                  getConnectorColors(index, index + 1) === 'bg-blue-600' ? 'text-blue-600' : 'text-gray-600'
                )} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Stepper;

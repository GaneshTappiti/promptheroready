import React from 'react';
import { cn } from '@/lib/utils';
import { Check, ChevronRight } from 'lucide-react';
import { Button } from './button';

export interface StepperStep {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  optional?: boolean;
  disabled?: boolean;
}

export type StepStatus = 'pending' | 'current' | 'completed' | 'error';

interface StepperProps {
  steps: StepperStep[];
  currentStep: string;
  completedSteps?: string[];
  errorSteps?: string[];
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'simple' | 'numbered';
  className?: string;
  onStepClick?: (stepId: string) => void;
  allowStepNavigation?: boolean;
  showStepNumbers?: boolean;
  showConnectors?: boolean;
}

const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  completedSteps = [],
  errorSteps = [],
  orientation = 'horizontal',
  variant = 'default',
  className,
  onStepClick,
  allowStepNavigation = false,
  showStepNumbers = true,
  showConnectors = true
}) => {
  const getStepStatus = (stepId: string): StepStatus => {
    if (errorSteps.includes(stepId)) return 'error';
    if (completedSteps.includes(stepId)) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'pending';
  };

  const getStepIndex = (stepId: string) => {
    return steps.findIndex(step => step.id === stepId);
  };

  const isStepClickable = (step: StepperStep, status: StepStatus) => {
    if (step.disabled) return false;
    if (!allowStepNavigation) return false;
    return status === 'completed' || status === 'current';
  };

  const renderStepIndicator = (step: StepperStep, index: number, status: StepStatus) => {
    const isClickable = isStepClickable(step, status);

    const indicatorContent = () => {
      if (status === 'completed') {
        return <Check className="h-4 w-4" />;
      }
      
      if (step.icon) {
        return step.icon;
      }
      
      if (showStepNumbers) {
        return <span className="text-sm font-medium">{index + 1}</span>;
      }
      
      return null;
    };

    const indicatorClasses = cn(
      "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200",
      {
        // Status-based styling
        'bg-primary border-primary text-primary-foreground': status === 'current',
        'bg-green-500 border-green-500 text-white': status === 'completed',
        'bg-red-500 border-red-500 text-white': status === 'error',
        'bg-muted border-muted-foreground/30 text-muted-foreground': status === 'pending',
        
        // Interactive styling
        'cursor-pointer hover:scale-105': isClickable,
        'cursor-not-allowed opacity-50': step.disabled
      }
    );

    const Wrapper = isClickable ? 'button' : 'div';

    return (
      <Wrapper
        className={indicatorClasses}
        onClick={isClickable ? () => onStepClick?.(step.id) : undefined}
        disabled={step.disabled}
      >
        {indicatorContent()}
      </Wrapper>
    );
  };

  const renderStepContent = (step: StepperStep, status: StepStatus) => {
    const isClickable = isStepClickable(step, status);

    return (
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            "transition-colors duration-200",
            isClickable && "cursor-pointer"
          )}
          onClick={isClickable ? () => onStepClick?.(step.id) : undefined}
        >
          <div className="flex items-center gap-2">
            <h3 className={cn(
              "text-sm font-medium transition-colors",
              {
                'text-foreground': status === 'current' || status === 'completed',
                'text-red-500': status === 'error',
                'text-muted-foreground': status === 'pending'
              }
            )}>
              {step.title}
            </h3>
            {step.optional && (
              <span className="text-xs text-muted-foreground">(Optional)</span>
            )}
          </div>
          
          {step.description && (
            <p className={cn(
              "text-xs mt-1 transition-colors",
              {
                'text-muted-foreground': status === 'current' || status === 'completed',
                'text-red-400': status === 'error',
                'text-muted-foreground/70': status === 'pending'
              }
            )}>
              {step.description}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderConnector = (index: number) => {
    if (!showConnectors || index === steps.length - 1) return null;

    const currentStepIndex = getStepIndex(currentStep);
    const isCompleted = index < currentStepIndex || completedSteps.includes(steps[index].id);

    if (orientation === 'horizontal') {
      return (
        <div className="flex-1 flex items-center px-4">
          <div className={cn(
            "h-0.5 w-full transition-colors duration-300",
            isCompleted ? 'bg-primary' : 'bg-muted-foreground/30'
          )} />
        </div>
      );
    } else {
      return (
        <div className="flex justify-center py-2">
          <div className={cn(
            "w-0.5 h-8 transition-colors duration-300",
            isCompleted ? 'bg-primary' : 'bg-muted-foreground/30'
          )} />
        </div>
      );
    }
  };

  if (orientation === 'horizontal') {
    return (
      <div className={cn("flex items-center w-full", className)}>
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex items-center">
                {renderStepIndicator(step, index, status)}
                <div className="ml-3">
                  {renderStepContent(step, status)}
                </div>
              </div>
              {renderConnector(index)}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {steps.map((step, index) => {
        const status = getStepStatus(step.id);
        
        return (
          <React.Fragment key={step.id}>
            <div className="flex items-start gap-3">
              {renderStepIndicator(step, index, status)}
              {renderStepContent(step, status)}
            </div>
            {renderConnector(index)}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Stepper navigation component
interface StepperNavigationProps {
  currentStep: string;
  steps: StepperStep[];
  onNext?: () => void;
  onPrevious?: () => void;
  onComplete?: () => void;
  nextLabel?: string;
  previousLabel?: string;
  completeLabel?: string;
  className?: string;
  disabled?: boolean;
}

export const StepperNavigation: React.FC<StepperNavigationProps> = ({
  currentStep,
  steps,
  onNext,
  onPrevious,
  onComplete,
  nextLabel = "Next",
  previousLabel = "Previous",
  completeLabel = "Complete",
  className,
  disabled = false
}) => {
  const currentIndex = steps.findIndex(step => step.id === currentStep);
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === steps.length - 1;

  return (
    <div className={cn("flex justify-between", className)}>
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstStep || disabled}
        className={isFirstStep ? "invisible" : ""}
      >
        {previousLabel}
      </Button>
      
      <Button
        onClick={isLastStep ? onComplete : onNext}
        disabled={disabled}
      >
        {isLastStep ? completeLabel : nextLabel}
        {!isLastStep && <ChevronRight className="ml-2 h-4 w-4" />}
      </Button>
    </div>
  );
};

export default Stepper;

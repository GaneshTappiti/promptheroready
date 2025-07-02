/**
 * Loading Spinner Component
 * Reusable loading spinner with different sizes and variants
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

const variantClasses = {
  default: 'text-gray-400',
  primary: 'text-green-500',
  secondary: 'text-blue-500',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  className,
  text,
  fullScreen = false,
}) => {
  const spinner = (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <Loader2 
        className={cn(
          'animate-spin',
          sizeClasses[size],
          variantClasses[variant]
        )} 
      />
      {text && (
        <p className={cn(
          'text-sm',
          variantClasses[variant]
        )}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="rounded-lg bg-black/80 p-6 border border-gray-800">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
};

// Page loading component
export const PageLoader: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="xl" variant="primary" text={text} />
  </div>
);

// Inline loading component
export const InlineLoader: React.FC<{ text?: string }> = ({ text }) => (
  <div className="flex items-center justify-center py-8">
    <LoadingSpinner size="md" variant="primary" text={text} />
  </div>
);

// Button loading component
export const ButtonLoader: React.FC = () => (
  <LoadingSpinner size="sm" className="mr-2" />
);

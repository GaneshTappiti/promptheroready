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

// AI Generation Loading Animation
export const AIGenerationLoader: React.FC<{
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({
  text = "AI is generating...",
  size = 'md',
  className
}) => {
  const sizeMultiplier = size === 'sm' ? 0.6 : size === 'lg' ? 1.4 : 1;
  const width = 75 * sizeMultiplier;
  const height = 100 * sizeMultiplier;

  return (
    <div className={cn("flex flex-col items-center gap-4 p-6", className)}>
      <div
        className="relative"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        {/* Bars */}
        {[1, 2, 3, 4, 5].map((index) => (
          <div
            key={index}
            className={cn(
              "absolute bottom-0 bg-gray-600 shadow-sm rounded-sm",
              `animate-ai-bar-${index}`
            )}
            style={{
              left: `${15 * (index - 1) * sizeMultiplier}px`,
              width: `${10 * sizeMultiplier}px`,
              height: '50%',
              transformOrigin: 'center bottom',
              transform: `scale(1, ${0.2 * index})`
            }}
          />
        ))}

        {/* Ball */}
        <div
          className="absolute bg-green-400 rounded-full shadow-lg shadow-green-400/50 animate-ai-ball"
          style={{
            bottom: `${10 * sizeMultiplier}px`,
            left: 0,
            width: `${10 * sizeMultiplier}px`,
            height: `${10 * sizeMultiplier}px`
          }}
        />
      </div>

      {text && (
        <p className="text-sm text-gray-400 animate-pulse text-center font-medium">{text}</p>
      )}
    </div>
  );
};

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// WorkspaceLayout - Main layout wrapper
interface WorkspaceLayoutProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'alt';
  showSidebar?: boolean;
}

export function WorkspaceLayout({ 
  children, 
  className, 
  variant = 'default',
  showSidebar = true 
}: WorkspaceLayoutProps) {
  const backgroundClass = variant === 'alt' 
    ? 'workspace-background-alt' 
    : 'workspace-background';
    
  return (
    <div className={cn(backgroundClass, className)}>
      {children}
    </div>
  );
}

// WorkspaceContainer - Content container with responsive max-widths
interface WorkspaceContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '5xl' | '7xl';
  padding?: 'sm' | 'md' | 'lg';
}

export function WorkspaceContainer({ 
  children, 
  className, 
  maxWidth = '7xl',
  padding = 'md'
}: WorkspaceContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '7xl': 'max-w-7xl'
  };

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={cn(
      'mx-auto',
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}

// WorkspaceCard - Glass-effect cards
interface WorkspaceCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'glass' | 'solid' | 'light';
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export function WorkspaceCard({ 
  children, 
  className, 
  variant = 'glass',
  padding = 'md',
  hover = false
}: WorkspaceCardProps) {
  const variantClasses = {
    glass: 'workspace-card',
    solid: 'workspace-card-solid',
    light: 'glass-effect-light'
  };

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const hoverClass = hover ? 'hover:shadow-lg hover:translate-y-[-2px]' : '';

  return (
    <div className={cn(
      variantClasses[variant],
      paddingClasses[padding],
      hoverClass,
      className
    )}>
      {children}
    </div>
  );
}

// WorkspaceHeader - Standardized header component
interface WorkspaceHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  className?: string;
}

export function WorkspaceHeader({ 
  title, 
  subtitle, 
  children, 
  showBackButton = false,
  onBack,
  className 
}: WorkspaceHeaderProps) {
  return (
    <div className={cn('mb-8', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button
              variant="outline"
              size="icon"
              onClick={onBack}
              className="bg-black/20 border-white/10 hover:bg-black/30"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{title}</h1>
            {subtitle && (
              <p className="text-sm md:text-base text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        {children && (
          <div className="flex items-center gap-3">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

// WorkspaceGrid - Responsive grid layout
interface WorkspaceGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function WorkspaceGrid({ 
  children, 
  columns = 3,
  gap = 'md',
  className 
}: WorkspaceGridProps) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  };

  return (
    <div className={cn(
      'grid',
      columnClasses[columns],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}

// Export all components
export default {
  WorkspaceLayout,
  WorkspaceContainer,
  WorkspaceCard,
  WorkspaceHeader,
  WorkspaceGrid
};

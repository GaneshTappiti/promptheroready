import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface WorkspaceButtonProps extends Omit<ButtonProps, 'size' | 'variant'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const WorkspaceButton = React.forwardRef<HTMLButtonElement, WorkspaceButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    icon,
    iconPosition = 'left',
    children,
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = 'transition-all duration-200 font-medium focus:ring-2 focus:ring-green-500/20';
    
    const variantClasses = {
      primary: 'workspace-button',
      secondary: 'workspace-button-secondary',
      ghost: 'bg-transparent hover:bg-black/20 text-gray-400 hover:text-white border-transparent',
      outline: 'bg-transparent border border-white/20 text-white hover:bg-black/20 hover:border-green-500/30',
      destructive: 'bg-red-600 hover:bg-red-500 text-white border-red-500/30'
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm h-8',
      md: 'px-4 py-2 text-sm h-10',
      lg: 'px-6 py-3 text-base h-12',
      icon: 'p-2 h-10 w-10'
    };

    const isDisabled = disabled || loading;

    return (
      <Button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          isDisabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        )}
        {!loading && icon && iconPosition === 'left' && (
          <span className="mr-2">{icon}</span>
        )}
        {children}
        {!loading && icon && iconPosition === 'right' && (
          <span className="ml-2">{icon}</span>
        )}
      </Button>
    );
  }
);

WorkspaceButton.displayName = 'WorkspaceButton';

// Preset button components for common use cases
export const PrimaryButton = (props: Omit<WorkspaceButtonProps, 'variant'>) => (
  <WorkspaceButton variant="primary" {...props} />
);

export const SecondaryButton = (props: Omit<WorkspaceButtonProps, 'variant'>) => (
  <WorkspaceButton variant="secondary" {...props} />
);

export const GhostButton = (props: Omit<WorkspaceButtonProps, 'variant'>) => (
  <WorkspaceButton variant="ghost" {...props} />
);

export const OutlineButton = (props: Omit<WorkspaceButtonProps, 'variant'>) => (
  <WorkspaceButton variant="outline" {...props} />
);

export const DestructiveButton = (props: Omit<WorkspaceButtonProps, 'variant'>) => (
  <WorkspaceButton variant="destructive" {...props} />
);

// Icon button variants
export const IconButton = (props: Omit<WorkspaceButtonProps, 'size'>) => (
  <WorkspaceButton size="icon" {...props} />
);

export const SmallButton = (props: Omit<WorkspaceButtonProps, 'size'>) => (
  <WorkspaceButton size="sm" {...props} />
);

export const LargeButton = (props: Omit<WorkspaceButtonProps, 'size'>) => (
  <WorkspaceButton size="lg" {...props} />
);

// Loading button variants
interface LoadingButtonProps extends WorkspaceButtonProps {
  loadingText?: string;
}

export const LoadingButton = ({ loadingText = 'Loading...', children, loading, ...props }: LoadingButtonProps) => (
  <WorkspaceButton loading={loading} {...props}>
    {loading ? loadingText : children}
  </WorkspaceButton>
);

// Action button with confirmation
interface ActionButtonProps extends WorkspaceButtonProps {
  confirmText?: string;
  onConfirm?: () => void;
  requireConfirmation?: boolean;
}

export const ActionButton = ({ 
  confirmText = 'Are you sure?', 
  onConfirm, 
  requireConfirmation = false,
  onClick,
  children,
  ...props 
}: ActionButtonProps) => {
  const [showConfirm, setShowConfirm] = React.useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (requireConfirmation && !showConfirm) {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000); // Auto-hide after 3 seconds
      return;
    }

    if (onConfirm) {
      onConfirm();
    } else if (onClick) {
      onClick(e);
    }
    
    setShowConfirm(false);
  };

  return (
    <WorkspaceButton onClick={handleClick} {...props}>
      {showConfirm ? confirmText : children}
    </WorkspaceButton>
  );
};

export default WorkspaceButton;

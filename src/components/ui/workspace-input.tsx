import React from 'react';
import { Input, InputProps } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Search, X } from 'lucide-react';

interface WorkspaceInputProps extends Omit<InputProps, 'size'> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'search' | 'password';
  clearable?: boolean;
  onClear?: () => void;
}

export const WorkspaceInput = React.forwardRef<HTMLInputElement, WorkspaceInputProps>(
  ({ 
    className,
    label,
    description,
    error,
    success,
    icon,
    iconPosition = 'left',
    size = 'md',
    variant = 'default',
    clearable = false,
    onClear,
    value,
    type,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(value || '');

    React.useEffect(() => {
      setInternalValue(value || '');
    }, [value]);

    const sizeClasses = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-5 text-base'
    };

    const iconSizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };

    const paddingClasses = {
      left: {
        sm: 'pl-8',
        md: 'pl-10',
        lg: 'pl-12'
      },
      right: {
        sm: 'pr-8',
        md: 'pr-10',
        lg: 'pr-12'
      }
    };

    const iconPositionClasses = {
      left: {
        sm: 'left-2.5',
        md: 'left-3',
        lg: 'left-4'
      },
      right: {
        sm: 'right-2.5',
        md: 'right-3',
        lg: 'right-4'
      }
    };

    const inputType = variant === 'password' && showPassword ? 'text' : 
                     variant === 'password' ? 'password' : 
                     type;

    const defaultIcon = variant === 'search' ? <Search className={iconSizeClasses[size]} /> : icon;
    const finalIcon = variant === 'password' ? null : defaultIcon;

    const handleClear = () => {
      setInternalValue('');
      if (onClear) {
        onClear();
      }
    };

    const inputElement = (
      <div className="relative">
        {finalIcon && (
          <div className={cn(
            'absolute top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none',
            iconPositionClasses[iconPosition][size]
          )}>
            {finalIcon}
          </div>
        )}
        
        <Input
          ref={ref}
          type={inputType}
          value={internalValue}
          onChange={(e) => {
            setInternalValue(e.target.value);
            if (props.onChange) {
              props.onChange(e);
            }
          }}
          className={cn(
            'workspace-input',
            sizeClasses[size],
            finalIcon && iconPosition === 'left' && paddingClasses.left[size],
            (finalIcon && iconPosition === 'right') || clearable || variant === 'password' 
              ? paddingClasses.right[size] : '',
            error && 'border-red-500/50 focus:border-red-500',
            success && 'border-green-500/50 focus:border-green-500',
            className
          )}
          {...props}
        />

        {/* Password toggle */}
        {variant === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={cn(
              'absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors',
              iconPositionClasses.right[size]
            )}
          >
            {showPassword ? <EyeOff className={iconSizeClasses[size]} /> : <Eye className={iconSizeClasses[size]} />}
          </button>
        )}

        {/* Clear button */}
        {clearable && internalValue && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              'absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors',
              variant === 'password' ? 'right-10' : iconPositionClasses.right[size]
            )}
          >
            <X className={iconSizeClasses[size]} />
          </button>
        )}
      </div>
    );

    if (!label && !description && !error && !success) {
      return inputElement;
    }

    return (
      <div className="space-y-2">
        {label && (
          <Label className="text-white font-medium">
            {label}
          </Label>
        )}
        {description && (
          <p className="text-sm text-gray-400">
            {description}
          </p>
        )}
        {inputElement}
        {error && (
          <p className="text-sm text-red-400">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-400">
            {success}
          </p>
        )}
      </div>
    );
  }
);

WorkspaceInput.displayName = 'WorkspaceInput';

// Textarea variant
interface WorkspaceTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  resize?: boolean;
}

export const WorkspaceTextarea = React.forwardRef<HTMLTextAreaElement, WorkspaceTextareaProps>(
  ({ 
    className,
    label,
    description,
    error,
    success,
    resize = true,
    ...props 
  }, ref) => {
    const textareaElement = (
      <Textarea
        ref={ref}
        className={cn(
          'workspace-input min-h-[80px]',
          !resize && 'resize-none',
          error && 'border-red-500/50 focus:border-red-500',
          success && 'border-green-500/50 focus:border-green-500',
          className
        )}
        {...props}
      />
    );

    if (!label && !description && !error && !success) {
      return textareaElement;
    }

    return (
      <div className="space-y-2">
        {label && (
          <Label className="text-white font-medium">
            {label}
          </Label>
        )}
        {description && (
          <p className="text-sm text-gray-400">
            {description}
          </p>
        )}
        {textareaElement}
        {error && (
          <p className="text-sm text-red-400">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-400">
            {success}
          </p>
        )}
      </div>
    );
  }
);

WorkspaceTextarea.displayName = 'WorkspaceTextarea';

// Preset input components
export const SearchInput = (props: Omit<WorkspaceInputProps, 'variant'>) => (
  <WorkspaceInput variant="search" {...props} />
);

export const PasswordInput = (props: Omit<WorkspaceInputProps, 'variant'>) => (
  <WorkspaceInput variant="password" {...props} />
);

export const ClearableInput = (props: Omit<WorkspaceInputProps, 'clearable'>) => (
  <WorkspaceInput clearable {...props} />
);

export default WorkspaceInput;

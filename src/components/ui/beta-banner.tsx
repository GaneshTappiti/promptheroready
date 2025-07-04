/**
 * Beta Banner Component
 * Displays a dismissible beta notification banner
 */

import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BetaBannerProps {
  className?: string;
  variant?: 'info' | 'warning';
  dismissible?: boolean;
  persistent?: boolean; // If true, banner reappears after page refresh
  message?: string;
}

export function BetaBanner({ 
  className,
  variant = 'info',
  dismissible = true,
  persistent = false,
  message = "This is a beta version of the application. Some features may be under development."
}: BetaBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const storageKey = 'beta-banner-dismissed';

  useEffect(() => {
    if (dismissible && !persistent) {
      const dismissed = localStorage.getItem(storageKey);
      if (dismissed === 'true') {
        setIsVisible(false);
      }
    }
  }, [dismissible, persistent]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (!persistent) {
      localStorage.setItem(storageKey, 'true');
    }
  };

  if (!isVisible) return null;

  const Icon = variant === 'warning' ? AlertTriangle : Info;
  const variantStyles = variant === 'warning' 
    ? 'border-yellow-600/30 bg-yellow-600/10 text-yellow-200'
    : 'border-blue-600/30 bg-blue-600/10 text-blue-200';

  return (
    <Alert className={cn(
      'relative border-l-4 rounded-none border-x-0 border-t-0 border-b',
      variantStyles,
      className
    )}>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3 flex-1">
          <Icon className="h-4 w-4 flex-shrink-0" />
          <Badge
            variant="secondary"
            className={cn(
              'font-semibold flex-shrink-0',
              variant === 'warning'
                ? 'bg-yellow-600/20 text-yellow-300 border-yellow-600/40'
                : 'bg-blue-600/20 text-blue-300 border-blue-600/40'
            )}
          >
            BETA
          </Badge>
          <AlertDescription className="text-sm flex-1 m-0">
            {message}
          </AlertDescription>
        </div>
        {dismissible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className={cn(
              'h-6 w-6 p-0 hover:bg-white/10 flex-shrink-0 ml-2',
              variant === 'warning' ? 'text-yellow-300 hover:text-yellow-100' : 'text-blue-300 hover:text-blue-100'
            )}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss beta banner</span>
          </Button>
        )}
      </div>
    </Alert>
  );
}

export default BetaBanner;

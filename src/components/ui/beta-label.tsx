/**
 * Beta Label Component
 * A small, reusable beta indicator for specific features or sections
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BetaLabelProps {
  className?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  size?: 'sm' | 'default' | 'lg';
  text?: string;
  pulse?: boolean;
}

export function BetaLabel({ 
  className,
  variant = 'default',
  size = 'sm',
  text = 'BETA',
  pulse = false
}: BetaLabelProps) {
  return (
    <Badge 
      variant={variant}
      className={cn(
        'font-semibold tracking-wide',
        size === 'sm' && 'text-xs px-1.5 py-0.5',
        size === 'default' && 'text-sm px-2 py-1',
        size === 'lg' && 'text-base px-3 py-1.5',
        pulse && 'animate-pulse',
        variant === 'default' && 'bg-blue-600/20 text-blue-300 border-blue-600/40 hover:bg-blue-600/30',
        variant === 'secondary' && 'bg-yellow-600/20 text-yellow-300 border-yellow-600/40 hover:bg-yellow-600/30',
        variant === 'outline' && 'bg-green-600/20 text-green-300 border-green-600/40 hover:bg-green-600/30',
        variant === 'destructive' && 'bg-red-600/20 text-red-300 border-red-600/40 hover:bg-red-600/30',
        className
      )}
    >
      {text}
    </Badge>
  );
}

export default BetaLabel;

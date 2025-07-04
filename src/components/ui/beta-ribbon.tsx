/**
 * Beta Ribbon Component
 * A corner ribbon for prominent beta indication with shine effect
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface BetaRibbonProps {
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  variant?: 'info' | 'warning' | 'success';
  text?: string;
  size?: 'sm' | 'default' | 'lg';
  animate?: boolean;
  shine?: boolean;
}

export function BetaRibbon({
  className,
  position = 'top-right',
  variant = 'warning',
  text = 'BETA',
  size = 'default',
  animate = false,
  shine = true
}: BetaRibbonProps) {
  const variantClasses = {
    info: 'bg-blue-500 text-white shadow-md',
    warning: 'bg-yellow-400 text-black shadow-md',
    success: 'bg-green-500 text-white shadow-md'
  };

  const sizeClasses = {
    sm: 'py-1 text-[10px] font-bold',
    default: 'py-1 text-xs font-bold',
    lg: 'py-2 text-sm font-bold'
  };

  const containerSizes = {
    sm: 'w-36 h-36',
    default: 'w-44 h-44',
    lg: 'w-52 h-52'
  };

  const ribbonWidths = {
    sm: 'w-[140px]',
    default: 'w-[170px]',
    lg: 'w-[200px]'
  };

  const ribbonPositions = {
    'top-left': 'top-6 left-[-50px]',
    'top-right': 'top-6 right-[-50px]',
    'bottom-left': 'bottom-6 left-[-50px]',
    'bottom-right': 'bottom-6 right-[-50px]'
  };

  const containerPositions = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0'
  };

  const rotations = {
    'top-left': '-rotate-45',
    'top-right': 'rotate-45',
    'bottom-left': 'rotate-45',
    'bottom-right': '-rotate-45'
  };

  return (
    <div className={cn(
      'fixed z-50 overflow-hidden pointer-events-none',
      containerPositions[position],
      containerSizes[size],
      className
    )}>
      <div className={cn(
        'absolute flex items-center justify-center text-center',
        ribbonPositions[position],
        ribbonWidths[size],
        rotations[position],
        variantClasses[variant],
        sizeClasses[size],
        animate && 'animate-pulse',
        'relative overflow-hidden'
      )}>
        {/* Main text */}
        <span className="relative z-10 leading-none">{text}</span>

        {/* Shine effect */}
        {shine && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full animate-shine" />
        )}
      </div>
    </div>
  );
}

export default BetaRibbon;

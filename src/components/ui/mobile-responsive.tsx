/**
 * Mobile Responsive Components
 * Provides mobile-optimized components and utilities for responsive design
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { useDeviceInfo } from '@/hooks/use-mobile'

// Mobile Container Component
interface MobileContainerProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

export function MobileContainer({ 
  children, 
  className, 
  padding = 'md',
  maxWidth = 'full'
}: MobileContainerProps) {
  const paddingClasses = {
    none: '',
    sm: 'mobile-padding-sm',
    md: 'mobile-padding',
    lg: 'mobile-padding-lg'
  }

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-none'
  }

  return (
    <div className={cn(
      'mobile-container mx-auto',
      paddingClasses[padding],
      maxWidthClasses[maxWidth],
      className
    )}>
      {children}
    </div>
  )
}

// Mobile Grid Component
interface MobileGridProps {
  children: React.ReactNode
  className?: string
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: 'sm' | 'md' | 'lg'
}

export function MobileGrid({ 
  children, 
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md'
}: MobileGridProps) {
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8'
  }

  const gridCols = `grid-cols-${cols.mobile} sm:grid-cols-${cols.tablet} lg:grid-cols-${cols.desktop}`

  return (
    <div className={cn(
      'grid',
      gridCols,
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  )
}

// Mobile Stack Component
interface MobileStackProps {
  children: React.ReactNode
  className?: string
  direction?: 'column' | 'row' | 'responsive'
  gap?: 'sm' | 'md' | 'lg'
  align?: 'start' | 'center' | 'end' | 'stretch'
}

export function MobileStack({ 
  children, 
  className,
  direction = 'responsive',
  gap = 'md',
  align = 'start'
}: MobileStackProps) {
  const directionClasses = {
    column: 'flex-col',
    row: 'flex-row',
    responsive: 'mobile-flex'
  }

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  }

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  }

  return (
    <div className={cn(
      'flex',
      directionClasses[direction],
      gapClasses[gap],
      alignClasses[align],
      className
    )}>
      {children}
    </div>
  )
}

// Mobile Button Component
interface MobileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export function MobileButton({ 
  children, 
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  ...props
}: MobileButtonProps) {
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
  }

  const sizeClasses = {
    sm: 'min-h-[40px] px-4 py-2 text-sm',
    md: 'mobile-button',
    lg: 'min-h-[52px] px-8 py-4 text-base'
  }

  return (
    <button 
      className={cn(
        'mobile-touch-target font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// Mobile Card Component
interface MobileCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'glass' | 'solid'
  padding?: 'sm' | 'md' | 'lg'
  interactive?: boolean
}

export function MobileCard({ 
  children, 
  className,
  variant = 'default',
  padding = 'md',
  interactive = false
}: MobileCardProps) {
  const variantClasses = {
    default: 'mobile-card',
    glass: 'glass-effect rounded-xl p-4 sm:p-6',
    solid: 'bg-card text-card-foreground border rounded-xl p-4 sm:p-6'
  }

  const paddingClasses = {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  }

  return (
    <div className={cn(
      variantClasses[variant],
      variant === 'default' ? '' : paddingClasses[padding],
      interactive && 'cursor-pointer hover:shadow-lg transition-shadow duration-200',
      className
    )}>
      {children}
    </div>
  )
}

// Mobile Text Component
interface MobileTextProps {
  children: React.ReactNode
  className?: string
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  color?: 'default' | 'muted' | 'primary' | 'secondary'
}

export function MobileText({ 
  children, 
  className,
  size = 'base',
  weight = 'normal',
  color = 'default'
}: MobileTextProps) {
  const sizeClasses = {
    xs: 'mobile-text-sm',
    sm: 'mobile-text',
    base: 'text-sm sm:text-base',
    lg: 'mobile-text-lg',
    xl: 'text-lg sm:text-xl'
  }

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  }

  const colorClasses = {
    default: 'text-foreground',
    muted: 'text-muted-foreground',
    primary: 'text-primary',
    secondary: 'text-secondary-foreground'
  }

  return (
    <span className={cn(
      sizeClasses[size],
      weightClasses[weight],
      colorClasses[color],
      className
    )}>
      {children}
    </span>
  )
}

// Mobile Heading Component
interface MobileHeadingProps {
  children: React.ReactNode
  className?: string
  level?: 1 | 2 | 3 | 4 | 5 | 6
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function MobileHeading({ 
  children, 
  className,
  level = 2,
  size = 'md'
}: MobileHeadingProps) {
  const sizeClasses = {
    sm: 'mobile-heading-sm',
    md: 'mobile-heading',
    lg: 'mobile-heading-lg',
    xl: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl'
  }

  const Component = `h${level}` as keyof JSX.IntrinsicElements

  return (
    <Component className={cn(
      'font-bold tracking-tight',
      sizeClasses[size],
      className
    )}>
      {children}
    </Component>
  )
}

// Responsive Show/Hide Components
interface ResponsiveProps {
  children: React.ReactNode
  className?: string
}

export function ShowOnMobile({ children, className }: ResponsiveProps) {
  return (
    <div className={cn('block sm:hidden', className)}>
      {children}
    </div>
  )
}

export function HideOnMobile({ children, className }: ResponsiveProps) {
  return (
    <div className={cn('hidden sm:block', className)}>
      {children}
    </div>
  )
}

export function ShowOnTablet({ children, className }: ResponsiveProps) {
  return (
    <div className={cn('hidden sm:block lg:hidden', className)}>
      {children}
    </div>
  )
}

export function ShowOnDesktop({ children, className }: ResponsiveProps) {
  return (
    <div className={cn('hidden lg:block', className)}>
      {children}
    </div>
  )
}

// Device Info Hook Component
export function DeviceInfoProvider({ children }: { children: React.ReactNode }) {
  const deviceInfo = useDeviceInfo()
  
  React.useEffect(() => {
    // Add device classes to body for CSS targeting
    document.body.classList.toggle('mobile-device', deviceInfo.isMobile)
    document.body.classList.toggle('tablet-device', deviceInfo.isTablet)
    document.body.classList.toggle('desktop-device', deviceInfo.isDesktop)
    document.body.classList.toggle('touch-device', deviceInfo.isTouch)
    document.body.classList.toggle('portrait', deviceInfo.orientation === 'portrait')
    document.body.classList.toggle('landscape', deviceInfo.orientation === 'landscape')
  }, [deviceInfo])

  return <>{children}</>
}

/**
 * Mobile-Optimized Sidebar Component
 * Provides responsive sidebar with mobile-first design
 */

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useIsMobile, useDeviceInfo } from '@/hooks/use-mobile'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Home,
  Settings,
  User
} from 'lucide-react'

interface MobileSidebarProps {
  children: React.ReactNode
  className?: string
  defaultOpen?: boolean
  collapsible?: boolean
  side?: 'left' | 'right'
  width?: string
  trigger?: React.ReactNode
}

export function MobileSidebar({
  children,
  className,
  defaultOpen = false,
  collapsible = true,
  side = 'left',
  width = '280px',
  trigger
}: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const isMobile = useIsMobile()
  const { isTouch } = useDeviceInfo()

  // Auto-close on mobile when clicking outside
  useEffect(() => {
    if (isMobile && isOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        const sidebar = document.querySelector('[data-mobile-sidebar]')
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobile, isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          {trigger || (
            <Button
              variant="ghost"
              size="icon"
              className="mobile-touch-target"
              onClick={() => setIsOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          )}
        </SheetTrigger>
        <SheetContent
          side={side}
          className={cn(
            'mobile-safe-area p-0 border-0',
            side === 'left' ? 'border-r border-white/10' : 'border-l border-white/10',
            className
          )}
          style={{ width }}
        >
          <div 
            data-mobile-sidebar
            className="h-full flex flex-col bg-background"
          >
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                className="mobile-touch-target"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto mobile-scroll-container p-4">
              {children}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop sidebar
  return (
    <div
      data-mobile-sidebar
      className={cn(
        'relative h-full bg-background border-r border-white/10 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
      style={{ width: isCollapsed ? '64px' : width }}
    >
      {/* Collapse Toggle */}
      {collapsible && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border border-white/10 bg-background"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      )}

      {/* Content */}
      <div className="h-full overflow-y-auto custom-scrollbar">
        {children}
      </div>
    </div>
  )
}

// Sidebar Navigation Item
interface SidebarNavItemProps {
  icon?: React.ReactNode
  children: React.ReactNode
  href?: string
  active?: boolean
  onClick?: () => void
  className?: string
}

export function SidebarNavItem({
  icon,
  children,
  href,
  active = false,
  onClick,
  className
}: SidebarNavItemProps) {
  const isMobile = useIsMobile()

  const content = (
    <div className={cn(
      'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
      'mobile-touch-target',
      active 
        ? 'bg-primary/10 text-primary' 
        : 'hover:bg-muted/50 hover:text-foreground',
      isMobile && 'py-3 px-4',
      className
    )}>
      {icon && (
        <span className="flex-shrink-0">
          {icon}
        </span>
      )}
      <span className={cn(
        'font-medium',
        isMobile ? 'text-base' : 'text-sm'
      )}>
        {children}
      </span>
    </div>
  )

  if (href) {
    return (
      <a href={href} onClick={onClick}>
        {content}
      </a>
    )
  }

  return (
    <button onClick={onClick} className="w-full text-left">
      {content}
    </button>
  )
}

// Sidebar Section
interface SidebarSectionProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export function SidebarSection({
  title,
  children,
  className
}: SidebarSectionProps) {
  const isMobile = useIsMobile()

  return (
    <div className={cn('space-y-2', className)}>
      {title && (
        <h3 className={cn(
          'font-semibold text-muted-foreground uppercase tracking-wide px-3',
          isMobile ? 'text-sm px-4' : 'text-xs'
        )}>
          {title}
        </h3>
      )}
      <div className="space-y-1">
        {children}
      </div>
    </div>
  )
}

// Example usage component
export function ExampleMobileSidebar() {
  return (
    <MobileSidebar
      trigger={
        <Button variant="ghost" size="icon" className="mobile-touch-target">
          <Menu className="h-6 w-6" />
        </Button>
      }
    >
      <div className="space-y-6">
        <SidebarSection title="Main">
          <SidebarNavItem icon={<Home className="h-5 w-5" />} active>
            Dashboard
          </SidebarNavItem>
          <SidebarNavItem icon={<User className="h-5 w-5" />}>
            Profile
          </SidebarNavItem>
          <SidebarNavItem icon={<Settings className="h-5 w-5" />}>
            Settings
          </SidebarNavItem>
        </SidebarSection>
      </div>
    </MobileSidebar>
  )
}

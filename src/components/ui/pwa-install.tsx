/**
 * PWA Installation Component
 * Provides mobile-optimized PWA installation prompts and management
 */

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useDeviceInfo } from '@/hooks/use-mobile'
import { MobileButton } from '@/components/ui/mobile-responsive'
import { 
  Download, 
  X, 
  Smartphone, 
  Monitor,
  Share,
  Plus
} from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PWAInstallProps {
  className?: string
  variant?: 'banner' | 'button' | 'card'
  showOnDesktop?: boolean
  autoShow?: boolean
}

export function PWAInstall({ 
  className, 
  variant = 'banner',
  showOnDesktop = true,
  autoShow = true 
}: PWAInstallProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const { isMobile } = useDeviceInfo()

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isInWebAppiOS = (window.navigator as { standalone?: boolean }).standalone === true
    setIsInstalled(isStandalone || isInWebAppiOS)

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      setIsInstallable(true)
      
      if (autoShow && !isInstalled) {
        setShowPrompt(true)
      }
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
      console.log('PWA was installed')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [autoShow, isInstalled])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt')
      } else {
        console.log('User dismissed the install prompt')
      }
      
      setDeferredPrompt(null)
      setShowPrompt(false)
    } catch (error) {
      console.error('Error during PWA installation:', error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Remember dismissal for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true')
  }

  // Don't show if already installed
  if (isInstalled) return null

  // Don't show on desktop if disabled
  if (!isMobile && !showOnDesktop) return null

  // Don't show if not installable and not iOS
  if (!isInstallable && !isIOS) return null

  // Don't show if dismissed this session
  if (sessionStorage.getItem('pwa-install-dismissed')) return null

  // iOS Installation Instructions
  const IOSInstructions = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Share className="h-5 w-5 text-blue-500" />
        <span className="text-sm">Tap the Share button</span>
      </div>
      <div className="flex items-center gap-3">
        <Plus className="h-5 w-5 text-blue-500" />
        <span className="text-sm">Select "Add to Home Screen"</span>
      </div>
      <div className="flex items-center gap-3">
        <Smartphone className="h-5 w-5 text-blue-500" />
        <span className="text-sm">Tap "Add" to install</span>
      </div>
    </div>
  )

  // Banner variant
  if (variant === 'banner' && showPrompt) {
    return (
      <div className={cn(
        'fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-white/10 p-4 shadow-lg',
        'mobile-safe-area',
        className
      )}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-primary/10 rounded-lg">
              {isMobile ? (
                <Smartphone className="h-5 w-5 text-primary" />
              ) : (
                <Monitor className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm">Install PromptHeroReady</h3>
              <p className="text-xs text-muted-foreground">
                Get the full app experience
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <MobileButton
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="p-2"
            >
              <X className="h-4 w-4" />
            </MobileButton>
            
            {isIOS ? (
              <MobileButton
                variant="primary"
                size="sm"
                onClick={() => setShowPrompt(false)}
              >
                How to Install
              </MobileButton>
            ) : (
              <MobileButton
                variant="primary"
                size="sm"
                onClick={handleInstall}
              >
                <Download className="h-4 w-4 mr-2" />
                Install
              </MobileButton>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Button variant
  if (variant === 'button') {
    return (
      <MobileButton
        variant="outline"
        onClick={isIOS ? () => setShowPrompt(true) : handleInstall}
        className={className}
      >
        <Download className="h-4 w-4 mr-2" />
        Install App
      </MobileButton>
    )
  }

  // Card variant
  if (variant === 'card') {
    return (
      <div className={cn(
        'mobile-card p-6 space-y-4',
        className
      )}>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Download className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Install PromptHeroReady</h3>
            <p className="text-sm text-muted-foreground">
              Access your projects offline and get native app experience
            </p>
          </div>
        </div>

        {isIOS ? (
          <IOSInstructions />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>✓</span>
              <span>Works offline</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>✓</span>
              <span>Fast loading</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>✓</span>
              <span>Native app feel</span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <MobileButton
            variant="ghost"
            onClick={handleDismiss}
            className="flex-1"
          >
            Maybe Later
          </MobileButton>
          <MobileButton
            variant="primary"
            onClick={isIOS ? () => {} : handleInstall}
            className="flex-1"
          >
            {isIOS ? 'Got It' : 'Install Now'}
          </MobileButton>
        </div>
      </div>
    )
  }

  return null
}

// Hook for PWA installation state
export function usePWAInstall() {
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isInWebAppiOS = (window.navigator as { standalone?: boolean }).standalone === true
    setIsInstalled(isStandalone || isInWebAppiOS)

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const install = async () => {
    if (!deferredPrompt) return false

    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      setDeferredPrompt(null)
      return choiceResult.outcome === 'accepted'
    } catch (error) {
      console.error('PWA installation error:', error)
      return false
    }
  }

  return {
    isInstallable,
    isInstalled,
    install,
    canInstall: !!deferredPrompt
  }
}

/**
 * Mobile-Optimized Image Component
 * Provides lazy loading, format optimization, and responsive images for mobile devices
 */

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useDeviceInfo } from '@/hooks/use-mobile'
import { mobilePerformanceService } from '@/services/mobilePerformanceService'

interface MobileImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  sizes?: string
  quality?: number
  priority?: boolean
  placeholder?: 'blur' | 'empty' | string
  onLoad?: () => void
  onError?: () => void
  lazy?: boolean
  responsive?: boolean
}

export function MobileImage({
  src,
  alt,
  className,
  width,
  height,
  sizes,
  quality = 80,
  priority = false,
  placeholder = 'empty',
  onLoad,
  onError,
  lazy = true,
  responsive = true,
}: MobileImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState<string>('')
  const imgRef = useRef<HTMLImageElement>(null)
  const { isMobile } = useDeviceInfo()

  useEffect(() => {
    if (!imgRef.current) return

    const img = imgRef.current

    // Optimize image based on device capabilities
    const optimizedSrc = mobilePerformanceService.optimizeImage(src, {
      quality: isMobile ? Math.min(quality, 70) : quality,
      format: 'webp',
      loading: priority ? 'eager' : 'lazy',
    })

    if (priority || !lazy) {
      // Load immediately for priority images
      setCurrentSrc(optimizedSrc)
    } else {
      // Use lazy loading
      mobilePerformanceService.lazyLoadImage(img, optimizedSrc, {
        quality: isMobile ? Math.min(quality, 70) : quality,
        format: 'webp',
      })
    }
  }, [src, quality, priority, lazy, isMobile])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setIsError(true)
    onError?.()
  }

  // Generate responsive sizes if not provided
  const responsiveSizes = sizes || (responsive ? 
    '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw' : 
    undefined
  )

  // Generate srcSet for responsive images
  const generateSrcSet = (baseSrc: string) => {
    if (!responsive) return undefined

    const breakpoints = [320, 640, 768, 1024, 1280, 1536]
    return breakpoints
      .map(bp => {
        const optimizedSrc = mobilePerformanceService.optimizeImage(baseSrc, {
          quality: bp <= 768 ? Math.min(quality, 70) : quality,
          format: 'webp',
        })
        return `${optimizedSrc} ${bp}w`
      })
      .join(', ')
  }

  // Placeholder component
  const PlaceholderComponent = () => {
    if (placeholder === 'empty') {
      return (
        <div 
          className={cn(
            'bg-muted animate-pulse flex items-center justify-center',
            className
          )}
          style={{ width, height }}
        >
          <div className="text-muted-foreground text-sm">Loading...</div>
        </div>
      )
    }

    if (placeholder === 'blur') {
      return (
        <div 
          className={cn(
            'bg-gradient-to-br from-muted to-muted/50 animate-pulse',
            className
          )}
          style={{ width, height }}
        />
      )
    }

    // Custom placeholder image
    return (
      <img
        src={placeholder}
        alt=""
        className={cn('blur-sm', className)}
        style={{ width, height }}
      />
    )
  }

  // Error component
  const ErrorComponent = () => (
    <div 
      className={cn(
        'bg-muted border border-dashed border-muted-foreground/20 flex items-center justify-center',
        className
      )}
      style={{ width, height }}
    >
      <div className="text-muted-foreground text-sm text-center p-4">
        <div className="mb-2">⚠️</div>
        <div>Failed to load image</div>
      </div>
    </div>
  )

  if (isError) {
    return <ErrorComponent />
  }

  return (
    <div className="relative overflow-hidden">
      {/* Placeholder */}
      {!isLoaded && <PlaceholderComponent />}
      
      {/* Main Image */}
      <img
        ref={imgRef}
        src={currentSrc}
        srcSet={generateSrcSet(src)}
        sizes={responsiveSizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          !isLoaded && 'absolute inset-0',
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: responsive ? '100%' : width,
          height: responsive ? 'auto' : height,
        }}
      />
    </div>
  )
}

// Picture component for art direction
interface MobilePictureProps {
  sources: Array<{
    srcSet: string
    media?: string
    type?: string
  }>
  img: Omit<MobileImageProps, 'src'> & { src: string }
  className?: string
}

export function MobilePicture({ sources, img, className }: MobilePictureProps) {
  return (
    <picture className={className}>
      {sources.map((source, index) => (
        <source
          key={index}
          srcSet={source.srcSet}
          media={source.media}
          type={source.type}
        />
      ))}
      <MobileImage {...img} />
    </picture>
  )
}

// Avatar component optimized for mobile
interface MobileAvatarProps {
  src?: string
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fallback?: string
  className?: string
}

export function MobileAvatar({ 
  src, 
  alt, 
  size = 'md', 
  fallback, 
  className 
}: MobileAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  }

  const sizePixels = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64
  }

  if (!src) {
    return (
      <div className={cn(
        'rounded-full bg-muted flex items-center justify-center font-medium',
        sizeClasses[size],
        className
      )}>
        {fallback || alt.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <MobileImage
      src={src}
      alt={alt}
      width={sizePixels[size]}
      height={sizePixels[size]}
      quality={60} // Lower quality for avatars
      className={cn(
        'rounded-full object-cover',
        sizeClasses[size],
        className
      )}
      responsive={false}
    />
  )
}

// Background image component
interface MobileBackgroundImageProps {
  src: string
  alt?: string
  children?: React.ReactNode
  className?: string
  overlay?: boolean
  overlayOpacity?: number
}

export function MobileBackgroundImage({
  src,
  alt = '',
  children,
  className,
  overlay = false,
  overlayOpacity = 0.5,
}: MobileBackgroundImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const { isMobile } = useDeviceInfo()

  const optimizedSrc = mobilePerformanceService.optimizeImage(src, {
    quality: isMobile ? 60 : 80,
    format: 'webp',
  })

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Background Image */}
      <img
        src={optimizedSrc}
        alt={alt}
        className={cn(
          'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        onLoad={() => setIsLoaded(true)}
      />
      
      {/* Overlay */}
      {overlay && (
        <div 
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}
      
      {/* Content */}
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  )
}

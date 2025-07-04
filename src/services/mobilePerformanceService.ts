/**
 * Mobile Performance Optimization Service
 * Provides mobile-specific performance optimizations and monitoring
 */

import { config } from '@/config'
import { useDeviceInfo } from '@/hooks/use-mobile'

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  interactionTime: number
  memoryUsage: number
  networkSpeed: 'slow' | 'fast' | 'unknown'
  batteryLevel?: number
  connectionType?: string
}

interface ImageOptimizationOptions {
  quality?: number
  format?: 'webp' | 'avif' | 'jpeg' | 'png'
  sizes?: string
  loading?: 'lazy' | 'eager'
  placeholder?: 'blur' | 'empty'
}

class MobilePerformanceService {
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    renderTime: 0,
    interactionTime: 0,
    memoryUsage: 0,
    networkSpeed: 'unknown'
  }

  private observers: Map<string, IntersectionObserver> = new Map()
  private imageCache: Map<string, HTMLImageElement> = new Map()

  constructor() {
    this.initializePerformanceMonitoring()
    this.setupNetworkMonitoring()
    this.setupBatteryMonitoring()
  }

  /**
   * Initialize performance monitoring
   */
  private initializePerformanceMonitoring() {
    if (typeof window === 'undefined') return

    // Monitor page load performance
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      this.metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart
      
      // Report to analytics if enabled
      if (config.analytics.enabled && config.analytics.trackPerformance) {
        this.reportMetrics('page_load', { loadTime: this.metrics.loadTime })
      }
    })

    // Monitor First Contentful Paint
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.renderTime = entry.startTime
            this.reportMetrics('first_contentful_paint', { renderTime: entry.startTime })
          }
        }
      })
      observer.observe({ entryTypes: ['paint'] })
    }

    // Monitor memory usage (if available)
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory
        this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024 // MB
      }, 30000) // Check every 30 seconds
    }
  }

  /**
   * Setup network monitoring
   */
  private setupNetworkMonitoring() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      
      const updateNetworkInfo = () => {
        this.metrics.connectionType = connection.effectiveType
        this.metrics.networkSpeed = connection.effectiveType === '4g' ? 'fast' : 'slow'
      }

      updateNetworkInfo()
      connection.addEventListener('change', updateNetworkInfo)
    }
  }

  /**
   * Setup battery monitoring
   */
  private setupBatteryMonitoring() {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: unknown) => {
        const updateBatteryInfo = () => {
          this.metrics.batteryLevel = battery.level * 100
        }

        updateBatteryInfo()
        battery.addEventListener('levelchange', updateBatteryInfo)
      })
    }
  }

  /**
   * Optimize image loading based on device capabilities
   */
  optimizeImage(src: string, options: ImageOptimizationOptions = {}): string {
    const {
      quality = 80,
      format = 'webp',
      loading = 'lazy'
    } = options

    // Check if device supports WebP
    const supportsWebP = this.supportsImageFormat('webp')
    const supportsAVIF = this.supportsImageFormat('avif')

    let optimizedSrc = src

    // Use modern formats if supported
    if (supportsAVIF && format === 'avif') {
      optimizedSrc = this.convertImageFormat(src, 'avif', quality)
    } else if (supportsWebP && (format === 'webp' || format === 'avif')) {
      optimizedSrc = this.convertImageFormat(src, 'webp', quality)
    }

    return optimizedSrc
  }

  /**
   * Check if browser supports image format
   */
  private supportsImageFormat(format: string): boolean {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    
    try {
      return canvas.toDataURL(`image/${format}`).indexOf(`data:image/${format}`) === 0
    } catch (error) {
      return false
    }
  }

  /**
   * Convert image format (placeholder - would integrate with image service)
   */
  private convertImageFormat(src: string, format: string, quality: number): string {
    // In a real implementation, this would integrate with an image optimization service
    // For now, return the original src
    return src
  }

  /**
   * Lazy load images with intersection observer
   */
  lazyLoadImage(element: HTMLImageElement, src: string, options: ImageOptimizationOptions = {}) {
    const observerId = `lazy-${Math.random().toString(36).substr(2, 9)}`
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          const optimizedSrc = this.optimizeImage(src, options)
          
          // Preload the image
          const preloadImg = new Image()
          preloadImg.onload = () => {
            img.src = optimizedSrc
            img.classList.remove('loading')
            img.classList.add('loaded')
          }
          preloadImg.src = optimizedSrc
          
          observer.unobserve(img)
          this.observers.delete(observerId)
        }
      })
    }, {
      rootMargin: '50px 0px', // Start loading 50px before entering viewport
      threshold: 0.1
    })

    observer.observe(element)
    this.observers.set(observerId, observer)
  }

  /**
   * Preload critical resources
   */
  preloadCriticalResources(resources: string[]) {
    resources.forEach((resource) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      
      if (resource.endsWith('.css')) {
        link.as = 'style'
      } else if (resource.endsWith('.js')) {
        link.as = 'script'
      } else if (resource.match(/\.(jpg|jpeg|png|webp|avif)$/)) {
        link.as = 'image'
      }
      
      link.href = resource
      document.head.appendChild(link)
    })
  }

  /**
   * Optimize for low-end devices
   */
  optimizeForLowEndDevice() {
    const isLowEnd = this.isLowEndDevice()
    
    if (isLowEnd) {
      // Reduce animations
      document.body.classList.add('reduce-motion')
      
      // Disable non-critical features
      document.body.classList.add('low-end-device')
      
      // Reduce image quality
      document.body.classList.add('low-quality-images')
    }
  }

  /**
   * Detect if device is low-end
   */
  private isLowEndDevice(): boolean {
    // Check memory
    if ('memory' in performance) {
      const memory = (performance as any).memory
      if (memory.jsHeapSizeLimit < 1073741824) { // Less than 1GB
        return true
      }
    }

    // Check CPU cores
    if ('hardwareConcurrency' in navigator) {
      if (navigator.hardwareConcurrency <= 2) {
        return true
      }
    }

    // Check connection speed
    if (this.metrics.networkSpeed === 'slow') {
      return true
    }

    return false
  }

  /**
   * Report performance metrics
   */
  private reportMetrics(event: string, data: unknown) {
    if (config.analytics.enabled) {
      // Send to analytics service
      console.log(`Performance metric: ${event}`, data)
      
      // In a real implementation, send to your analytics service
      // analytics.track(event, data)
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * Cleanup observers and resources
   */
  cleanup() {
    this.observers.forEach((observer) => {
      observer.disconnect()
    })
    this.observers.clear()
    this.imageCache.clear()
  }
}

// Create singleton instance
export const mobilePerformanceService = new MobilePerformanceService()

// React hook for using mobile performance service
export function useMobilePerformance() {
  const deviceInfo = useDeviceInfo()
  
  return {
    ...mobilePerformanceService,
    deviceInfo,
    isLowEndDevice: mobilePerformanceService['isLowEndDevice'](),
    metrics: mobilePerformanceService.getMetrics(),
  }
}

export default mobilePerformanceService

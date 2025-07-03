import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024
const DESKTOP_BREAKPOINT = 1280

export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isTouch: boolean
  orientation: 'portrait' | 'landscape' | undefined
  screenSize: 'mobile' | 'tablet' | 'desktop' | 'wide'
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useDeviceInfo(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = React.useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isTouch: false,
    orientation: undefined,
    screenSize: 'desktop'
  })

  React.useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isMobile = width < MOBILE_BREAKPOINT
      const isTablet = width >= MOBILE_BREAKPOINT && width < DESKTOP_BREAKPOINT
      const isDesktop = width >= DESKTOP_BREAKPOINT
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const orientation = height > width ? 'portrait' : 'landscape'

      let screenSize: 'mobile' | 'tablet' | 'desktop' | 'wide' = 'desktop'
      if (width < MOBILE_BREAKPOINT) screenSize = 'mobile'
      else if (width < TABLET_BREAKPOINT) screenSize = 'tablet'
      else if (width < 1536) screenSize = 'desktop'
      else screenSize = 'wide'

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isTouch,
        orientation,
        screenSize
      })
    }

    // Initial check
    updateDeviceInfo()

    // Listen for resize events
    const handleResize = () => updateDeviceInfo()
    window.addEventListener('resize', handleResize)

    // Listen for orientation changes
    const handleOrientationChange = () => {
      // Small delay to ensure dimensions are updated
      setTimeout(updateDeviceInfo, 100)
    }
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  return deviceInfo
}

export function useScreenSize() {
  const { screenSize } = useDeviceInfo()
  return screenSize
}

export function useIsTouch() {
  const { isTouch } = useDeviceInfo()
  return isTouch
}

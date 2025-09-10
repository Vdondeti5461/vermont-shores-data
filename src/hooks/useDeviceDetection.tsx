import { useState, useEffect } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isChrome: boolean;
  isFirefox: boolean;
  screenSize: {
    width: number;
    height: number;
  };
  orientation: 'portrait' | 'landscape';
  pixelRatio: number;
}

export const useDeviceDetection = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isTouchDevice: false,
    isIOS: false,
    isAndroid: false,
    isSafari: false,
    isChrome: false,
    isFirefox: false,
    screenSize: { width: 0, height: 0 },
    orientation: 'portrait',
    pixelRatio: 1,
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const userAgent = navigator.userAgent;
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Device type detection
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;

      // Touch device detection
      const isTouchDevice = 
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 ||
        (window as any).DocumentTouch && document instanceof (window as any).DocumentTouch;

      // OS detection
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isAndroid = /Android/.test(userAgent);

      // Browser detection
      const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
      const isChrome = /Chrome/.test(userAgent) && !/Edg/.test(userAgent);
      const isFirefox = /Firefox/.test(userAgent);

      // Orientation
      const orientation = height > width ? 'portrait' : 'landscape';

      // Pixel ratio
      const pixelRatio = window.devicePixelRatio || 1;

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice,
        isIOS,
        isAndroid,
        isSafari,
        isChrome,
        isFirefox,
        screenSize: { width, height },
        orientation,
        pixelRatio,
      });
    };

    // Initial detection
    updateDeviceInfo();

    // Listen for resize and orientation changes
    const handleResize = () => updateDeviceInfo();
    const handleOrientationChange = () => {
      // Delay to ensure screen dimensions are updated
      setTimeout(updateDeviceInfo, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return deviceInfo;
};

// Utility hook for common responsive breakpoints
export const useResponsive = () => {
  const { screenSize } = useDeviceDetection();
  
  return {
    isXs: screenSize.width < 640,
    isSm: screenSize.width >= 640 && screenSize.width < 768,
    isMd: screenSize.width >= 768 && screenSize.width < 1024,
    isLg: screenSize.width >= 1024 && screenSize.width < 1280,
    isXl: screenSize.width >= 1280 && screenSize.width < 1536,
    is2Xl: screenSize.width >= 1536,
    width: screenSize.width,
    height: screenSize.height,
  };
};
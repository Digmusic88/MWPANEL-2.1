import { useState, useEffect } from 'react';

export interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenSize: 'mobile' | 'tablet' | 'desktop';
  width: number;
  height: number;
}

// Breakpoints siguiendo Tailwind CSS
const BREAKPOINTS = {
  mobile: 768,    // sm
  tablet: 1024,   // lg
  desktop: 1280   // xl
};

export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenSize: 'desktop',
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 720
  });

  useEffect(() => {
    const updateResponsiveState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      const isMobile = width < BREAKPOINTS.mobile;
      const isTablet = width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet;
      const isDesktop = width >= BREAKPOINTS.tablet;
      
      let screenSize: 'mobile' | 'tablet' | 'desktop' = 'desktop';
      if (isMobile) screenSize = 'mobile';
      else if (isTablet) screenSize = 'tablet';
      
      setState({
        isMobile,
        isTablet,
        isDesktop,
        screenSize,
        width,
        height
      });
    };

    // Ejecutar inmediatamente
    updateResponsiveState();

    // Listener para cambios de tamaño
    const handleResize = () => {
      updateResponsiveState();
    };

    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return state;
};

// Hook simplificado solo para mobile
export const useIsMobile = (): boolean => {
  const { isMobile } = useResponsive();
  return isMobile;
};

// Hook para breakpoints específicos
export const useBreakpoint = (breakpoint: keyof typeof BREAKPOINTS): boolean => {
  const { width } = useResponsive();
  return width < BREAKPOINTS[breakpoint];
};

// Utilidad para obtener clases Tailwind según dispositivo
export const getResponsiveClasses = (mobile: string, tablet: string = '', desktop: string = ''): string => {
  const classes = [mobile];
  if (tablet) classes.push(`md:${tablet}`);
  if (desktop) classes.push(`lg:${desktop}`);
  return classes.join(' ');
};
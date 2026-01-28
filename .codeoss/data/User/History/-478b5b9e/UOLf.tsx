import { CSSProperties } from 'react';

export const THEME = {
  colors: {
    background: '#030507',
    surface: '#0f172a',
    primary: '#0066ff',
    primaryGlow: 'rgba(0,102,255,0.4)',
    accent: '#38bdf8',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    text: {
      main: '#ffffff',
      muted: 'rgba(255,255,255,0.5)',
      disabled: 'rgba(255,255,255,0.3)',
    },
    border: 'rgba(255,255,255,0.05)',
  },
  effects: {
    glass: {
      background: 'rgba(255,255,255,0.015)',
      backdropFilter: 'blur(24px)',
      border: '1px solid rgba(255,255,255,0.05)',
    },
    glassSidebar: {
      background: 'rgba(255,255,255,0.01)',
      backdropFilter: 'blur(40px)',
      borderRight: '1px solid rgba(255,255,255,0.05)',
    },
    glow: (color: string) => ({
      boxShadow: `0 0 20px ${color}40`, // 40 es opacidad hex
    }),
  },
  layout: {
    sidebarWidth: '300px',
    radius: {
      card: '24px',
      button: '12px',
    }
  }
};

// Utilidad para mixins de estilos comunes
export const commonStyles = {
  flexCenter: { display: 'flex', alignItems: 'center', justifyContent: 'center' } as CSSProperties,
  flexBetween: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } as CSSProperties,
  fullScreen: { width: '100vw', height: '100vh', overflow: 'hidden' } as CSSProperties,
};
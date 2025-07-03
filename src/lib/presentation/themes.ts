// Presentation Themes - Adapted from presentation-ai repository

import { ThemeProperties, ThemeType } from '@/types/presentation';

export const defaultThemes: Record<ThemeType, ThemeProperties> = {
  mystique: {
    id: 'mystique',
    name: 'Mystique',
    description: 'Dark and mysterious theme with purple accents',
    colors: {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      accent: '#C4B5FD',
      background: '#0F0F23',
      surface: '#1E1B4B',
      text: '#F8FAFC',
      textSecondary: '#CBD5E1',
    },
    fonts: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif',
      code: 'JetBrains Mono, monospace',
    },
    spacing: {
      small: '0.5rem',
      medium: '1rem',
      large: '2rem',
    },
    borderRadius: '0.75rem',
    shadows: {
      small: '0 1px 3px rgba(139, 92, 246, 0.1)',
      medium: '0 4px 6px rgba(139, 92, 246, 0.1)',
      large: '0 10px 15px rgba(139, 92, 246, 0.1)',
    },
    animations: {
      duration: '0.3s',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  aurora: {
    id: 'aurora',
    name: 'Aurora',
    description: 'Bright and colorful theme with gradient accents',
    colors: {
      primary: '#06B6D4',
      secondary: '#0891B2',
      accent: '#67E8F9',
      background: '#F0F9FF',
      surface: '#FFFFFF',
      text: '#0F172A',
      textSecondary: '#475569',
    },
    fonts: {
      heading: 'Poppins, sans-serif',
      body: 'Inter, sans-serif',
    },
    spacing: {
      small: '0.5rem',
      medium: '1rem',
      large: '2rem',
    },
    borderRadius: '1rem',
    shadows: {
      small: '0 1px 3px rgba(6, 182, 212, 0.1)',
      medium: '0 4px 6px rgba(6, 182, 212, 0.1)',
      large: '0 10px 15px rgba(6, 182, 212, 0.1)',
    },
    animations: {
      duration: '0.3s',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  nexus: {
    id: 'nexus',
    name: 'Nexus',
    description: 'Modern tech theme with blue and gray tones',
    colors: {
      primary: '#3B82F6',
      secondary: '#1D4ED8',
      accent: '#93C5FD',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      text: '#1E293B',
      textSecondary: '#64748B',
    },
    fonts: {
      heading: 'Space Grotesk, sans-serif',
      body: 'Inter, sans-serif',
    },
    spacing: {
      small: '0.5rem',
      medium: '1rem',
      large: '2rem',
    },
    borderRadius: '0.5rem',
    shadows: {
      small: '0 1px 3px rgba(59, 130, 246, 0.1)',
      medium: '0 4px 6px rgba(59, 130, 246, 0.1)',
      large: '0 10px 15px rgba(59, 130, 246, 0.1)',
    },
    animations: {
      duration: '0.3s',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  zenith: {
    id: 'zenith',
    name: 'Zenith',
    description: 'Clean and minimal theme with green accents',
    colors: {
      primary: '#10B981',
      secondary: '#059669',
      accent: '#6EE7B7',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      text: '#111827',
      textSecondary: '#6B7280',
    },
    fonts: {
      heading: 'Outfit, sans-serif',
      body: 'Inter, sans-serif',
    },
    spacing: {
      small: '0.5rem',
      medium: '1rem',
      large: '2rem',
    },
    borderRadius: '0.375rem',
    shadows: {
      small: '0 1px 3px rgba(16, 185, 129, 0.1)',
      medium: '0 4px 6px rgba(16, 185, 129, 0.1)',
      large: '0 10px 15px rgba(16, 185, 129, 0.1)',
    },
    animations: {
      duration: '0.3s',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  prism: {
    id: 'prism',
    name: 'Prism',
    description: 'Vibrant theme with rainbow gradient elements',
    colors: {
      primary: '#EC4899',
      secondary: '#BE185D',
      accent: '#F9A8D4',
      background: '#FDF2F8',
      surface: '#FFFFFF',
      text: '#1F2937',
      textSecondary: '#6B7280',
    },
    fonts: {
      heading: 'Playfair Display, serif',
      body: 'Inter, sans-serif',
    },
    spacing: {
      small: '0.5rem',
      medium: '1rem',
      large: '2rem',
    },
    borderRadius: '1.5rem',
    shadows: {
      small: '0 1px 3px rgba(236, 72, 153, 0.1)',
      medium: '0 4px 6px rgba(236, 72, 153, 0.1)',
      large: '0 10px 15px rgba(236, 72, 153, 0.1)',
    },
    animations: {
      duration: '0.3s',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  velocity: {
    id: 'velocity',
    name: 'Velocity',
    description: 'Dynamic theme with orange and red gradients',
    colors: {
      primary: '#F97316',
      secondary: '#EA580C',
      accent: '#FED7AA',
      background: '#FFF7ED',
      surface: '#FFFFFF',
      text: '#1C1917',
      textSecondary: '#78716C',
    },
    fonts: {
      heading: 'Montserrat, sans-serif',
      body: 'Inter, sans-serif',
    },
    spacing: {
      small: '0.5rem',
      medium: '1rem',
      large: '2rem',
    },
    borderRadius: '0.75rem',
    shadows: {
      small: '0 1px 3px rgba(249, 115, 22, 0.1)',
      medium: '0 4px 6px rgba(249, 115, 22, 0.1)',
      large: '0 10px 15px rgba(249, 115, 22, 0.1)',
    },
    animations: {
      duration: '0.3s',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  quantum: {
    id: 'quantum',
    name: 'Quantum',
    description: 'Futuristic theme with neon accents',
    colors: {
      primary: '#8B5CF6',
      secondary: '#7C3AED',
      accent: '#C4B5FD',
      background: '#0C0A09',
      surface: '#1C1917',
      text: '#FAFAF9',
      textSecondary: '#A8A29E',
    },
    fonts: {
      heading: 'Orbitron, sans-serif',
      body: 'Inter, sans-serif',
      code: 'JetBrains Mono, monospace',
    },
    spacing: {
      small: '0.5rem',
      medium: '1rem',
      large: '2rem',
    },
    borderRadius: '0.25rem',
    shadows: {
      small: '0 0 10px rgba(139, 92, 246, 0.3)',
      medium: '0 0 20px rgba(139, 92, 246, 0.3)',
      large: '0 0 30px rgba(139, 92, 246, 0.3)',
    },
    animations: {
      duration: '0.3s',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  eclipse: {
    id: 'eclipse',
    name: 'Eclipse',
    description: 'Dark professional theme with subtle highlights',
    colors: {
      primary: '#6366F1',
      secondary: '#4F46E5',
      accent: '#A5B4FC',
      background: '#111827',
      surface: '#1F2937',
      text: '#F9FAFB',
      textSecondary: '#D1D5DB',
    },
    fonts: {
      heading: 'IBM Plex Sans, sans-serif',
      body: 'Inter, sans-serif',
    },
    spacing: {
      small: '0.5rem',
      medium: '1rem',
      large: '2rem',
    },
    borderRadius: '0.5rem',
    shadows: {
      small: '0 1px 3px rgba(99, 102, 241, 0.1)',
      medium: '0 4px 6px rgba(99, 102, 241, 0.1)',
      large: '0 10px 15px rgba(99, 102, 241, 0.1)',
    },
    animations: {
      duration: '0.3s',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  custom: {
    id: 'custom',
    name: 'Custom',
    description: 'User-defined custom theme',
    colors: {
      primary: '#3B82F6',
      secondary: '#1D4ED8',
      accent: '#93C5FD',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      text: '#111827',
      textSecondary: '#6B7280',
    },
    fonts: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif',
    },
    spacing: {
      small: '0.5rem',
      medium: '1rem',
      large: '2rem',
    },
    borderRadius: '0.5rem',
    shadows: {
      small: '0 1px 3px rgba(0, 0, 0, 0.1)',
      medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
      large: '0 10px 15px rgba(0, 0, 0, 0.1)',
    },
    animations: {
      duration: '0.3s',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};

export const getTheme = (themeType: ThemeType, customTheme?: ThemeProperties): ThemeProperties => {
  if (themeType === 'custom' && customTheme) {
    return customTheme;
  }
  return defaultThemes[themeType] || defaultThemes.mystique;
};

export const createCustomTheme = (baseTheme: ThemeType, overrides: Partial<ThemeProperties>): ThemeProperties => {
  const base = defaultThemes[baseTheme];
  return {
    ...base,
    ...overrides,
    id: 'custom',
    name: overrides.name || 'Custom Theme',
    colors: {
      ...base.colors,
      ...overrides.colors,
    },
    fonts: {
      ...base.fonts,
      ...overrides.fonts,
    },
    spacing: {
      ...base.spacing,
      ...overrides.spacing,
    },
    shadows: {
      ...base.shadows,
      ...overrides.shadows,
    },
    animations: {
      ...base.animations,
      ...overrides.animations,
    },
  };
};

export const themeList = Object.values(defaultThemes).filter(theme => theme.id !== 'custom');

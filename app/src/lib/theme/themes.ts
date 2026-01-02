export interface Theme {
  id: string
  name: string
  description?: string
  colors: {
    // Core palette
    background: string
    backgroundSubtle: string
    backgroundElevated: string
    backgroundElevatedRgb: string
    
    foreground: string
    foregroundMuted: string
    foregroundSubtle: string
    
    // Accent colors
    accent: string
    accentGlow: string
    accentMuted: string
    
    secondary: string
    secondaryMuted: string
    
    // States
    success: string
    warning: string
    error: string
    
    // Borders & surfaces
    border: string
    borderFocus: string
    borderSubtle: string
    surfaceGlass: string
    
    // Shadows
    shadowGlow: string
    shadowSoft: string
  }
}

export const themes: Record<string, Theme> = {
  dark: {
    id: 'dark',
    name: 'Dark',
    description: 'Deep night sky with aurora accents',
    colors: {
      background: '#0c0e1a',
      backgroundSubtle: '#12152a',
      backgroundElevated: '#1a1e3a',
      backgroundElevatedRgb: '26, 30, 58',
      
      foreground: '#e8eaf6',
      foregroundMuted: '#9fa8da',
      foregroundSubtle: '#8293f3',
      
      accent: '#b093ff',
      accentGlow: '#c4a2ff',
      accentMuted: '#574992',
      
      secondary: '#c5cae9',
      secondaryMuted: '#7986cb',
      
      success: '#69f0ae',
      warning: '#ffd54f',
      error: '#ff5252',
      
      border: 'rgba(156, 163, 220, 0.15)',
      borderFocus: 'rgba(124, 77, 255, 0.5)',
      borderSubtle: 'rgba(156, 163, 220, 0.08)',
      surfaceGlass: 'rgba(26, 30, 58, 0.7)',
      
      shadowGlow: '0 0 40px rgba(124, 77, 255, 0.15)',
      shadowSoft: '0 4px 24px rgba(0, 0, 0, 0.3)',
    }
  },
  
  light: {
    id: 'light',
    name: 'Light',
    description: 'Soft daylight with subtle accents',
    colors: {
      background: '#f5f5ff',
      backgroundSubtle: '#e8eaf6',
      backgroundElevated: '#ffffff',
      backgroundElevatedRgb: '255, 255, 255',
      
      foreground: '#1a1e3a',
      foregroundMuted: '#3f51b5',
      foregroundSubtle: '#7986cb',
      
      accent: '#7c4dff',
      accentGlow: '#9575ff',
      accentMuted: '#b39ddb',
      
      secondary: '#3f51b5',
      secondaryMuted: '#7986cb',
      
      success: '#00c853',
      warning: '#ffa000',
      error: '#d32f2f',
      
      border: 'rgba(63, 81, 181, 0.15)',
      borderFocus: 'rgba(124, 77, 255, 0.5)',
      borderSubtle: 'rgba(63, 81, 181, 0.08)',
      surfaceGlass: 'rgba(255, 255, 255, 0.8)',
      
      shadowGlow: '0 0 40px rgba(124, 77, 255, 0.1)',
      shadowSoft: '0 4px 24px rgba(0, 0, 0, 0.08)',
    }
  },
  
  aurora: {
    id: 'aurora',
    name: 'Aurora Borealis',
    description: 'Northern lights with ethereal greens',
    colors: {
      background: '#0a0e1f',
      backgroundSubtle: '#0f1528',
      backgroundElevated: '#1a2035',
      backgroundElevatedRgb: '26, 32, 53',
      
      foreground: '#e0f7fa',
      foregroundMuted: '#80deea',
      foregroundSubtle: '#4dd0e1',
      
      accent: '#00ff9f',
      accentGlow: '#00ffcc',
      accentMuted: '#00796b',
      
      secondary: '#26c6da',
      secondaryMuted: '#0097a7',
      
      success: '#00e676',
      warning: '#ffab40',
      error: '#ff5252',
      
      border: 'rgba(0, 255, 159, 0.15)',
      borderFocus: 'rgba(0, 255, 159, 0.5)',
      borderSubtle: 'rgba(0, 255, 159, 0.08)',
      surfaceGlass: 'rgba(26, 32, 53, 0.7)',
      
      shadowGlow: '0 0 40px rgba(0, 255, 159, 0.15)',
      shadowSoft: '0 4px 24px rgba(0, 0, 0, 0.3)',
    }
  },
  
  midnight: {
    id: 'midnight',
    name: 'Midnight Blue',
    description: 'Deep ocean blues with silver highlights',
    colors: {
      background: '#0d1117',
      backgroundSubtle: '#161b22',
      backgroundElevated: '#21262d',
      backgroundElevatedRgb: '33, 38, 45',
      
      foreground: '#c9d1d9',
      foregroundMuted: '#8b949e',
      foregroundSubtle: '#6e7681',
      
      accent: '#58a6ff',
      accentGlow: '#79c0ff',
      accentMuted: '#1f6feb',
      
      secondary: '#7ee787',
      secondaryMuted: '#3fb950',
      
      success: '#3fb950',
      warning: '#d29922',
      error: '#f85149',
      
      border: 'rgba(88, 166, 255, 0.15)',
      borderFocus: 'rgba(88, 166, 255, 0.5)',
      borderSubtle: 'rgba(88, 166, 255, 0.08)',
      surfaceGlass: 'rgba(33, 38, 45, 0.7)',
      
      shadowGlow: '0 0 40px rgba(88, 166, 255, 0.15)',
      shadowSoft: '0 4px 24px rgba(0, 0, 0, 0.3)',
    }
  },
}

export function getThemeById(id: string): Theme {
  return themes[id] || themes.dark
}


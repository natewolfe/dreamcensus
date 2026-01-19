'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

export type ThemeName = 'dawn' | 'day' | 'dusk' | 'night'
export type ThemePreference = ThemeName | 'auto'

interface ThemeContextValue {
  preference: ThemePreference
  resolved: ThemeName
  setPreference: (pref: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

/**
 * Determine theme based on current time
 * Dawn: 6am-11am, Day: 11am-5pm, Dusk: 5pm-10pm, Night: 10pm-6am
 */
function getTimeBasedTheme(): ThemeName {
  const hour = new Date().getHours()
  
  if (hour >= 6 && hour < 11) return 'dawn'
  if (hour >= 11 && hour < 17) return 'day'
  if (hour >= 17 && hour < 22) return 'dusk'
  return 'night'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('auto')
  const [resolved, setResolved] = useState<ThemeName>('night')
  const [mounted, setMounted] = useState(false)

  // Load saved preference on mount
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('theme-preference') as ThemePreference | null
    if (saved && ['auto', 'dawn', 'day', 'dusk', 'night'].includes(saved)) {
      setPreferenceState(saved)
    }
  }, [])

  // Resolve theme and apply to document
  useEffect(() => {
    if (!mounted) return

    const updateTheme = () => {
      const newResolved = preference === 'auto' ? getTimeBasedTheme() : preference
      setResolved(newResolved)
      
      // Apply theme class to html element
      document.documentElement.className = document.documentElement.className
        .split(' ')
        .filter(cls => !cls.startsWith('theme-'))
        .concat(`theme-${newResolved}`)
        .join(' ')
    }

    updateTheme()

    // Auto-update every minute when in auto mode
    if (preference === 'auto') {
      const interval = setInterval(updateTheme, 60000) // Check every minute
      return () => clearInterval(interval)
    }
  }, [preference, mounted])

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref)
    localStorage.setItem('theme-preference', pref)
  }, [])

  // Always provide context, but use safe defaults before mounting
  // to prevent hydration mismatch while still allowing useTheme() to work
  return (
    <ThemeContext.Provider value={{ preference, resolved, setPreference }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}


'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { themes, getThemeById } from './themes'
import type { Theme } from './themes'

interface ThemeContextValue {
  theme: string
  setTheme: (theme: string) => void
  themes: typeof themes
  currentTheme: Theme
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

interface ThemeProviderProps {
  children: React.ReactNode
  initialTheme?: string
}

export function ThemeProvider({ children, initialTheme = 'dark' }: ThemeProviderProps) {
  const [theme, setThemeState] = useState(initialTheme)
  const [mounted, setMounted] = useState(false)
  
  // Apply theme to DOM
  const applyTheme = useCallback((themeId: string) => {
    const themeConfig = getThemeById(themeId)
    if (!themeConfig) return
    
    const root = document.documentElement
    Object.entries(themeConfig.colors).forEach(([key, value]) => {
      // Convert camelCase to kebab-case
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
      root.style.setProperty(cssVar, value)
    })
  }, [])
  
  const setTheme = useCallback(async (newTheme: string) => {
    if (!themes[newTheme]) {
      console.warn(`Theme "${newTheme}" not found, falling back to dark`)
      newTheme = 'dark'
    }
    
    setThemeState(newTheme)
    
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('dream-census-theme', newTheme)
    }
    
    // Update CSS variables
    applyTheme(newTheme)
    
    // Persist to database (background, fire and forget)
    try {
      await fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme }),
      })
    } catch (error) {
      console.error('Failed to persist theme preference:', error)
    }
  }, [applyTheme])
  
  // Initialize theme on mount
  useEffect(() => {
    setMounted(true)
    
    // Priority: localStorage > initialTheme (from server) > system preference
    let selectedTheme = initialTheme
    
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('dream-census-theme')
      if (stored && themes[stored]) {
        selectedTheme = stored
      } else if (!initialTheme || initialTheme === 'dark') {
        // If no stored preference and no server preference, check system
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        selectedTheme = prefersDark ? 'dark' : 'light'
      }
    }
    
    setThemeState(selectedTheme)
    applyTheme(selectedTheme)
  }, [initialTheme, applyTheme])
  
  // Prevent flash of unstyled content
  if (!mounted) {
    return <>{children}</>
  }
  
  const currentTheme = getThemeById(theme)
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes, currentTheme }}>
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


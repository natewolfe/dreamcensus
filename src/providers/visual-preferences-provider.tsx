'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'

interface VisualPreferences {
  enhancedAnimations: boolean
}

interface VisualPreferencesContextValue {
  preferences: VisualPreferences
  setEnhancedAnimations: (enabled: boolean) => void
}

const VisualPreferencesContext = createContext<VisualPreferencesContextValue | null>(null)

const DEFAULT_PREFERENCES: VisualPreferences = {
  enhancedAnimations: true,
}

export function VisualPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<VisualPreferences>(DEFAULT_PREFERENCES)
  const [mounted, setMounted] = useState(false)

  // Load saved preferences on mount
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('visual-preferences')
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<VisualPreferences>
        setPreferences({
          enhancedAnimations: parsed.enhancedAnimations ?? DEFAULT_PREFERENCES.enhancedAnimations,
        })
      } catch (e) {
        // Invalid JSON, use defaults
        console.error('Failed to parse visual preferences:', e)
      }
    }
  }, [])

  const setEnhancedAnimations = useCallback((enabled: boolean) => {
    const newPreferences = { ...preferences, enhancedAnimations: enabled }
    setPreferences(newPreferences)
    if (mounted) {
      localStorage.setItem('visual-preferences', JSON.stringify(newPreferences))
    }
  }, [preferences, mounted])

  return (
    <VisualPreferencesContext.Provider value={{ preferences, setEnhancedAnimations }}>
      {children}
    </VisualPreferencesContext.Provider>
  )
}

export function useVisualPreferences() {
  const context = useContext(VisualPreferencesContext)
  if (!context) {
    throw new Error('useVisualPreferences must be used within VisualPreferencesProvider')
  }
  return context
}

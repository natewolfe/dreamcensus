'use client'

import { useState, useEffect } from 'react'
import { useVisualPreferences } from './use-visual-preferences'

export function useEnhancedAnimations(): boolean {
  const { preferences } = useVisualPreferences()
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Return false until mounted to avoid hydration mismatch
  if (!mounted) {
    return false
  }

  return !prefersReducedMotion && preferences.enhancedAnimations
}

'use client'

import { useEnhancedAnimations } from '@/hooks/use-enhanced-animations'

export interface DreamMistProps {
  intensity?: 'subtle' | 'medium'
}

export function DreamMist({ intensity = 'subtle' }: DreamMistProps) {
  const showEffects = useEnhancedAnimations()

  if (!showEffects) return null

  return (
    <div
      className="dream-mist-layer pointer-events-none fixed inset-0 z-0"
      style={
        {
          '--mist-intensity': intensity === 'medium' ? 1 : 0.6,
        } as React.CSSProperties
      }
      aria-hidden="true"
    />
  )
}

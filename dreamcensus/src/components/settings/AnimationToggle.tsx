'use client'

import { useVisualPreferences } from '@/hooks/use-visual-preferences'
import { Toggle } from '@/components/ui'

export function AnimationToggle() {
  const { preferences, setEnhancedAnimations } = useVisualPreferences()

  return (
    <Toggle
      options={['on', 'off'] as const}
      value={preferences.enhancedAnimations ? 'on' : 'off'}
      onChange={(value) => setEnhancedAnimations(value === 'on')}
      labels={{
        on: 'Enhanced',
        off: 'Minimal',
      }}
      size="md"
      className="max-w-xs"
    />
  )
}

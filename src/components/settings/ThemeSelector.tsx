'use client'

import { motion } from 'motion/react'
import { useTheme, type ThemePreference } from '@/hooks/use-theme'
import { Card } from '@/components/ui'
import { cn } from '@/lib/utils'

const THEME_OPTIONS: Array<{
  value: ThemePreference
  label: string
  description: string
  colors: {
    bg: string
    fg: string
    accent: string
  }
}> = [
  {
    value: 'auto',
    label: 'Auto',
    description: 'Changes based on time of day',
    colors: {
      bg: 'linear-gradient(135deg, #e8f0f5 0%, #faf9f7 25%, #2a2030 50%, #0c0e1a 75%)',
      fg: '#2d3748',
      accent: '#d4a574',
    },
  },
  {
    value: 'dawn',
    label: 'Dawn',
    description: 'Soft pale blue and light tan',
    colors: {
      bg: '#e8f0f5',
      fg: '#2d3748',
      accent: '#d4a574',
    },
  },
  {
    value: 'day',
    label: 'Day',
    description: 'Bright off-white with gold accents',
    colors: {
      bg: '#faf9f7',
      fg: '#1a1a1a',
      accent: '#c9a227',
    },
  },
  {
    value: 'dusk',
    label: 'Dusk',
    description: 'Warm gold and mauve',
    colors: {
      bg: '#2a2030',
      fg: '#f0e8e0',
      accent: '#d4a054',
    },
  },
  {
    value: 'night',
    label: 'Night',
    description: 'Dark blue-purple with silver-cyan',
    colors: {
      bg: '#0c0e1a',
      fg: '#e8eaf6',
      accent: '#7ec8c8',
    },
  },
]

export function ThemeSelector() {
  const { preference, resolved, setPreference } = useTheme()

  return (
    <div className="space-y-3">
      {THEME_OPTIONS.map((option) => {
        const isSelected = preference === option.value
        const isActive = resolved === option.value || (preference === 'auto' && option.value === 'auto')

        return (
          <motion.button
            key={option.value}
            onClick={() => setPreference(option.value)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full"
          >
            <Card
              variant={isSelected ? 'elevated' : 'interactive'}
              padding="md"
            >
              <div className="flex items-center gap-4">
                {/* Color swatch */}
                <div className="relative flex-shrink-0">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-lg border-2 transition-all',
                      isSelected ? 'border-accent' : 'border-border'
                    )}
                    style={{
                      background: option.colors.bg,
                    }}
                  >
                    {/* Small accent dot */}
                    <div
                      className="absolute bottom-1 right-1 w-3 h-3 rounded-full"
                      style={{ backgroundColor: option.colors.accent }}
                    />
                  </div>
                  
                  {/* Active indicator */}
                  {isActive && preference === 'auto' && option.value !== 'auto' && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>

                {/* Label */}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">
                      {option.label}
                    </h4>
                    {isActive && preference === 'auto' && option.value !== 'auto' && (
                      <span className="text-xs text-accent">Active</span>
                    )}
                  </div>
                  <p className="text-sm text-muted">
                    {option.description}
                  </p>
                </div>

                {/* Selection indicator */}
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center',
                    isSelected
                      ? 'border-accent bg-accent'
                      : 'border-border'
                  )}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            </Card>
          </motion.button>
        )
      })}

      {/* Info note */}
      {preference === 'auto' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-muted px-2"
        >
          Auto mode cycles: Dawn (5-8am) → Day (8am-6pm) → Dusk (6-9pm) → Night (9pm-5am)
        </motion.div>
      )}
    </div>
  )
}


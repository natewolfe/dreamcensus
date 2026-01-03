'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

type LucidityValue = 'no' | 'maybe' | 'yes' | null

interface LucidityToggleProps {
  value: LucidityValue
  onChange: (value: 'no' | 'maybe' | 'yes') => void
}

const OPTIONS = [
  { value: 'no' as const, label: 'No' },
  { value: 'maybe' as const, label: 'Maybe' },
  { value: 'yes' as const, label: 'Yes' },
] as const

export function LucidityToggle({ value, onChange }: LucidityToggleProps) {
  const selectedIndex = value ? OPTIONS.findIndex(o => o.value === value) : -1

  return (
    <div
      role="radiogroup"
      aria-label="Were you aware it was a dream?"
      className="relative flex rounded-full bg-card-bg border border-border p-1"
    >
      {/* Sliding indicator */}
      {value && (
        <motion.div
          layoutId="lucidity-indicator"
          className="absolute inset-y-1 rounded-full bg-accent"
          style={{ 
            width: `${100 / OPTIONS.length}%`,
            left: `${(selectedIndex / OPTIONS.length) * 100}%` 
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}

      {OPTIONS.map((option) => (
        <button
          key={option.value}
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'relative flex-1 px-6 py-2 rounded-full text-sm font-medium',
            'transition-colors duration-200 z-10',
            value === option.value
              ? 'text-white'
              : 'text-muted hover:text-foreground'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}


'use client'

import { useRef, useState, useLayoutEffect } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

type LucidityValue = 'no' | 'maybe' | 'yes' | null

interface LucidityToggleProps {
  value: LucidityValue
  onChange: (value: 'no' | 'maybe' | 'yes') => void
  /** Called after selection for auto-advance */
  onCommit?: () => void
}

const OPTIONS = [
  { value: 'no' as const, label: 'No' },
  { value: 'maybe' as const, label: 'Not Sure' },
  { value: 'yes' as const, label: 'Yes' },
] as const

export function LucidityToggle({ value, onChange, onCommit }: LucidityToggleProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

  // Measure selected button position
  useLayoutEffect(() => {
    if (!value || !containerRef.current) return
    
    const selectedButton = containerRef.current.querySelector(
      `[data-value="${value}"]`
    ) as HTMLButtonElement
    
    if (selectedButton) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const buttonRect = selectedButton.getBoundingClientRect()
      setIndicatorStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      })
    }
  }, [value])

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label="Were you aware it was a dream?"
      className="relative inline-flex rounded-full bg-card-bg border border-border p-1"
    >
      {/* Sliding indicator */}
      {value && (
        <motion.div
          layoutId="lucidity-indicator"
          className="absolute inset-y-1 rounded-full bg-accent"
          animate={indicatorStyle}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}

      {OPTIONS.map((option, index) => {
        const selectedIndex = value ? OPTIONS.findIndex(o => o.value === value) : -1
        // Hide divider if it's adjacent to selected option
        const showDivider = index > 0 && index !== selectedIndex && index !== selectedIndex + 1

        return (
          <div key={option.value} className="relative flex items-center">
            {/* Divider */}
            {index > 0 && (
              <div
                className={cn(
                  'absolute left-0 top-1/2 -translate-y-1/2 w-px h-4 bg-border transition-opacity duration-200',
                  showDivider ? 'opacity-100' : 'opacity-0'
                )}
              />
            )}
            <button
              data-value={option.value}
              role="radio"
              aria-checked={value === option.value}
              onClick={() => {
                onChange(option.value)
                onCommit?.()
              }}
              className={cn(
                'relative px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap',
                'transition-colors duration-200 z-10',
                value === option.value
                  ? 'text-foreground'
                  : 'text-muted hover:text-foreground'
              )}
            >
              {option.label}
            </button>
          </div>
        )
      })}
    </div>
  )
}


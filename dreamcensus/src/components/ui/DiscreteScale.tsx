'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export interface DiscreteScaleProps {
  min: number
  max: number
  value: number | null
  onChange: (value: number) => void
  minLabel?: string
  maxLabel?: string
  showLabels?: boolean
  disabled?: boolean
  className?: string
  /** Called after selection for auto-advance */
  onCommit?: () => void
}

export function DiscreteScale({
  min,
  max,
  value,
  onChange,
  minLabel,
  maxLabel,
  showLabels = true,
  disabled = false,
  className,
  onCommit,
}: DiscreteScaleProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null)
  
  const range = max - min
  const steps = range + 1
  // Display value for future visual feedback
  const _displayValue = hoveredValue ?? value
  void _displayValue

  return (
    <div className={cn('space-y-4', className)}>
      {/* Labels */}
      {showLabels && (minLabel || maxLabel) && (
        <div className="flex justify-between text-sm text-muted">
          <span className="max-w-[40%] text-left">{minLabel ?? min}</span>
          <span className="max-w-[40%] text-right">{maxLabel ?? max}</span>
        </div>
      )}

      {/* Scale buttons */}
      <div className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: steps }, (_, i) => {
          const stepValue = min + i
          const isSelected = value === stepValue
          const isHovered = hoveredValue === stepValue

          return (
            <motion.button
              key={stepValue}
              type="button"
              onClick={() => {
                onChange(stepValue)
                onCommit?.()
              }}
              onMouseEnter={() => setHoveredValue(stepValue)}
              onMouseLeave={() => setHoveredValue(null)}
              disabled={disabled}
              whileHover={!disabled ? { scale: 1.1 } : undefined}
              whileTap={!disabled ? { scale: 0.95 } : undefined}
              className={cn(
                'w-12 h-12 rounded-lg',
                'flex flex-1 items-center justify-center',
                'text-md font-medium transition-all',
                'border-2 focus:outline-none focus:ring-2 focus:ring-offset-2',
                isSelected && 'bg-muted border-muted text-foreground shadow-lg shadow-muted/30',
                !isSelected && isHovered && 'border-accent/50 bg-accent/10 text-accent',
                !isSelected && !isHovered && 'border-border bg-card-bg text-muted hover:text-foreground',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              aria-label={`${stepValue}`}
              aria-pressed={isSelected}
            >
              {stepValue}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}


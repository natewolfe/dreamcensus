'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export type FrequencyAnchorSet = 'standard' | 'temporal' | 'agreement'

export interface FrequencyScaleProps {
  value: number | null
  onChange: (value: number) => void
  anchorSet?: FrequencyAnchorSet
  steps?: 5 | 7
  allowNA?: boolean
  disabled?: boolean
  className?: string
  /** Called after selection for auto-advance */
  onCommit?: () => void
}

/** Anchor labels: [low, middle, high] */
const ANCHOR_LABELS: Record<FrequencyAnchorSet, Record<5 | 7, [string, string, string]>> = {
  standard: {
    5: ['Never', 'Sometimes', 'Very often'],
    7: ['Never', 'Sometimes', 'Always'],
  },
  temporal: {
    5: ['Never', 'Weekly', 'Multiple times daily'],
    7: ['Never', 'Weekly', 'Constantly'],
  },
  agreement: {
    5: ['Strongly disagree', 'Neutral', 'Strongly agree'],
    7: ['Strongly disagree', 'Neutral', 'Strongly agree'],
  },
}

export function FrequencyScale({
  value,
  onChange,
  anchorSet = 'standard',
  steps = 5,
  allowNA = false,
  disabled = false,
  className,
  onCommit,
}: FrequencyScaleProps) {
  const [lowLabel, midLabel, highLabel] = ANCHOR_LABELS[anchorSet][steps]

  // Build numeric options 1 through steps
  const options = Array.from({ length: steps }, (_, i) => i + 1)

  const handleSelect = (optionValue: number) => {
    if (disabled) return
    onChange(optionValue)
    onCommit?.()
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Anchor labels: low, middle, high */}
      <div className="flex text-xs text-muted px-1">
        <span className="flex-1 text-left">{lowLabel}</span>
        <span className="flex-1 text-center">{midLabel}</span>
        <span className="flex-1 text-right">{highLabel}</span>
      </div>

      {/* Number buttons */}
      <div className="flex gap-1.5">
        {options.map((num) => {
          const isSelected = value === num

          return (
            <motion.button
              key={num}
              type="button"
              onClick={() => handleSelect(num)}
              disabled={disabled}
              whileHover={!disabled ? { scale: 1.08 } : undefined}
              whileTap={!disabled ? { scale: 0.95 } : undefined}
              className={cn(
                'flex-1 rounded-lg py-4 text-md font-semibold transition-all',
                'border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent',
                isSelected && 'bg-muted border-muted text-foreground shadow-md',
                !isSelected && 'border-border bg-card-bg text-muted hover:text-foreground hover:border-accent/50',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              aria-pressed={isSelected}
              aria-label={`${num} of ${steps}`}
            >
              {num}
            </motion.button>
          )
        })}

        {/* N/A option */}
        {allowNA && (
          <motion.button
            type="button"
            onClick={() => handleSelect(-1)}
            disabled={disabled}
            whileHover={!disabled ? { scale: 1.08 } : undefined}
            whileTap={!disabled ? { scale: 0.95 } : undefined}
            className={cn(
              'px-3 py-2 rounded-lg text-xs font-medium transition-all ml-2',
              'border-2 border-dashed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent',
              value === -1 && 'bg-muted/20 border-muted text-muted',
              value !== -1 && 'border-border bg-card-bg text-muted hover:text-foreground hover:border-accent/50',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            aria-pressed={value === -1}
            aria-label="Not applicable"
          >
            N/A
          </motion.button>
        )}
      </div>
    </div>
  )
}


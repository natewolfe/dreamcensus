'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { BINARY_VARIANT_CONFIG, type BinaryVariant, type BinaryValue } from '@/lib/flow/types'

export type { BinaryVariant, BinaryValue }

export interface BinaryButtonsProps {
  variant: BinaryVariant
  value: BinaryValue | null
  onChange: (value: BinaryValue) => void
  disabled?: boolean
  className?: string
  /** Called after selection for auto-advance */
  onCommit?: () => void
}

export function BinaryButtons({
  variant,
  value,
  onChange,
  disabled = false,
  className,
  onCommit,
}: BinaryButtonsProps) {
  const config = BINARY_VARIANT_CONFIG[variant]
  const isLeftSelected = value === config.left
  const isRightSelected = value === config.right
  
  const handleSelect = (val: BinaryValue) => {
    if (disabled) return
    onChange(val)
    onCommit?.()
  }

  return (
    <div className={cn('flex', className)}>
      {/* Left button (No/Disagree/False) */}
      <motion.button
        type="button"
        onClick={() => handleSelect(config.left)}
        disabled={disabled}
        whileTap={!disabled ? { scale: 0.98 } : undefined}
        className={cn(
          'flex-1 rounded-l-xl px-6 py-4 text-lg font-medium transition-all',
          'border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:z-10 uppercase',
          isLeftSelected
            ? 'bg-[var(--response-no-bg)] border-[var(--response-no)] text-[var(--response-no)] z-10'
            : 'bg-card-bg border-border text-muted hover:bg-[var(--response-no-bg)] hover:text-[var(--response-no)] hover:border-[var(--response-no)] hover:z-10',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        aria-pressed={isLeftSelected}
      >
        {config.leftLabel}
      </motion.button>

      {/* Right button (Yes/Agree/True) - overlaps left border with -ml-0.5 */}
      <motion.button
        type="button"
        onClick={() => handleSelect(config.right)}
        disabled={disabled}
        whileTap={!disabled ? { scale: 0.98 } : undefined}
        className={cn(
          'flex-1 rounded-r-xl px-6 py-4 text-lg font-medium transition-all -ml-0.5',
          'border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:z-10 uppercase',
          isRightSelected
            ? 'bg-[var(--response-yes-bg)] border-[var(--response-yes)] text-[var(--response-yes)] z-10'
            : 'bg-card-bg border-border text-muted hover:bg-[var(--response-yes-bg)] hover:text-[var(--response-yes)] hover:border-[var(--response-yes)]',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        aria-pressed={isRightSelected}
      >
        {config.rightLabel}
      </motion.button>
    </div>
  )
}


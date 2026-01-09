'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import type { BinaryVariant, BinaryValue } from '@/lib/flow/types'

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

const VARIANT_CONFIG: Record<BinaryVariant, { left: BinaryValue; right: BinaryValue; leftLabel: string; rightLabel: string }> = {
  yes_no: {
    left: 'no',
    right: 'yes',
    leftLabel: 'No',
    rightLabel: 'Yes',
  },
  agree_disagree: {
    left: 'disagree',
    right: 'agree',
    leftLabel: 'Disagree',
    rightLabel: 'Agree',
  },
  true_false: {
    left: 'false',
    right: 'true',
    leftLabel: 'False',
    rightLabel: 'True',
  },
}

export function BinaryButtons({
  variant,
  value,
  onChange,
  disabled = false,
  className,
  onCommit,
}: BinaryButtonsProps) {
  const config = VARIANT_CONFIG[variant]
  const isLeftSelected = value === config.left
  const isRightSelected = value === config.right
  
  const handleSelect = (val: BinaryValue) => {
    if (disabled) return
    onChange(val)
    onCommit?.()
  }

  return (
    <div className={cn('flex gap-3', className)}>
      {/* Left button (No/Disagree/False) */}
      <motion.button
        type="button"
        onClick={() => handleSelect(config.left)}
        disabled={disabled}
        whileHover={!disabled ? { scale: 1.02 } : undefined}
        whileTap={!disabled ? { scale: 0.98 } : undefined}
        className={cn(
          'flex-1 rounded-xl px-6 py-4 text-lg font-medium transition-all',
          'border-2 focus:outline-none focus:ring-2 focus:ring-offset-2',
          isLeftSelected
            ? 'bg-[var(--response-no)] border-[var(--response-no)] text-foreground shadow-lg'
            : 'bg-[var(--response-no-bg)] border-[var(--response-no)] text-[var(--response-no)] hover:bg-[var(--response-no)] hover:text-foreground',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        aria-pressed={isLeftSelected}
      >
        {config.leftLabel}
      </motion.button>

      {/* Right button (Yes/Agree/True) */}
      <motion.button
        type="button"
        onClick={() => handleSelect(config.right)}
        disabled={disabled}
        whileHover={!disabled ? { scale: 1.02 } : undefined}
        whileTap={!disabled ? { scale: 0.98 } : undefined}
        className={cn(
          'flex-1 rounded-xl px-6 py-4 text-lg font-medium transition-all',
          'border-2 focus:outline-none focus:ring-2 focus:ring-offset-2',
          isRightSelected
            ? 'bg-[var(--response-yes)] border-[var(--response-yes)] text-foreground shadow-lg'
            : 'bg-[var(--response-yes-bg)] border-[var(--response-yes)] text-[var(--response-yes)] hover:bg-[var(--response-yes)] hover:text-foreground',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        aria-pressed={isRightSelected}
      >
        {config.rightLabel}
      </motion.button>
    </div>
  )
}


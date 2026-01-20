'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export interface ProgressBarProps {
  /** Progress value (0-100) */
  value: number
  /** Size variant */
  size?: 'sm' | 'md'
  /** Visual variant */
  variant?: 'default' | 'subtle'
  /** Optional animation delay in seconds */
  animationDelay?: number
  /** Additional CSS classes */
  className?: string
}

const sizeStyles = {
  sm: 'h-1',
  md: 'h-2',
}

const variantStyles = {
  default: {
    container: 'bg-subtle/30',
    bar: 'bg-accent',
  },
  subtle: {
    container: 'bg-subtle/20',
    bar: 'bg-accent',
  },
}

/**
 * Animated progress bar component
 * Used across Census forms, flow navigation, and overview screens
 */
export function ProgressBar({
  value,
  size = 'sm',
  variant = 'default',
  animationDelay = 0,
  className,
}: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(100, value))
  const styles = variantStyles[variant]

  return (
    <div
      className={cn(
        'rounded-full overflow-hidden',
        sizeStyles[size],
        styles.container,
        className
      )}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clampedValue}%` }}
        transition={{
          duration: 0.6,
          ease: 'easeOut',
          delay: animationDelay,
        }}
        className={cn('h-full', styles.bar)}
      />
    </div>
  )
}

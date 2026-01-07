'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  'aria-label'?: string
}

const sizeStyles = {
  sm: { track: 'w-9 h-5', knob: 'w-4 h-4', travel: 16 },
  md: { track: 'w-11 h-6', knob: 'w-5 h-5', travel: 20 },
  lg: { track: 'w-14 h-7', knob: 'w-6 h-6', travel: 28 },
}

export function Switch({
  checked,
  onChange,
  size = 'md',
  disabled = false,
  className,
  'aria-label': ariaLabel,
}: SwitchProps) {
  const styles = sizeStyles[size]

  return (
    <motion.button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      whileHover={disabled ? undefined : { scale: 1.07 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={cn(
        'relative rounded-full transition-all duration-300 cursor-pointer',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
        styles.track,
        checked ? 'bg-accent' : 'bg-subtle/50',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
    >
      <motion.div
        className={cn(
          'absolute top-0.5 left-0.5 bg-white rounded-full shadow-sm',
          styles.knob
        )}
        animate={{
          x: checked ? styles.travel : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
      />
    </motion.button>
  )
}

'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export interface EmojiCardProps {
  /** Emoji to display */
  emoji: string
  /** Primary label */
  label: string
  /** Optional description below label */
  description?: string
  /** Whether this card is selected */
  selected: boolean
  /** Callback when selection changes */
  onChange: (selected: boolean) => void
  /** Size variant */
  size?: 'sm' | 'md'
  /** Additional class name */
  className?: string
}

const sizeClasses = {
  sm: {
    container: 'p-3 min-w-[64px]',
    emoji: 'text-2xl',
    label: 'text-xs',
    description: 'text-[10px]',
  },
  md: {
    container: 'px-6 py-4 min-w-[100px]',
    emoji: 'text-2xl',
    label: 'text-sm',
    description: 'text-xs',
  },
}

/**
 * Card with emoji, label, and optional description
 * Used for flag selection (lucid, nightmare, recurring) and mood selection
 */
export function EmojiCard({
  emoji,
  label,
  description,
  selected,
  onChange,
  size = 'md',
  className,
}: EmojiCardProps) {
  const sizes = sizeClasses[size]

  return (
    <motion.button
      type="button"
      onClick={() => onChange(!selected)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'flex flex-col items-center gap-2 rounded-xl transition-all',
        'border-2',
        sizes.container,
        selected
          ? 'bg-accent/20 border-accent text-foreground'
          : 'bg-subtle/30 border-border text-muted hover:border-accent/50',
        className
      )}
    >
      <span className={sizes.emoji}>{emoji}</span>
      <span className={cn('font-medium', sizes.label)}>{label}</span>
      {description && (
        <span className={cn('text-muted text-center', sizes.description)}>
          {description}
        </span>
      )}
    </motion.button>
  )
}

export interface EmojiCardGroupProps {
  /** Options to display */
  options: Array<{
    value: string
    emoji: string
    label: string
    description?: string
  }>
  /** Currently selected value (single select) */
  value: string | null
  /** Callback when selection changes */
  onChange: (value: string | null) => void
  /** Size variant */
  size?: 'sm' | 'md'
  /** Additional class name */
  className?: string
  /** Called after selection for auto-advance */
  onCommit?: () => void
}

/**
 * Group of EmojiCards for single-select patterns (like mood selection)
 */
export function EmojiCardGroup({
  options,
  value,
  onChange,
  size = 'md',
  className,
  onCommit,
}: EmojiCardGroupProps) {
  return (
    <div className={cn('flex flex-wrap justify-center gap-3', className)}>
      {options.map((option) => (
        <EmojiCard
          key={option.value}
          emoji={option.emoji}
          label={option.label}
          description={option.description}
          selected={value === option.value}
          onChange={(selected) => {
            onChange(selected ? option.value : null)
            if (selected) onCommit?.() // Only commit when selecting, not deselecting
          }}
          size={size}
        />
      ))}
    </div>
  )
}


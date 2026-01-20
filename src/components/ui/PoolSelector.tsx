'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { Input } from './Input'

export interface PoolSelectorProps {
  /** Available options to select from */
  options: string[]
  /** Currently selected values */
  selected: string[]
  /** Callback when selection changes */
  onChange: (selected: string[]) => void
  /** Maximum number of selections allowed */
  max?: number
  /** Allow adding custom values */
  allowCustom?: boolean
  /** Placeholder for custom input */
  customPlaceholder?: string
  /** Show expand button after threshold */
  expandable?: boolean
  /** Number of options to show before expand button */
  expandThreshold?: number
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Additional class name */
  className?: string
}

const sizeClasses = {
  sm: {
    chip: 'h-9 px-4 text-sm',
    icon: 'h-3.5 w-3.5',
  },
  md: {
    chip: 'h-10 px-4 text-sm',
    icon: 'h-4 w-4',
  },
  lg: {
    chip: 'h-11 px-5 text-lg',
    icon: 'h-4 w-4',
  },
}

/**
 * Unified multi-select pool component
 * Replaces: Chips, TagPool, EmotionChips
 */
export function PoolSelector({
  options,
  selected,
  onChange,
  max,
  allowCustom = false,
  customPlaceholder = 'Add...',
  expandable = false,
  expandThreshold = 8,
  size = 'md',
  className,
}: PoolSelectorProps) {
  const [showExpanded, setShowExpanded] = useState(false)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customValue, setCustomValue] = useState('')

  const sizes = sizeClasses[size]
  const atMax = max !== undefined && selected.length >= max

  const handleToggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option))
    } else if (!atMax) {
      onChange([...selected, option])
    }
  }

  const handleAddCustom = () => {
    const trimmed = customValue.trim()
    if (!trimmed) return
    
    // Don't add if already exists (case-insensitive)
    const normalizedExisting = [...options, ...selected].map(t => t.toLowerCase())
    if (normalizedExisting.includes(trimmed.toLowerCase())) {
      setCustomValue('')
      setShowCustomInput(false)
      return
    }

    if (!atMax) {
      onChange([...selected, trimmed])
    }
    setCustomValue('')
    setShowCustomInput(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddCustom()
    } else if (e.key === 'Escape') {
      setCustomValue('')
      setShowCustomInput(false)
    }
  }

  // Determine visible options
  const visibleOptions = expandable && !showExpanded && options.length > expandThreshold
    ? options.slice(0, expandThreshold)
    : options

  // Custom tags that user has added (not in original options)
  const customTags = selected.filter((tag) => !options.includes(tag))

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap gap-2 justify-center">
        {/* Preset options */}
        <AnimatePresence mode="popLayout">
          {visibleOptions.map((option) => {
            const isSelected = selected.includes(option)
            const isDimmed = !isSelected && atMax

            return (
              <motion.button
                key={option}
                type="button"
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => handleToggle(option)}
                disabled={isDimmed}
                whileHover={!isDimmed ? { scale: 1.05 } : undefined}
                whileTap={!isDimmed ? { scale: 0.95 } : undefined}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full',
                  'font-medium border-2 transition-all duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                  sizes.chip,
                  isSelected
                    ? 'bg-muted text-foreground border-muted'
                    : 'bg-transparent text-foreground border-border hover:border-accent',
                  isDimmed && 'opacity-40 cursor-not-allowed'
                )}
                aria-pressed={isSelected}
              >
                {option}
                {isSelected && (
                  <svg className={sizes.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </motion.button>
            )
          })}
        </AnimatePresence>

        {/* Custom tags */}
        {customTags.map((tag) => (
          <motion.button
            key={tag}
            type="button"
            layout
            onClick={() => handleToggle(tag)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full',
              'font-medium border-2 transition-all duration-150',
              'bg-muted text-foreground border-muted',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
              sizes.chip
            )}
            aria-pressed={true}
          >
            {tag}
            <svg className={sizes.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.button>
        ))}

        {/* Expand button */}
        {expandable && !showExpanded && options.length > expandThreshold && (
          <motion.button
            type="button"
            layout
            onClick={() => setShowExpanded(true)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full',
              'font-medium border-2 border-dashed transition-all duration-150',
              'bg-transparent text-muted border-subtle hover:text-foreground hover:border-muted',
              sizes.chip
            )}
          >
            +{options.length - expandThreshold} more
          </motion.button>
        )}

        {/* Custom input */}
        {allowCustom && (
          <AnimatePresence mode="wait">
            {showCustomInput ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="inline-flex items-center gap-2"
              >
                <Input
                  type="text"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleAddCustom}
                  placeholder={customPlaceholder}
                  className="h-9 w-40 text-sm"
                  autoFocus
                />
              </motion.div>
            ) : (
              <motion.button
                key="button"
                type="button"
                onClick={() => setShowCustomInput(true)}
                disabled={atMax}
                whileHover={!atMax ? { scale: 1.05 } : undefined}
                whileTap={!atMax ? { scale: 0.95 } : undefined}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full',
                  'font-medium border-2 border-dashed transition-all duration-150',
                  'bg-transparent text-muted hover:text-foreground hover:border-accent',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                  sizes.chip,
                  atMax && 'opacity-40 cursor-not-allowed'
                )}
              >
                <svg className={sizes.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add
              </motion.button>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}


'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { Input } from './Input'

export interface TagPoolProps {
  tags: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  allowCustom?: boolean
  min?: number
  max?: number
  customPlaceholder?: string
  className?: string
}

export function TagPool({
  tags,
  selected,
  onChange,
  allowCustom = false,
  min: _min,
  max,
  customPlaceholder = 'Add a tag...',
  className,
}: TagPoolProps) {
  void _min // Reserved for future min validation
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customValue, setCustomValue] = useState('')

  const handleToggle = (tag: string) => {
    if (selected.includes(tag)) {
      // Deselect
      onChange(selected.filter((t) => t !== tag))
    } else {
      // Select (if not at max)
      if (max && selected.length >= max) {
        return
      }
      onChange([...selected, tag])
    }
  }

  const handleAddCustom = () => {
    const trimmed = customValue.trim()
    if (!trimmed) return
    
    // Don't add if already exists (case-insensitive)
    const normalizedExisting = [...tags, ...selected].map(t => t.toLowerCase())
    if (normalizedExisting.includes(trimmed.toLowerCase())) {
      setCustomValue('')
      setShowCustomInput(false)
      return
    }

    // Add to selection (if not at max)
    if (max && selected.length >= max) {
      setCustomValue('')
      setShowCustomInput(false)
      return
    }

    onChange([...selected, trimmed])
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

  const atMax = max !== undefined && selected.length >= max

  return (
    <div className={cn('space-y-4', className)}>
      {/* Tag pool */}
      <div className="flex flex-wrap gap-2 justify-center">
        {/* Preset tags */}
        {tags.map((tag) => {
          const isSelected = selected.includes(tag)
          const isDimmed = !isSelected && atMax

          return (
            <motion.button
              key={tag}
              type="button"
              onClick={() => handleToggle(tag)}
              disabled={isDimmed}
              whileHover={!isDimmed ? { scale: 1.05 } : undefined}
              whileTap={!isDimmed ? { scale: 0.95 } : undefined}
              className={cn(
                'inline-flex items-center gap-1.5',
                'h-11 px-5 rounded-full',
                'text-lg font-regular',
                'border-2 transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                isSelected
                  ? 'bg-accent text-foreground border-accent shadow-sm'
                  : 'bg-transparent text-foreground border-border hover:border-accent',
                isDimmed && 'opacity-40 cursor-not-allowed'
              )}
              aria-pressed={isSelected}
            >
              {tag}
              {isSelected && (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </motion.button>
          )
        })}

        {/* Custom tags that user has added */}
        {selected
          .filter((tag) => !tags.includes(tag))
          .map((tag) => (
            <motion.button
              key={tag}
              type="button"
              onClick={() => handleToggle(tag)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'inline-flex items-center gap-1.5',
                'h-11 px-5 rounded-full',
                'text-sm font-medium',
                'border-2 transition-all duration-150',
                'bg-accent text-foreground border-accent shadow-sm',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2'
              )}
              aria-pressed={true}
            >
              {tag}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.button>
          ))}

        {/* Custom input or Add button */}
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
                  className="h-11 w-40 text-md text-center rounded-full"
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
                  'inline-flex items-center gap-1.5',
                  'h-11 px-5 rounded-full',
                  'text-sm font-medium',
                  'border-2 border-dashed transition-all duration-150',
                  'bg-transparent text-muted hover:text-foreground hover:border-accent',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                  atMax && 'opacity-40 cursor-not-allowed'
                )}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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


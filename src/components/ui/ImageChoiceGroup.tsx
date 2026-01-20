'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export interface ImageChoice {
  id: string
  label: string
  imageUrl: string
  alt: string
}

export interface ImageChoiceGroupProps {
  options: ImageChoice[]
  value: string | string[] | null
  onChange: (value: string | string[]) => void
  allowMultiple?: boolean
  columns?: 2 | 3 | 4
  disabled?: boolean
  className?: string
  /** Called after selection for auto-advance (single-select only) */
  onCommit?: () => void
}

export function ImageChoiceGroup({
  options,
  value,
  onChange,
  allowMultiple = false,
  columns = 2,
  disabled = false,
  className,
  onCommit,
}: ImageChoiceGroupProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())

  const handleSelect = (optionId: string) => {
    if (disabled) return

    if (allowMultiple) {
      const currentArray = Array.isArray(value) ? value : []
      if (currentArray.includes(optionId)) {
        onChange(currentArray.filter((id) => id !== optionId))
      } else {
        onChange([...currentArray, optionId])
      }
    } else {
      onChange(optionId)
      onCommit?.() // Only fires for single-select
    }
  }

  const isSelected = (optionId: string): boolean => {
    if (allowMultiple) {
      return Array.isArray(value) && value.includes(optionId)
    }
    return value === optionId
  }

  const handleImageError = (optionId: string) => {
    setImageErrors((prev) => new Set(prev).add(optionId))
  }

  const handleImageLoad = (optionId: string) => {
    setLoadedImages((prev) => new Set(prev).add(optionId))
  }

  const gridColsClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  }[columns]

  return (
    <div className={cn('grid gap-3', gridColsClass, className)}>
      {options.map((option) => {
        const selected = isSelected(option.id)
        const hasError = imageErrors.has(option.id)
        const isLoaded = loadedImages.has(option.id)

        return (
          <motion.button
            key={option.id}
            type="button"
            onClick={() => handleSelect(option.id)}
            disabled={disabled}
            whileHover={!disabled ? { scale: 1.02 } : undefined}
            whileTap={!disabled ? { scale: 0.98 } : undefined}
            className={cn(
              'relative overflow-hidden rounded-xl transition-all',
              'border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent',
              selected
                ? 'border-accent shadow-lg shadow-accent/30'
                : 'border-border hover:border-accent/50',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            aria-pressed={selected}
            aria-label={option.label}
          >
            {/* Image container */}
            <div className="relative aspect-square bg-subtle/20">
              {!hasError ? (
                <>
                  {/* Loading skeleton */}
                  {!isLoaded && (
                    <div className="absolute inset-0 bg-subtle/30 animate-pulse" />
                  )}
                  
                  <Image
                    src={option.imageUrl}
                    alt={option.alt}
                    fill
                    className={cn(
                      'object-cover transition-opacity duration-300',
                      isLoaded ? 'opacity-100' : 'opacity-0'
                    )}
                    onError={() => handleImageError(option.id)}
                    onLoad={() => handleImageLoad(option.id)}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </>
              ) : (
                // Fallback for failed images
                <div className="absolute inset-0 flex items-center justify-center bg-subtle/20">
                  <span className="text-4xl opacity-50">🖼️</span>
                </div>
              )}

              {/* Selection overlay */}
              {selected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-accent/20 flex items-center justify-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-12 h-12 rounded-full bg-muted text-foreground flex items-center justify-center shadow-lg"
                  >
                    <svg
                      className="w-7 h-7"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </motion.div>
                </motion.div>
              )}
            </div>

            {/* Label */}
            <div
              className={cn(
                'px-3 py-2 text-sm font-medium transition-colors',
                selected ? 'bg-muted text-foreground' : 'bg-card-bg text-foreground'
              )}
            >
              {option.label}
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}


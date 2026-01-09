'use client'

import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useEnhancedAnimations } from '@/hooks/use-enhanced-animations'

export interface ToggleProps<T extends string> {
  options: readonly T[] | T[]
  value: T | null
  onChange: (value: T) => void
  labels?: Partial<Record<T, string>>
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeStyles = {
  sm: 'h-8 text-sm',
  md: 'h-10 text-base',
  lg: 'h-12 text-lg',
}

export function Toggle<T extends string>({
  options,
  value,
  onChange,
  labels,
  size = 'md',
  className,
}: ToggleProps<T>) {
  const showEffects = useEnhancedAnimations()
  const [animatingOption, setAnimatingOption] = useState<T | null>(null)
  const previousValue = useRef<T | null>(value)

  const handleChange = (option: T) => {
    // Only animate when switching to a new value
    if (showEffects && previousValue.current !== option) {
      setAnimatingOption(option)
      setTimeout(() => {
        setAnimatingOption(null)
      }, 180)
    }
    
    previousValue.current = option
    onChange(option)
  }

  return (
    <div
      className={cn(
        'inline-flex rounded-lg bg-subtle/30 p-1',
        'focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2',
        className
      )}
      role="radiogroup"
    >
      {options.map((option) => {
        const isSelected = value === option
        const isAnimating = animatingOption === option
        const label = labels?.[option] || option

        return (
          <button
            key={option}
            type="button"
            onClick={() => handleChange(option)}
            className={cn(
              'relative px-4 rounded-md font-medium',
              'transition-all duration-150',
              'focus-visible:outline-none',
              sizeStyles[size],
              isAnimating && 'chip-fill-animate',
              isSelected && !isAnimating
                ? 'bg-accent text-foreground shadow-sm'
                : 'text-muted hover:text-foreground'
            )}
            role="radio"
            aria-checked={isSelected}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}


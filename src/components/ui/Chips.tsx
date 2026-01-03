'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface ChipsProps<T extends string> {
  options: readonly T[] | T[]
  selected: T[]
  onChange: (selected: T[]) => void
  max?: number
  renderOption?: (option: T, isSelected: boolean) => ReactNode
  expandable?: boolean
  expandThreshold?: number
  className?: string
}

export function Chips<T extends string>({
  options,
  selected,
  onChange,
  max,
  renderOption,
  expandable = false,
  expandThreshold = 8,
  className,
}: ChipsProps<T>) {
  const handleToggle = (option: T) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option))
    } else {
      if (max && selected.length >= max) {
        // Don't add if at max
        return
      }
      onChange([...selected, option])
    }
  }

  const visibleOptions = expandable && options.length > expandThreshold
    ? options.slice(0, expandThreshold)
    : options

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {visibleOptions.map((option) => {
        const isSelected = selected.includes(option)

        return (
          <button
            key={option}
            type="button"
            onClick={() => handleToggle(option)}
            className={cn(
              'inline-flex items-center gap-1.5',
              'h-9 px-4 rounded-full',
              'text-sm font-medium',
              'border transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
              'active:scale-95',
              isSelected
                ? 'bg-accent text-white border-accent'
                : 'bg-transparent text-foreground border-border hover:border-accent'
            )}
            aria-pressed={isSelected}
          >
            {renderOption ? (
              renderOption(option, isSelected)
            ) : (
              <>
                {option}
                {isSelected && (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </>
            )}
          </button>
        )
      })}

      {expandable && options.length > expandThreshold && (
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1.5',
            'h-9 px-4 rounded-full',
            'text-sm font-medium',
            'border border-border',
            'bg-transparent text-muted hover:text-foreground hover:border-accent',
            'transition-all duration-150'
          )}
        >
          +{options.length - expandThreshold} more
        </button>
      )}
    </div>
  )
}


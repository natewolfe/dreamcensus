'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

export interface DropdownOption {
  value: string
  label: string
  /** Optional description shown in subtle text below label */
  description?: string
}

export interface SearchableDropdownProps {
  options: DropdownOption[]
  value: string | null
  onChange: (value: string) => void
  placeholder?: string
  allowOther?: boolean
  disabled?: boolean
  className?: string
  /** Called after selection for auto-advance */
  onCommit?: () => void
  /** Show search input in dropdown (default: true) */
  showSearch?: boolean
}

export function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  allowOther = false,
  disabled = false,
  className,
  onCommit,
  showSearch = true,
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showOtherInput, setShowOtherInput] = useState(false)
  const [otherValue, setOtherValue] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Check if current value is a custom "other" value
  const isCustomValue = value && !options.find((opt) => opt.value === value)

  useEffect(() => {
    if (isCustomValue && value) {
      setOtherValue(value)
      setShowOtherInput(true)
    }
  }, [isCustomValue, value])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  // Simple fuzzy search
  const filteredOptions = options.filter((option) => {
    const query = searchQuery.toLowerCase()
    const label = option.label.toLowerCase()
    
    // Check if all characters in query appear in order in label
    let queryIndex = 0
    for (let i = 0; i < label.length && queryIndex < query.length; i++) {
      if (label[i] === query[queryIndex]) {
        queryIndex++
      }
    }
    return queryIndex === query.length
  })

  const handleSelect = (optionValue: string) => {
    if (disabled) return
    onChange(optionValue)
    setIsOpen(false)
    setSearchQuery('')
    setShowOtherInput(false)
    onCommit?.() // Regular selection auto-advances
  }

  const handleOtherClick = () => {
    setShowOtherInput(true)
    setIsOpen(false)
  }

  const handleOtherSubmit = () => {
    if (otherValue.trim()) {
      onChange(otherValue.trim())
      setShowOtherInput(false)
    }
  }

  const selectedOption = options.find((opt) => opt.value === value)
  const displayValue = selectedOption?.label || (isCustomValue ? value : placeholder)

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Selected value / trigger button */}
      {!showOtherInput ? (
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'w-full px-4 py-3 rounded-lg text-left',
            'bg-card-bg border-2 border-border',
            'text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors',
            'flex items-center justify-between'
          )}
        >
          <span className={cn(!value && 'text-muted')}>{displayValue}</span>
          <svg
            className={cn(
              'w-5 h-5 text-muted transition-transform',
              isOpen && 'transform rotate-180'
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      ) : (
        // Other input mode
        <div className="flex gap-2">
          <input
            type="text"
            value={otherValue}
            onChange={(e) => setOtherValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleOtherSubmit()
              } else if (e.key === 'Escape') {
                setShowOtherInput(false)
                setOtherValue('')
              }
            }}
            placeholder="Type your response..."
            autoFocus
            className={cn(
              'flex-1 px-4 py-3 rounded-lg',
              'bg-card-bg border-2 border-accent',
              'text-foreground',
              'focus:outline-none focus:ring-2 focus:ring-accent',
              'transition-colors'
            )}
          />
          <button
            type="button"
            onClick={handleOtherSubmit}
            className="px-4 py-3 rounded-lg bg-accent text-foreground font-medium hover:opacity-90 transition-opacity"
          >
            ✓
          </button>
          <button
            type="button"
            onClick={() => {
              setShowOtherInput(false)
              setOtherValue('')
            }}
            className="px-4 py-3 rounded-lg border-2 border-border text-muted hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 w-full mt-2',
              'bg-card-bg border-2 border-border rounded-lg shadow-lg',
              'overflow-hidden'
            )}
          >
            {/* Search input */}
            {showSearch && (
              <div className="p-3 border-b border-border">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className={cn(
                    'w-full px-3 py-2 rounded-md',
                    'bg-background border border-border',
                    'text-foreground text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-accent',
                    'transition-colors'
                  )}
                />
              </div>
            )}

            {/* Options list */}
            <div className="max-h-64 overflow-y-auto">
              {(showSearch ? filteredOptions : options).length > 0 ? (
                (showSearch ? filteredOptions : options).map((option) => {
                  const isSelected = value === option.value

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={cn(
                        'w-full px-4 py-3 text-left opacity-80 transition-colors',
                        'hover:bg-accent/10',
                        isSelected && 'bg-accent/20 text-foreground font-medium opacity-100'
                      )}
                    >
                      <span>{option.label}</span>
                      {option.description && (
                        <span className="text-sm text-muted mt-0.5 ml-2">
                          {option.description}
                        </span>
                      )}
                    </button>
                  )
                })
              ) : (
                <div className="px-4 py-8 text-center text-muted text-sm">
                  No options found
                </div>
              )}

              {/* Other option */}
              {allowOther && (
                <button
                  type="button"
                  onClick={handleOtherClick}
                  className={cn(
                    'w-full px-4 py-3 text-left transition-colors',
                    'border-t border-dashed border-border',
                    'text-muted hover:text-foreground hover:bg-accent/10'
                  )}
                >
                  Other (specify)
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


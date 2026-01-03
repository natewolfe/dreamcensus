'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import type { TagInputProps } from './types'

export function TagInput({
  value,
  onChange,
  suggestions = [],
  placeholder = 'Add a tag...',
  max = 20,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter suggestions based on input
  const filteredSuggestions = suggestions
    .filter((s) => 
      s.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(s)
    )
    .slice(0, 5)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setShowSuggestions(newValue.length > 0 && filteredSuggestions.length > 0)
    setFocusedIndex(-1)
  }

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase()
    if (trimmed && !value.includes(trimmed) && value.length < (max ?? 20)) {
      onChange([...value, trimmed])
      setInputValue('')
      setShowSuggestions(false)
      setFocusedIndex(-1)
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((t) => t !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (focusedIndex >= 0 && focusedIndex < filteredSuggestions.length) {
        const suggestion = filteredSuggestions[focusedIndex]
        if (suggestion) addTag(suggestion)
      } else if (inputValue.trim()) {
        addTag(inputValue)
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setFocusedIndex(-1)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex((prev) => 
        Math.min(prev + 1, filteredSuggestions.length - 1)
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex((prev) => Math.max(prev - 1, -1))
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      const lastTag = value[value.length - 1]
      if (lastTag) removeTag(lastTag)
    }
  }

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative">
      {/* Tags + Input */}
      <div
        className={cn(
          'flex flex-wrap gap-2 rounded-xl border border-border bg-card-bg p-2',
          'focus-within:border-accent focus-within:ring-1 focus-within:ring-accent',
          'transition-colors'
        )}
      >
        {/* Existing tags */}
        <AnimatePresence mode="popLayout">
          {value.map((tag) => (
            <motion.button
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => removeTag(tag)}
              className={cn(
                'flex items-center gap-1 rounded-full bg-accent/20 px-2 py-1',
                'text-sm text-accent hover:bg-accent/30 transition-colors',
                'group'
              )}
            >
              <span>{tag}</span>
              <span className="text-accent/60 group-hover:text-accent">×</span>
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Input */}
        {value.length < (max ?? 20) && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (inputValue && filteredSuggestions.length > 0) {
                setShowSuggestions(true)
              }
            }}
            placeholder={value.length === 0 ? placeholder : ''}
            className={cn(
              'flex-1 min-w-[120px] bg-transparent text-foreground',
              'placeholder:text-subtle',
              'focus:outline-none'
            )}
          />
        )}
      </div>

      {/* Tag count */}
      {max && (
        <div className="mt-1 text-right text-xs text-muted">
          {value.length} / {max}
        </div>
      )}

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-20 mt-2 w-full',
              'rounded-xl border border-border bg-card-bg shadow-lg',
              'overflow-hidden'
            )}
          >
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                onClick={() => addTag(suggestion)}
                onMouseEnter={() => setFocusedIndex(index)}
                className={cn(
                  'w-full px-4 py-2 text-left text-sm',
                  'transition-colors',
                  index === focusedIndex
                    ? 'bg-accent/20 text-accent'
                    : 'text-foreground hover:bg-subtle/30'
                )}
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


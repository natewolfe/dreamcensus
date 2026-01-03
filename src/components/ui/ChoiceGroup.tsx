'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Input } from '@/components/ui'
import { cn } from '@/lib/utils'

export interface ChoiceGroupProps {
  options: string[]
  value: string | string[] | null
  onChange: (value: string | string[]) => void
  allowMultiple?: boolean
  allowOther?: boolean
  maxSelections?: number
  disabled?: boolean
  className?: string
}

export function ChoiceGroup({
  options,
  value,
  onChange,
  allowMultiple = false,
  allowOther = false,
  maxSelections,
  disabled = false,
  className,
}: ChoiceGroupProps) {
  const [showOther, setShowOther] = useState(() => {
    if (!allowOther) return false
    
    if (allowMultiple) {
      // For multi-select, only show if there's a custom value not in options
      return Array.isArray(value) && value.length > 0 && value.some(v => !options.includes(v))
    } else {
      // For single select, check if value exists and is not in options
      return typeof value === 'string' && value !== '' && !options.includes(value)
    }
  })
  
  const [otherValue, setOtherValue] = useState(() => {
    if (!allowOther) return ''
    
    if (allowMultiple) {
      if (!Array.isArray(value)) return ''
      return value.find(v => !options.includes(v)) ?? ''
    } else {
      if (typeof value === 'string' && value !== '' && !options.includes(value)) {
        return value
      }
      return ''
    }
  })

  const handleSelectOption = (option: string) => {
    if (disabled) return

    if (allowMultiple) {
      const currentArray = Array.isArray(value) ? value : []
      if (currentArray.includes(option)) {
        onChange(currentArray.filter(v => v !== option))
      } else {
        // Check max selections
        if (maxSelections && currentArray.length >= maxSelections) {
          return
        }
        onChange([...currentArray, option])
      }
    } else {
      onChange(option)
      setShowOther(false)
    }
  }

  const handleSelectOther = () => {
    if (disabled) return
    setShowOther(true)
    if (otherValue) {
      onChange(allowMultiple ? [otherValue] : otherValue)
    }
  }

  const handleOtherChange = (newValue: string) => {
    setOtherValue(newValue)
    if (allowMultiple) {
      const currentArray = Array.isArray(value) ? value.filter(v => options.includes(v)) : []
      onChange([...currentArray, newValue])
    } else {
      onChange(newValue)
    }
  }

  const isSelected = (option: string) => {
    if (allowMultiple) {
      return Array.isArray(value) && value.includes(option)
    }
    return value === option
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Options */}
      {options.map((option) => (
        <motion.button
          key={option}
          type="button"
          onClick={() => handleSelectOption(option)}
          disabled={disabled}
          whileHover={!disabled ? { scale: 1.01 } : undefined}
          whileTap={!disabled ? { scale: 0.99 } : undefined}
          className={cn(
            'w-full rounded-xl px-4 py-3 text-center',
            'transition-all border-2 focus:outline-none focus:ring-2 focus:ring-offset-2',
            isSelected(option) && 'bg-accent border-accent text-white',
            !isSelected(option) && 'border-border bg-card-bg text-foreground hover:border-accent/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="flex items-center justify-center gap-2">
            <span className="font-medium">{option}</span>
          </div>
        </motion.button>
      ))}

      {/* Other option */}
      {allowOther && (
        <>
          {!showOther ? (
            <motion.button
              type="button"
              onClick={handleSelectOther}
              disabled={disabled}
              whileHover={!disabled ? { scale: 1.01 } : undefined}
              whileTap={!disabled ? { scale: 0.99 } : undefined}
              className={cn(
                'w-full rounded-xl px-4 py-3 text-center',
                'border-2 border-dashed border-subtle',
                'bg-transparent text-muted hover:border-muted hover:text-foreground',
                'transition-all focus:outline-none focus:ring-2 focus:ring-offset-2',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              Other (specify)
            </motion.button>
          ) : (
            <div className="space-y-2">
              <Input
                type="text"
                value={otherValue}
                onChange={(e) => handleOtherChange(e.target.value)}
                placeholder="Other..."
                autoFocus
                disabled={disabled}
                className="text-center"
              />
              <button
                type="button"
                onClick={() => {
                  setShowOther(false)
                  setOtherValue('')
                  if (!allowMultiple) {
                    onChange('')
                  } else {
                    onChange([])
                  }
                }}
                disabled={disabled}
                className="text-sm text-muted text-center hover:text-foreground transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}


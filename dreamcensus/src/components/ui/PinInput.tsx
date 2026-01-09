'use client'

import {
  type KeyboardEvent,
  type ClipboardEvent,
  type ChangeEvent,
  useRef,
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react'
import { cn } from '@/lib/utils'

export interface PinInputProps {
  /** Number of digits (default: 6) */
  length?: number
  /** Current value */
  value: string
  /** Callback when value changes */
  onChange: (value: string) => void
  /** Callback when all digits are entered */
  onComplete?: (value: string) => void
  /** Error message */
  error?: string
  /** Disable the input */
  disabled?: boolean
  /** Auto-focus first input on mount */
  autoFocus?: boolean
  /** Accessible label for the input group */
  label?: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Additional class name for the container */
  className?: string
}

export interface PinInputRef {
  /** Focus the first empty input or the first input if all filled */
  focus: () => void
  /** Clear all inputs */
  clear: () => void
}

/**
 * PinInput - A reusable PIN/OTP code entry component
 *
 * Features:
 * - Individual input boxes with auto-advance on digit entry
 * - Auto-backtrack on deletion
 * - Paste support for full codes
 * - Arrow key navigation
 * - Accessible with screen reader support
 * - Configurable length and size
 */
export const PinInput = forwardRef<PinInputRef, PinInputProps>(
  (
    {
      length = 6,
      value,
      onChange,
      onComplete,
      error,
      disabled = false,
      autoFocus = false,
      label = 'Enter code',
      size = 'lg',
      className,
    },
    ref
  ) => {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    // Expose focus and clear methods
    useImperativeHandle(ref, () => ({
      focus: () => {
        const firstEmpty = value.length < length ? value.length : 0
        inputRefs.current[firstEmpty]?.focus()
      },
      clear: () => {
        onChange('')
        inputRefs.current[0]?.focus()
      },
    }))

    // Auto-focus on mount
    useEffect(() => {
      if (autoFocus && !disabled) {
        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
          inputRefs.current[0]?.focus()
        }, 50)
        return () => clearTimeout(timer)
      }
    }, [autoFocus, disabled])

    // Call onComplete when all digits are entered
    useEffect(() => {
      if (value.length === length && onComplete) {
        onComplete(value)
      }
    }, [value, length, onComplete])

    // Convert value string to array of individual digits
    const digits = value.split('').slice(0, length)
    while (digits.length < length) {
      digits.push('')
    }

    const focusInput = useCallback(
      (index: number) => {
        const clampedIndex = Math.max(0, Math.min(index, length - 1))
        inputRefs.current[clampedIndex]?.focus()
      },
      [length]
    )

    const handleChange = useCallback(
      (index: number, e: ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value

        // Only accept digits
        const digit = inputValue.replace(/\D/g, '').slice(-1)

        if (digit) {
          // Update the digit at this position
          const newDigits = [...digits]
          newDigits[index] = digit
          const newValue = newDigits.join('')
          onChange(newValue)

          // Auto-advance to next input
          if (index < length - 1) {
            focusInput(index + 1)
          }
        }
      },
      [digits, length, onChange, focusInput]
    )

    const handleKeyDown = useCallback(
      (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
          case 'Backspace':
            e.preventDefault()
            if (digits[index]) {
              // Clear current digit
              const newDigits = [...digits]
              newDigits[index] = ''
              onChange(newDigits.join(''))
            } else if (index > 0) {
              // Move to previous and clear it
              const newDigits = [...digits]
              newDigits[index - 1] = ''
              onChange(newDigits.join(''))
              focusInput(index - 1)
            }
            break

          case 'Delete':
            e.preventDefault()
            if (digits[index]) {
              const newDigits = [...digits]
              newDigits[index] = ''
              onChange(newDigits.join(''))
            }
            break

          case 'ArrowLeft':
            e.preventDefault()
            if (index > 0) {
              focusInput(index - 1)
            }
            break

          case 'ArrowRight':
            e.preventDefault()
            if (index < length - 1) {
              focusInput(index + 1)
            }
            break

          case 'Home':
            e.preventDefault()
            focusInput(0)
            break

          case 'End':
            e.preventDefault()
            focusInput(length - 1)
            break
        }
      },
      [digits, length, onChange, focusInput]
    )

    const handlePaste = useCallback(
      (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text')
        const pastedDigits = pastedData.replace(/\D/g, '').slice(0, length)

        if (pastedDigits) {
          onChange(pastedDigits)
          // Focus the next empty input or the last one
          const focusIndex = Math.min(pastedDigits.length, length - 1)
          focusInput(focusIndex)
        }
      },
      [length, onChange, focusInput]
    )

    const handleFocus = useCallback(
      (index: number) => {
        // Select the input content on focus
        inputRefs.current[index]?.select()
      },
      []
    )

    // Size classes
    const sizeClasses = {
      sm: 'w-10 h-12 text-lg',
      md: 'w-12 h-14 text-xl',
      lg: 'w-14 h-16 text-2xl sm:w-16 sm:h-18 sm:text-3xl',
    }

    const gapClasses = {
      sm: 'gap-2',
      md: 'gap-2.5',
      lg: 'gap-3',
    }

    return (
      <div className={cn('w-full', className)}>
        {/* Screen reader label */}
        <label id="pin-label" className="sr-only">
          {label}
        </label>

        {/* Input group */}
        <div
          role="group"
          aria-labelledby="pin-label"
          className={cn(
            'flex items-center justify-center',
            gapClasses[size]
          )}
        >
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              disabled={disabled}
              aria-label={`Digit ${index + 1} of ${length}`}
              aria-invalid={error ? 'true' : 'false'}
              onChange={(e) => handleChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              onFocus={() => handleFocus(index)}
              className={cn(
                // Base styles
                'rounded-xl border-2 text-center font-mono font-bold',
                'bg-background text-foreground',
                'transition-all duration-150 ease-out',
                // Focus styles
                'focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30',
                'focus:scale-105',
                // Default border
                'border-border',
                // Filled state - subtle highlight
                digit && 'border-accent/50 bg-accent/5',
                // Error state
                error && 'border-red-500 focus:border-red-500 focus:ring-red-500/30',
                // Disabled state
                disabled && 'opacity-50 cursor-not-allowed',
                // Size
                sizeClasses[size]
              )}
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <p
            role="alert"
            className="mt-3 text-center text-sm text-red-500"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

PinInput.displayName = 'PinInput'

import { type InputHTMLAttributes, type ReactNode, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helpText?: string
  /** Element to render at the start (left) inside the input border */
  startAddon?: ReactNode
  /** Element to render at the end (right) inside the input border */
  endAddon?: ReactNode
  /** Show clear button when input has value (replaces endAddon when active) */
  clearable?: boolean
  /** Callback when clear button is clicked */
  onClear?: () => void
}

const SearchIcon = () => (
  <svg
    className="h-5 w-5 text-muted flex-shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
)

const ClearButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex items-center justify-center flex-shrink-0',
      'h-6 w-6 rounded-full',
      'bg-muted/30 hover:bg-muted/50',
      'text-foreground',
      'transition-colors duration-150'
    )}
    aria-label="Clear input"
  >
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
)

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, startAddon, endAddon, clearable, onClear, className, id, value, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    const hasValue = value !== undefined && value !== ''
    const showClearButton = clearable && hasValue
    const hasAddon = startAddon || endAddon || clearable

    // Determine what to show at the end
    const endContent = showClearButton ? (
      <ClearButton onClick={() => onClear?.()} />
    ) : clearable ? (
      <SearchIcon />
    ) : (
      endAddon
    )

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}

        {hasAddon ? (
          // Addon mode: wrapper provides border, input is borderless
          <div
            className={cn(
              'flex items-center gap-2 w-full rounded-lg border px-4 py-2.5',
              'bg-background text-foreground',
              'border-border focus-within:border-accent',
              'transition-colors duration-150',
              error && 'border-red-500 focus-within:border-red-500',
              className
            )}
          >
            {startAddon}
            <input
              ref={ref}
              id={inputId}
              value={value}
              className={cn(
                'flex-1 min-w-0 bg-transparent outline-none',
                'focus-visible:outline-none',
                'placeholder:text-muted/50',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={
                error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined
              }
              {...props}
            />
            {endContent}
          </div>
        ) : (
          // Standard mode: input has its own border
          <input
            ref={ref}
            id={inputId}
            value={value}
            className={cn(
              'w-full rounded-lg border px-4 py-2.5',
              'bg-background text-foreground',
              'border-border focus:border-accent',
              'placeholder:text-muted/50',
              'transition-colors duration-150',
              'focus:outline-none focus-visible:outline-none',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-red-500 focus:border-red-500',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined
            }
            {...props}
          />
        )}

        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-500">
            {error}
          </p>
        )}

        {helpText && !error && (
          <p id={`${inputId}-help`} className="mt-1.5 text-sm text-muted">
            {helpText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'


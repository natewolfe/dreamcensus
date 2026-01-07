'use client'

import { cn } from '@/lib/utils'

export interface TextAreaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  minLength?: number
  rows?: number
  disabled?: boolean
  className?: string
}

export function TextArea({
  value,
  onChange,
  placeholder = 'Type your response...',
  maxLength = 2000,
  minLength = 0,
  rows = 4,
  disabled = false,
  className,
}: TextAreaProps) {
  const remaining = maxLength - value.length
  const isValid = value.length >= minLength

  return (
    <div className={cn('space-y-2', className)}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        disabled={disabled}
        className={cn(
          'w-full rounded-xl px-4 py-3 resize-none',
          'bg-card-bg border border-border text-foreground',
          'placeholder:text-muted/50',
          'focus:outline-none focus:border-accent',
          'focus-visible:outline-none',
          'transition-colors',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      />
      
      <div className="flex items-center justify-between text-xs text-muted">
        {minLength > 0 && (
          <span>
            {isValid ? '✓' : `At least ${minLength} characters required`}
          </span>
        )}
        <span className={cn(
          'ml-auto',
          remaining < 100 && 'text-orange-500',
          remaining === 0 && 'text-red-500'
        )}>
          {remaining} remaining
        </span>
      </div>
    </div>
  )
}


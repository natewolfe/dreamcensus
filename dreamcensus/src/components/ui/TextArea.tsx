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
  /** Auto-focus the textarea on mount */
  autoFocus?: boolean
  /** Called when Ctrl/Cmd+Enter is pressed to advance to next step */
  onEnterAdvance?: () => void
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
  autoFocus = false,
  onEnterAdvance,
}: TextAreaProps) {
  const remaining = maxLength - value.length
  const isValid = value.length >= minLength

  // Handle Ctrl/Cmd+Enter for advancing
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !e.nativeEvent.isComposing) {
      if (onEnterAdvance) {
        e.preventDefault()
        onEnterAdvance()
      }
    }
  }

  const showCount = value.length > 0 || remaining < maxLength * 0.1

  return (
    <div className={cn('relative', className)}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        disabled={disabled}
        autoFocus={autoFocus}
        className={cn(
          'w-full rounded-xl px-4 py-3 pb-8 resize-none',
          'bg-card-bg border border-border text-foreground',
          'placeholder:text-muted/50 placeholder:italic',
          'focus:outline-none focus:border-accent',
          'focus-visible:outline-none',
          'transition-colors',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      />
      
      {/* Character count inside textarea */}
      <div className="absolute bottom-4 right-3 flex items-center gap-2 text-xs pointer-events-none">
        {minLength > 0 && !isValid && (
          <span className="text-muted">
            {minLength - value.length} more
          </span>
        )}
        <span className={cn(
          'tabular-nums transition-opacity',
          showCount ? 'opacity-100' : 'opacity-0',
          remaining < 100 && 'text-orange-500',
          remaining < 20 && 'text-red-500',
          remaining >= 100 && 'text-muted/50'
        )}>
          {remaining}
        </span>
      </div>
    </div>
  )
}


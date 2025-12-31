'use client'

import { Question, ResponseRecord } from './useStreamState'

interface QuestionListItemProps {
  question: Question
  response?: ResponseRecord
  preservedText?: string
  onNo: () => void
  onYes: () => void
  onWrite: () => void
  onClear: () => void
}

interface ActionButtonProps {
  label: string
  onClick: () => void
  active: boolean
  variant: 'error' | 'success' | 'accent'
  className?: string
}

function ActionButton({ label, onClick, active, variant, className = '' }: ActionButtonProps) {
  const variantStyles = {
    error: active
      ? 'bg-[var(--error)] text-white border-[var(--error)]'
      : 'bg-[var(--background-subtle)] text-[var(--foreground-muted)] border-[var(--border)] hover:bg-[rgba(255,82,82,0.15)] hover:text-[var(--error)] hover:border-[var(--error)]',
    success: active
      ? 'bg-[var(--success)] text-white border-[var(--success)]'
      : 'bg-[var(--background-subtle)] text-[var(--foreground-muted)] border-[var(--border)] hover:bg-[rgba(105,240,174,0.15)] hover:text-[var(--success)] hover:border-[var(--success)]',
    accent: active
      ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
      : 'bg-[var(--background-subtle)] text-[var(--foreground-muted)] border-[var(--border)] hover:bg-[rgba(176,147,255,0.15)] hover:text-[var(--accent)] hover:border-[var(--accent)]',
  }

  return (
    <button
      onClick={onClick}
      className={`
        py-2.5 px-4 rounded-lg text-base font-medium transition-all border
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {label}
    </button>
  )
}

export function QuestionListItem({
  question,
  response,
  preservedText,
  onNo,
  onYes,
  onWrite,
  onClear,
}: QuestionListItemProps) {
  const isAnswered = !!response
  const textToShow = response?.expandedText || preservedText
  const hasWrittenResponse = !!textToShow
  const truncatedText = hasWrittenResponse && textToShow 
    ? textToShow.slice(0, 140) + (textToShow.length > 140 ? '...' : '')
    : null
  
  const handleNo = () => {
    if (isAnswered && response.response === 'no') {
      onClear()
    } else {
      onNo()
    }
  }
  
  const handleYes = () => {
    if (isAnswered && response.response === 'yes') {
      onClear()
    } else {
      onYes()
    }
  }
  
  return (
      <div className="w-full rounded-xl bg-[var(--background-elevated)] border border-[var(--border)] hover:border-[rgba(176,147,255,0.3)] transition-all group/item">
      <div className="p-1 flex flex-col sm:flex-row gap-2">
        {/* Left Side: Question and Write button/response */}
        <div className="p-4 pb-1 sm:pb-4 sm:pl-6 flex-1 flex flex-col gap-3 sm:gap-1">
          {/* Question with inline Respond link on desktop */}
          <button
            onClick={onWrite}
            className="text-lg leading-relaxed text-left cursor-pointer hover:text-[var(--accent)] transition-colors w-full"
          >
            <span>{question.text}</span>
            {!hasWrittenResponse && (
              <span className="hidden sm:inline ml-2 opacity-0 group-hover/item:opacity-100 transition-opacity text-sm text-[var(--accent)]">
                Respond
              </span>
            )}
          </button>
          
          {/* Mobile: Full-width Respond button */}
          {!hasWrittenResponse && (
            <button
              onClick={onWrite}
              className="sm:hidden w-full py-2.5 px-4 rounded-lg text-base font-medium border border-[var(--border)]/50 text-[var(--foreground-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
            >
              Respond
            </button>
          )}
          
          {/* Written response display */}
          {hasWrittenResponse && (
            <div className="group relative text-sm text-[var(--foreground-muted)] italic">
              <p className="pr-16 sm:pr-0">"{truncatedText}"</p>
              {/* Edit link - always visible on mobile, hover on desktop */}
              <button
                onClick={onWrite}
                className="absolute right-0 top-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-[var(--accent)] flex items-center gap-1"
                aria-label="Edit response"
              >
                <span className="hidden sm:inline">Edit</span>
                <svg className="sm:hidden w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
          )}
        </div>
        
        {/* Right Side: No/Yes buttons - full height */}
        <div className="flex sm:self-stretch">
          <ActionButton
            label="No"
            onClick={handleNo}
            active={isAnswered && response.response === 'no'}
            variant="error"
            className="flex-1 sm:w-24 rounded-r-none relative z-[1] hover:z-[2] sm:h-full"
          />
          <ActionButton
            label="Yes"
            onClick={handleYes}
            active={isAnswered && response.response === 'yes'}
            variant="success"
            className="flex-1 sm:w-24 rounded-l-none -ml-px relative z-[1] hover:z-[2] sm:h-full"
          />
        </div>
      </div>
    </div>
  )
}


'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Question } from './useStreamState'

interface WriteModalProps {
  question: Question | null
  onSubmit: (response: 'yes' | 'no', expandedText?: string) => void
  onClose: () => void
}

interface ActionButtonProps {
  label: string
  onClick: () => void
  variant: 'error' | 'success'
  className?: string
}

function ActionButton({ label, onClick, variant, className = '' }: ActionButtonProps) {
  const variantStyles = {
    error: 'bg-[var(--background-subtle)] text-[var(--foreground-muted)] border-[var(--border)] hover:bg-[rgba(255,82,82,0.15)] hover:text-[var(--error)] hover:border-[var(--error)]',
    success: 'bg-[var(--background-subtle)] text-[var(--foreground-muted)] border-[var(--border)] hover:bg-[rgba(105,240,174,0.15)] hover:text-[var(--success)] hover:border-[var(--success)]',
  }

  return (
    <button
      onClick={onClick}
      className={`
        py-3 px-6 rounded-lg text-lg font-medium transition-all border
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {label}
    </button>
  )
}

export function WriteModal({ question, onSubmit, onClose }: WriteModalProps) {
  const [expandedText, setExpandedText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (question && textareaRef.current) {
      // Focus textarea when expanded
      textareaRef.current.focus()
    }
    
    // Reset text when question changes
    setExpandedText('')
  }, [question])

  if (!question) return null

  const handleSubmit = (response: 'yes' | 'no') => {
    onSubmit(response, expandedText.trim() || undefined)
  }

  return (
    <AnimatePresence>
      {question && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-[var(--background)] rounded-3xl border-2 border-[var(--border)] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-[var(--border)]">
              <div className="flex items-start justify-between mb-4">
                <div className="pl-2 text-xs font-medium text-[var(--accent)]/70 uppercase tracking-widest">
                  {question.category}
                </div>
                <button
                  onClick={onClose}
                  className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <h2 className="p-6 text-3xl text-center font-medium leading-snug">
                {question.text}
              </h2>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 pb-2">
              <label className="block">
                <span className="text-sm text-[var(--foreground-muted)] mb-2 block">
                  Details: <span className="text-[var(--foreground-muted)]/50">(Optional)</span>
                </span>
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={expandedText}
                    onChange={(e) => setExpandedText(e.target.value)}
                    placeholder="Share your experience..."
                    className="w-full h-32 px-4 py-3 pb-8 bg-[var(--background-elevated)] border border-[var(--border)] rounded-xl resize-none focus:outline-none focus:border-[var(--accent)] transition-colors"
                    maxLength={2000}
                  />
                  <div className="absolute bottom-4 right-3 text-xs text-[var(--foreground-muted)]/40 pointer-events-none">
                    {expandedText.length} / 2000
                  </div>
                </div>
              </label>
            </div>

            {/* Footer - Yes/No Actions */}
            <div className="p-4 pt-0 flex">
              <ActionButton
                label="No"
                onClick={() => handleSubmit('no')}
                variant="error"
                className="flex-1 rounded-r-none relative z-[1] hover:z-[2]"
              />
              <ActionButton
                label="Yes"
                onClick={() => handleSubmit('yes')}
                variant="success"
                className="flex-1 rounded-l-none -ml-px relative z-[1] hover:z-[2]"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { CensusStepData, AnswerValue } from '@/lib/types'
import { OpinionSlider } from '@/components/census/OpinionSlider'

interface FormStepProps {
  step: CensusStepData
  value: AnswerValue
  onChange: (value: AnswerValue) => void
  onSubmit: () => void
}

/**
 * Parse question label markdown safely (without dangerouslySetInnerHTML)
 * Converts *text* to emphasized spans
 */
function parseQuestionLabel(label: string): React.ReactNode {
  const parts = label.split(/\*(.*?)\*/g)
  return parts.map((part, i) => 
    i % 2 === 1 
      ? <em key={i} className="not-italic text-[var(--accent-glow)]">{part}</em>
      : part
  )
}

export function FormStep({ step, value, onChange, onSubmit }: FormStepProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [step.id])

  // Handle Enter key for submission
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Don't submit on Enter for textareas (allow multiline)
      if (step.kind === 'long_text') return
      e.preventDefault()
      onSubmit()
    }
  }, [step.kind, onSubmit])

  // Render the appropriate input based on step kind
  const renderInput = () => {
    switch (step.kind) {
      case 'statement':
        return <StatementStep step={step} />

      case 'legal':
        return (
          <LegalStep
            step={step}
            checked={value === true}
            onChange={(checked) => onChange(checked)}
          />
        )

      case 'yes_no':
        return (
          <YesNoStep
            value={value as boolean | null}
            onChange={onChange}
          />
        )

      case 'short_text':
      case 'email':
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={step.kind === 'email' ? 'email' : 'text'}
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={step.kind === 'email' ? 'your@email.com' : 'Type your answer...'}
            aria-labelledby={`question-${step.id}`}
            aria-describedby={step.help ? `help-${step.id}` : undefined}
            aria-required={step.props.required}
            className="w-full text-xl bg-transparent border-b-2 border-[var(--border)] focus:border-[var(--accent)] py-3 outline-none transition-colors"
          />
        )

      case 'long_text':
        return (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your answer..."
            rows={4}
            maxLength={step.props.maxLength}
            aria-labelledby={`question-${step.id}`}
            aria-describedby={step.help ? `help-${step.id}` : undefined}
            aria-required={step.props.required}
            className="w-full text-lg bg-[var(--background-elevated)] border border-[var(--border)] rounded-lg p-4 outline-none focus:border-[var(--accent)] transition-colors resize-none"
          />
        )

      case 'number':
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="number"
            value={(value as number) ?? ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
            onKeyDown={handleKeyDown}
            min={step.props.minValue}
            max={step.props.maxValue}
            placeholder="Enter a number..."
            aria-labelledby={`question-${step.id}`}
            aria-describedby={step.help ? `help-${step.id}` : undefined}
            aria-required={step.props.required}
            className="w-full text-xl bg-transparent border-b-2 border-[var(--border)] focus:border-[var(--accent)] py-3 outline-none transition-colors"
          />
        )

      case 'date':
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="date"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-labelledby={`question-${step.id}`}
            aria-describedby={step.help ? `help-${step.id}` : undefined}
            aria-required={step.props.required}
            className="w-full text-xl bg-[var(--background-elevated)] border border-[var(--border)] rounded-lg p-4 outline-none focus:border-[var(--accent)] transition-colors"
          />
        )

      case 'single_choice':
      case 'dropdown':
        return (
          <SingleChoiceStep
            choices={step.props.choices || []}
            value={value as string | null}
            onChange={onChange}
            onSubmit={onSubmit}
          />
        )

      case 'multi_choice':
        return (
          <MultiChoiceStep
            choices={step.props.choices || []}
            value={(value as string[]) || []}
            onChange={onChange}
            allowOther={step.props.allowOther}
          />
        )

      case 'picture_choice':
        return (
          <PictureChoiceStep
            choices={step.props.choices || []}
            value={step.props.allowMultiple ? ((value as string[]) || []) : (value as string | null)}
            onChange={onChange}
            allowMultiple={step.props.allowMultiple}
            onSubmit={onSubmit}
          />
        )

      case 'opinion_scale':
        return (
          <OpinionSlider
            steps={step.props.steps || 5}
            labels={step.props.labels}
            value={value as number | null}
            onChange={onChange}
            onSubmit={onSubmit}
          />
        )

      case 'rating':
        return (
          <RatingStep
            steps={step.props.steps || 5}
            value={value as number | null}
            onChange={onChange}
            onSubmit={onSubmit}
          />
        )

      default:
        return (
          <p className="text-[var(--foreground-muted)]">
            Unknown question type: {step.kind}
          </p>
        )
    }
  }

  return (
    <div className="animate-slide-up">
      {/* Question label */}
      <h2 
        id={`question-${step.id}`}
        className="text-2xl md:text-3xl font-medium mb-4"
      >
        {parseQuestionLabel(step.label)}
      </h2>

      {/* Help text */}
      {step.help && (
        <p 
          id={`help-${step.id}`}
          className="text-[var(--foreground-muted)] mb-8 text-lg"
        >
          {step.help}
        </p>
      )}

      {/* Input */}
      <div className="mt-8">
        {renderInput()}
      </div>
    </div>
  )
}

// ============================================================================
// Sub-components for different step types
// ============================================================================

function StatementStep({ step }: { step: CensusStepData }) {
  // Statement steps are informational only - no input needed
  // Navigation is handled by the wizard's Continue button
  return (
    <div className="space-y-6">
      {step.props.imageUrl && (
        <img 
          src={step.props.imageUrl} 
          alt="" 
          className="rounded-lg max-h-64 object-contain"
        />
      )}
    </div>
  )
}

function LegalStep({ 
  step, 
  checked, 
  onChange 
}: { 
  step: CensusStepData
  checked: boolean
  onChange: (checked: boolean) => void 
}) {
  return (
    <label className="flex items-start gap-4 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1.5 w-5 h-5 rounded border-2 border-[var(--border)] bg-transparent checked:bg-[var(--accent)] checked:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
      />
      <span className="text-[var(--foreground-muted)] group-hover:text-[var(--foreground)] transition-colors">
        I agree to the terms above
      </span>
    </label>
  )
}

function YesNoStep({ 
  value, 
  onChange 
}: { 
  value: boolean | null
  onChange: (value: boolean) => void 
}) {
  return (
    <div className="flex gap-4">
      {[
        { label: 'Yes', val: true },
        { label: 'No', val: false },
      ].map(({ label, val }) => (
        <button
          key={label}
          type="button"
          onClick={() => onChange(val)}
          className={`flex-1 py-4 px-6 rounded-lg border-2 transition-all ${
            value === val
              ? 'border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--foreground)]'
              : 'border-[var(--border)] hover:border-[var(--foreground-subtle)]'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function SingleChoiceStep({
  choices,
  value,
  onChange,
  onSubmit,
}: {
  choices: { ref: string; label: string }[]
  value: string | null
  onChange: (value: string) => void
  onSubmit: () => void
}) {
  return (
    <div className="space-y-3">
      {choices.map((choice, idx) => (
        <button
          key={choice.ref}
          type="button"
          onClick={() => {
            onChange(choice.ref)
            // Auto-advance after selection
            setTimeout(onSubmit, 300)
          }}
          className={`w-full text-left py-4 px-5 rounded-lg border-2 transition-all flex items-center gap-4 ${
            value === choice.ref
              ? 'border-[var(--accent)] bg-[var(--accent-muted)]'
              : 'border-[var(--border)] hover:border-[var(--foreground-subtle)]'
          }`}
        >
          <span className="w-7 h-7 rounded-md border border-[var(--border)] flex items-center justify-center text-sm text-[var(--foreground-muted)]">
            {String.fromCharCode(65 + idx)}
          </span>
          <span>{choice.label}</span>
        </button>
      ))}
    </div>
  )
}

function MultiChoiceStep({
  choices,
  value,
  onChange,
  allowOther,
}: {
  choices: { ref: string; label: string }[]
  value: string[]
  onChange: (value: string[]) => void
  allowOther?: boolean
}) {
  const toggleChoice = (ref: string) => {
    if (value.includes(ref)) {
      onChange(value.filter((v) => v !== ref))
    } else {
      onChange([...value, ref])
    }
  }

  return (
    <div className="space-y-3">
      {choices.map((choice, idx) => (
        <button
          key={choice.ref}
          type="button"
          onClick={() => toggleChoice(choice.ref)}
          className={`w-full text-left py-4 px-5 rounded-lg border-2 transition-all flex items-center gap-4 ${
            value.includes(choice.ref)
              ? 'border-[var(--accent)] bg-[var(--accent-muted)]'
              : 'border-[var(--border)] hover:border-[var(--foreground-subtle)]'
          }`}
        >
          <span className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
            value.includes(choice.ref)
              ? 'border-[var(--accent)] bg-[var(--accent)]'
              : 'border-[var(--border)]'
          }`}>
            {value.includes(choice.ref) && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </span>
          <span>{choice.label}</span>
        </button>
      ))}
      <p className="text-sm text-[var(--foreground-subtle)] pt-2">
        Select all that apply
      </p>
    </div>
  )
}

function PictureChoiceStep({
  choices,
  value,
  onChange,
  allowMultiple,
  onSubmit,
}: {
  choices: { ref: string; label: string; imageUrl?: string }[]
  value: string | string[] | null
  onChange: (value: string | string[]) => void
  allowMultiple?: boolean
  onSubmit: () => void
}) {
  const isSelected = (ref: string) => {
    if (Array.isArray(value)) return value.includes(ref)
    return value === ref
  }

  const handleSelect = (ref: string) => {
    if (allowMultiple) {
      const current = (value as string[]) || []
      if (current.includes(ref)) {
        onChange(current.filter((v) => v !== ref))
      } else {
        onChange([...current, ref])
      }
    } else {
      onChange(ref)
      setTimeout(onSubmit, 300)
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {choices.map((choice) => (
        <button
          key={choice.ref}
          type="button"
          onClick={() => handleSelect(choice.ref)}
          className={`relative aspect-square rounded-lg border-2 overflow-hidden transition-all ${
            isSelected(choice.ref)
              ? 'border-[var(--accent)] ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--background)]'
              : 'border-[var(--border)] hover:border-[var(--foreground-subtle)]'
          }`}
        >
          {choice.imageUrl ? (
            <img
              src={choice.imageUrl}
              alt={choice.label}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[var(--background-elevated)]">
              <span className="text-2xl font-medium">{choice.label}</span>
            </div>
          )}
          {isSelected(choice.ref) && (
            <div className="absolute inset-0 bg-[var(--accent)]/20 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}
          {choice.label && choice.imageUrl && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <span className="text-white text-sm">{choice.label}</span>
            </div>
          )}
        </button>
      ))}
    </div>
  )
}

function RatingStep({
  steps,
  value,
  onChange,
  onSubmit,
}: {
  steps: number
  value: number | null
  onChange: (value: number) => void
  onSubmit: () => void
}) {
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: steps }, (_, i) => i + 1).map((num) => (
        <button
          key={num}
          type="button"
          onClick={() => {
            onChange(num)
            setTimeout(onSubmit, 300)
          }}
          className="p-2 transition-transform hover:scale-110"
        >
          <svg
            className={`w-10 h-10 ${
              value !== null && num <= value
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-[var(--border)] fill-transparent'
            }`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        </button>
      ))}
    </div>
  )
}


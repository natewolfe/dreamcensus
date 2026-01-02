'use client'

import { motion, useMotionValue, useTransform, animate } from 'motion/react'
import { useRef, useState } from 'react'
import type { Question, AnswerValue, StepKind, Choice, ScaleLabels } from '@/lib/types'
import { OpinionSlider } from './OpinionSlider'
import { Button } from '@/components/ui'

interface QuestionCardProps {
  question: Question
  value: AnswerValue
  onChange: (value: AnswerValue) => void
  onSubmit: () => void
  onSkip: () => void
  showThemeIndicator?: boolean
  isSwipeable?: boolean
  isTop?: boolean
  style?: React.CSSProperties
}

export function QuestionCard({
  question,
  value,
  onChange,
  onSubmit,
  onSkip,
  showThemeIndicator = false,
  isSwipeable = true,
  isTop = true,
  style,
}: QuestionCardProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const isDragging = useRef(false)
  const dragDistance = useRef(0)
  
  const rotation = useTransform(x, [-300, 0, 300], [-15, 0, 15])
  
  // Swipe indicators (only for swipeable yes/no questions)
  const yesOpacity = useTransform(x, [0, 150], [0, 1])
  const noOpacity = useTransform(x, [-150, 0], [1, 0])
  const skipOpacity = useTransform(y, [-150, 0], [1, 0])

  const isYesNo = question.kind === 'yes_no'
  const canSwipe = isSwipeable && isYesNo && isTop

  const handleDragStart = () => {
    isDragging.current = true
    dragDistance.current = 0
  }

  const handleDrag = (_: any, info: any) => {
    dragDistance.current = Math.max(
      dragDistance.current,
      Math.abs(info.offset.x) + Math.abs(info.offset.y)
    )
  }

  const handleDragEnd = (_: any, info: any) => {
    if (!canSwipe) return
    
    const swipeThreshold = 100
    
    // Check for upward swipe (skip)
    if (info.offset.y < -swipeThreshold) {
      onSkip()
    }
    // Check for horizontal swipes (yes/no)
    else if (Math.abs(info.offset.x) > swipeThreshold) {
      if (info.offset.x > 0) {
        onChange(true)
        setTimeout(onSubmit, 100)
      } else {
        onChange(false)
        setTimeout(onSubmit, 100)
      }
    } else {
      // Snap back to origin
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 })
      animate(y, 0, { type: 'spring', stiffness: 300, damping: 30 })
    }
    
    setTimeout(() => {
      isDragging.current = false
    }, 50)
  }

  return (
    <motion.div
      drag={canSwipe}
      dragConstraints={{ left: -300, right: 300, top: -200, bottom: 50 }}
      dragElastic={0.7}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      className={`absolute inset-0 ${canSwipe ? 'cursor-grab active:cursor-grabbing' : isTop ? '' : 'pointer-events-none'}`}
      style={{
        ...style,
        x: canSwipe ? x : 0,
        y: canSwipe ? y : 0,
        rotate: canSwipe ? rotation : 0,
      }}
      whileTap={canSwipe ? { scale: 1.02 } : undefined}
    >
      <div className="h-full w-full bg-[var(--background-elevated)] rounded-3xl border-2 border-[var(--border)] shadow-2xl flex flex-col relative overflow-hidden">
        {/* Theme indicator */}
        {showThemeIndicator && question.themeSlug && (
          <div className="px-6 pt-6">
            <div className="text-xs font-medium text-[var(--accent)]/60 uppercase tracking-widest">
              {question.category}
            </div>
          </div>
        )}

        {/* Skip button */}
        {isTop && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSkip()
            }}
            className="absolute top-4 right-5 text-sm text-[var(--foreground-muted)]/50 hover:text-[var(--foreground-muted)] transition-colors z-10"
          >
            Skip
          </button>
        )}

        {/* Question content */}
        <div className="flex-1 flex flex-col justify-center px-8 py-6">
          <h2 className="text-2xl md:text-3xl font-medium text-center leading-relaxed mb-6">
            {question.text}
          </h2>
          
          {question.help && (
            <p className="text-center text-[var(--foreground-muted)] text-sm mb-6">
              {question.help}
            </p>
          )}

          {/* Render input based on question kind */}
          <div className="mt-4">
            {renderInput(question, value, onChange, onSubmit)}
          </div>
        </div>

        {/* Mobile swipe indicators for yes/no */}
        {canSwipe && (
          <>
            <motion.div
              className="absolute top-12 right-12 text-6xl font-bold text-green-500 rotate-12 pointer-events-none"
              style={{ opacity: yesOpacity }}
            >
              YES
            </motion.div>
            <motion.div
              className="absolute top-12 left-12 text-6xl font-bold text-red-500 -rotate-12 pointer-events-none"
              style={{ opacity: noOpacity }}
            >
              NO
            </motion.div>
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-[var(--foreground-muted)] pointer-events-none"
              style={{ opacity: skipOpacity }}
            >
              SKIP
            </motion.div>
          </>
        )}

        {/* Desktop action buttons for yes/no */}
        {isYesNo && !isSwipeable && isTop && (
          <div className="flex text-xl border-t border-[var(--border)]">
            <button
              onClick={() => {
                onChange(false)
                setTimeout(onSubmit, 100)
              }}
              className="flex-1 py-5 text-[var(--foreground-muted)] hover:text-[var(--error)] hover:bg-[rgba(255,82,82,0.08)] transition-all border-r border-[var(--border)] font-medium"
            >
              No
            </button>
            <button
              onClick={() => {
                onChange(true)
                setTimeout(onSubmit, 100)
              }}
              className="flex-1 py-5 text-[var(--foreground-muted)] hover:text-[var(--success)] hover:bg-[rgba(105,240,174,0.08)] transition-all font-medium"
            >
              Yes
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

/**
 * Render appropriate input based on question kind
 */
function renderInput(
  question: Question,
  value: AnswerValue,
  onChange: (value: AnswerValue) => void,
  onSubmit: () => void
) {
  const props = question.props || {}

  switch (question.kind) {
    case 'yes_no':
      // Handled by swipe or bottom buttons
      return null

    case 'single_choice':
      return (
        <SingleChoiceInput
          choices={props.choices || []}
          value={value as string | null}
          onChange={(v) => {
            onChange(v)
            setTimeout(onSubmit, 300)
          }}
        />
      )

    case 'multi_choice':
      return (
        <MultiChoiceInput
          choices={props.choices || []}
          value={(value as string[]) || []}
          onChange={onChange}
        />
      )

    case 'opinion_scale':
      return (
        <OpinionSlider
          steps={props.steps || 5}
          labels={props.labels as ScaleLabels}
          value={value as number | null}
          onChange={onChange}
          onSubmit={onSubmit}
        />
      )

    case 'rating':
      return (
        <RatingInput
          steps={props.steps || 5}
          value={value as number | null}
          onChange={(v) => {
            onChange(v)
            setTimeout(onSubmit, 300)
          }}
        />
      )

    case 'short_text':
    case 'long_text':
      return (
        <TextInput
          value={(value as string) || ''}
          onChange={onChange}
          multiline={question.kind === 'long_text'}
          maxLength={props.maxLength}
        />
      )

    case 'picture_choice':
      return (
        <PictureChoiceInput
          choices={props.choices || []}
          value={props.allowMultiple ? ((value as string[]) || []) : (value as string | null)}
          onChange={(v) => {
            onChange(v)
            if (!props.allowMultiple) {
              setTimeout(onSubmit, 300)
            }
          }}
          allowMultiple={props.allowMultiple}
        />
      )

    case 'statement':
      // Just show continue button
      return (
        <div className="text-center">
          <Button onClick={onSubmit} variant="primary" size="lg">
            Continue
          </Button>
        </div>
      )

    default:
      return (
        <div className="text-center text-[var(--foreground-muted)]">
          Unsupported question type: {question.kind}
        </div>
      )
  }
}

// Sub-components for different input types

function SingleChoiceInput({
  choices,
  value,
  onChange,
}: {
  choices: Choice[]
  value: string | null
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto">
      {choices.map((choice, idx) => (
        <button
          key={choice.ref}
          onClick={() => onChange(choice.ref)}
          className={`w-full text-left py-3 px-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
            value === choice.ref
              ? 'border-[var(--accent)] bg-[var(--accent-muted)]'
              : 'border-[var(--border)] hover:border-[var(--foreground-subtle)]'
          }`}
        >
          <span className="w-6 h-6 rounded-md border border-[var(--border)] flex items-center justify-center text-xs text-[var(--foreground-muted)]">
            {String.fromCharCode(65 + idx)}
          </span>
          <span>{choice.label}</span>
        </button>
      ))}
    </div>
  )
}

function MultiChoiceInput({
  choices,
  value,
  onChange,
}: {
  choices: Choice[]
  value: string[]
  onChange: (value: string[]) => void
}) {
  const toggleChoice = (ref: string) => {
    if (value.includes(ref)) {
      onChange(value.filter(v => v !== ref))
    } else {
      onChange([...value, ref])
    }
  }

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto">
      {choices.map((choice) => (
        <button
          key={choice.ref}
          onClick={() => toggleChoice(choice.ref)}
          className={`w-full text-left py-3 px-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
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
      <p className="text-xs text-[var(--foreground-subtle)] text-center pt-2">
        Select all that apply
      </p>
    </div>
  )
}

function RatingInput({
  steps,
  value,
  onChange,
}: {
  steps: number
  value: number | null
  onChange: (value: number) => void
}) {
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: steps }, (_, i) => i + 1).map((num) => (
        <button
          key={num}
          onClick={() => onChange(num)}
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

function TextInput({
  value,
  onChange,
  multiline,
  maxLength,
}: {
  value: string
  onChange: (value: string) => void
  multiline?: boolean
  maxLength?: number
}) {
  if (multiline) {
    return (
      <div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer..."
          rows={4}
          maxLength={maxLength}
          className="w-full text-base bg-[var(--background-subtle)] border border-[var(--border)] rounded-lg p-4 outline-none focus:border-[var(--accent)] transition-colors resize-none"
        />
        {maxLength && (
          <div className="text-xs text-right text-[var(--foreground-subtle)] mt-1">
            {value.length}/{maxLength}
          </div>
        )}
      </div>
    )
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Type your answer..."
      maxLength={maxLength}
      className="w-full text-lg bg-transparent border-b-2 border-[var(--border)] focus:border-[var(--accent)] py-3 outline-none transition-colors"
    />
  )
}

function PictureChoiceInput({
  choices,
  value,
  onChange,
  allowMultiple,
}: {
  choices: Choice[]
  value: string | string[] | null
  onChange: (value: string | string[]) => void
  allowMultiple?: boolean
}) {
  const isSelected = (ref: string) => {
    if (Array.isArray(value)) return value.includes(ref)
    return value === ref
  }

  const handleSelect = (ref: string) => {
    if (allowMultiple) {
      const current = (value as string[]) || []
      if (current.includes(ref)) {
        onChange(current.filter(v => v !== ref))
      } else {
        onChange([...current, ref])
      }
    } else {
      onChange(ref)
    }
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
      {choices.map((choice) => (
        <button
          key={choice.ref}
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
            <div className="w-full h-full flex items-center justify-center bg-[var(--background-subtle)]">
              <span className="text-lg font-medium">{choice.label}</span>
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
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
              <span className="text-white text-xs">{choice.label}</span>
            </div>
          )}
        </button>
      ))}
    </div>
  )
}


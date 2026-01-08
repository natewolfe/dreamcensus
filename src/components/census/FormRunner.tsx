'use client'

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button, ProgressBar } from '@/components/ui'
import { QuestionRenderer } from './QuestionRenderer'
import { getDefaultValue } from './defaults'
import { getSkipBehavior } from './types'
import { hasValidAnswer } from '@/lib/census'
import { slideVariants, slideTransition } from '@/lib/motion'
import type { FlowDirection } from '@/lib/flow/types'
import type { CensusQuestion } from './types'

export interface FormRunnerProps {
  form: {
    id: string
    name: string
    questions: CensusQuestion[]
  }
  initialAnswers: Map<string, unknown>
  onComplete: (answers: Map<string, unknown>) => void
  onExit: () => void
}

// Conditional logic evaluation
function evaluateCondition(
  condition: { questionId: string; operator: string; value: unknown } | undefined,
  answers: Map<string, unknown>
): boolean {
  if (!condition) return true

  const answer = answers.get(condition.questionId)
  if (answer === undefined || answer === null) return false

  switch (condition.operator) {
    case 'eq':
      return answer === condition.value
    case 'ne':
      return answer !== condition.value
    case 'contains':
      return Array.isArray(answer) && answer.includes(condition.value)
    case 'gt':
      return typeof answer === 'number' && typeof condition.value === 'number' && answer > condition.value
    case 'lt':
      return typeof answer === 'number' && typeof condition.value === 'number' && answer < condition.value
    default:
      return true
  }
}

export function FormRunner({
  form,
  initialAnswers,
  onComplete,
  onExit,
}: FormRunnerProps) {
  void onExit // Exit handled at page level

  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<FlowDirection>('forward')
  const [answers, setAnswers] = useState<Map<string, unknown>>(initialAnswers)

  // Ref for onComplete to prevent stale closures
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  // Filter questions based on conditional logic
  const questions = useMemo(() => {
    const sorted = [...form.questions].sort((a, b) => a.order - b.order)
    return sorted.filter((q) => {
      const showWhen = (q as { showWhen?: { questionId: string; operator: string; value: unknown } }).showWhen
      return evaluateCondition(showWhen, answers)
    })
  }, [form.questions, answers])

  // Clamp index if questions changed due to conditional filtering
  const safeIndex = Math.min(currentIndex, Math.max(0, questions.length - 1))
  useEffect(() => {
    if (safeIndex !== currentIndex && questions.length > 0) {
      setCurrentIndex(safeIndex)
    }
  }, [safeIndex, currentIndex, questions.length])

  const currentQuestion = questions[safeIndex]
  const currentAnswer = currentQuestion ? answers.get(currentQuestion.id) : undefined

  // Derived state
  const isFirstQuestion = safeIndex === 0
  const isLastQuestion = safeIndex === questions.length - 1
  const skipBehavior = currentQuestion ? getSkipBehavior(currentQuestion) : 'optional'
  const isValid = currentQuestion ? hasValidAnswer(currentQuestion, currentAnswer) : false
  const canGoForward = skipBehavior !== 'required' || isValid

  // Button state
  const isSkippable = skipBehavior === 'optional' || skipBehavior === 'skippable'
  const buttonState = useMemo(() => {
    if (!isValid && isSkippable) {
      return { text: 'Skip', variant: 'secondary' as const, disabled: false }
    }
    if (!isValid && skipBehavior === 'required') {
      return { text: 'Next', variant: 'secondary' as const, disabled: true }
    }
    return { text: 'Next', variant: 'primary' as const, disabled: false }
  }, [isValid, isSkippable, skipBehavior])

  // Auto-save to localStorage
  useEffect(() => {
    if (currentQuestion && currentAnswer !== undefined) {
      localStorage.setItem(
        `census-answer-${currentQuestion.id}`,
        JSON.stringify(currentAnswer)
      )
    }
  }, [currentQuestion, currentAnswer])

  const goBack = useCallback(() => {
    if (!isFirstQuestion) {
      setDirection('back')
      setCurrentIndex((i) => i - 1)
    }
  }, [isFirstQuestion])

  const goForward = useCallback(() => {
    if (!canGoForward) return
    if (isLastQuestion) {
      onCompleteRef.current(answers)
    } else {
      setDirection('forward')
      setCurrentIndex((i) => i + 1)
    }
  }, [canGoForward, isLastQuestion, answers])

  const setAnswer = useCallback(
    (value: unknown) => {
      if (!currentQuestion) return
      setAnswers((prev) => new Map(prev).set(currentQuestion.id, value))
    },
    [currentQuestion]
  )

  if (!currentQuestion) {
    return (
      <div className="text-center py-12 text-muted">
        <p>No questions available</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Navigation header: [<-] [X of Y] [->] */}
      <div className="flex items-center justify-between">
        <button
          onClick={goBack}
          disabled={isFirstQuestion}
          className="p-2 text-muted hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous question"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span className="text-sm text-muted">
          {safeIndex + 1} of {questions.length}
        </span>

        <button
          onClick={goForward}
          disabled={!canGoForward}
          className="p-2 text-muted hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next question"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <ProgressBar
        value={((safeIndex + 1) / questions.length) * 100}
        size="sm"
        variant="default"
      />

      {/* Question with animation */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentQuestion.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={slideTransition}
        >
          <QuestionRenderer
            question={currentQuestion}
            value={currentAnswer ?? getDefaultValue(currentQuestion.type)}
            onChange={setAnswer}
          />
        </motion.div>
      </AnimatePresence>

      {/* Bottom action button */}
      <div className="pt-4">
        <Button
          variant={buttonState.variant}
          onClick={goForward}
          disabled={buttonState.disabled}
          fullWidth
        >
          {isLastQuestion ? 'Complete Form' : buttonState.text} →
        </Button>
      </div>
    </div>
  )
}


'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button, NavProgress } from '@/components/ui'
import { QuestionRenderer } from './QuestionRenderer'
import { useQuestionNavigation } from './useQuestionNavigation'
import { getDefaultValue } from './defaults'
import type { SectionRunnerProps } from './types'

export function SectionRunner({
  section,
  initialAnswers,
  onComplete,
  onExit,
  onAnswersChange,
}: SectionRunnerProps) {
  const nav = useQuestionNavigation(
    section.questions,
    initialAnswers,
    onComplete ?? (() => {})
  )
  const contentRef = useRef<HTMLDivElement>(null)
  
  void onExit // Exit handled at page level
  
  // Stable reference for initial state comparison
  const initialAnswersJson = useRef(
    JSON.stringify([...initialAnswers.entries()].sort(([a], [b]) => a.localeCompare(b)))
  )
  
  // Notify parent of answer changes
  useEffect(() => {
    if (onAnswersChange) {
      const currentJson = JSON.stringify(
        [...nav.answers.entries()].sort(([a], [b]) => a.localeCompare(b))
      )
      onAnswersChange(nav.answers, currentJson !== initialAnswersJson.current)
    }
  }, [nav.answers, onAnswersChange])
  
  // Auto-save to localStorage
  useEffect(() => {
    if (nav.currentQuestion && nav.currentAnswer !== undefined) {
      localStorage.setItem(
        `census-answer-${nav.currentQuestion.id}`,
        JSON.stringify(nav.currentAnswer)
      )
    }
  }, [nav.currentQuestion, nav.currentAnswer])
  
  // Auto-focus first focusable element after question transition
  useEffect(() => {
    const timer = setTimeout(() => {
      if (contentRef.current) {
        const firstFocusable = contentRef.current.querySelector<HTMLElement>(
          'input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), [tabindex="0"]:not([disabled])'
        )
        // Only focus if it's an input/textarea (not buttons, to avoid visual jarring)
        if (firstFocusable && (firstFocusable.tagName === 'INPUT' || firstFocusable.tagName === 'TEXTAREA')) {
          firstFocusable.focus()
        }
      }
    }, 350) // After animation completes
    
    return () => clearTimeout(timer)
  }, [nav.currentQuestion?.id])
  
  if (!nav.currentQuestion) {
    return (
      <div className="text-center py-12 text-muted">
        <p>No questions available</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-8">
      <NavProgress
        currentStep={nav.currentIndex}
        totalSteps={nav.totalQuestions}
        onBack={nav.goBack}
        onForward={nav.goForward}
        canGoBack={!nav.isFirstQuestion}
        canGoForward={nav.canGoForward}
        backLabel="Previous question"
        forwardLabel="Next question"
      />
      
      {/* Question with animation */}
      <AnimatePresence mode="wait" custom={nav.direction}>
        <motion.div
          ref={contentRef}
          key={nav.currentQuestion.id}
          custom={nav.direction}
          initial={{ opacity: 0, x: nav.direction === 'forward' ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: nav.direction === 'forward' ? -50 : 50 }}
          transition={{ duration: 0.3 }}
        >
          <QuestionRenderer
            question={nav.currentQuestion}
            value={nav.currentAnswer ?? getDefaultValue(nav.currentQuestion.type)}
            onChange={nav.setAnswer}
            onCommit={nav.triggerAutoAdvance}
          />
        </motion.div>
      </AnimatePresence>
      
      {/* Bottom action button */}
      <div className="pt-4">
        <Button
          variant={nav.buttonState.variant}
          onClick={nav.goForward}
          disabled={nav.buttonState.disabled}
          fullWidth
        >
          {nav.isLastQuestion ? 'Complete Section' : nav.buttonState.text} →
        </Button>
      </div>
    </div>
  )
}


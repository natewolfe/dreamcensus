'use client'

import { useEffect } from 'react'
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
}: SectionRunnerProps) {
  const nav = useQuestionNavigation(
    section.questions,
    initialAnswers,
    onComplete ?? (() => {})
  )
  
  void onExit // Exit handled at page level
  
  // Auto-save to localStorage
  useEffect(() => {
    if (nav.currentQuestion && nav.currentAnswer !== undefined) {
      localStorage.setItem(
        `census-answer-${nav.currentQuestion.id}`,
        JSON.stringify(nav.currentAnswer)
      )
    }
  }, [nav.currentQuestion, nav.currentAnswer])
  
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


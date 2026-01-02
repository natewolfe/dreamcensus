'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { QuestionCard } from '@/components/census/QuestionCard'
import { Button, Icon } from '@/components/ui'
import type { Question, AnswerValue } from '@/lib/types'

interface CardFlowProps {
  initialQuestions: Question[]
  themeProgress?: {
    themeSlug: string
    themeName: string
    answered: number
    total: number
  }
  mode: 'mixed' | 'theme-focus'
}

export function CardFlow({ initialQuestions, themeProgress, mode }: CardFlowProps) {
  const router = useRouter()
  const [questions, setQuestions] = useState(initialQuestions)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  // Detect desktop
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex) / questions.length) * 100

  const handleAnswer = useCallback((value: AnswerValue) => {
    if (!currentQuestion) return
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }))
  }, [currentQuestion])

  const handleSubmit = useCallback(async () => {
    if (!currentQuestion || isSaving) return

    const answer = answers[currentQuestion.id]
    if (answer === null || answer === undefined) return

    setIsSaving(true)

    try {
      // Save answer to database
      await fetch('/api/census/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answer,
          source: mode === 'theme-focus' ? 'focus-mode' : 'card',
        }),
      })

      // Move to next question
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1)
      } else {
        // Completed all questions
        router.push('/census/map')
      }
    } catch (error) {
      console.error('Failed to save answer:', error)
      alert('Failed to save your answer. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }, [currentQuestion, answers, currentIndex, questions.length, mode, router, isSaving])

  const handleSkip = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      router.push('/census/map')
    }
  }, [currentIndex, questions.length, router])

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }, [currentIndex])

  if (!currentQuestion) {
    return null
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header with progress */}
      <div className="border-b border-[var(--border)] bg-[var(--background-elevated)]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/census/map')}
                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <Icon name="chevron-left" />
              </button>
              <div>
                <div className="font-medium">
                  {themeProgress ? themeProgress.themeName : 'Dream Census'}
                </div>
                <div className="text-xs text-[var(--foreground-muted)]">
                  Question {currentIndex + 1} of {questions.length}
                </div>
              </div>
            </div>

            {themeProgress && (
              <div className="text-sm text-[var(--foreground-muted)]">
                {themeProgress.answered + currentIndex + 1}/{themeProgress.total}
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="progress-bar">
            <motion.div
              className="progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Card Stack */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl aspect-[3/4] max-h-[700px]">
          <AnimatePresence mode="popLayout">
            {questions.slice(currentIndex, currentIndex + 3).map((question, index) => (
              <motion.div
                key={question.id}
                className="absolute inset-0"
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{
                  scale: 1 - index * 0.05,
                  opacity: 1 - index * 0.3,
                  y: index * 10,
                  zIndex: 10 - index,
                }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <QuestionCard
                  question={question}
                  value={answers[question.id] ?? null}
                  onChange={handleAnswer}
                  onSubmit={handleSubmit}
                  onSkip={handleSkip}
                  isSwipeable={!isDesktop}
                  isTop={index === 0}
                  showThemeIndicator={mode === 'mixed'}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Desktop Navigation */}
      {isDesktop && (
        <div className="border-t border-[var(--border)] bg-[var(--background-elevated)]">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <Icon name="chevron-left" className="mr-2" />
              Previous
            </Button>

            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSaving || answers[currentQuestion.id] === undefined}
              loading={isSaving}
            >
              {currentIndex === questions.length - 1 ? 'Complete' : 'Next'}
              <Icon name="chevron-right" className="ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Mobile hint */}
      {!isDesktop && (
        <div className="text-center text-sm text-[var(--foreground-muted)] py-4 px-4">
          Swipe to answer • Tap to see more
        </div>
      )}
    </div>
  )
}


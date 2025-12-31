'use client'

import { useState, useCallback, useEffect, useTransition, useOptimistic } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import type { CensusStepData, AnswersState, AnswerValue } from '@/lib/types'
import { calculateProgress } from '@/lib/progress'
import { FormStep } from './form-step'
import { submitCensus, saveAnswer, checkAndCompleteCensus } from './actions'
import { WizardProgress } from '@/components/census/WizardProgress'

interface CensusWizardProps {
  steps: CensusStepData[]
  totalSteps: number
  initialAnswers?: AnswersState
  initialStep?: number
  chapterSlug?: string
  chapterName?: string
}

export function CensusWizard({ 
  steps, 
  totalSteps, 
  initialAnswers = {}, 
  initialStep = 0,
  chapterSlug,
  chapterName
}: CensusWizardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  // Use provided initialStep or parse from URL
  const urlStep = parseInt(searchParams.get('step') || '0', 10)
  const startingStep = initialStep > 0 ? initialStep : urlStep
  const [currentIndex, setCurrentIndex] = useState(
    Math.min(Math.max(0, startingStep), steps.length - 1)
  )
  const [answers, setAnswers] = useState<AnswersState>(initialAnswers)
  const [optimisticAnswers, setOptimisticAnswers] = useOptimistic(answers)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const currentStep = steps[currentIndex]
  const progress = calculateProgress(currentIndex + 1, totalSteps)
  const isFirstStep = currentIndex === 0
  const isLastStep = currentIndex === steps.length - 1

  // Update URL when step changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    params.set('step', currentIndex.toString())
    const basePath = chapterSlug ? `/census/${chapterSlug}` : '/census'
    router.replace(`${basePath}?${params.toString()}`, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, chapterSlug]) // Only update when step index changes, not when searchParams changes

  // Debounced auto-save
  const debouncedSave = useDebouncedCallback(
    async (stepId: string, value: AnswerValue) => {
      const formData = new FormData()
      formData.set('stepId', stepId)
      formData.set('value', JSON.stringify(value))
      await saveAnswer(formData)
    },
    1000
  )

  // Handle answer submission with optimistic update
  const handleAnswer = useCallback((value: AnswerValue) => {
    const key = currentStep.analyticsKey || currentStep.id
    
    // Update actual state immediately
    setAnswers((prev) => ({ ...prev, [key]: value }))
    
    // Optimistic update must be inside a transition (React 19 requirement)
    startTransition(() => {
      setOptimisticAnswers((prev) => ({ ...prev, [key]: value }))
    })
    
    // Auto-save to server in background
    debouncedSave(currentStep.id, value)
  }, [currentStep, debouncedSave, setOptimisticAnswers, startTransition])

  // Navigate to next step
  const handleNext = useCallback(async () => {
    if (isLastStep) {
      // Flush any pending debounced saves
      await debouncedSave.flush()
      
      // For chapter completion: check if all chapters are done
      if (chapterSlug) {
        startTransition(async () => {
          // Check if this was the last chapter
          await checkAndCompleteCensus()
          // Redirect to chapter completion page
          router.push(`/census/${chapterSlug}/complete`)
        })
      } else {
        // Full census completion - mark as complete
        startTransition(async () => {
          try {
            const result = await submitCensus({ answers })
            if ('error' in result) {
              setSubmitError(result.error)
            } else {
              router.push('/census/complete')
            }
          } catch (err) {
            setSubmitError('Failed to submit census. Please try again.')
            console.error('Census submission error:', err)
          }
        })
      }
      return
    }

    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => Math.min(prev + 1, steps.length - 1))
      setIsTransitioning(false)
    }, 150)
  }, [isLastStep, answers, router, steps.length, chapterSlug, debouncedSave])

  // Navigate to previous step
  const handleBack = useCallback(() => {
    if (isFirstStep) return
    
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => Math.max(prev - 1, 0))
      setIsTransitioning(false)
    }, 150)
  }, [isFirstStep])

  // Check if current step is answered (use optimistic state for immediate feedback)
  const currentAnswer = optimisticAnswers[currentStep.analyticsKey || currentStep.id]
  const isRequired = currentStep.props.required ?? false
  const hasAnswer = (() => {
    if (currentAnswer === undefined || currentAnswer === null) return false
    if (currentAnswer === '') return false
    if (Array.isArray(currentAnswer) && currentAnswer.length === 0) return false
    return true
  })()
  const canProceed = !isRequired || hasAnswer || currentStep.kind === 'statement'

  return (
    <div className="min-h-screen flex flex-col">
      {/* Enhanced Progress Header */}
      <WizardProgress
        currentIndex={currentIndex}
        totalSteps={totalSteps}
        chapterName={chapterName}
        steps={steps}
      />

      {/* Screen reader announcement */}
      <div 
        aria-live="polite" 
        className="sr-only"
      >
        Question {currentIndex + 1} of {totalSteps}
      </div>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-[var(--space-page)] py-20 pt-24">
        <div 
          className={`w-full max-w-2xl transition-opacity duration-150 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >

          {/* Error message */}
          {submitError && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
              {submitError}
            </div>
          )}

          {/* Question */}
          <FormStep
            step={currentStep}
            value={currentAnswer}
            onChange={handleAnswer}
            onSubmit={handleNext}
          />

          {/* Navigation */}
          <div className="flex items-center justify-between mt-12 pt-6 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={handleBack}
              disabled={isFirstStep || isPending}
              className="btn btn-secondary disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed || isPending}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </span>
              ) : isLastStep ? (
                'Complete'
              ) : (
                'Continue →'
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Keyboard hint */}
      <footer className="fixed bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-[var(--foreground-subtle)]">
          Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--background-elevated)] text-[var(--foreground-muted)]">Enter</kbd> to continue
        </p>
      </footer>
    </div>
  )
}


import { useState, useCallback } from 'react'

export interface UseSubStepFlowConfig<TStep extends string> {
  steps: readonly TStep[]
  parentDirection?: 'forward' | 'back'
  onComplete: () => void
  onBack: () => void
}

export interface UseSubStepFlowReturn<TStep extends string> {
  subStep: TStep
  direction: 'forward' | 'back'
  currentSubIndex: number
  isLastSubStep: boolean
  goNext: () => void
  goBack: () => void
}

/**
 * Hook for managing multi-substep navigation within a flow step
 * Abstracts the common pattern used in QuickFacts, MicroStructure, CloseRitual, etc.
 * 
 * @example
 * const { subStep, direction, goNext, goBack } = useSubStepFlow({
 *   steps: ['recall', 'emotions', 'flags'] as const,
 *   onComplete: () => handleComplete({ data }),
 *   onBack: () => handleBack(),
 * })
 */
export function useSubStepFlow<TStep extends string>({
  steps,
  parentDirection = 'forward',
  onComplete,
  onBack,
}: UseSubStepFlowConfig<TStep>): UseSubStepFlowReturn<TStep> {
  const [subStep, setSubStep] = useState<TStep>(steps[0])
  const [direction, setDirection] = useState<'forward' | 'back'>(parentDirection)

  const currentSubIndex = steps.indexOf(subStep)
  const isLastSubStep = currentSubIndex === steps.length - 1

  const goNext = useCallback(() => {
    if (isLastSubStep) {
      onComplete()
    } else {
      setDirection('forward')
      setSubStep(steps[currentSubIndex + 1])
    }
  }, [isLastSubStep, currentSubIndex, steps, onComplete])

  const goBack = useCallback(() => {
    if (currentSubIndex === 0) {
      onBack()
    } else {
      setDirection('back')
      setSubStep(steps[currentSubIndex - 1])
    }
  }, [currentSubIndex, steps, onBack])

  return {
    subStep,
    direction,
    currentSubIndex,
    isLastSubStep,
    goNext,
    goBack,
  }
}


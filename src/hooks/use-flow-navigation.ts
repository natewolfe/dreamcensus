import { useState, useCallback } from 'react'
import type {
  FlowConfig,
  FlowNavigationReturn,
  FlowNavigationState,
} from '@/lib/flow/types'

/**
 * Generic hook for managing flow navigation state and actions
 * 
 * @example
 * const { state, actions } = useFlowNavigation({
 *   steps: ['start', 'details', 'confirm', 'complete'],
 *   initialData: { name: '', email: '' },
 *   onComplete: async (data) => { await saveData(data) },
 * })
 * 
 * // In component:
 * <button onClick={actions.next}>Next</button>
 * <button onClick={actions.back}>Back</button>
 */
export function useFlowNavigation<TStep extends string, TData>(
  config: FlowConfig<TStep, TData>
): FlowNavigationReturn<TStep, TData> {
  const { steps, initialData, onComplete, onCancel } = config

  const [stepIndex, setStepIndex] = useState(0)
  const [data, setData] = useState<TData>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')

  const currentStep = steps[stepIndex] as TStep

  const next = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      setDirection('forward')
      setStepIndex((prev) => prev + 1)
    }
  }, [stepIndex, steps.length])

  const back = useCallback(() => {
    if (stepIndex > 0) {
      setDirection('back')
      setStepIndex((prev) => prev - 1)
    }
  }, [stepIndex])

  const skip = useCallback(() => {
    next()
  }, [next])

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < steps.length) {
        setDirection(step > stepIndex ? 'forward' : 'back')
        setStepIndex(step)
      }
    },
    [stepIndex, steps.length]
  )

  const updateData = useCallback((updates: Partial<TData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }, [])

  const complete = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      await onComplete(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [data, onComplete])

  const cancel = useCallback(() => {
    if (onCancel) {
      onCancel()
    }
  }, [onCancel])

  const state: FlowNavigationState<TStep, TData> = {
    currentStep,
    stepIndex,
    totalSteps: steps.length,
    data,
    isLoading,
    error,
    direction,
  }

  const actions = {
    next,
    back,
    skip,
    goToStep,
    updateData,
    complete,
    cancel,
  }

  return { state, actions }
}


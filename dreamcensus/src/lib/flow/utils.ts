import type { FlowDirection } from './types'

/**
 * Creates a flow navigator helper to reduce boilerplate in manual state machines
 * 
 * @example
 * ```tsx
 * const navigator = createFlowNavigator(
 *   ['start', 'details', 'confirm'],
 *   setStep,
 *   setDirection
 * )
 * 
 * // Navigate to a specific step
 * navigator.goTo('details', 'forward')
 * 
 * // Go to next step in sequence
 * navigator.goNext('start') // -> 'details'
 * 
 * // Go to previous step
 * navigator.goBack('details') // -> 'start'
 * ```
 */
export function createFlowNavigator<TStep extends string>(
  steps: readonly TStep[],
  setStep: (step: TStep) => void,
  setDirection: (dir: FlowDirection) => void
) {
  return {
    /**
     * Navigate to a specific step with direction
     */
    goTo(step: TStep, direction: FlowDirection = 'forward') {
      setDirection(direction)
      setStep(step)
    },

    /**
     * Navigate to the next step in the sequence
     * Returns false if already at the last step
     */
    goNext(currentStep: TStep): boolean {
      const currentIndex = steps.indexOf(currentStep)
      if (currentIndex === -1 || currentIndex === steps.length - 1) {
        return false
      }
      
      setDirection('forward')
      setStep(steps[currentIndex + 1]!)
      return true
    },

    /**
     * Navigate to the previous step in the sequence
     * Returns false if already at the first step
     */
    goBack(currentStep: TStep): boolean {
      const currentIndex = steps.indexOf(currentStep)
      if (currentIndex === -1 || currentIndex === 0) {
        return false
      }
      
      setDirection('back')
      setStep(steps[currentIndex - 1]!)
      return true
    },

    /**
     * Get the index of a step
     */
    getStepIndex(step: TStep): number {
      return steps.indexOf(step)
    },

    /**
     * Check if a step is the first step
     */
    isFirstStep(step: TStep): boolean {
      return steps.indexOf(step) === 0
    },

    /**
     * Check if a step is the last step
     */
    isLastStep(step: TStep): boolean {
      return steps.indexOf(step) === steps.length - 1
    },

    /**
     * Get the next step in the sequence (without navigating)
     */
    getNextStep(currentStep: TStep): TStep | null {
      const currentIndex = steps.indexOf(currentStep)
      if (currentIndex === -1 || currentIndex === steps.length - 1) {
        return null
      }
      return steps[currentIndex + 1]!
    },

    /**
     * Get the previous step in the sequence (without navigating)
     */
    getPreviousStep(currentStep: TStep): TStep | null {
      const currentIndex = steps.indexOf(currentStep)
      if (currentIndex === -1 || currentIndex === 0) {
        return null
      }
      return steps[currentIndex - 1]!
    },
  }
}

/**
 * Helper to calculate progress percentage for a flow
 */
export function calculateFlowProgress(
  currentStep: string,
  steps: readonly string[]
): number {
  const index = steps.indexOf(currentStep)
  if (index === -1) return 0
  return Math.round(((index + 1) / steps.length) * 100)
}

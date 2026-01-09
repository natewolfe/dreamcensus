/**
 * Shared step configuration factory
 * Provides reusable utilities for flow step management
 */

export interface StepConfig<TStep extends string> {
  stepCounts: Record<TStep, number>
  defaultOrder: TStep[]
}

export interface StepConfigReturn<TStep extends string> {
  stepCounts: Record<TStep, number>
  getTotalSteps: (order?: TStep[]) => number
  getStepOffset: (currentStep: TStep, order?: TStep[]) => number
}

/**
 * Factory function to create step configuration utilities
 * Abstracts the common logic for calculating step offsets and totals
 * 
 * @example
 * const nightConfig = createStepConfig({
 *   stepCounts: { welcome: 1, day_reflect: 2, breathing: 1 },
 *   defaultOrder: ['welcome', 'day_reflect', 'breathing'],
 * })
 * 
 * const total = nightConfig.getTotalSteps() // 4
 * const offset = nightConfig.getStepOffset('breathing') // 3
 */
export function createStepConfig<TStep extends string>(
  config: StepConfig<TStep>
): StepConfigReturn<TStep> {
  const { stepCounts, defaultOrder } = config

  function getTotalSteps(order: TStep[] = defaultOrder): number {
    return order.reduce((sum, step) => sum + (stepCounts[step] ?? 0), 0)
  }

  function getStepOffset(currentStep: TStep, order: TStep[] = defaultOrder): number {
    const index = order.indexOf(currentStep)
    if (index === -1) return 0
    
    let offset = 0
    for (let i = 0; i < index; i++) {
      offset += stepCounts[order[i]] ?? 0
    }
    return offset
  }

  return {
    stepCounts,
    getTotalSteps,
    getStepOffset,
  }
}


import type { NightStep } from './types'

/**
 * Step counts for each screen in the night flow
 */
export const STEP_COUNTS: Record<NightStep, number> = {
  'welcome': 1,
  'day_reflect': 2,
  'breathing': 1,
  'intention': 1,
  'tomorrow': 2,
  'complete': 0, // Completion screen has no counter
}

/**
 * Total steps in night flow (linear path)
 */
export const TOTAL_STEPS = 7 // welcome(1) + dayReflect(2) + breathing(1) + intention(1) + tomorrow(2)

/**
 * Get step offset (how many steps came before current screen)
 */
export function getStepOffset(currentStep: NightStep): number {
  const order: NightStep[] = ['welcome', 'day_reflect', 'breathing', 'intention', 'tomorrow', 'complete']
  const index = order.indexOf(currentStep)
  
  if (index === -1) return 0
  
  let offset = 0
  for (let i = 0; i < index; i++) {
    const step = order[i]
    if (step) {
      offset += STEP_COUNTS[step]
    }
  }
  
  return offset
}


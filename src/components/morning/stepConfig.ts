import type { MorningStep, RecallLevel } from './types'

export type MorningPath = 'full' | 'fragments' | 'minimal' | null
export type CaptureMethod = 'voice' | 'text' | null

/**
 * Map recall level to path
 * - nothing → minimal (emotion-only, no capture)
 * - fragments → fragments (quick capture, simplified)
 * - scene/full → full (complete capture flow)
 */
export function getPathFromRecall(recallLevel: RecallLevel | undefined): MorningPath {
  if (!recallLevel) return null
  
  switch (recallLevel) {
    case 'nothing':
      return 'minimal'
    case 'fragments':
      return 'fragments'
    case 'scene':
    case 'full':
      return 'full'
  }
}

/**
 * Step counts for each screen in the morning flow
 */
export const STEP_COUNTS: Record<MorningStep, number> = {
  'start': 1,        // Capture method selection
  'quick-facts': 3,  // recall, emotions, flags
  'voice': 1,
  'text': 1,
  'structure': 2,    // vividness, lucidity
  'tags': 1,
  'close': 2,        // title, waking life
  'complete': 0,     // Completion screen has no counter
}

/**
 * Calculate total steps based on recall path
 */
export function getTotalSteps(path: MorningPath, _captureMethod?: CaptureMethod): number {
  if (!path) {
    // Before recall is determined, show just start step
    return 1
  }
  
  if (path === 'minimal') {
    // Minimal: start(1) + structure(2) + close(2) = 5
    // No quick-facts, no capture, no tags
    return 5
  }
  
  if (path === 'fragments') {
    // Fragments: start(1) + quickFacts(3) + capture(1) + structure(2) + close(2) = 9
    // Skip tags for fragments
    return 9
  }
  
  // Full: start(1) + quickFacts(3) + capture(1) + structure(2) + tags(1) + close(2) = 10
  return 10
}

/**
 * Get step offset (how many steps came before current screen)
 */
export function getStepOffset(
  currentStep: MorningStep, 
  path: MorningPath, 
  captureMethod: CaptureMethod
): number {
  const order = getStepOrder(path, captureMethod)
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

/**
 * Get the ordered list of steps for a given path
 */
export function getStepOrder(path: MorningPath, captureMethod: CaptureMethod): MorningStep[] {
  if (!path) {
    return ['start', 'complete']
  }
  
  if (path === 'minimal') {
    // No capture, simplified flow
    return ['start', 'structure', 'close', 'complete']
  }
  
  if (path === 'fragments') {
    // Quick capture, no detailed tags
    const capture: MorningStep = captureMethod === 'voice' ? 'voice' : 'text'
    return ['start', 'quick-facts', capture, 'structure', 'close', 'complete']
  }
  
  // Full path
  const capture: MorningStep = captureMethod === 'voice' ? 'voice' : 'text'
  return ['start', 'quick-facts', capture, 'structure', 'tags', 'close', 'complete']
}

/**
 * Determine next step based on current state
 */
export function getNextStep(
  currentStep: MorningStep,
  path: MorningPath,
  captureMethod: CaptureMethod
): MorningStep | null {
  const order = getStepOrder(path, captureMethod)
  const index = order.indexOf(currentStep)
  
  if (index === -1 || index >= order.length - 1) return null
  return order[index + 1] ?? null
}

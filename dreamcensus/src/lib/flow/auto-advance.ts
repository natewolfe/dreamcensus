import type { QuestionType, QuestionConfig } from '@/components/census/types'

/** Delay before auto-advancing (ms) - allows user to see selection */
export const AUTO_ADVANCE_DELAY = 300

/** Question types that should auto-advance on single selection */
export function shouldAutoAdvance(
  type: QuestionType,
  config?: QuestionConfig
): boolean {
  switch (type) {
    case 'binary':
    case 'statement':
    case 'scale':
    case 'frequency':
    case 'dropdown':
      return true
    case 'choice':
      return !config?.allowMultiple && !config?.allowOther
    case 'imageChoice':
      return !config?.allowMultiple
    default:
      return false
  }
}

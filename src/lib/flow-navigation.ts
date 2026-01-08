/**
 * Shared utilities for flow navigation (Morning/Night modes)
 * Extracted from useQuestionNavigation for DRY
 */

export type SkipBehavior = 'required' | 'optional' | 'skippable'

export interface ButtonState {
  text: string
  variant: 'primary' | 'secondary' | 'special'
  disabled: boolean
}

/**
 * Compute button state based on validation and skip behavior
 * @param isValid - Whether the current step has valid input
 * @param skipBehavior - How skipping is handled (required/optional/skippable)
 * @param isLast - Whether this is the last step in the flow
 * @returns Button state with text, variant, and disabled status
 */
export function getButtonState(
  isValid: boolean,
  skipBehavior: SkipBehavior = 'optional',
  isLast: boolean = false
): ButtonState {
  // Last step shows "Complete" with special styling
  if (isLast) {
    return { 
      text: 'Complete', 
      variant: 'special', 
      disabled: !isValid && skipBehavior === 'required' 
    }
  }
  
  // Not valid but can skip
  if (!isValid && (skipBehavior === 'optional' || skipBehavior === 'skippable')) {
    return { text: 'Skip', variant: 'secondary', disabled: false }
  }
  
  // Not valid and required - block forward progress
  if (!isValid && skipBehavior === 'required') {
    return { text: 'Next', variant: 'secondary', disabled: true }
  }
  
  // Valid - primary action
  return { text: 'Next', variant: 'primary', disabled: false }
}


import type { AnswerValue, StepKind, StepProps } from './types'

/**
 * Check if an answer has a valid value (not empty/null/undefined)
 */
export function isAnswerValid(value: AnswerValue, _kind: StepKind): boolean {
  if (value === undefined || value === null) return false
  if (value === '') return false
  if (Array.isArray(value) && value.length === 0) return false
  return true
}

/**
 * Validate answer completeness with specific error messages
 */
export function isAnswerComplete(
  value: AnswerValue,
  kind: StepKind,
  props: StepProps
): { valid: boolean; error?: string } {
  // Optional fields can be empty
  if (!props.required && !isAnswerValid(value, kind)) {
    return { valid: true }
  }
  
  // Required fields must have a value
  if (props.required && !isAnswerValid(value, kind)) {
    return { valid: false, error: 'This field is required' }
  }

  // Validate number ranges
  if (kind === 'number' && typeof value === 'number') {
    if (props.minValue !== undefined && value < props.minValue) {
      return { valid: false, error: `Minimum value is ${props.minValue}` }
    }
    if (props.maxValue !== undefined && value > props.maxValue) {
      return { valid: false, error: `Maximum value is ${props.maxValue}` }
    }
  }

  // Validate text length
  if ((kind === 'short_text' || kind === 'long_text') && typeof value === 'string') {
    if (props.maxLength !== undefined && value.length > props.maxLength) {
      return { valid: false, error: `Maximum length is ${props.maxLength} characters` }
    }
  }

  return { valid: true }
}


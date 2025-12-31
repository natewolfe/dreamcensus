import { describe, it, expect } from 'vitest'
import { isAnswerValid, isAnswerComplete } from './validation'
import type { StepProps } from './types'

describe('isAnswerValid', () => {
  it('should return false for undefined', () => {
    expect(isAnswerValid(undefined, 'short_text')).toBe(false)
  })

  it('should return false for null', () => {
    expect(isAnswerValid(null, 'short_text')).toBe(false)
  })

  it('should return false for empty string', () => {
    expect(isAnswerValid('', 'short_text')).toBe(false)
  })

  it('should return false for empty array', () => {
    expect(isAnswerValid([], 'multi_choice')).toBe(false)
  })

  it('should return true for non-empty string', () => {
    expect(isAnswerValid('answer', 'short_text')).toBe(true)
  })

  it('should return true for number', () => {
    expect(isAnswerValid(5, 'number')).toBe(true)
  })

  it('should return true for non-empty array', () => {
    expect(isAnswerValid(['option1'], 'multi_choice')).toBe(true)
  })
})

describe('isAnswerComplete', () => {
  it('should allow empty value for optional field', () => {
    const props: StepProps = { required: false }
    const result = isAnswerComplete('', 'short_text', props)
    expect(result.valid).toBe(true)
  })

  it('should reject empty value for required field', () => {
    const props: StepProps = { required: true }
    const result = isAnswerComplete('', 'short_text', props)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('This field is required')
  })

  it('should validate number minimum', () => {
    const props: StepProps = { required: true, minValue: 5 }
    const result = isAnswerComplete(3, 'number', props)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Minimum value is 5')
  })

  it('should validate number maximum', () => {
    const props: StepProps = { required: true, maxValue: 10 }
    const result = isAnswerComplete(15, 'number', props)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Maximum value is 10')
  })

  it('should validate text max length', () => {
    const props: StepProps = { required: true, maxLength: 10 }
    const result = isAnswerComplete('This is a very long text', 'short_text', props)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Maximum length is 10 characters')
  })

  it('should accept valid number in range', () => {
    const props: StepProps = { required: true, minValue: 1, maxValue: 10 }
    const result = isAnswerComplete(5, 'number', props)
    expect(result.valid).toBe(true)
  })

  it('should accept valid text within length', () => {
    const props: StepProps = { required: true, maxLength: 100 }
    const result = isAnswerComplete('Short text', 'short_text', props)
    expect(result.valid).toBe(true)
  })
})


import { describe, it, expect } from 'vitest'
import { getButtonState, type SkipBehavior } from '../flow-navigation'

describe('getButtonState', () => {
  describe('Last step behavior', () => {
    it('should show "Complete" for valid last step', () => {
      const state = getButtonState(true, 'optional', true)
      
      expect(state.text).toBe('Complete')
      expect(state.variant).toBe('primary')
      expect(state.disabled).toBe(false)
    })

    it('should show "Complete" disabled for invalid required last step', () => {
      const state = getButtonState(false, 'required', true)
      
      expect(state.text).toBe('Complete')
      expect(state.variant).toBe('primary')
      expect(state.disabled).toBe(true)
    })

    it('should show "Complete" enabled for invalid optional last step', () => {
      const state = getButtonState(false, 'optional', true)
      
      expect(state.text).toBe('Complete')
      expect(state.variant).toBe('primary')
      expect(state.disabled).toBe(false)
    })
  })

  describe('Non-last step - Valid input', () => {
    it('should show "Next" primary for valid required step', () => {
      const state = getButtonState(true, 'required', false)
      
      expect(state.text).toBe('Next')
      expect(state.variant).toBe('primary')
      expect(state.disabled).toBe(false)
    })

    it('should show "Next" primary for valid optional step', () => {
      const state = getButtonState(true, 'optional', false)
      
      expect(state.text).toBe('Next')
      expect(state.variant).toBe('primary')
      expect(state.disabled).toBe(false)
    })

    it('should show "Next" primary for valid skippable step', () => {
      const state = getButtonState(true, 'skippable', false)
      
      expect(state.text).toBe('Next')
      expect(state.variant).toBe('primary')
      expect(state.disabled).toBe(false)
    })
  })

  describe('Non-last step - Invalid input', () => {
    it('should show "Next" disabled for invalid required step', () => {
      const state = getButtonState(false, 'required', false)
      
      expect(state.text).toBe('Next')
      expect(state.variant).toBe('secondary')
      expect(state.disabled).toBe(true)
    })

    it('should show "Skip" enabled for invalid optional step', () => {
      const state = getButtonState(false, 'optional', false)
      
      expect(state.text).toBe('Skip')
      expect(state.variant).toBe('secondary')
      expect(state.disabled).toBe(false)
    })

    it('should show "Skip" enabled for invalid skippable step', () => {
      const state = getButtonState(false, 'skippable', false)
      
      expect(state.text).toBe('Skip')
      expect(state.variant).toBe('secondary')
      expect(state.disabled).toBe(false)
    })
  })

  describe('Edge cases', () => {
    it('should handle undefined skipBehavior (defaults to optional)', () => {
      const state = getButtonState(false, undefined, false)
      
      expect(state.text).toBe('Skip')
      expect(state.variant).toBe('secondary')
      expect(state.disabled).toBe(false)
    })

    it('should handle isLast undefined (defaults to false)', () => {
      const state = getButtonState(true, 'optional', undefined)
      
      expect(state.text).toBe('Next')
      expect(state.variant).toBe('primary')
      expect(state.disabled).toBe(false)
    })
  })

  describe('All skip behaviors', () => {
    const skipBehaviors: SkipBehavior[] = ['required', 'optional', 'skippable']

    skipBehaviors.forEach((behavior) => {
      it(`should handle ${behavior} behavior correctly`, () => {
        const validState = getButtonState(true, behavior, false)
        const invalidState = getButtonState(false, behavior, false)

        // Valid should always show Next primary
        expect(validState.text).toBe('Next')
        expect(validState.variant).toBe('primary')

        // Invalid behavior depends on skip behavior
        if (behavior === 'required') {
          expect(invalidState.disabled).toBe(true)
        } else {
          expect(invalidState.text).toBe('Skip')
          expect(invalidState.disabled).toBe(false)
        }
      })
    })
  })
})

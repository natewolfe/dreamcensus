import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSubStepFlow } from '../use-sub-step-flow'

describe('useSubStepFlow', () => {
  const mockSteps = ['step1', 'step2', 'step3'] as const

  it('should initialize with first step', () => {
    const { result } = renderHook(() =>
      useSubStepFlow({
        steps: mockSteps,
        onComplete: vi.fn(),
        onBack: vi.fn(),
      })
    )

    expect(result.current.subStep).toBe('step1')
    expect(result.current.currentSubIndex).toBe(0)
    expect(result.current.localStep).toBe(0)
    expect(result.current.currentStep).toBe(0)
    expect(result.current.isLastSubStep).toBe(false)
    expect(result.current.direction).toBe('forward')
  })

  it('should advance to next substep on goNext', () => {
    const { result } = renderHook(() =>
      useSubStepFlow({
        steps: mockSteps,
        onComplete: vi.fn(),
        onBack: vi.fn(),
      })
    )

    act(() => {
      result.current.goNext()
    })

    expect(result.current.subStep).toBe('step2')
    expect(result.current.currentSubIndex).toBe(1)
    expect(result.current.direction).toBe('forward')
  })

  it('should go back to previous substep on goBack', () => {
    const { result } = renderHook(() =>
      useSubStepFlow({
        steps: mockSteps,
        onComplete: vi.fn(),
        onBack: vi.fn(),
      })
    )

    // Move forward first
    act(() => {
      result.current.goNext()
    })

    // Then go back
    act(() => {
      result.current.goBack()
    })

    expect(result.current.subStep).toBe('step1')
    expect(result.current.currentSubIndex).toBe(0)
    expect(result.current.direction).toBe('back')
  })

  it('should call onComplete when advancing past last step', () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() =>
      useSubStepFlow({
        steps: mockSteps,
        onComplete,
        onBack: vi.fn(),
      })
    )

    // Navigate to last step (index 2 of 3 steps)
    act(() => {
      result.current.goNext() // Move to step2 (index 1)
    })
    act(() => {
      result.current.goNext() // Move to step3 (index 2)
    })

    expect(result.current.isLastSubStep).toBe(true)

    // Advance past last step
    act(() => {
      result.current.goNext()
    })

    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('should call onBack when going back from first step', () => {
    const onBack = vi.fn()
    const { result } = renderHook(() =>
      useSubStepFlow({
        steps: mockSteps,
        onComplete: vi.fn(),
        onBack,
      })
    )

    act(() => {
      result.current.goBack()
    })

    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('should set isLastSubStep correctly', () => {
    const { result } = renderHook(() =>
      useSubStepFlow({
        steps: mockSteps,
        onComplete: vi.fn(),
        onBack: vi.fn(),
      })
    )

    expect(result.current.isLastSubStep).toBe(false)

    // Navigate to last step (index 2 of 3 steps)
    act(() => {
      result.current.goNext() // Move to step2 (index 1)
    })
    act(() => {
      result.current.goNext() // Move to step3 (index 2)
    })

    expect(result.current.isLastSubStep).toBe(true)
  })

  it('should respect parentDirection on initialization', () => {
    const { result } = renderHook(() =>
      useSubStepFlow({
        steps: mockSteps,
        parentDirection: 'back',
        onComplete: vi.fn(),
        onBack: vi.fn(),
      })
    )

    expect(result.current.direction).toBe('back')
  })

  it('should provide consistent aliases for step index', () => {
    const { result } = renderHook(() =>
      useSubStepFlow({
        steps: mockSteps,
        onComplete: vi.fn(),
        onBack: vi.fn(),
      })
    )

    act(() => {
      result.current.goNext()
    })

    expect(result.current.currentSubIndex).toBe(1)
    expect(result.current.localStep).toBe(1)
    expect(result.current.currentStep).toBe(1)
  })
})

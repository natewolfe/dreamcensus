import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useQuestionNavigation } from '@/components/census/useQuestionNavigation'
import type { CensusQuestion } from '@/components/census/types'

describe('useQuestionNavigation', () => {
  const mockQuestions: CensusQuestion[] = [
    {
      id: 'q1',
      text: 'Question 1',
      type: 'statement',
      order: 0,
      required: true,
      config: {},
    },
    {
      id: 'q2',
      text: 'Question 2',
      type: 'choice',
      order: 1,
      required: false,
      config: { options: ['A', 'B'] },
    },
    {
      id: 'q3',
      text: 'Question 3',
      type: 'text',
      order: 2,
      required: true,
      config: {},
    },
  ]

  it('should initialize with first question and forward direction', () => {
    const { result } = renderHook(() =>
      useQuestionNavigation(mockQuestions, new Map(), vi.fn())
    )

    expect(result.current.currentIndex).toBe(0)
    expect(result.current.direction).toBe('forward')
    expect(result.current.currentQuestion?.id).toBe('q1')
    expect(result.current.isFirstQuestion).toBe(true)
    expect(result.current.isLastQuestion).toBe(false)
  })

  it('should navigate forward and increment index', () => {
    const { result } = renderHook(() =>
      useQuestionNavigation(mockQuestions, new Map(), vi.fn())
    )

    act(() => {
      result.current.setAnswer('agree')
    })

    act(() => {
      result.current.goForward()
    })

    expect(result.current.currentIndex).toBe(1)
    expect(result.current.direction).toBe('forward')
    expect(result.current.currentQuestion?.id).toBe('q2')
  })

  it('should navigate backward and decrement index', () => {
    const { result } = renderHook(() =>
      useQuestionNavigation(mockQuestions, new Map(), vi.fn())
    )

    // Move to second question first
    act(() => {
      result.current.setAnswer('agree')
    })
    act(() => {
      result.current.goForward()
    })

    // Then go back
    act(() => {
      result.current.goBack()
    })

    expect(result.current.currentIndex).toBe(0)
    expect(result.current.direction).toBe('backward')
    expect(result.current.currentQuestion?.id).toBe('q1')
  })

  it('should not go back from first question', () => {
    const { result } = renderHook(() =>
      useQuestionNavigation(mockQuestions, new Map(), vi.fn())
    )

    act(() => {
      result.current.goBack()
    })

    expect(result.current.currentIndex).toBe(0)
    expect(result.current.isFirstQuestion).toBe(true)
  })

  it('should call onComplete when advancing past last question', () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() =>
      useQuestionNavigation(mockQuestions, new Map(), onComplete)
    )

    // Navigate to last question (index 2 of 3 questions)
    act(() => {
      result.current.setAnswer('agree')
    })
    act(() => {
      result.current.goForward() // Move to index 1
    })
    act(() => {
      result.current.setAnswer('option A')
    })
    act(() => {
      result.current.goForward() // Move to index 2 (last)
    })

    // Now on last question
    expect(result.current.isLastQuestion).toBe(true)

    // Answer and advance
    act(() => {
      result.current.setAnswer('Some text')
    })
    act(() => {
      result.current.goForward()
    })

    expect(onComplete).toHaveBeenCalledWith(expect.any(Map))
  })

  it('should update answers correctly', () => {
    const { result } = renderHook(() =>
      useQuestionNavigation(mockQuestions, new Map(), vi.fn())
    )

    act(() => {
      result.current.setAnswer('agree')
    })

    expect(result.current.currentAnswer).toBe('agree')
    expect(result.current.answers.get('q1')).toBe('agree')
  })

  it('should reflect validation status in button state', () => {
    const { result } = renderHook(() =>
      useQuestionNavigation(mockQuestions, new Map(), vi.fn())
    )

    // Initially invalid (required question, no answer)
    expect(result.current.buttonState.disabled).toBe(true)

    // After answering
    act(() => {
      result.current.setAnswer('agree')
    })

    expect(result.current.buttonState.disabled).toBe(false)
    expect(result.current.buttonState.variant).toBe('primary')
  })

  it('should allow skipping optional questions', () => {
    const { result } = renderHook(() =>
      useQuestionNavigation(mockQuestions, new Map(), vi.fn())
    )

    // Navigate to optional question (q2) without answering q1
    act(() => {
      result.current.setAnswer('agree')
    })
    act(() => {
      result.current.goForward()
    })

    // q2 is optional (required: false), so without an answer it should show Skip
    // But we need to check if it's actually invalid first
    expect(result.current.canGoForward).toBe(true)
    // The button text depends on whether the question has a valid answer
    // Since we haven't answered q2, and it's optional, it should allow forward
    expect(result.current.buttonState.disabled).toBe(false)
  })

  it('should sort questions by order', () => {
    const unorderedQuestions = [
      { ...mockQuestions[2], order: 2 },
      { ...mockQuestions[0], order: 0 },
      { ...mockQuestions[1], order: 1 },
    ]

    const { result } = renderHook(() =>
      useQuestionNavigation(unorderedQuestions, new Map(), vi.fn())
    )

    expect(result.current.currentQuestion?.id).toBe('q1')
  })
})

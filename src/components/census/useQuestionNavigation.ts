'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import type { CensusQuestion } from './types'
import { getSkipBehavior } from './types'
import { hasValidAnswer } from '@/lib/census'
import { getButtonState as getButtonStateUtil, type ButtonState as ButtonStateType } from '@/lib/flow-navigation'
import { shouldAutoAdvance } from '@/lib/flow/auto-advance'
import { useDebouncedCommit } from '@/hooks/use-debounced-commit'

interface NavigationState {
  currentIndex: number
  direction: 'forward' | 'backward'
}

type ButtonState = ButtonStateType

// Deep equality check for answer comparison
function answersEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a === null || b === null || a === undefined || b === undefined) return false
  if (typeof a !== typeof b) return false
  if (typeof a !== 'object') return a === b
  
  // Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((val, i) => answersEqual(val, b[i]))
  }
  
  // Objects
  if (Array.isArray(a) || Array.isArray(b)) return false
  const keysA = Object.keys(a as object)
  const keysB = Object.keys(b as object)
  if (keysA.length !== keysB.length) return false
  return keysA.every(key => answersEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]))
}

export function useQuestionNavigation(
  questions: CensusQuestion[],
  initialAnswers: Map<string, unknown>,
  onComplete: (answers: Map<string, unknown>) => void
) {
  const [state, setState] = useState<NavigationState>({
    currentIndex: 0,
    direction: 'forward',
  })
  const [answers, setAnswers] = useState<Map<string, unknown>>(initialAnswers)
  
  // Use ref for onComplete to prevent stale closures
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
  
  const sortedQuestions = useMemo(
    () => [...questions].sort((a, b) => a.order - b.order),
    [questions]
  )
  
  const currentQuestion = sortedQuestions[state.currentIndex]
  const currentAnswer = currentQuestion ? answers.get(currentQuestion.id) : undefined
  const initialAnswer = currentQuestion ? initialAnswers.get(currentQuestion.id) : undefined
  
  // Derived state
  const isFirstQuestion = state.currentIndex === 0
  const isLastQuestion = state.currentIndex === sortedQuestions.length - 1
  const skipBehavior = currentQuestion ? getSkipBehavior(currentQuestion) : 'optional'
  const isValid = currentQuestion ? hasValidAnswer(currentQuestion, currentAnswer) : false
  const isReturning = initialAnswer !== undefined
  const isModified = isReturning && !answersEqual(currentAnswer, initialAnswer)
  
  // Can navigate forward?
  const canGoForward = skipBehavior !== 'required' || isValid
  
  // Determine if auto-advance should be disabled for current question
  const shouldDisableAutoAdvance = useMemo(() => {
    if (!currentQuestion) return true
    if (isLastQuestion) return true // Never auto-advance on last question
    if (isReturning) return true // User went back to review/change answer
    if (!shouldAutoAdvance(currentQuestion.type, currentQuestion.config)) return true
    return false
  }, [currentQuestion, isLastQuestion, isReturning])
  
  // Button state computation using shared utility
  const buttonState: ButtonState = useMemo(() => {
    // Use shared utility for base state
    const baseState = getButtonStateUtil(isValid, skipBehavior, isLastQuestion)
    
    // Special case: returning user with unmodified answer gets secondary variant
    if (isValid && isReturning && !isModified && !isLastQuestion) {
      return { ...baseState, variant: 'secondary' }
    }
    
    return baseState
  }, [skipBehavior, isValid, isReturning, isModified, isLastQuestion])
  
  // Actions
  const goBack = useCallback(() => {
    if (state.currentIndex > 0) {
      setState(s => ({ currentIndex: s.currentIndex - 1, direction: 'backward' }))
    }
  }, [state.currentIndex])
  
  const goForward = useCallback(() => {
    if (!canGoForward) return
    if (isLastQuestion) {
      onCompleteRef.current(answers)
    } else {
      setState(s => ({ currentIndex: s.currentIndex + 1, direction: 'forward' }))
    }
  }, [canGoForward, isLastQuestion, answers])
  
  const setAnswer = useCallback((value: unknown) => {
    if (!currentQuestion) return
    setAnswers(prev => new Map(prev).set(currentQuestion.id, value))
  }, [currentQuestion])
  
  // Auto-advance handler
  const { scheduleCommit: triggerAutoAdvance } = useDebouncedCommit({
    onCommit: goForward,
    disabled: shouldDisableAutoAdvance,
  })
  
  return {
    // State
    currentIndex: state.currentIndex,
    direction: state.direction,
    currentQuestion,
    currentAnswer,
    answers,
    
    // Derived
    isFirstQuestion,
    isLastQuestion,
    canGoForward,
    buttonState,
    totalQuestions: sortedQuestions.length,
    
    // Actions
    goBack,
    goForward,
    setAnswer,
    triggerAutoAdvance,
  }
}


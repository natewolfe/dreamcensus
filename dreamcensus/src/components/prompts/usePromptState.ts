'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'

export interface PromptQuestion {
  id: string
  text: string
  category: string
  variant: 'yes_no' | 'agree_disagree' | 'true_false'
}

export interface ResponseRecord {
  questionId: string
  response: 'yes' | 'no' | 'agree' | 'disagree' | 'true' | 'false'
  expandedText?: string
  index: number
}

export interface PromptState {
  // Data
  questions: PromptQuestion[]
  responses: Map<string, ResponseRecord>
  
  // UI State
  currentCardIndex: number
  viewMode: 'card' | 'list'
  isDesktop: boolean
  
  // Actions
  recordResponse: (questionId: string, response: string, expandedText?: string) => void
  nextCard: () => void
  previousCard: () => void
  setViewMode: (mode: 'card' | 'list') => void
  
  // Computed
  currentQuestion: PromptQuestion | undefined
  progressStats: { answered: number; total: number; yesCount: number; noCount: number }
}

export function usePromptState(
  initialQuestions: PromptQuestion[],
  onResponse: (questionId: string, response: string, expandedText?: string) => void,
  onRequestMore: () => void
): PromptState {
  // Core state
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')
  const [isDesktop, setIsDesktop] = useState(false)
  const [responses, setResponses] = useState<Map<string, ResponseRecord>>(new Map())

  // Detect desktop on client
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Current question (for card view)
  const currentQuestion = useMemo(
    () => initialQuestions[currentCardIndex],
    [initialQuestions, currentCardIndex]
  )

  // Progress statistics
  const progressStats = useMemo(() => {
    const answered = responses.size
    const total = initialQuestions.length
    const responseValues = Array.from(responses.values())
    const yesCount = responseValues.filter(r => 
      r.response === 'yes' || r.response === 'agree' || r.response === 'true'
    ).length
    const noCount = responseValues.filter(r => 
      r.response === 'no' || r.response === 'disagree' || r.response === 'false'
    ).length
    
    return { answered, total, yesCount, noCount }
  }, [responses, initialQuestions.length])

  // Actions
  const recordResponse = useCallback((
    questionId: string,
    response: string,
    expandedText?: string
  ) => {
    const questionIndex = initialQuestions.findIndex(q => q.id === questionId)
    
    const record: ResponseRecord = {
      questionId,
      response: response as any,
      expandedText,
      index: questionIndex !== -1 ? questionIndex : responses.size,
    }
    
    setResponses(prev => new Map(prev).set(questionId, record))
    onResponse(questionId, response, expandedText)
  }, [initialQuestions, responses.size, onResponse])

  const nextCard = useCallback(() => {
    setCurrentCardIndex(prev => prev + 1)
    
    // Request more questions if running low
    if (currentCardIndex >= initialQuestions.length - 5) {
      onRequestMore()
    }
  }, [currentCardIndex, initialQuestions.length, onRequestMore])

  const previousCard = useCallback(() => {
    setCurrentCardIndex(prev => Math.max(0, prev - 1))
  }, [])

  return {
    // Data
    questions: initialQuestions,
    responses,
    
    // UI State
    currentCardIndex,
    viewMode,
    isDesktop,
    
    // Actions
    recordResponse,
    nextCard,
    previousCard,
    setViewMode,
    
    // Computed
    currentQuestion,
    progressStats,
  }
}


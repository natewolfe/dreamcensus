'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import type { Question, AnsweredQuestion } from '@/lib/types'

export interface ResponseRecord {
  questionId: string
  response: 'yes' | 'no'
  expandedText?: string
  index: number
}

export interface StreamState {
  // Data
  questions: Question[]
  answeredQuestions: AnsweredQuestion[]
  responses: Map<string, ResponseRecord>
  preservedTexts: Map<string, string>
  
  // UI State
  currentCardIndex: number
  viewMode: 'card' | 'list'
  writeModalQuestion: Question | null
  isDesktop: boolean
  
  // Actions
  recordResponse: (questionId: string, response: 'yes' | 'no', expandedText?: string) => void
  clearResponse: (questionId: string, preserveText?: boolean) => void
  setViewMode: (mode: 'card' | 'list') => void
  openWriteModal: (question: Question) => void
  closeWriteModal: () => void
  nextCard: () => void
  previousCard: () => void
  jumpToCard: (questionId: string) => void
  
  // Computed
  currentQuestion: Question | undefined
  allQuestions: Question[]
  progressStats: { answered: number; total: number; yesCount: number; noCount: number }
}

export function useStreamState(
  initialQuestions: Question[],
  answeredQuestions: AnsweredQuestion[],
  onResponse: (questionId: string, response: 'yes' | 'no', expandedText?: string) => void,
  onClearResponse: (questionId: string, preserveText?: boolean, expandedText?: string) => void,
  onRequestMore: () => void
): StreamState {
  // Core state
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')
  const [writeModalQuestion, setWriteModalQuestion] = useState<Question | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const [preservedTexts, setPreservedTexts] = useState<Map<string, string>>(new Map())
  const [responses, setResponses] = useState<Map<string, ResponseRecord>>(() => {
    // Initialize with answered questions if provided
    const map = new Map<string, ResponseRecord>()
    answeredQuestions.forEach((aq, index) => {
      map.set(aq.question.id, {
        questionId: aq.question.id,
        response: aq.response,
        expandedText: aq.expandedText || undefined,
        index,
      })
    })
    return map
  })

  // Detect desktop on client
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Update responses when answered questions are loaded
  useEffect(() => {
    if (answeredQuestions.length > 0 && responses.size === 0) {
      const map = new Map<string, ResponseRecord>()
      answeredQuestions.forEach((aq, index) => {
        map.set(aq.question.id, {
          questionId: aq.question.id,
          response: aq.response,
          expandedText: aq.expandedText || undefined,
          index,
        })
      })
      setResponses(map)
      
      // If we have answered questions but no unanswered questions, auto-switch to list view
      if (initialQuestions.length === 0) {
        setViewMode('list')
      }
    }
  }, [answeredQuestions, responses.size, initialQuestions.length])

  // Deduplicate and merge questions
  const allQuestions = useMemo(() => {
    const baseQuestions = answeredQuestions.length > 0 && initialQuestions.length === 0
      ? answeredQuestions.map(aq => aq.question)
      : initialQuestions
    
    // Deduplicate by keeping first occurrence of each ID
    const seen = new Set<string>()
    return baseQuestions.filter(q => {
      if (seen.has(q.id)) return false
      seen.add(q.id)
      return true
    })
  }, [answeredQuestions, initialQuestions])

  // Current question (for card view)
  const currentQuestion = useMemo(
    () => initialQuestions[currentCardIndex],
    [initialQuestions, currentCardIndex]
  )

  // Progress statistics
  const progressStats = useMemo(() => {
    const answered = responses.size
    const total = allQuestions.length
    const yesCount = Array.from(responses.values()).filter(r => r.response === 'yes').length
    const noCount = Array.from(responses.values()).filter(r => r.response === 'no').length
    
    return { answered, total, yesCount, noCount }
  }, [responses, allQuestions.length])

  // Actions
  const recordResponse = useCallback((
    questionId: string,
    response: 'yes' | 'no',
    expandedText?: string
  ) => {
    const questionIndex = initialQuestions.findIndex(q => q.id === questionId)
    
    // Check if we have preserved text for this question
    const textToUse = expandedText || preservedTexts.get(questionId)
    
    const record: ResponseRecord = {
      questionId,
      response,
      expandedText: textToUse,
      index: questionIndex !== -1 ? questionIndex : responses.size,
    }
    
    setResponses(prev => new Map(prev).set(questionId, record))
    
    // Clear preserved text once we've used it
    if (preservedTexts.has(questionId)) {
      setPreservedTexts(prev => {
        const next = new Map(prev)
        next.delete(questionId)
        return next
      })
    }
    
    onResponse(questionId, response, textToUse)
  }, [initialQuestions, responses.size, preservedTexts, onResponse])

  const clearResponse = useCallback((questionId: string, preserveText = true) => {
    const existingResponse = responses.get(questionId)
    const expandedText = preserveText && existingResponse ? existingResponse.expandedText : undefined
    
    // Store the text in preservedTexts if we're preserving it
    if (expandedText) {
      setPreservedTexts(prev => new Map(prev).set(questionId, expandedText))
    }
    
    setResponses(prev => {
      const next = new Map(prev)
      next.delete(questionId)
      return next
    })
    
    onClearResponse(questionId, preserveText, expandedText)
  }, [responses, onClearResponse])

  const openWriteModal = useCallback((question: Question) => {
    setWriteModalQuestion(question)
  }, [])

  const closeWriteModal = useCallback(() => {
    setWriteModalQuestion(null)
  }, [])

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

  const jumpToCard = useCallback((questionId: string) => {
    const index = initialQuestions.findIndex(q => q.id === questionId)
    if (index !== -1) {
      setCurrentCardIndex(index)
      setViewMode('card')
    }
  }, [initialQuestions])

  return {
    // Data
    questions: initialQuestions,
    answeredQuestions,
    responses,
    preservedTexts,
    
    // UI State
    currentCardIndex,
    viewMode,
    writeModalQuestion,
    isDesktop,
    
    // Actions
    recordResponse,
    clearResponse,
    setViewMode,
    openWriteModal,
    closeWriteModal,
    nextCard,
    previousCard,
    jumpToCard,
    
    // Computed
    currentQuestion,
    allQuestions,
    progressStats,
  }
}


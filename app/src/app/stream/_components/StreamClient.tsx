'use client'

import { useState, useCallback, useEffect } from 'react'
import { StreamContainer } from './StreamContainer'
import { getStreamQuestions, saveStreamResponse, clearStreamResponse, getAnsweredQuestions } from '../actions'

interface Question {
  id: string
  text: string
  category: string
  tags: string[]
}

interface AnsweredQuestion {
  question: Question
  response: 'yes' | 'no'
  expandedText?: string | null
}

interface StreamClientProps {
  initialQuestions: Question[]
}

export function StreamClient({ initialQuestions }: StreamClientProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestion[]>([])

  // Load answered questions if we have no unanswered questions
  useEffect(() => {
    if (initialQuestions.length === 0) {
      getAnsweredQuestions()
        .then(setAnsweredQuestions)
        .catch((err) => {
          console.error('Failed to load answered questions:', err)
        })
    }
  }, [initialQuestions.length])

  const handleResponse = useCallback(
    async (questionId: string, response: 'yes' | 'no', expandedText?: string) => {
      try {
        await saveStreamResponse(questionId, response, expandedText)
      } catch (err) {
        console.error('Failed to save response:', err)
      }
    },
    []
  )

  const handleClearResponse = useCallback(
    async (questionId: string, preserveText?: boolean, expandedText?: string) => {
      try {
        await clearStreamResponse(questionId, preserveText, expandedText)
      } catch (err) {
        console.error('Failed to clear response:', err)
      }
    },
    []
  )

  const handleRequestMore = useCallback(async () => {
    try {
      const newQuestions = await getStreamQuestions(10)
      setQuestions((prev) => {
        // Deduplicate by ID to prevent duplicate keys
        const existingIds = new Set(prev.map(q => q.id))
        const uniqueNew = newQuestions.filter(q => !existingIds.has(q.id))
        return [...prev, ...uniqueNew]
      })
    } catch (err) {
      console.error('Failed to load more questions:', err)
    }
  }, [])

  return (
    <StreamContainer
      questions={questions}
      answeredQuestions={answeredQuestions}
      onResponse={handleResponse}
      onClearResponse={handleClearResponse}
      onRequestMore={handleRequestMore}
    />
  )
}


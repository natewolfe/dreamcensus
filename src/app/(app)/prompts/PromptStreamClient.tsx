'use client'

import { useState, useCallback } from 'react'
import { PromptStream } from '@/components/prompts'
import { saveStreamResponse, getStreamQuestions } from './actions'
import type { PromptQuestion } from '@/components/prompts'

interface PromptStreamClientProps {
  initialQuestions: PromptQuestion[]
}

export function PromptStreamClient({ initialQuestions }: PromptStreamClientProps) {
  const [questions, setQuestions] = useState<PromptQuestion[]>(initialQuestions)

  const handleResponse = useCallback(
    async (questionId: string, response: string, expandedText?: string) => {
      try {
        await saveStreamResponse({ questionId, response, expandedText })
      } catch (err) {
        console.error('Failed to save response:', err)
      }
    },
    []
  )

  const handleRequestMore = useCallback(async () => {
    try {
      const result = await getStreamQuestions(10)
      if (result.success) {
        setQuestions((prev) => {
          // Deduplicate by ID
          const existingIds = new Set(prev.map(q => q.id))
          const uniqueNew = result.data.filter(q => !existingIds.has(q.id))
          return [...prev, ...uniqueNew]
        })
      }
    } catch (err) {
      console.error('Failed to load more questions:', err)
    }
  }, [])

  return (
    <PromptStream
      initialQuestions={questions}
      onResponse={handleResponse}
      onRequestMore={handleRequestMore}
    />
  )
}


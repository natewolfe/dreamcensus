'use client'

import { useCallback } from 'react'
import { EmbeddedPromptStack } from '@/components/prompts'
import { saveStreamResponse } from '../prompts/actions'
import type { PromptQuestion } from '@/components/prompts'
import type { BinaryValue } from '@/components/ui'

interface EmbeddedPromptStackClientProps {
  initialQuestions: PromptQuestion[]
}

export function EmbeddedPromptStackClient({ initialQuestions }: EmbeddedPromptStackClientProps) {
  const handleResponse = useCallback(async (
    questionId: string,
    response: BinaryValue,
    expandedText?: string
  ) => {
    try {
      await saveStreamResponse({ questionId, response, expandedText })
    } catch (err) {
      console.error('Failed to save response:', err)
    }
  }, [])

  return (
    <EmbeddedPromptStack
      questions={initialQuestions}
      onResponse={handleResponse}
    />
  )
}


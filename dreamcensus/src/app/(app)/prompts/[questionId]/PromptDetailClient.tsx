'use client'

import { useRouter } from 'next/navigation'
import { PromptDetail } from '@/components/prompts'
import { saveStreamResponse } from '../actions'
import type { PromptQuestion } from '@/components/prompts'
import type { BinaryValue } from '@/components/ui'

interface PromptDetailClientProps {
  question: PromptQuestion
}

export function PromptDetailClient({ question }: PromptDetailClientProps) {
  const router = useRouter()

  const handleSubmit = async (response: BinaryValue, expandedText?: string) => {
    try {
      await saveStreamResponse({
        questionId: question.id,
        response,
        expandedText,
      })
      router.push('/prompts')
    } catch (error) {
      console.error('Failed to save response:', error)
    }
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <PromptDetail
      question={question}
      onSubmit={handleSubmit}
      onBack={handleBack}
    />
  )
}


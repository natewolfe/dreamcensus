'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PromptDetail } from '@/components/prompts'
import { saveStreamResponse, skipPrompt } from '../actions'
import type { PromptQuestion } from '@/components/prompts'
import type { BinaryValue } from '@/lib/flow/types'

interface PromptDetailClientProps {
  questions: PromptQuestion[]
  initialIndex: number
}

export function PromptDetailClient({ questions, initialIndex }: PromptDetailClientProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  
  const currentQuestion = questions[currentIndex]
  const hasMore = currentIndex < questions.length - 1

  // Early return must be after all hooks
  if (!currentQuestion) {
    router.push('/prompts')
    return null
  }

  const goToNext = () => {
    if (hasMore) {
      setCurrentIndex(i => i + 1)
    } else {
      router.push('/prompts')
    }
  }

  const handleSubmit = async (response: BinaryValue, expandedText?: string) => {
    try {
      await saveStreamResponse({
        questionId: currentQuestion.id,
        response,
        expandedText,
      })
      goToNext()
    } catch (error) {
      console.error('Failed to save response:', error)
    }
  }

  const handleSkip = async () => {
    try {
      await skipPrompt(currentQuestion.id)
      goToNext()
    } catch (error) {
      console.error('Failed to skip:', error)
    }
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <PromptDetail
      key={currentQuestion.id}
      question={currentQuestion}
      onSubmit={handleSubmit}
      onSkip={handleSkip}
      onBack={handleBack}
    />
  )
}


'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PromptCard } from './PromptCard'
import { respondToPrompt, skipPrompt } from '@/app/(app)/prompts/actions'
import { useToast } from '@/hooks/use-toast'

interface PromptViewProps {
  prompt: {
    id: string
    text: string
    type: string
    responseType: string
    options?: string[]
  }
}

export function PromptView({ prompt }: PromptViewProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleResponse = async (value: Record<string, unknown>) => {
    setIsSubmitting(true)
    try {
      const result = await respondToPrompt(prompt.id, value)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      toast.success('Response saved!')
      router.refresh()
    } catch (error) {
      console.error('Failed to submit response:', error)
      toast.error('Failed to save response. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = async () => {
    setIsSubmitting(true)
    try {
      const result = await skipPrompt(prompt.id)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      toast.info('Prompt skipped')
      router.refresh()
    } catch (error) {
      console.error('Failed to skip prompt:', error)
      toast.error('Failed to skip prompt. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PromptCard
      prompt={prompt}
      onResponse={handleResponse}
      onSkip={handleSkip}
      onExpand={() => setIsExpanded(!isExpanded)}
      isExpanded={isExpanded}
      isSubmitting={isSubmitting}
    />
  )
}


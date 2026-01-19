'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { PromptCard } from './PromptCard'
import { usePromptState, type PromptQuestion } from './usePromptState'
import { useRouter } from 'next/navigation'
import { UndoIcon, ListIcon } from '@/components/ui'
import type { BinaryValue } from '@/lib/flow/types'

interface PromptStreamProps {
  initialQuestions: PromptQuestion[]
  onResponse: (questionId: string, response: string, expandedText?: string) => void
  onSkip: (questionId: string) => void
  onRequestMore: () => void
}

export function PromptStream({
  initialQuestions,
  onResponse,
  onSkip,
  onRequestMore,
}: PromptStreamProps) {
  const router = useRouter()
  const state = usePromptState(initialQuestions, onResponse, onRequestMore)
  const [exitDirections, setExitDirections] = useState<Record<string, 'left' | 'right' | 'up'>>({})
  
  const visibleCards = state.questions.slice(
    state.currentCardIndex,
    state.currentCardIndex + 3
  )

  const handleResponse = (questionId: string, response: BinaryValue) => {
    const direction = (response === 'yes' || response === 'agree' || response === 'true') ? 'right' : 'left'
    
    // Only animate on mobile
    if (!state.isDesktop) {
      setExitDirections(prev => ({ ...prev, [questionId]: direction }))
    }
    
    state.recordResponse(questionId, response)
    
    // Defer nextCard to allow state update to apply
    setTimeout(() => state.nextCard(), state.isDesktop ? 0 : 300)
  }

  const handleSkip = (questionId: string) => {
    // Only animate on mobile
    if (!state.isDesktop) {
      setExitDirections(prev => ({ ...prev, [questionId]: 'up' }))
    }
    
    onSkip(questionId)
    setTimeout(() => state.nextCard(), state.isDesktop ? 0 : 300)
  }

  const handleExpand = (questionId: string) => {
    router.push(`/prompts/${questionId}`)
  }

  return (
    <div className="relative px-4 pb-12 md:px-6 md:pb-6 flex-1 flex items-center justify-center overflow-hidden">
      {/* Controls */}
      <div className="absolute top-2 md:top-3 left-6 right-6 md:left-6 md:right-6 max-w-4xl mx-auto flex items-center justify-between p-2 z-10">
        {/* Undo button */}
        <button
          onClick={state.previousCard}
          disabled={state.currentCardIndex === 0}
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm text-muted hover:text-foreground hover:bg-card-bg disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Undo last answer"
        >
          <UndoIcon className="w-[18px] h-[18px]" />
          <span className="hidden sm:inline">Undo</span>
        </button>

        {/* Card counter (center) */}
        <div className="text-sm text-muted">
          {state.progressStats.answered} of {state.progressStats.total} answered
        </div>

        {/* List view button */}
        <button
          onClick={() => state.setViewMode('list')}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted hover:text-foreground hover:bg-card-bg transition-all text-sm"
          aria-label="View all questions"
        >
          <span className="hidden sm:inline">List</span>
          <ListIcon className="w-[18px] h-[18px]" />
        </button>
      </div>

      {/* Card Stack */}
      <div className="relative w-full max-w-2xl h-[500px] md:h-[520px] max-h-[70vh]">
        <AnimatePresence>
          {visibleCards.map((question, index) => {
            const isTop = index === 0
            const scale = 1 - index * 0.05
            const yOffset = index * 10
            const zIndex = visibleCards.length - index
            const direction = exitDirections[question.id] || 'left'

            return (
              <motion.div
                key={question.id}
                className="absolute inset-0"
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{
                  scale,
                  y: yOffset,
                  opacity: 1,
                  zIndex,
                }}
                exit={state.isDesktop ? undefined : {
                  x: direction === 'up' ? 0 : (direction === 'right' ? 1000 : -1000),
                  y: direction === 'up' ? -1000 : 0,
                  opacity: 0,
                  rotate: direction === 'up' ? 0 : (direction === 'right' ? 20 : -20),
                  transition: { duration: 0.3 }
                }}
                style={{ originX: 0.5, originY: 1 }}
              >
                <PromptCard
                  question={question}
                  isTop={isTop}
                  isDesktop={state.isDesktop}
                  onResponse={(response) => handleResponse(question.id, response)}
                  onSkip={() => handleSkip(question.id)}
                  onExpand={() => handleExpand(question.id)}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}


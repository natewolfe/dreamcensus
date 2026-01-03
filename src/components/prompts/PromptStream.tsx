'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { PromptCard } from './PromptCard'
import { usePromptState, type PromptQuestion } from './usePromptState'
import { useRouter } from 'next/navigation'
import type { BinaryValue } from '@/components/ui'

interface PromptStreamProps {
  initialQuestions: PromptQuestion[]
  onResponse: (questionId: string, response: string, expandedText?: string) => void
  onRequestMore: () => void
}

export function PromptStream({
  initialQuestions,
  onResponse,
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
    
    setTimeout(() => state.nextCard(), state.isDesktop ? 0 : 300)
  }

  const handleExpand = (questionId: string) => {
    router.push(`/prompts/${questionId}`)
  }

  return (
    <div className="relative px-6 flex-1 flex items-center justify-center overflow-hidden">
      {/* Controls */}
      <div className="absolute top-4 left-0 right-0 w-full max-w-5xl mx-auto flex items-center justify-between p-3 z-10">
        {/* Undo button */}
        <button
          onClick={state.previousCard}
          disabled={state.currentCardIndex === 0}
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm text-muted hover:text-foreground hover:bg-card-bg disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Undo last answer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v6h6" />
            <path d="M3 13a9 9 0 1 0 2.64-6.36L3 9" />
          </svg>
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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <circle cx="4" cy="6" r="1" fill="currentColor" />
            <circle cx="4" cy="12" r="1" fill="currentColor" />
            <circle cx="4" cy="18" r="1" fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* Card Stack */}
      <div className="relative w-full max-w-2xl h-[500px] md:h-[520px]">
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


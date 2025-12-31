'use client'

import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { StreamCard } from './StreamCard'
import { StreamState } from './useStreamState'

interface CardViewProps {
  state: StreamState
}

function CardControls({ 
  canUndo, 
  onUndo, 
  answeredCount,
  totalCount,
  onOpenList 
}: { 
  canUndo: boolean
  onUndo: () => void
  answeredCount: number
  totalCount: number
  onOpenList: () => void
}) {
  return (
    <div className="absolute top-4 left-0 right-0 w-full max-w-5xl mx-auto flex items-center justify-between p-3 z-10">
      {/* Undo button */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm
          ${!canUndo
            ? 'text-[var(--foreground-subtle)] cursor-not-allowed opacity-50' 
            : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-elevated)]'
          }
        `}
        aria-label="Undo last answer"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7v6h6" />
          <path d="M3 13a9 9 0 1 0 2.64-6.36L3 9" />
        </svg>
        <span className="hidden sm:inline">Undo</span>
      </button>

      {/* Card counter (center) */}
      <div className="text-sm text-[var(--foreground-muted)]">
        {answeredCount} of {totalCount} answered
      </div>

      {/* List view button */}
      <button
        onClick={onOpenList}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-elevated)] transition-all text-sm"
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
  )
}

export function CardView({ state }: CardViewProps) {
  const [exitDirections, setExitDirections] = React.useState<Record<string, 'left' | 'right' | 'up'>>({})
  
  const visibleCards = state.questions.slice(
    state.currentCardIndex,
    state.currentCardIndex + 3
  )

  return (
    <div className="relative px-6 flex-1 flex items-center justify-center overflow-hidden">
      {/* Controls */}
      <CardControls
        canUndo={state.currentCardIndex > 0}
        onUndo={state.previousCard}
        answeredCount={state.progressStats.answered}
        totalCount={state.progressStats.total}
        onOpenList={() => state.setViewMode('list')}
      />

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
                exit={{
                  x: direction === 'up' ? 0 : (direction === 'right' ? 1000 : -1000),
                  y: direction === 'up' ? -1000 : 0,
                  opacity: 0,
                  rotate: direction === 'up' ? 0 : (direction === 'right' ? 20 : -20),
                  transition: { duration: 0.3 }
                }}
                style={{ originX: 0.5, originY: 1 }}
              >
                <StreamCard
                  question={question}
                  isTop={isTop}
                  isDesktop={state.isDesktop}
                  onNo={() => {
                    setExitDirections(prev => ({ ...prev, [question.id]: 'left' }))
                    state.recordResponse(question.id, 'no')
                    // Defer nextCard to allow state update to apply
                    setTimeout(() => state.nextCard(), 0)
                  }}
                  onYes={() => {
                    setExitDirections(prev => ({ ...prev, [question.id]: 'right' }))
                    state.recordResponse(question.id, 'yes')
                    // Defer nextCard to allow state update to apply
                    setTimeout(() => state.nextCard(), 0)
                  }}
                  onWrite={() => state.openWriteModal(question)}
                  onSkip={() => {
                    setExitDirections(prev => ({ ...prev, [question.id]: 'up' }))
                    setTimeout(() => state.nextCard(), 0)
                  }}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}


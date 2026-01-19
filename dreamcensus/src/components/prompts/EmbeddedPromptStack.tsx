'use client'

import { useState } from 'react'
import { motion, useMotionValue, animate } from 'motion/react'
import { useRouter } from 'next/navigation'
import type { PromptQuestion } from './usePromptState'
import { BINARY_VARIANT_CONFIG, type BinaryValue } from '@/lib/flow/types'
import Link from 'next/link'

interface EmbeddedPromptStackProps {
  questions: PromptQuestion[]
  onResponse: (questionId: string, response: BinaryValue, expandedText?: string) => Promise<void>
}

export function EmbeddedPromptStack({ questions, onResponse }: EmbeddedPromptStackProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answeredCount, setAnsweredCount] = useState(0)
  const [lastDismissedAt, setLastDismissedAt] = useState(0) // Track when overlay was dismissed
  const x = useMotionValue(0)
  
  const currentQuestion = questions[currentIndex]
  // Show "after 3 answers" overlay when 3+ answers since last dismissal
  const showPromptsShortcut = currentQuestion && (answeredCount - lastDismissedAt) >= 3

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const velocityThreshold = 500
    const offsetThreshold = 150
    
    // Strong swipe → navigate to full prompts page
    if (Math.abs(info.velocity.x) > velocityThreshold || Math.abs(info.offset.x) > offsetThreshold) {
      router.push('/prompts')
      return
    }
    
    // Snap back
    animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 })
  }

  const handleExpand = () => {
    if (currentQuestion) {
      router.push(`/prompts/${currentQuestion.id}`)
    }
  }

  const handleResponse = async (response: BinaryValue) => {
    if (!currentQuestion) return
    
    await onResponse(currentQuestion.id, response)
    setAnsweredCount(c => c + 1)
    // Allow index to go beyond array length so currentQuestion becomes undefined after last answer
    setCurrentIndex(i => i + 1)
  }

  // Get response labels from shared config (uppercase for embedded UI)
  const config = currentQuestion ? BINARY_VARIANT_CONFIG[currentQuestion.variant] : BINARY_VARIANT_CONFIG.yes_no
  const labels = {
    left: config.leftLabel.toUpperCase(),
    right: config.rightLabel.toUpperCase(),
    leftValue: config.left,
    rightValue: config.right,
  }

  if (!currentQuestion) {
    // Show completion card if we've answered prompts, otherwise show empty state
    if (answeredCount > 0) {
      return (
        <section aria-label="Daily prompts" className="mb-10">
          <div className="flex items-center justify-end mb-4">
            <Link
              href="/prompts"
              className="text-sm text-accent hover:text-accent/80 transition-colors duration-300"
            >
              See more →
            </Link>
          </div>
          <div className="relative h-[300px] md:h-[340px]">
            <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-muted/20 flex flex-col items-center justify-center gap-4">
              <p className="text-muted text-sm">
                Excellent! You've answered {answeredCount} prompt{answeredCount !== 1 ? 's' : ''}
              </p>
              <button
                onClick={() => router.push('/prompts')}
                className="px-6 py-3 bg-accent text-foreground rounded-xl font-medium hover:bg-accent/90 transition-colors cursor-pointer"
              >
                Continue to Prompts →
              </button>
            </div>
          </div>
        </section>
      )
    }
    
    return (
      <section className="rounded-2xl bg-card-bg border border-border p-8 text-center">
        <p className="text-muted">No prompts available</p>
        <button 
          onClick={() => router.push('/prompts')}
          className="mt-4 text-sm text-accent hover:text-accent/80"
        >
          Browse all prompts →
        </button>
      </section>
    )
  }

  return (
    <section aria-label="Daily prompts" className="mb-10">
      {/* Section header */}
      <div className="flex items-center justify-end mb-4">
        <Link
          href="/prompts"
          onClick={() => router.push('/prompts')}
          className="text-sm text-accent hover:text-accent/80 transition-colors duration-300"
        >
          See more →
        </Link>
      </div>

      {/* Card stack */}
      <div className="relative h-[300px] md:h-[340px]">
        {/* Background stack cards */}
        {questions.slice(currentIndex + 1, currentIndex + 3).map((_, i) => (
          <div
            key={`stack-${i}`}
            className="absolute inset-0 rounded-2xl bg-card-bg border border-border pointer-events-none"
            style={{
              transform: `scale(${1 - (i + 1) * 0.04}) translateY(${(i + 1) * 8}px)`,
              transformOrigin: 'center bottom',
              zIndex: 2 - i,
              opacity: 1 - (i + 1) * 0.3,
            }}
          />
        ))}

        {/* Active card */}
        <motion.div
          drag="x"
          dragConstraints={{ left: -120, right: 120 }}
          dragElastic={0.4}
          onDragEnd={handleDragEnd}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ x, backfaceVisibility: 'hidden', willChange: 'transform' }}
          className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing rounded-2xl bg-card-bg border-2 border-border transition-all duration-300 hover:shadow-xl flex flex-col overflow-hidden"
        >
            {/* Category badge - absolutely positioned */}
            <div className="absolute top-0 left-0 px-5 pt-4 text-xs font-medium text-accent uppercase tracking-widest">
              {currentQuestion.category}
            </div>

            {/* Skip button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setCurrentIndex(i => i + 1)
              }}
              className="absolute top-3 right-4 text-sm text-muted hover:text-foreground transition-colors opacity-50 hover:opacity-100 z-10"
            >
              Skip
            </button>

            {/* Question text - click to open prompts page */}
            <div 
              className="flex-1 flex items-center justify-center px-6 py-4 cursor-pointer"
              onClick={() => router.push('/prompts')}
            >
              <h3 className="text-lg md:text-xl font-medium text-center leading-relaxed text-foreground">
                {currentQuestion.text}
              </h3>
            </div>

            {/* Action buttons */}
            <div className="flex border-t border-border">
              <button
                onClick={() => handleResponse(labels.leftValue)}
                className="flex-1 py-3.5 text-sm font-medium text-muted hover:text-[var(--response-no)] hover:bg-[var(--response-no-bg)] transition-all border-r border-border cursor-pointer"
              >
                {labels.left}
              </button>
              <button
                onClick={handleExpand}
                className="flex-1 py-3.5 text-sm font-medium text-muted hover:text-accent hover:bg-accent/10 transition-all border-r border-border cursor-pointer uppercase"
              >
                More
              </button>
              <button
                onClick={() => handleResponse(labels.rightValue)}
                className="flex-1 py-3.5 text-sm font-medium text-muted hover:text-[var(--response-yes)] hover:bg-[var(--response-yes-bg)] transition-all cursor-pointer"
              >
                {labels.right}
              </button>
            </div>

            {/* Shortcut overlay after 3 answers */}
            {showPromptsShortcut && (
              <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-4 z-20 bg-card-bg/95 backdrop-blur-sm">
                <p className="text-muted text-sm">
                  Nice! You've answered {answeredCount} prompts
                </p>
                <button
                  onClick={() => router.push('/prompts')}
                  className="px-6 py-3 bg-accent text-foreground rounded-xl font-medium hover:bg-accent/90 transition-colors cursor-pointer"
                >
                  Continue to Prompts →
                </button>
                <button
                  onClick={() => setLastDismissedAt(answeredCount)}
                  className="text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
                >
                  Keep answering here
                </button>
              </div>
            )}
        </motion.div>
      </div>
    </section>
  )
}


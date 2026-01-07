'use client'

import { useState } from 'react'
import { motion, useMotionValue, animate } from 'motion/react'
import { useRouter } from 'next/navigation'
import type { PromptQuestion } from './usePromptState'
import type { BinaryValue } from '@/components/ui'
import Link from 'next/link'

interface EmbeddedPromptStackProps {
  questions: PromptQuestion[]
  onResponse: (questionId: string, response: BinaryValue, expandedText?: string) => Promise<void>
}

export function EmbeddedPromptStack({ questions, onResponse }: EmbeddedPromptStackProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const x = useMotionValue(0)
  
  const currentQuestion = questions[currentIndex]

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
    setCurrentIndex(i => Math.min(i + 1, questions.length - 1))
  }

  const getResponseLabels = () => {
    if (!currentQuestion) return { left: 'NO', right: 'YES', leftValue: 'no' as BinaryValue, rightValue: 'yes' as BinaryValue }
    
    switch (currentQuestion.variant) {
      case 'yes_no':
        return { left: 'NO', right: 'YES', leftValue: 'no' as BinaryValue, rightValue: 'yes' as BinaryValue }
      case 'agree_disagree':
        return { left: 'DISAGREE', right: 'AGREE', leftValue: 'disagree' as BinaryValue, rightValue: 'agree' as BinaryValue }
      case 'true_false':
        return { left: 'FALSE', right: 'TRUE', leftValue: 'false' as BinaryValue, rightValue: 'true' as BinaryValue }
    }
  }

  const labels = getResponseLabels()

  if (!currentQuestion) {
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
            {/* Category badge */}
            <div className="px-5 pt-4">
              <span className="text-xs font-medium text-accent uppercase tracking-widest">
                {currentQuestion.category}
              </span>
            </div>

            {/* Question text - click to navigate to prompts stream */}
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
                className="flex-1 py-3.5 text-sm font-medium text-muted hover:text-accent hover:bg-accent/10 transition-all border-r border-border cursor-pointer"
              >
                Expand
              </button>
              <button
                onClick={() => handleResponse(labels.rightValue)}
                className="flex-1 py-3.5 text-sm font-medium text-muted hover:text-[var(--response-yes)] hover:bg-[var(--response-yes-bg)] transition-all cursor-pointer"
              >
                {labels.right}
              </button>
            </div>
        </motion.div>
      </div>
    </section>
  )
}


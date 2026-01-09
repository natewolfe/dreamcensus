'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from '@/components/ui'

export interface InsightItem {
  label: string
  message: string
}

interface InsightsCarouselProps {
  insights: InsightItem[]
}

export function InsightsCarousel({ insights }: InsightsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')

  const canGoBack = currentIndex > 0
  const canGoForward = currentIndex < insights.length - 1

  const goBack = () => {
    if (canGoBack) {
      setDirection('back')
      setCurrentIndex(i => i - 1)
    }
  }

  const goForward = () => {
    if (canGoForward) {
      setDirection('forward')
      setCurrentIndex(i => i + 1)
    }
  }

  if (insights.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <span className="text-xs text-muted uppercase tracking-widest mb-2 opacity-0 pointer-events-none">Insights</span>
        <p className="text-muted text-sm">Record more dreams to see patterns</p>
      </div>
    )
  }

  // Safe to access since we've verified insights is non-empty above
  const currentInsight = insights[currentIndex]!

  return (
    <div className="flex-1 flex flex-col">
      {/* Content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 md:px-7">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction === 'forward' ? 30 : -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction === 'forward' ? -30 : 30 }}
            transition={{ duration: 0.2 }}
            className="text-center"
          >
            {/* Small label */}
            <span className="text-xs font-semibold text-muted uppercase tracking-widest mb-3 block">
              {currentInsight.label}
            </span>
            
            {/* Main message */}
            <span className="text-lg text-foreground text-base font-medium leading-tight">
              {currentInsight.message}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Link to weather */}
        <Link
          href="/weather"
          className="mt-3 text-sm text-accent font-medium hover:text-accent/80 transition-colors"
        >
          More →
        </Link>
      </div>

      {/* Bottom navigation: arrows + dots */}
      <div className="flex items-center justify-between px-2 pb-2">
        {/* Left arrow */}
        <button
          onClick={goBack}
          disabled={!canGoBack}
          className="p-2 text-muted hover:text-foreground transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Previous insight"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Dotted pagination */}
        <div className="flex gap-1.5 justify-center">
          {insights.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentIndex ? 'forward' : 'back')
                setCurrentIndex(i)
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentIndex ? 'bg-subtle' : 'bg-subtle/40 hover:bg-subtle/60'
              }`}
              aria-label={`Go to insight ${i + 1}`}
            />
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={goForward}
          disabled={!canGoForward}
          className="p-2 text-muted hover:text-foreground transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next insight"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

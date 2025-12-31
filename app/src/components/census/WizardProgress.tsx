'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import type { CensusStepData } from '@/lib/types'

interface WizardProgressProps {
  currentIndex: number
  totalSteps: number
  chapterName?: string
  steps: CensusStepData[]
}

export function WizardProgress({ currentIndex, totalSteps, chapterName, steps }: WizardProgressProps) {
  const progress = ((currentIndex + 1) / totalSteps) * 100

  // Get surrounding steps for mini-map (3 before, 3 after current)
  const miniMapStart = Math.max(0, currentIndex - 3)
  const miniMapEnd = Math.min(steps.length, currentIndex + 4)
  const miniMapSteps = steps.slice(miniMapStart, miniMapEnd)

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/90 backdrop-blur-sm border-b border-[var(--border)]">
      {/* Progress bar */}
      <div className="h-1 bg-[var(--background-elevated)]">
        <motion.div 
          className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-glow)]"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      
      {/* Chapter info + mini map */}
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          {chapterName && (
            <div className="text-xs text-[var(--accent)] font-medium">{chapterName}</div>
          )}
          <div className="text-sm text-[var(--foreground-muted)]">
            Question {currentIndex + 1} of {totalSteps}
          </div>
        </div>
        
        {/* Mini map dots */}
        <div className="hidden md:flex gap-1">
          {miniMapSteps.map((step, i) => {
            const actualIndex = miniMapStart + i
            return (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-all ${
                  actualIndex < currentIndex 
                    ? 'bg-[var(--accent)]' 
                    : actualIndex === currentIndex 
                    ? 'bg-[var(--accent)] ring-2 ring-[var(--accent)]/30 ring-offset-1 ring-offset-[var(--background)]'
                    : 'bg-[var(--border)]'
                }`}
                title={`Question ${actualIndex + 1}`}
              />
            )
          })}
        </div>
        
        {/* Save & Exit */}
        <Link 
          href="/census" 
          className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] flex items-center gap-1 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="hidden sm:inline">Save & Exit</span>
        </Link>
      </div>
    </div>
  )
}


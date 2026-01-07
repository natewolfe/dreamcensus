'use client'

import { motion } from 'motion/react'

export interface NavProgressProps {
  /** Current step index (0-based) */
  currentStep: number
  /** Total number of steps */
  totalSteps: number
  /** Callback for going back */
  onBack: () => void
  /** Callback for going forward */
  onForward?: () => void
  /** Whether back navigation is allowed */
  canGoBack?: boolean
  /** Whether forward navigation is allowed */
  canGoForward?: boolean
  /** Aria labels */
  backLabel?: string
  forwardLabel?: string
}

/**
 * Shared navigation header with step counter and progress bar
 * Used by SectionRunner (Census) and FlowCard (Morning/Night modes)
 */
export function NavProgress({
  currentStep,
  totalSteps,
  onBack,
  onForward,
  canGoBack = true,
  canGoForward = true,
  backLabel = 'Previous step',
  forwardLabel = 'Next step',
}: NavProgressProps) {
  const isFirstStep = currentStep === 0

  return (
    <div className="space-y-4">
      {/* Navigation header: [<-] [X of Y] [->] */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          disabled={isFirstStep || !canGoBack}
          className="p-2 text-muted hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label={backLabel}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {/* Step counter removed - totalSteps calculation is complex with dynamic paths */}
        <div />
        
        <button
          onClick={onForward}
          disabled={!canGoForward || !onForward}
          className="p-2 text-muted hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label={forwardLabel}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="h-1 rounded-full bg-subtle/30 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="h-full bg-accent"
        />
      </div>
    </div>
  )
}


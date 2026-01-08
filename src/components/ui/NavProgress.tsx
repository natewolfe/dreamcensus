'use client'

import { ProgressBar } from './ProgressBar'
import { ChevronLeft, ChevronRight } from './Icons'

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
          <ChevronLeft />
        </button>
        
        {/* Step counter removed - totalSteps calculation is complex with dynamic paths */}
        <div />
        
        <button
          onClick={onForward}
          disabled={!canGoForward || !onForward}
          className="p-2 text-muted hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label={forwardLabel}
        >
          <ChevronRight />
        </button>
      </div>
      
      {/* Progress bar */}
      <ProgressBar
        value={((currentStep + 1) / totalSteps) * 100}
        size="sm"
        variant="default"
      />
    </div>
  )
}


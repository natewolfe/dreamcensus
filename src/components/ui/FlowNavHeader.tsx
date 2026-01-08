'use client'

import { ChevronLeft, ChevronRight } from './Icons'

export interface FlowNavHeaderProps {
  onBack: () => void
  onForward?: () => void
  canGoBack?: boolean
  canGoForward?: boolean
  progress?: { current: number; total: number }
  showForward?: boolean
  backLabel?: string
  forwardLabel?: string
}

const navButtonClass = 'p-2 text-muted hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed'

export function FlowNavHeader({
  onBack,
  onForward,
  canGoBack = true,
  canGoForward = true,
  progress,
  showForward = true,
  backLabel = 'Previous',
  forwardLabel = 'Next',
}: FlowNavHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <button
        onClick={onBack}
        disabled={!canGoBack}
        className={navButtonClass}
        aria-label={backLabel}
      >
        <ChevronLeft />
      </button>

      {progress ? (
        <span className="text-sm text-muted">
          {progress.current} of {progress.total}
        </span>
      ) : (
        <div />
      )}

      {showForward && onForward ? (
        <button
          onClick={onForward}
          disabled={!canGoForward}
          className={navButtonClass}
          aria-label={forwardLabel}
        >
          <ChevronRight />
        </button>
      ) : (
        <div className="w-9" />
      )}
    </div>
  )
}

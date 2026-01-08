import { useRef, useCallback, useEffect, useState } from 'react'
import { AUTO_ADVANCE_DELAY } from '@/lib/flow/auto-advance'

export interface UseDebouncedCommitOptions {
  /** Callback when commit fires */
  onCommit?: () => void
  /** Delay in ms (default: AUTO_ADVANCE_DELAY) */
  delay?: number
  /** If true, skip auto-commit entirely */
  disabled?: boolean
}

/**
 * Debounced commit handler with cancellation.
 * Respects prefers-reduced-motion accessibility setting.
 * 
 * Note: This is intentionally separate from useDebouncedCallback because it:
 * - Respects prefers-reduced-motion for auto-advance UX
 * - Has a disabled flag for conditional auto-advance
 * - Uses AUTO_ADVANCE_DELAY constant for consistency
 * - Is specifically designed for flow navigation
 */
export function useDebouncedCommit({
  onCommit,
  delay = AUTO_ADVANCE_DELAY,
  disabled = false,
}: UseDebouncedCommitOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Check reduced motion preference on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const cancelCommit = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const scheduleCommit = useCallback(() => {
    // Don't auto-advance if disabled, no callback, or user prefers reduced motion
    if (disabled || !onCommit || prefersReducedMotion) return
    
    // Cancel any pending commit first
    cancelCommit()
    
    // Schedule new commit
    timeoutRef.current = setTimeout(() => {
      onCommit()
      timeoutRef.current = null
    }, delay)
  }, [onCommit, delay, disabled, prefersReducedMotion, cancelCommit])

  // Cleanup on unmount
  useEffect(() => {
    return () => cancelCommit()
  }, [cancelCommit])

  return { scheduleCommit, cancelCommit, isDisabled: disabled || prefersReducedMotion }
}

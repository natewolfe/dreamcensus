'use client'

import { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'motion/react'
import { Button } from '@/components/ui'
import type { AlarmRingOverlayProps } from './types'

export function AlarmRingOverlay({
  snoozeCount,
  maxSnoozes,
  onSnooze,
  onStop,
}: AlarmRingOverlayProps) {
  const canSnooze = snoozeCount < maxSnoozes

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        onStop()
      } else if (e.key === 's' && canSnooze) {
        onSnooze()
      }
    },
    [onStop, onSnooze, canSnooze]
  )

  useEffect(() => {
    // Disable escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keydown', handleEscape)

    // Prevent body scroll
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-12 px-4 max-w-md"
      >
        {/* Time display */}
        <div>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-7xl font-light text-foreground mb-6"
          >
            {currentTime}
          </motion.div>
          <h1 className="text-2xl font-medium text-foreground">
            Time to wake up
          </h1>
        </div>

        {/* Action buttons */}
        <div className="space-y-4 w-full">
          {/* Primary: I'm Awake */}
          <Button
            size="lg"
            variant="primary"
            onClick={onStop}
            fullWidth
            className="h-16 text-xl"
          >
            I'm Awake
          </Button>

          {/* Secondary: Snooze (if available) */}
          {canSnooze && (
            <Button
              size="lg"
              variant="secondary"
              onClick={onSnooze}
              fullWidth
              className="h-14"
            >
              Snooze
            </Button>
          )}

          {!canSnooze && snoozeCount > 0 && (
            <p className="text-sm text-muted">
              Maximum snoozes reached
            </p>
          )}
        </div>

        {/* Keyboard hints */}
        <div className="text-xs text-muted space-y-1">
          <p>Press Enter to wake up</p>
          {canSnooze && <p>Press S to snooze</p>}
        </div>
      </motion.div>
    </div>,
    document.body
  )
}

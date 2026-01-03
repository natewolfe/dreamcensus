'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import type { MorningStartProps } from './types'

function getTimeGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 17) return 'Good day'
  if (hour >= 17 && hour < 21) return 'Good evening'
  return 'Sweet dreams'
}

export function MorningStart({ globalStep, totalSteps, onVoice, onText, onEmotionOnly, onSkip: _onSkip }: MorningStartProps) {
  const greeting = getTimeGreeting()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="space-y-8"
    >
      {/* Step counter */}
      <div className="text-center">
        <span className="text-sm text-muted">
          {globalStep + 1} of {totalSteps}
        </span>
      </div>

      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-center"
        >
          <h1 className="mb-2 text-3xl font-light text-foreground">
            {greeting}
          </h1>
          <p className="text-lg text-muted">
            Anything you remember?
          </p>
        </motion.div>

        <div className="mt-4 w-full max-w-sm space-y-4">
          {/* Primary: Voice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <button
              onClick={onVoice}
              className={cn(
                'group w-full rounded-xl bg-card-bg border border-border p-6',
                'transition-all duration-200',
                'hover:border-accent hover:shadow-lg hover:shadow-accent/10',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
              )}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-2xl transition-colors group-hover:bg-accent/30">
                  🎤
                </div>
                <div className="text-left">
                  <div className="text-lg font-medium text-foreground">
                    Record
                  </div>
                  <div className="text-sm text-muted">
                    Tap and speak your dream
                  </div>
                </div>
              </div>
            </button>
          </motion.div>

          {/* Secondary: Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <button
              onClick={onText}
              className={cn(
                'group w-full rounded-xl bg-card-bg border border-border p-6',
                'transition-all duration-200',
                'hover:border-accent hover:shadow-lg hover:shadow-accent/10',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
              )}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-2xl transition-colors group-hover:bg-accent/30">
                  ✏️
                </div>
                <div className="text-left">
                  <div className="text-lg font-medium text-foreground">
                    Type
                  </div>
                  <div className="text-sm text-muted">
                    Write your dream in words
                  </div>
                </div>
              </div>
            </button>
          </motion.div>

          {/* Tertiary: Emotion only */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="py-4 text-center"
          >
            <button
              onClick={onEmotionOnly}
              className={cn(
                'text-muted hover:text-foreground transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:rounded'
              )}
            >
              I only have a feeling →
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}


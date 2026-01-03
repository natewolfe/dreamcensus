'use client'

import { motion } from 'motion/react'
import { Button } from '@/components/ui'
import type { NightCompleteProps } from './types'

const DEFAULT_TIPS = [
  'Keep your phone nearby but screen-down. Dream memories fade quickly after waking.',
  'Try not to move immediately when you wake. Dreams are clearest in those first moments.',
  'Even fragments are valuable. Capture whatever you remember, however small.',
]

export function NightComplete({
  intention,
  reminderTime,
  tip = DEFAULT_TIPS[Math.floor(Math.random() * DEFAULT_TIPS.length)],
  onClose,
}: NightCompleteProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-8"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-center space-y-8 max-w-md"
      >
        <div className="text-4xl">✨</div>
        
        <h1 className="text-2xl font-light text-foreground">
          Sleep well
        </h1>

        {intention && (
          <div className="text-muted">
            <p className="text-sm mb-1">Your intention:</p>
            <p className="text-foreground italic">"{intention}"</p>
          </div>
        )}

        {reminderTime && (
          <p className="text-sm text-muted">
            Reminder set for {reminderTime}
          </p>
        )}

        <div className="border-t border-border pt-6">
          <div className="flex items-start gap-3 text-left">
            <span className="text-xl">💡</span>
            <div>
              <p className="text-sm text-muted leading-relaxed">
                {tip}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}


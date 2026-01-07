'use client'

import { motion } from 'motion/react'
import { Button } from '@/components/ui'
import type { NightWelcomeProps } from './types'

function getTimeGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 18 && hour < 21) return 'Good evening'
  if (hour >= 21 || hour < 3) return 'Getting sleepy?'
  if (hour >= 3 && hour < 6) return 'Late night?'
  return 'Rest well'
}

export function NightWelcome({ onBegin, onNotTonight }: NightWelcomeProps) {
  const greeting = getTimeGreeting()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-[50vh] flex-col items-center justify-center px-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-center space-y-8"
      >
        <div className="text-5xl mb-6">🌙</div>
        
        <h1 className="text-2xl font-light text-foreground">
          {greeting}
        </h1>
        
        <p className="text-muted">
          Ready to wind down for sleep?
        </p>
        
        <div className="pt-8">
          <Button
            variant="primary"
            size="lg"
            onClick={onBegin}
          >
            Begin →
          </Button>
        </div>
        
        <button
          onClick={onNotTonight}
          className="text-sm text-subtle hover:text-muted transition-colors"
        >
          Not tonight →
        </button>
      </motion.div>
    </motion.div>
  )
}


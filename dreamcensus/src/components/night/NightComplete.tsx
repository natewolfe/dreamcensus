'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui'
import { useAlarm } from '@/hooks/use-alarm'
import { formatAlarmTimeSplit } from '@/lib/alarm'
import type { NightCompleteProps } from './types'

function formatCountdown(targetISO: string): string | null {
  const now = new Date()
  const target = new Date(targetISO)
  
  const diffMs = target.getTime() - now.getTime()
  if (diffMs <= 0) return null
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (diffHours === 0) return `${diffMins}m`
  return `${diffHours}h ${diffMins}m`
}

export function NightComplete({
  intention,
  onClose,
}: NightCompleteProps) {
  const { isArmed, nextAlarmTime } = useAlarm()
  const [countdown, setCountdown] = useState<string | null>(null)

  // Update countdown every minute
  useEffect(() => {
    if (!nextAlarmTime) return

    const update = () => setCountdown(formatCountdown(nextAlarmTime))
    update()

    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [nextAlarmTime])

  // Format alarm time for display
  const alarmDisplay = nextAlarmTime
    ? formatAlarmTimeSplit(new Date(nextAlarmTime))
    : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 flex flex-col items-center justify-center bg-background px-6"
    >
      {/* Subtle close button - top right */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-subtle hover:text-muted transition-colors"
        aria-label="Close"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Main content */}
      <div className="flex flex-col items-center text-center space-y-8">
        
        {/* Ambient glow circle */}
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: 'easeInOut' 
          }}
          className="absolute w-64 h-64 rounded-full bg-accent/10 blur-3xl pointer-events-none"
        />

        {/* Moon icon */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-5xl"
        >
          🌙
        </motion.div>

        {/* Alarm display - hero element */}
        {isArmed && alarmDisplay ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">🔔</span>
              <span className="text-5xl md:text-6xl font-light text-foreground tracking-tight">
                {alarmDisplay.time}
              </span>
            </div>
            {countdown && (
              <p className="text-lg text-muted">
                {alarmDisplay.day} · <span className="text-accent font-medium">{countdown}</span>
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex items-center gap-2 text-muted"
          >
            <span className="text-xl">🔕</span>
            <span className="text-lg">No alarm set</span>
          </motion.div>
        )}

        {/* Goodnight message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-2xl font-light text-foreground"
        >
          Sleep well
        </motion.p>

        {/* Intention - subtle display */}
        {intention && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="max-w-xs text-sm text-subtle italic"
          >
            "{intention}"
          </motion.p>
        )}
      </div>

      {/* Completion button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.4 }}
        className="absolute bottom-16 left-0 right-0 flex justify-center px-6"
      >
        <Button variant="special" onClick={onClose} size="lg" className="w-full max-w-xs">
          Sweet dreams ✨
        </Button>
      </motion.div>

      {/* Bottom hint - very subtle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 1.4, duration: 0.5 }}
        className="absolute bottom-6 text-xs text-muted"
      >
        Leave open for alarm
      </motion.p>
    </motion.div>
  )
}

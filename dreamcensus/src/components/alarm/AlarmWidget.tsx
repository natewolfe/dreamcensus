'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import type { AlarmWidgetProps } from './types'

const MotionLink = motion.create(Link)

export function AlarmWidget({
  isArmed,
  nextAlarmTime,
  hasValidAlarm,
  onToggle,
}: AlarmWidgetProps) {
  // Determine what text to show
  const displayText = hasValidAlarm && nextAlarmTime ? nextAlarmTime : 'Off'

  return (
    <MotionLink
      href="/settings/alarm"
      className="flex items-center gap-3 px-2 md:px-3 py-2 md:py-3 rounded-lg border border-border/50 hover:shadow-md"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Alarm Emoji + Time/Label Display */}
      <span
        className={cn(
          'text-base md:text-lg font-semibold uppercase tracking-wide transition-colors whitespace-nowrap',
          isArmed ? 'text-foreground' : 'text-muted/50'
        )}
      >
        🔔 {displayText}
      </span>

      {/* Toggle Switch - stops propagation to prevent navigation */}
      <motion.button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onToggle()
        }}
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'relative w-12 h-6 rounded-full transition-all duration-300 cursor-pointer',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
          isArmed ? 'bg-accent' : 'bg-subtle/30'
        )}
        role="switch"
        aria-checked={isArmed}
        aria-label={isArmed ? 'Alarm armed' : 'Alarm disarmed'}
      >
        <motion.div
          className="absolute top-0.5 left-0.5 w-5 h-5 bg-accent rounded-full shadow-sm"
          animate={{
            x: isArmed ? 24 : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        />
      </motion.button>
    </MotionLink>
  )
}

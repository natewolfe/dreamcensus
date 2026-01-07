'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import type { AlarmWidgetProps } from './types'

export function AlarmWidget({
  isArmed,
  nextAlarmTime,
  hasValidAlarm,
  onToggle,
}: AlarmWidgetProps) {
  // Determine what text to show
  const displayText = hasValidAlarm && nextAlarmTime ? nextAlarmTime : 'Off'

  return (
    <div className="flex items-center gap-3 px-2 md:px-3 py-2 md:py-3 rounded-lg bg-transparent border border-border/50">
      {/* Alarm Emoji + Time/Label Display */}
      <span
        className={cn(
          'text-base md:text-lg font-semibold uppercase tracking-wide transition-colors whitespace-nowrap',
          isArmed ? 'text-foreground' : 'text-muted/50'
        )}
      >
        🔔 {displayText}
      </span>

      {/* Toggle Switch */}
      <motion.button
        onClick={onToggle}
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
          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
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
    </div>
  )
}

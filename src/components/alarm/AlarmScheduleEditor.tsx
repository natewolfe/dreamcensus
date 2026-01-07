'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import type { AlarmScheduleEditorProps } from './types'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function AlarmScheduleEditor({
  schedule,
  onChange,
}: AlarmScheduleEditorProps) {
  const handleToggleDay = (dayIndex: number) => {
    const newSchedule = schedule.map((rule, i) =>
      i === dayIndex ? { ...rule, enabled: !rule.enabled } : rule
    )
    onChange(newSchedule)
  }

  return (
    <div className="grid grid-cols-7 gap-2 md:gap-3">
      {schedule.map((rule, i) => (
        <motion.button
          key={rule.dayOfWeek}
          onClick={() => handleToggleDay(i)}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'aspect-square rounded-lg font-medium text-xs md:text-base uppercase tracking-widest transition-all cursor-pointer',
            'border-2',
            rule.enabled
              ? 'bg-subtle border-subtle text-foreground'
              : 'border-border bg-background text-muted hover:border-accent/50'
          )}
        >
          {DAY_LABELS[i]}
        </motion.button>
      ))}
    </div>
  )
}

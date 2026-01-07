'use client'

import { motion } from 'motion/react'
import { Slider } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { AlarmSnoozeSettingsProps } from './types'

const MAX_SNOOZES_OPTIONS = [1, 2, 3, 5]

export function AlarmSnoozeSettings({
  snoozeMinutes,
  maxSnoozes,
  onSnoozeMinutesChange,
  onMaxSnoozesChange,
}: AlarmSnoozeSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Snooze duration slider */}
      <div className="flex flex-col gap-3">
        <label className="text-base font-medium text-muted">
          Snooze Duration
        </label>
        <div className="flex items-center gap-4">
          <Slider
            value={snoozeMinutes}
            onChange={onSnoozeMinutesChange}
            min={1}
            max={30}
            step={1}
            className="flex-1"
          />
          <span className="text-lg text-foreground w-16 text-right">
            {snoozeMinutes} min
          </span>
        </div>
      </div>

      {/* Max snoozes */}
      <div className="flex flex-col gap-3">
        <label className="block text-base font-medium text-muted">
          Maximum Snoozes
        </label>
        <div className="grid grid-cols-4 gap-2">
          {MAX_SNOOZES_OPTIONS.map((max) => (
            <motion.button
              key={max}
              onClick={() => onMaxSnoozesChange(max)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'rounded-lg px-4 py-3 text-lg font-medium transition-all',
                'border-2',
                maxSnoozes === max
                  ? 'bg-subtle border-subtle text-foreground'
                  : 'border-border bg-background text-muted hover:border-accent/50 cursor-pointer'
              )}
            >
              {max}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

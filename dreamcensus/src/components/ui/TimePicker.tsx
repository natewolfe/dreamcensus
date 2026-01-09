'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export interface TimePickerProps {
  value: string // "HH:MM" 24-hour format (internal)
  onChange: (value: string) => void
  onCommit?: () => void // Called on blur/completion for debounced saves
  disabled?: boolean
  className?: string
}

// Convert 24-hour to 12-hour format
function to12Hour(hour24: number): { hour12: number; isPM: boolean } {
  if (hour24 === 0) return { hour12: 12, isPM: false }
  if (hour24 === 12) return { hour12: 12, isPM: true }
  if (hour24 > 12) return { hour12: hour24 - 12, isPM: true }
  return { hour12: hour24, isPM: false }
}

// Convert 12-hour to 24-hour format
function to24Hour(hour12: number, isPM: boolean): number {
  if (hour12 === 12) return isPM ? 12 : 0
  return isPM ? hour12 + 12 : hour12
}

export function TimePicker({
  value,
  onChange,
  onCommit,
  disabled = false,
  className,
}: TimePickerProps) {
  const [localHour, setLocalHour] = useState('')
  const [localMinute, setLocalMinute] = useState('')
  const [isPM, setIsPM] = useState(false)

  // Sync local state when prop value changes
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':')
      const hour24 = parseInt(h || '0')
      const { hour12, isPM: pm } = to12Hour(hour24)
      setLocalHour(hour12.toString())
      setLocalMinute(m || '00')
      setIsPM(pm)
    }
  }, [value])

  const emitTime = useCallback((h: string, m: string, pm: boolean) => {
    const hour12 = parseInt(h)
    const minute = parseInt(m)

    if (!isNaN(hour12) && hour12 >= 1 && hour12 <= 12 && !isNaN(minute) && minute >= 0 && minute <= 59) {
      const hour24 = to24Hour(hour12, pm)
      onChange(`${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
    }
  }, [onChange])

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHour = e.target.value
    if (newHour === '' || /^\d{1,2}$/.test(newHour)) {
      const num = parseInt(newHour)
      if (newHour === '' || (num >= 1 && num <= 12)) {
        setLocalHour(newHour)
        emitTime(newHour, localMinute, isPM)
      }
    }
  }

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinute = e.target.value
    if (newMinute === '' || /^\d{1,2}$/.test(newMinute)) {
      const num = parseInt(newMinute)
      if (newMinute === '' || (num >= 0 && num <= 59)) {
        setLocalMinute(newMinute)
        emitTime(localHour, newMinute, isPM)
      }
    }
  }

  const handleBlur = () => {
    onCommit?.()
  }

  const inputClasses = cn(
    'w-full px-3 py-3 rounded-lg',
    'bg-card-bg border-2 border-border',
    'text-foreground text-center text-lg md:text-xl',
    'focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'transition-colors',
    '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
  )

  return (
    <div className={cn('flex gap-2 items-center', className)}>
      {/* Hour */}
      <div className="">
        <label className="block text-xs text-muted text-center mb-1">
          Hour
        </label>
        <input
          type="number"
          min={1}
          max={12}
          value={localHour}
          onChange={handleHourChange}
          onBlur={handleBlur}
          placeholder="HH"
          disabled={disabled}
          className={inputClasses}
        />
      </div>

      <span className="text-2xl text-muted mt-5">:</span>

      {/* Minute */}
      <div className="">
        <label className="block text-xs text-muted text-center mb-1">
          Min
        </label>
        <input
          type="number"
          min={0}
          max={59}
          value={localMinute}
          onChange={handleMinuteChange}
          onBlur={handleBlur}
          placeholder="MM"
          disabled={disabled}
          className={inputClasses}
        />
      </div>

      {/* AM/PM Segmented Control */}
      <div>
        <label className="block text-xs text-muted text-center mb-1">
          &nbsp;
        </label>
        <div className="flex ml-1">
          <motion.button
            onClick={() => {
              if (isPM) {
                setIsPM(false)
                emitTime(localHour, localMinute, false)
              }
            }}
            whileTap={{ scale: 0.98 }}
            disabled={disabled}
            className={cn(
              'px-4 py-3 font-medium text-lg',
              'border-2 border-r-0 rounded-l-lg transition-all',
              'focus:outline-none focus:z-10 focus:ring-2 focus:ring-accent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              !isPM
                ? 'bg-subtle border-subtle text-foreground'
                : 'bg-card-bg border-border text-muted hover:text-foreground cursor-pointer'
            )}
          >
            AM
          </motion.button>
          <motion.button
            onClick={() => {
              if (!isPM) {
                setIsPM(true)
                emitTime(localHour, localMinute, true)
              }
            }}
            whileTap={{ scale: 0.98 }}
            disabled={disabled}
            className={cn(
              'px-4 py-3 font-medium text-lg',
              'border-2 rounded-r-lg transition-all',
              'focus:outline-none focus:z-10 focus:ring-2 focus:ring-accent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isPM
                ? 'bg-subtle border-subtle text-foreground'
                : 'bg-card-bg border-border text-muted hover:text-foreground cursor-pointer'
            )}
          >
            PM
          </motion.button>
        </div>
      </div>
    </div>
  )
}

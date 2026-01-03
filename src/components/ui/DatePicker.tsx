'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export interface DatePickerProps {
  value: string | null // ISO date string (YYYY-MM-DD)
  onChange: (value: string) => void
  minDate?: string // ISO date string
  maxDate?: string // ISO date string
  showAge?: boolean // Show calculated age
  disabled?: boolean
  className?: string
}

export function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  showAge = false,
  disabled = false,
  className,
}: DatePickerProps) {
  const [isMobile, setIsMobile] = useState(false)

  // Local state for partial date entry (desktop only, but must be declared unconditionally)
  const [localDay, setLocalDay] = useState('')
  const [localMonth, setLocalMonth] = useState('')
  const [localYear, setLocalYear] = useState('')

  useEffect(() => {
    // Detect mobile for native picker
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Sync local state when prop value changes externally
  useEffect(() => {
    const parsed = value ? new Date(value) : null
    setLocalDay(parsed ? parsed.getDate().toString() : '')
    setLocalMonth(parsed ? (parsed.getMonth() + 1).toString() : '')
    setLocalYear(parsed ? parsed.getFullYear().toString() : '')
  }, [value])

  const calculateAge = (dateString: string): number | null => {
    if (!dateString) return null
    const birth = new Date(dateString)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const age = value ? calculateAge(value) : null

  // Mobile: Use native date input
  if (isMobile) {
    return (
      <div className={cn('space-y-2', className)}>
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          min={minDate}
          max={maxDate}
          disabled={disabled}
          className={cn(
            'w-full px-4 py-3 rounded-lg',
            'bg-card-bg border-2 border-border',
            'text-foreground text-base',
            'focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors'
          )}
        />
        {showAge && age !== null && age >= 0 && (
          <p className="text-sm text-muted">Age: {age} years old</p>
        )}
      </div>
    )
  }

  // Try to emit a valid date to parent when all fields are complete
  const tryEmitDate = (d: string, m: string, y: string) => {
    const day = parseInt(d) || 0
    const month = parseInt(m) || 0
    const year = parseInt(y) || 0

    if (day > 0 && day <= 31 && month > 0 && month <= 12 && year > 1900 && year <= 2100) {
      const dateStr = `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      onChange(dateStr)
    }
  }

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDay = e.target.value
    // Allow empty or valid day values (partial typing like "3" for "31")
    if (newDay === '' || /^\d{1,2}$/.test(newDay)) {
      const numDay = parseInt(newDay)
      if (newDay === '' || (numDay >= 0 && numDay <= 31)) {
        setLocalDay(newDay)
        tryEmitDate(newDay, localMonth, localYear)
      }
    }
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMonth = e.target.value
    if (newMonth === '' || /^\d{1,2}$/.test(newMonth)) {
      const numMonth = parseInt(newMonth)
      if (newMonth === '' || (numMonth >= 0 && numMonth <= 12)) {
        setLocalMonth(newMonth)
        tryEmitDate(localDay, newMonth, localYear)
      }
    }
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newYear = e.target.value
    if (newYear === '' || /^\d{1,4}$/.test(newYear)) {
      setLocalYear(newYear)
      tryEmitDate(localDay, localMonth, newYear)
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex gap-2">
        {/* Day */}
        <div className="flex-1">
          <label htmlFor="day" className="block text-xs text-muted mb-1">
            Day
          </label>
          <input
            id="day"
            type="number"
            min={1}
            max={31}
            value={localDay}
            onChange={handleDayChange}
            placeholder="DD"
            disabled={disabled}
            className={cn(
              'w-full px-3 py-3 rounded-lg',
              'bg-card-bg border-2 border-border',
              'text-foreground text-center',
              'focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors',
              '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
            )}
          />
        </div>

        {/* Month */}
        <div className="flex-1">
          <label htmlFor="month" className="block text-xs text-muted mb-1">
            Month
          </label>
          <input
            id="month"
            type="number"
            min={1}
            max={12}
            value={localMonth}
            onChange={handleMonthChange}
            placeholder="MM"
            disabled={disabled}
            className={cn(
              'w-full px-3 py-3 rounded-lg',
              'bg-card-bg border-2 border-border',
              'text-foreground text-center',
              'focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors',
              '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
            )}
          />
        </div>

        {/* Year */}
        <div className="flex-[1.5]">
          <label htmlFor="year" className="block text-xs text-muted mb-1">
            Year
          </label>
          <input
            id="year"
            type="number"
            min={1900}
            max={2100}
            value={localYear}
            onChange={handleYearChange}
            placeholder="YYYY"
            disabled={disabled}
            className={cn(
              'w-full px-3 py-3 rounded-lg',
              'bg-card-bg border-2 border-border',
              'text-foreground text-center',
              'focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors',
              '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
            )}
          />
        </div>
      </div>

      {showAge && age !== null && age >= 0 && (
        <p className="text-sm text-muted">Age: {age} years old</p>
      )}
    </div>
  )
}


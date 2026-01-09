import type { ScheduleRule, TonightOverride, DayOfWeek } from './types'

/**
 * Compute the next alarm time based on schedule and tonight override
 * 
 * @param now - Current time
 * @param schedule - Weekly schedule rules
 * @param tonightOverride - Optional override from NightCheckIn
 * @param timezone - User's timezone (e.g., "America/New_York")
 * @param fallbackTime - Optional fallback time in "HH:MM" format when no schedule exists
 * @returns Next alarm Date or null if no alarm scheduled
 */
export function computeNextAlarm(
  now: Date,
  schedule: ScheduleRule[],
  tonightOverride: TonightOverride | null,
  timezone: string = 'UTC',
  fallbackTime?: string
): Date | null {
  // 1. Check tonight override first
  if (tonightOverride?.enabled && tonightOverride.wakeTimeISO) {
    const overrideTime = new Date(tonightOverride.wakeTimeISO)
    if (overrideTime > now) {
      return overrideTime
    }
  }

  // 2. Find next enabled day from schedule
  const enabledDays = schedule.filter((rule) => rule.enabled)
  
  // 3. Use fallback time if no schedule configured
  if (enabledDays.length === 0 && fallbackTime) {
    const [hours, minutes] = fallbackTime.split(':').map(Number)
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(hours ?? 7, minutes ?? 0, 0, 0)
    return tomorrow
  }
  
  if (enabledDays.length === 0) {
    return null
  }

  // Try next 14 days (2 weeks) to find next alarm
  for (let daysAhead = 0; daysAhead < 14; daysAhead++) {
    const checkDate = new Date(now)
    checkDate.setDate(checkDate.getDate() + daysAhead)
    
    const dayOfWeek = checkDate.getDay() as DayOfWeek
    const rule = enabledDays.find((r) => r.dayOfWeek === dayOfWeek)
    
    if (rule) {
      // Parse the time
      const [hours, minutes] = rule.wakeTimeLocal.split(':').map(Number)
      
      const alarmTime = new Date(checkDate)
      alarmTime.setHours(hours ?? 0, minutes ?? 0, 0, 0)
      
      // If this time is in the future, this is our next alarm
      if (alarmTime > now) {
        return alarmTime
      }
    }
  }

  return null
}

/**
 * Format alarm time for display
 * @param date - Alarm time
 * @returns Formatted string like "Tomorrow at 7:30 AM" or "Mon at 7:30 AM"
 */
export function formatAlarmTime(date: Date): string {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  
  const alarmDay = new Date(date)
  alarmDay.setHours(0, 0, 0, 0)
  
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  
  // Check if today
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  
  if (alarmDay.getTime() === today.getTime()) {
    return `Today at ${timeStr}`
  }
  
  // Check if tomorrow
  if (alarmDay.getTime() === tomorrow.getTime()) {
    return `Tomorrow at ${timeStr}`
  }
  
  // Otherwise show day of week
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
  return `${dayName} at ${timeStr}`
}

/**
 * Format alarm time for split display (day label + time)
 * @param date - Alarm time
 * @returns Object with day and time strings
 */
export function formatAlarmTimeSplit(date: Date): { day: string; time: string } {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  
  const alarmDay = new Date(date)
  alarmDay.setHours(0, 0, 0, 0)
  
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  
  let day: string
  if (alarmDay.getTime() === today.getTime()) {
    day = 'Today'
  } else if (alarmDay.getTime() === tomorrow.getTime()) {
    day = 'Tomorrow'
  } else {
    day = date.toLocaleDateString('en-US', { weekday: 'short' })
  }
  
  return { day, time: timeStr }
}

/**
 * Get default schedule (all days at 7:00 AM)
 */
export function getDefaultSchedule(): ScheduleRule[] {
  return [
    { dayOfWeek: 0, enabled: true, wakeTimeLocal: '07:00' }, // Sunday
    { dayOfWeek: 1, enabled: true, wakeTimeLocal: '07:00' }, // Monday
    { dayOfWeek: 2, enabled: true, wakeTimeLocal: '07:00' }, // Tuesday
    { dayOfWeek: 3, enabled: true, wakeTimeLocal: '07:00' }, // Wednesday
    { dayOfWeek: 4, enabled: true, wakeTimeLocal: '07:00' }, // Thursday
    { dayOfWeek: 5, enabled: true, wakeTimeLocal: '07:00' }, // Friday
    { dayOfWeek: 6, enabled: true, wakeTimeLocal: '07:00' }, // Saturday
  ]
}

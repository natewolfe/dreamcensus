import type { ScheduleRule, DayOfWeek } from './types'

const DAY_NAMES_PLURAL = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'] as const

/**
 * Get a human-readable repeat timeframe for the alarm schedule
 * 
 * Returns just the variable part (to be prefixed with "Repeats" in the UI):
 * - No days: "never"
 * - All 7 days: "everyday"
 * - Mon-Fri: "weekdays"
 * - Sat-Sun: "weekends"
 * - Single day: "Mondays", "Tuesdays", etc.
 * - Custom: "every:"
 */
export function getScheduleRepeatLabel(schedule: ScheduleRule[]): string {
  const enabledDays = schedule.filter(r => r.enabled).map(r => r.dayOfWeek)
  const count = enabledDays.length

  if (count === 0) return 'never'
  if (count === 7) return 'everyday'

  // Check for single day
  if (count === 1) {
    const dayIndex = enabledDays[0]
    if (dayIndex !== undefined) {
      return DAY_NAMES_PLURAL[dayIndex]
    }
  }

  // Check for weekdays (Mon-Fri: 1,2,3,4,5)
  const isWeekdays = count === 5 && 
    ([1, 2, 3, 4, 5] as DayOfWeek[]).every(d => enabledDays.includes(d))
  if (isWeekdays) return 'weekdays'

  // Check for weekends (Sat, Sun: 0, 6)
  const isWeekends = count === 2 && 
    enabledDays.includes(0) && enabledDays.includes(6)
  if (isWeekends) return 'weekends'

  // Custom selection
  return 'every:'
}

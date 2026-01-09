/**
 * Alarm system types
 */

/**
 * Day of week (0 = Sunday, 6 = Saturday)
 */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

/**
 * Schedule rule for a single day
 */
export interface ScheduleRule {
  dayOfWeek: DayOfWeek
  enabled: boolean
  wakeTimeLocal: string // "HH:MM" format
}

/**
 * Tonight override (from NightCheckIn)
 */
export interface TonightOverride {
  enabled: boolean
  wakeTimeISO: string
  date: string // YYYY-MM-DD
}

/**
 * Alarm settings (matches Prisma model)
 */
export interface AlarmSettings {
  id: string
  userId: string
  isArmed: boolean
  schedule: ScheduleRule[]
  soundId: string
  volume: number
  snoozeMinutes: number
  maxSnoozes: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Runtime alarm state (stored in IndexedDB)
 */
export interface AlarmRuntimeState {
  nextAlarmAtISO: string | null
  isRinging: boolean
  ringStartedAtISO: string | null
  snoozeUntilISO: string | null
  snoozeCount: number
  lastComputedAtISO: string
  source: 'schedule' | 'override' | null
  sourceDate: string | null
}

/**
 * Alarm context passed to MorningMode for tracking
 */
export interface AlarmContext {
  alarmId: string
  scheduledTime: string
  actualStopTime: string
  snoozeCount: number
}

/**
 * Alarm scheduler interface
 */
export interface AlarmScheduler {
  start(nextAlarmAt: Date): void
  cancel(): void
  onTrigger(callback: () => void): void
}

/**
 * Sound definition
 */
export interface AlarmSound {
  id: string
  name: string
  file: string
  description: string
}

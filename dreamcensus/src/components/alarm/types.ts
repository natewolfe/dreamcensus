/**
 * Alarm UI component types
 */

import type { ScheduleRule } from '@/lib/alarm'

export interface AlarmWidgetProps {
  isArmed: boolean
  nextAlarmTime: string | null
  hasValidAlarm: boolean
  onToggle: () => void
}

export interface AlarmRingOverlayProps {
  snoozeCount: number
  maxSnoozes: number
  onSnooze: () => void
  onStop: () => void
}

export interface AlarmScheduleEditorProps {
  schedule: ScheduleRule[]
  onChange: (schedule: ScheduleRule[]) => void
}

export interface AlarmSoundSelectorProps {
  soundId: string
  volume: number
  onSoundChange: (soundId: string) => void
  onVolumeChange: (volume: number) => void
}

export interface AlarmSnoozeSettingsProps {
  snoozeMinutes: number
  maxSnoozes: number
  onSnoozeMinutesChange: (minutes: number) => void
  onMaxSnoozesChange: (max: number) => void
}

export interface AlarmReliabilityBannerProps {
  variant?: 'info' | 'warning'
}

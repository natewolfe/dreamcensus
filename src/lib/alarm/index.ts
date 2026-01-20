/**
 * Barrel export for alarm module
 */

export type {
  DayOfWeek,
  ScheduleRule,
  TonightOverride,
  AlarmSettings,
  AlarmRuntimeState,
  AlarmContext,
  AlarmScheduler,
  AlarmSound,
} from './types'

export { computeNextAlarm, formatAlarmTime, formatAlarmTimeSplit, getDefaultSchedule } from './compute-next-alarm'
export { createWebScheduler, getScheduler } from './scheduler'
export {
  ALARM_SOUNDS,
  type AlarmSoundId,
  unlockAudio,
  playSound,
  stopSound,
  previewSound,
  isAudioUnlocked,
} from './sounds'
export { getAlarmState, saveAlarmState, clearAlarmState, getInitialAlarmState } from './store'
export { getScheduleRepeatLabel } from './schedule-labels'
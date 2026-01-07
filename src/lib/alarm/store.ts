import { getDB } from '../offline/store'
import type { AlarmRuntimeState } from './types'

const ALARM_STATE_KEY = 'current'

/**
 * Get the current alarm runtime state from IndexedDB
 */
export async function getAlarmState(): Promise<AlarmRuntimeState | null> {
  try {
    const db = await getDB()
    const state = await db.get('alarmState', ALARM_STATE_KEY)
    return state ?? null
  } catch (error) {
    console.error('Failed to get alarm state:', error)
    return null
  }
}

/**
 * Save alarm runtime state to IndexedDB
 */
export async function saveAlarmState(state: AlarmRuntimeState): Promise<void> {
  try {
    const db = await getDB()
    await db.put('alarmState', state, ALARM_STATE_KEY)
  } catch (error) {
    console.error('Failed to save alarm state:', error)
  }
}

/**
 * Clear alarm runtime state
 */
export async function clearAlarmState(): Promise<void> {
  try {
    const db = await getDB()
    await db.delete('alarmState', ALARM_STATE_KEY)
  } catch (error) {
    console.error('Failed to clear alarm state:', error)
  }
}

/**
 * Get the initial alarm state
 */
export function getInitialAlarmState(): AlarmRuntimeState {
  return {
    nextAlarmAtISO: null,
    isRinging: false,
    ringStartedAtISO: null,
    snoozeUntilISO: null,
    snoozeCount: 0,
    lastComputedAtISO: new Date().toISOString(),
    source: null,
    sourceDate: null,
  }
}

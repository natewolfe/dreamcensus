'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import { emitEvent } from '@/lib/events'
import { db } from '@/lib/db'
import type { ActionResult } from '@/lib/actions'
import { computeNextAlarm, getDefaultSchedule } from '@/lib/alarm'
import type { ScheduleRule } from '@/lib/alarm'

// =============================================================================
// SCHEMAS
// =============================================================================

const ScheduleRuleSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  enabled: z.boolean(),
  wakeTimeLocal: z.string().regex(/^\d{1,2}:\d{2}$/),
})

const UpdateScheduleSchema = z.object({
  schedule: z.array(ScheduleRuleSchema).length(7),
})

const UpdateSoundSchema = z.object({
  soundId: z.string(),
  volume: z.number().min(0).max(100),
})

const UpdateSnoozeSchema = z.object({
  snoozeMinutes: z.number().min(1).max(30),
  maxSnoozes: z.number().min(1).max(10),
})

// =============================================================================
// ACTIONS
// =============================================================================

/**
 * Get alarm settings for the current user
 * Creates default settings if none exist
 */
export async function getAlarmSettings(): Promise<ActionResult<{
  settings: {
    id: string
    isArmed: boolean
    schedule: ScheduleRule[]
    soundId: string
    volume: number
    snoozeMinutes: number
    maxSnoozes: number
    lastSetTime: string | null
  }
  nextAlarmTime: string | null
}>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get or create alarm settings
    let settings = await db.alarmSettings.findUnique({
      where: { userId: session.userId },
    })

    if (!settings) {
      // Create default settings
      settings = await db.alarmSettings.create({
        data: {
          userId: session.userId,
          isArmed: false,
          schedule: getDefaultSchedule(),
          soundId: 'gentle-rise',
          volume: 80,
          snoozeMinutes: 10,
          maxSnoozes: 3,
        },
      })
    }

    // Check for tonight override from NightCheckIn
    const today = new Date().toISOString().split('T')[0]
    const nightCheckIn = await db.nightCheckIn.findUnique({
      where: {
        userId_date: {
          userId: session.userId,
          date: today ?? '',
        },
      },
    })

    const tonightOverride = nightCheckIn?.plannedWakeTime
      ? {
          enabled: true,
          wakeTimeISO: nightCheckIn.plannedWakeTime,
          date: today ?? '',
        }
      : null

    // Compute next alarm time
    const schedule = settings.schedule as ScheduleRule[]
    const nextAlarm = settings.isArmed
      ? computeNextAlarm(new Date(), schedule, tonightOverride, 'UTC', settings.lastSetTime ?? undefined)
      : null

    return {
      success: true,
      data: {
        settings: {
          id: settings.id,
          isArmed: settings.isArmed,
          schedule: schedule,
          soundId: settings.soundId,
          volume: settings.volume,
          snoozeMinutes: settings.snoozeMinutes,
          maxSnoozes: settings.maxSnoozes,
          lastSetTime: settings.lastSetTime,
        },
        nextAlarmTime: nextAlarm ? nextAlarm.toISOString() : null,
      },
    }
  } catch (error) {
    console.error('getAlarmSettings error:', error)
    return { success: false, error: 'Failed to load alarm settings' }
  }
}

/**
 * Update alarm schedule
 */
export async function updateAlarmSchedule(
  input: z.infer<typeof UpdateScheduleSchema>
): Promise<ActionResult<void>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    const data = UpdateScheduleSchema.parse(input)

    // Extract most common or first enabled time for lastSetTime
    const enabledRule = data.schedule.find(r => r.enabled)
    const lastSetTime = enabledRule?.wakeTimeLocal ?? null

    // Update settings
    await db.alarmSettings.upsert({
      where: { userId: session.userId },
      create: {
        userId: session.userId,
        schedule: data.schedule,
        lastSetTime,
      },
      update: {
        schedule: data.schedule,
        lastSetTime,
      },
    })

    // Emit event
    await emitEvent({
      type: 'alarm.settings.updated',
      userId: session.userId,
      payload: {
        schedule: data.schedule,
      },
    })

    revalidatePath('/settings/alarm')
    revalidatePath('/today')

    return { success: true, data: undefined }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid schedule data' }
    }
    console.error('updateAlarmSchedule error:', error)
    return { success: false, error: 'Failed to update schedule' }
  }
}

/**
 * Set alarm armed state
 */
export async function setAlarmArmed(armed: boolean): Promise<ActionResult<void>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get settings to compute next alarm
    const settings = await db.alarmSettings.findUnique({
      where: { userId: session.userId },
    })

    if (!settings) {
      // Create default settings if none exist
      await db.alarmSettings.create({
        data: {
          userId: session.userId,
          isArmed: armed,
          schedule: getDefaultSchedule(),
        },
      })
    } else {
      await db.alarmSettings.update({
        where: { userId: session.userId },
        data: { isArmed: armed },
      })
    }

    // Compute next alarm time for event
    let nextAlarmTime: string | null = null
    if (armed && settings) {
      const schedule = settings.schedule as ScheduleRule[]
      const nextAlarm = computeNextAlarm(new Date(), schedule, null, 'UTC', settings.lastSetTime ?? undefined)
      nextAlarmTime = nextAlarm ? nextAlarm.toISOString() : null
    }

    // Emit event
    await emitEvent({
      type: armed ? 'alarm.armed' : 'alarm.disarmed',
      userId: session.userId,
      payload: armed
        ? { armedAt: new Date().toISOString(), nextAlarmAt: nextAlarmTime }
        : { disarmedAt: new Date().toISOString() },
    })

    revalidatePath('/settings/alarm')
    revalidatePath('/today')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('setAlarmArmed error:', error)
    return { success: false, error: 'Failed to update alarm' }
  }
}

/**
 * Update alarm sound settings
 */
export async function updateAlarmSound(
  input: z.infer<typeof UpdateSoundSchema>
): Promise<ActionResult<void>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    const data = UpdateSoundSchema.parse(input)

    await db.alarmSettings.upsert({
      where: { userId: session.userId },
      create: {
        userId: session.userId,
        soundId: data.soundId,
        volume: data.volume,
        schedule: getDefaultSchedule(),
      },
      update: {
        soundId: data.soundId,
        volume: data.volume,
      },
    })

    // Emit event
    await emitEvent({
      type: 'alarm.settings.updated',
      userId: session.userId,
      payload: {
        soundId: data.soundId,
        volume: data.volume,
      },
    })

    revalidatePath('/settings/alarm')

    return { success: true, data: undefined }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid sound settings' }
    }
    console.error('updateAlarmSound error:', error)
    return { success: false, error: 'Failed to update sound' }
  }
}

/**
 * Update snooze settings
 */
export async function updateSnoozeSettings(
  input: z.infer<typeof UpdateSnoozeSchema>
): Promise<ActionResult<void>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    const data = UpdateSnoozeSchema.parse(input)

    await db.alarmSettings.upsert({
      where: { userId: session.userId },
      create: {
        userId: session.userId,
        snoozeMinutes: data.snoozeMinutes,
        maxSnoozes: data.maxSnoozes,
        schedule: getDefaultSchedule(),
      },
      update: {
        snoozeMinutes: data.snoozeMinutes,
        maxSnoozes: data.maxSnoozes,
      },
    })

    // Emit event
    await emitEvent({
      type: 'alarm.settings.updated',
      userId: session.userId,
      payload: {
        snoozeMinutes: data.snoozeMinutes,
        maxSnoozes: data.maxSnoozes,
      },
    })

    revalidatePath('/settings/alarm')

    return { success: true, data: undefined }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid snooze settings' }
    }
    console.error('updateSnoozeSettings error:', error)
    return { success: false, error: 'Failed to update snooze settings' }
  }
}

/**
 * Record alarm rang event
 */
export async function recordAlarmRang(
  scheduledFor: string,
  source: 'schedule' | 'override'
): Promise<ActionResult<void>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    await emitEvent({
      type: 'alarm.rang',
      userId: session.userId,
      payload: {
        scheduledFor,
        actualRingAt: new Date().toISOString(),
        source,
      },
    })

    return { success: true, data: undefined }
  } catch (error) {
    console.error('recordAlarmRang error:', error)
    return { success: false, error: 'Failed to record alarm event' }
  }
}

/**
 * Record alarm snoozed event
 */
export async function recordAlarmSnoozed(
  snoozeNumber: number,
  snoozeUntil: string
): Promise<ActionResult<void>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    await emitEvent({
      type: 'alarm.snoozed',
      userId: session.userId,
      payload: {
        snoozeNumber,
        snoozeUntil,
      },
    })

    return { success: true, data: undefined }
  } catch (error) {
    console.error('recordAlarmSnoozed error:', error)
    return { success: false, error: 'Failed to record snooze' }
  }
}

/**
 * Record alarm stopped event
 */
export async function recordAlarmStopped(
  snoozeCount: number,
  routedToCapture: boolean,
  dreamEntryId?: string
): Promise<ActionResult<void>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    await emitEvent({
      type: 'alarm.stopped',
      userId: session.userId,
      payload: {
        stoppedAt: new Date().toISOString(),
        snoozeCount,
        routedToCapture,
        dreamEntryId,
      },
    })

    return { success: true, data: undefined }
  } catch (error) {
    console.error('recordAlarmStopped error:', error)
    return { success: false, error: 'Failed to record alarm stop' }
  }
}

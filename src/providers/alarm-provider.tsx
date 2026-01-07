'use client'

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import {
  getScheduler,
  playSound,
  stopSound,
  getAlarmState,
  saveAlarmState,
  getInitialAlarmState,
  computeNextAlarm,
} from '@/lib/alarm'
import type { AlarmRuntimeState, AlarmContext as AlarmContextType } from '@/lib/alarm'
import { getAlarmSettings, recordAlarmRang, recordAlarmSnoozed, recordAlarmStopped } from '@/app/(app)/settings/alarm/actions'
import { useToast } from '@/hooks/use-toast'
import { AlarmRingOverlay } from '@/components/alarm'

interface AlarmContextValue {
  isRinging: boolean
  isArmed: boolean
  nextAlarmTime: string | null
  snoozeCount: number
  handleSnooze: () => void
  handleStop: () => void
  refreshAlarm: () => Promise<void>
}

export const AlarmContext = createContext<AlarmContextValue | null>(null)

export function AlarmProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { toast } = useToast()
  const [runtimeState, setRuntimeState] = useState<AlarmRuntimeState>(getInitialAlarmState())
  const [isArmed, setIsArmed] = useState(false)
  const [soundId, setSoundId] = useState('gentle-rise')
  const [volume, setVolume] = useState(80)
  const [snoozeMinutes, setSnoozeMinutes] = useState(9)
  const [maxSnoozes, setMaxSnoozes] = useState(3)
  const schedulerRef = useRef(getScheduler())
  const alarmContextRef = useRef<AlarmContextType | null>(null)

  /**
   * Load alarm settings and runtime state from server + IndexedDB
   */
  const loadAlarmData = useCallback(async () => {
    try {
      // Load from IndexedDB
      const storedState = await getAlarmState()
      if (storedState) {
        setRuntimeState(storedState)
      }

      // Load settings from server
      const result = await getAlarmSettings()
      if (result.success) {
        const { settings, nextAlarmTime } = result.data
        setIsArmed(settings.isArmed)
        setSoundId(settings.soundId)
        setVolume(settings.volume)
        setSnoozeMinutes(settings.snoozeMinutes)
        setMaxSnoozes(settings.maxSnoozes)

        // Update runtime state with computed next alarm
        const newState: AlarmRuntimeState = {
          ...runtimeState,
          nextAlarmAtISO: nextAlarmTime,
          lastComputedAtISO: new Date().toISOString(),
        }
        setRuntimeState(newState)
        await saveAlarmState(newState)

        // Start scheduler if armed and has next alarm
        if (settings.isArmed && nextAlarmTime) {
          schedulerRef.current.start(new Date(nextAlarmTime))
        }
      }
    } catch (error) {
      console.error('Failed to load alarm data:', error)
    }
  }, [runtimeState])

  /**
   * Initialize alarm on mount
   */
  useEffect(() => {
    let mounted = true

    const init = async () => {
      if (!mounted) return
      await loadAlarmData()
    }

    init()

    return () => {
      mounted = false
    }
  }, []) // Only run once on mount

  /**
   * Set up alarm trigger handler
   */
  useEffect(() => {
    schedulerRef.current.onTrigger(async () => {
      // Ring the alarm
      const newState: AlarmRuntimeState = {
        ...runtimeState,
        isRinging: true,
        ringStartedAtISO: new Date().toISOString(),
        snoozeCount: 0,
      }
      setRuntimeState(newState)
      await saveAlarmState(newState)

      // Play sound
      playSound(soundId, volume)

      // Record alarm rang event
      if (newState.nextAlarmAtISO) {
        await recordAlarmRang(
          newState.nextAlarmAtISO,
          newState.source ?? 'schedule'
        )
      }
    })
  }, [runtimeState, soundId, volume])

  /**
   * Handle snooze action
   */
  const handleSnooze = useCallback(async () => {
    if (runtimeState.snoozeCount >= maxSnoozes) {
      toast.warning('Maximum snoozes reached')
      return
    }

    // Stop sound
    stopSound()

    // Calculate snooze time
    const snoozeUntil = new Date()
    snoozeUntil.setMinutes(snoozeUntil.getMinutes() + snoozeMinutes)

    // Update state
    const newState: AlarmRuntimeState = {
      ...runtimeState,
      isRinging: false,
      snoozeUntilISO: snoozeUntil.toISOString(),
      snoozeCount: runtimeState.snoozeCount + 1,
    }
    setRuntimeState(newState)
    await saveAlarmState(newState)

    // Record snooze event
    await recordAlarmSnoozed(newState.snoozeCount, snoozeUntil.toISOString())

    // Schedule next alarm
    schedulerRef.current.start(snoozeUntil)

    toast.info(`Snoozed until ${snoozeUntil.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })}`)
  }, [runtimeState, snoozeMinutes, maxSnoozes, toast])

  /**
   * Handle stop action (I'm Awake)
   */
  const handleStop = useCallback(async () => {
    // Stop sound
    stopSound()

    // Cancel any pending snooze
    schedulerRef.current.cancel()

    // Prepare alarm context for MorningMode
    alarmContextRef.current = {
      alarmId: runtimeState.nextAlarmAtISO ?? crypto.randomUUID(),
      scheduledTime: runtimeState.nextAlarmAtISO ?? new Date().toISOString(),
      actualStopTime: new Date().toISOString(),
      snoozeCount: runtimeState.snoozeCount,
    }

    // Record stop event
    await recordAlarmStopped(runtimeState.snoozeCount, true)

    // Reset state
    const newState: AlarmRuntimeState = {
      ...getInitialAlarmState(),
      lastComputedAtISO: new Date().toISOString(),
    }
    setRuntimeState(newState)
    await saveAlarmState(newState)

    // Route to morning capture with alarm context
    router.push('/today/morning?alarm=true')
  }, [runtimeState, router])

  /**
   * Refresh alarm (recompute next alarm time)
   */
  const refreshAlarm = useCallback(async () => {
    await loadAlarmData()
  }, [loadAlarmData])

  const contextValue: AlarmContextValue = {
    isRinging: runtimeState.isRinging,
    isArmed,
    nextAlarmTime: runtimeState.nextAlarmAtISO,
    snoozeCount: runtimeState.snoozeCount,
    handleSnooze,
    handleStop,
    refreshAlarm,
  }

  return (
    <AlarmContext.Provider value={contextValue}>
      {children}
      
      {/* Ring overlay rendered here to be global */}
      {runtimeState.isRinging && (
        <AlarmRingOverlay
          snoozeCount={runtimeState.snoozeCount}
          maxSnoozes={maxSnoozes}
          onSnooze={handleSnooze}
          onStop={handleStop}
        />
      )}
    </AlarmContext.Provider>
  )
}

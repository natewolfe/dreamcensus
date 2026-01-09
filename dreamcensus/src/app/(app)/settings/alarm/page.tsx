'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout'
import { Card, Switch, TimePicker } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  AlarmScheduleEditor,
  AlarmSoundSelector,
  AlarmSnoozeSettings,
  AlarmReliabilityBanner,
} from '@/components/alarm'
import type { ScheduleRule } from '@/lib/alarm'
import {
  getAlarmSettings,
  updateAlarmSchedule,
  setAlarmArmed,
  updateAlarmSound,
  updateSnoozeSettings,
} from './actions'
import { useToast } from '@/hooks/use-toast'
import { useAlarm } from '@/hooks/use-alarm'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'

export default function AlarmSettingsPage() {
  const { toast } = useToast()
  const { refreshAlarm } = useAlarm()
  const [isLoading, setIsLoading] = useState(true)
  const [isArmed, setIsArmed] = useState(false)
  const [schedule, setSchedule] = useState<ScheduleRule[]>([])
  const [soundId, setSoundId] = useState('gentle-rise')
  const [volume, setVolume] = useState(80)
  const [snoozeMinutes, setSnoozeMinutes] = useState(9)
  const [maxSnoozes, setMaxSnoozes] = useState(3)

  // Debounced save functions (batches rapid changes)
  const [debouncedSaveSound] = useDebouncedCallback(
    async (newSoundId: string, newVolume: number) => {
      const result = await updateAlarmSound({ soundId: newSoundId, volume: newVolume })
      if (!result.success) {
        toast.error(result.error)
      }
    },
    { delay: 500 }
  )

  const [debouncedSaveSnooze] = useDebouncedCallback(
    async (minutes: number, max: number) => {
      const result = await updateSnoozeSettings({ snoozeMinutes: minutes, maxSnoozes: max })
      if (!result.success) {
        toast.error(result.error)
      }
    },
    { delay: 500 }
  )

  const [debouncedSaveSchedule] = useDebouncedCallback(
    async (newSchedule: ScheduleRule[]) => {
      const result = await updateAlarmSchedule({ schedule: newSchedule })
      if (result.success) {
        await refreshAlarm()
      } else {
        toast.error(result.error)
      }
    },
    { delay: 500 }
  )

  // Load settings on mount
  useEffect(() => {
    let mounted = true

    const load = async () => {
      const result = await getAlarmSettings()
      if (mounted && result.success) {
        const { settings } = result.data
        setIsArmed(settings.isArmed)
        setSchedule(settings.schedule)
        setSoundId(settings.soundId)
        setVolume(settings.volume)
        setSnoozeMinutes(settings.snoozeMinutes)
        setMaxSnoozes(settings.maxSnoozes)
        setIsLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  // Handlers - update local state immediately, debounce saves
  const handleToggleArmed = async (newArmed: boolean) => {
    const result = await setAlarmArmed(newArmed)
    
    if (result.success) {
      setIsArmed(newArmed)
      await refreshAlarm()
      toast.success(newArmed ? 'Alarm armed' : 'Alarm disarmed')
    } else {
      toast.error(result.error)
    }
  }

  const handleScheduleChange = (newSchedule: ScheduleRule[]) => {
    setSchedule(newSchedule)
    debouncedSaveSchedule(newSchedule)
  }

  // Get the most common wake time (for the main time picker)
  const wakeTime = schedule.reduce((acc, rule) => {
    const count = schedule.filter((r) => r.wakeTimeLocal === rule.wakeTimeLocal).length
    if (count > acc.count) {
      return { time: rule.wakeTimeLocal, count }
    }
    return acc
  }, { time: '07:00', count: 0 }).time

  const handleWakeTimeChange = (newTime: string) => {
    const newSchedule = schedule.map((rule) => ({
      ...rule,
      wakeTimeLocal: newTime,
    }))
    setSchedule(newSchedule)
    debouncedSaveSchedule(newSchedule)
  }

  const handleSoundChange = (newSoundId: string) => {
    setSoundId(newSoundId)
    debouncedSaveSound(newSoundId, volume)
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    debouncedSaveSound(soundId, newVolume)
  }

  const handleSnoozeChange = (minutes: number) => {
    setSnoozeMinutes(minutes)
    debouncedSaveSnooze(minutes, maxSnoozes)
  }

  const handleMaxSnoozesChange = (max: number) => {
    setMaxSnoozes(max)
    debouncedSaveSnooze(snoozeMinutes, max)
  }

  if (isLoading) {
    return (
      <div id="main-content" className="container mx-auto max-w-2xl px-4 py-8">
        <PageHeader title="Alarm" subtitle="Loading..." />
      </div>
    )
  }

  return (
    <div id="main-content" className="container mx-auto max-w-2xl px-4 py-8 pb-16">
      <PageHeader
        title="Alarm"
        subtitle="Schedule your wake-up call"
        actions={<AlarmReliabilityBanner />}
      />

      <div className="space-y-6 mt-6">
        {/* Status Card */}
        <Card padding="none" variant="plain">
          <div className="flex items-end gap-4">
            {/* Wake Time - Left */}
            <div className="flex-1">
              <TimePicker
                value={wakeTime}
                onChange={handleWakeTimeChange}
              />
            </div>

            {/* Alarm Status - Right */}
            <div className="flex flex-col">
              <div className="flex items-center justify-center gap-3 px-2 md:px-4 py-3 rounded-lg bg-transparent border border-border/50">
                <span className={cn("inline-block w-16 text-lg font-semibold uppercase tracking-wide", isArmed ? 'text-foreground' : 'text-muted/50')}>
                  🔔 {isArmed ? 'On' : 'Off'}
                </span>
                <Switch
                  checked={isArmed}
                  onChange={handleToggleArmed}
                  size="lg"
                  aria-label="Alarm armed"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Repeat Days */}
        <Card padding="lg" className="mb-3">
          <div className="flex flex-col gap-3">
            <h3 className="text-md font-medium text-muted">
              Repeat
            </h3>
            <AlarmScheduleEditor
              schedule={schedule}
              onChange={handleScheduleChange}
            />
          </div>
        </Card>

        {/* Sound */}
        <Card padding="lg" className="mb-3">
          <div className="space-y-4">
            <AlarmSoundSelector
              soundId={soundId}
              volume={volume}
              onSoundChange={handleSoundChange}
              onVolumeChange={handleVolumeChange}
            />
          </div>
        </Card>

        {/* Snooze */}
        <Card padding="lg">
          <div className="space-y-4">
            <AlarmSnoozeSettings
              snoozeMinutes={snoozeMinutes}
              maxSnoozes={maxSnoozes}
              onSnoozeMinutesChange={handleSnoozeChange}
              onMaxSnoozesChange={handleMaxSnoozesChange}
            />
          </div>
        </Card>

      </div>
    </div>
  )
}

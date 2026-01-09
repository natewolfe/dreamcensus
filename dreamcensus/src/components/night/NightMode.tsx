'use client'

import { useState, useCallback } from 'react'
import { AnimatePresence } from 'motion/react'
import { NightWelcome } from './NightWelcome'
import { DayReflection } from './DayReflection'
import { BreathingGuide } from './BreathingGuide'
import { DreamIntention } from './DreamIntention'
import { TomorrowSetup } from './TomorrowSetup'
import { NightComplete } from './NightComplete'
import { LoadingOverlay } from '@/components/ui/LoadingOverlay'
import { useToast } from '@/hooks/use-toast'
import { saveNightCheckIn } from '@/app/(app)/today/actions'
import type {
  NightModeProps,
  NightStep,
  NightCheckInData,
  DayReflectionData,
} from './types'

export function NightMode({
  initialStep = 'welcome',
  onComplete,
  onCancel,
}: NightModeProps) {
  const [step, setStep] = useState<NightStep>(initialStep)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [data, setData] = useState<Partial<NightCheckInData>>({
    date: new Date().toISOString().split('T')[0],
  })
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const updateData = useCallback((updates: Partial<NightCheckInData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }, [])

  const handleStart = () => {
    setDirection('forward')
    setStep('day_reflect')
  }

  const handleReflectionComplete = (reflectionData: DayReflectionData) => {
    updateData({
      mood: reflectionData.mood,
      dayNotes: reflectionData.dayNotes,
    })
    setDirection('forward')
    setStep('breathing')
  }

  const handleBreathingComplete = () => {
    setDirection('forward')
    setStep('intention')
  }

  const handleIntentionComplete = (intention: string) => {
    updateData({ intention })
    setDirection('forward')
    setStep('tomorrow')
  }

  const handleTomorrowComplete = async ({
    wakeTime,
    enableReminder,
    armAlarm,
  }: {
    wakeTime: string
    enableReminder: boolean
    armAlarm: boolean
  }) => {
    updateData({
      plannedWakeTime: wakeTime,
      reminderEnabled: enableReminder,
    })

    // Save to server
    setIsSaving(true)
    try {
      // Save night check-in
      const result = await saveNightCheckIn({
        mood: data.mood,
        dayNotes: data.dayNotes,
        intention: data.intention,
        plannedWakeTime: wakeTime,
        reminderEnabled: enableReminder,
      })
      
      if (!result.success) {
        throw new Error(result.error)
      }

      // Update alarm armed state if changed
      const { setAlarmArmed } = await import('@/app/(app)/settings/alarm/actions')
      await setAlarmArmed(armAlarm)
      
      setStep('complete')
      toast.success('Night check-in saved!')
    } catch (error) {
      console.error('Failed to save night check-in:', error)
      toast.error('Failed to save check-in. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    onComplete()
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <NightWelcome
            key="welcome"
            onBegin={handleStart}
            onNotTonight={onCancel}
          />
        )}

        {step === 'day_reflect' && (
          <DayReflection
            key="day_reflect"
            direction={direction}
            onComplete={handleReflectionComplete}
            onSkip={() => {
              setDirection('forward')
              setStep('breathing')
            }}
            onBack={() => {
              setDirection('back')
              setStep('welcome')
            }}
          />
        )}

        {step === 'breathing' && (
          <BreathingGuide
            key="breathing"
            duration={60}
            onComplete={handleBreathingComplete}
            onSkip={() => {
              setDirection('forward')
              setStep('intention')
            }}
            onBack={() => {
              setDirection('back')
              setStep('day_reflect')
            }}
          />
        )}

        {step === 'intention' && (
          <DreamIntention
            key="intention"
            direction={direction}
            onComplete={handleIntentionComplete}
            onSkip={() => {
              setDirection('forward')
              setStep('tomorrow')
            }}
            onBack={() => {
              setDirection('back')
              setStep('breathing')
            }}
          />
        )}

        {step === 'tomorrow' && (
          <TomorrowSetup
            key="tomorrow"
            direction={direction}
            defaultWakeTime="7:00"
            onComplete={handleTomorrowComplete}
            onSkip={() => handleTomorrowComplete({ wakeTime: '7:00', enableReminder: false, armAlarm: false })}
            onBack={() => {
              setDirection('back')
              setStep('intention')
            }}
          />
        )}

        {step === 'complete' && (
          <NightComplete
            key="complete"
            intention={data.intention}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>

      <LoadingOverlay isVisible={isSaving} message="Saving..." />
    </>
  )
}


'use client'

import { useState, useCallback, useMemo } from 'react'
import { AnimatePresence } from 'motion/react'
import { NightWelcome } from './NightWelcome'
import { DayReflection } from './DayReflection'
import { BreathingGuide } from './BreathingGuide'
import { DreamIntention } from './DreamIntention'
import { TomorrowSetup } from './TomorrowSetup'
import { NightComplete } from './NightComplete'
import { getStepOffset, TOTAL_STEPS } from './stepConfig'
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
  
  // Calculate global step position
  const stepOffset = useMemo(() => getStepOffset(step), [step])

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
  }: {
    wakeTime: string
    enableReminder: boolean
  }) => {
    updateData({
      plannedWakeTime: wakeTime,
      reminderEnabled: enableReminder,
    })

    // Save to server
    setIsSaving(true)
    try {
      // In production, call saveNightCheckIn server action
      await new Promise((resolve) => setTimeout(resolve, 500))
      setStep('complete')
    } catch (error) {
      console.error('Failed to save night check-in:', error)
      // TODO: Show error
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
            globalStep={stepOffset}
            totalSteps={TOTAL_STEPS}
            onBegin={handleStart}
            onNotTonight={onCancel}
          />
        )}

        {step === 'day_reflect' && (
          <DayReflection
            key="day_reflect"
            globalStep={stepOffset}
            totalSteps={TOTAL_STEPS}
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
            globalStep={stepOffset}
            totalSteps={TOTAL_STEPS}
            duration={60}
            onComplete={handleBreathingComplete}
            onSkip={() => {
              setDirection('forward')
              setStep('intention')
            }}
          />
        )}

        {step === 'intention' && (
          <DreamIntention
            key="intention"
            globalStep={stepOffset}
            totalSteps={TOTAL_STEPS}
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
            globalStep={stepOffset}
            totalSteps={TOTAL_STEPS}
            direction={direction}
            defaultWakeTime="7:00"
            onComplete={handleTomorrowComplete}
            onSkip={() => handleTomorrowComplete({ wakeTime: '7:00', enableReminder: false })}
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
            reminderTime={data.plannedWakeTime}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>

      {/* Loading overlay */}
      {isSaving && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="text-4xl mb-4 animate-pulse">✨</div>
            <p className="text-muted">Saving...</p>
          </div>
        </div>
      )}
    </>
  )
}


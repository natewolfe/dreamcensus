'use client'

import { useState, useCallback } from 'react'
import { motion } from 'motion/react'
import { FlowCard } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { TomorrowSetupProps } from './types'

// Internal step types for single-prompt flow
type TomorrowSetupSubStep = 'wakeTime' | 'reminder'

const SUB_STEPS: TomorrowSetupSubStep[] = ['wakeTime', 'reminder']

const WAKE_TIME_PRESETS = [
  { value: '6:00', label: '6:00 AM' },
  { value: '6:30', label: '6:30 AM' },
  { value: '7:00', label: '7:00 AM' },
  { value: '7:30', label: '7:30 AM' },
  { value: '8:00', label: '8:00 AM' },
  { value: '8:30', label: '8:30 AM' },
  { value: '9:00', label: '9:00 AM' },
]

export function TomorrowSetup({
  globalStep,
  totalSteps,
  direction: parentDirection,
  defaultWakeTime = '7:00',
  onComplete,
  onSkip,
  onBack,
}: TomorrowSetupProps) {
  const [subStep, setSubStep] = useState<TomorrowSetupSubStep>('wakeTime')
  const [direction, setDirection] = useState<'forward' | 'back'>(parentDirection || 'forward')
  
  const [wakeTime, setWakeTime] = useState(defaultWakeTime)
  const [enableReminder, setEnableReminder] = useState(true)

  const currentSubIndex = SUB_STEPS.indexOf(subStep)
  const localStep = globalStep + currentSubIndex
  const isLastSubStep = currentSubIndex === SUB_STEPS.length - 1

  const goNext = useCallback(() => {
    if (isLastSubStep) {
      onComplete({ wakeTime, enableReminder })
    } else {
      setDirection('forward')
      setSubStep(SUB_STEPS[currentSubIndex + 1] as TomorrowSetupSubStep)
    }
  }, [isLastSubStep, currentSubIndex, wakeTime, enableReminder, onComplete])

  const goBack = useCallback(() => {
    if (currentSubIndex === 0) {
      onBack()
    } else {
      setDirection('back')
      setSubStep(SUB_STEPS[currentSubIndex - 1] as TomorrowSetupSubStep)
    }
  }, [currentSubIndex, onBack])

  // Render step content
  const renderStep = () => {
    switch (subStep) {
      case 'wakeTime':
        return (
          <div className="w-full max-w-xs space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {WAKE_TIME_PRESETS.map((time) => (
                <motion.button
                  key={time.value}
                  onClick={() => setWakeTime(time.value)}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'rounded-xl px-4 py-3 font-medium transition-all',
                    'border-2',
                    wakeTime === time.value
                      ? 'bg-accent border-accent text-white'
                      : 'border-border bg-subtle/30 text-foreground hover:border-accent/50'
                  )}
                >
                  {time.label}
                </motion.button>
              ))}
            </div>
            
            <div className="text-center pt-2">
              <button
                onClick={() => {
                  const custom = prompt('Enter wake time (HH:MM)', wakeTime)
                  if (custom) setWakeTime(custom)
                }}
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                Custom time...
              </button>
            </div>
          </div>
        )

      case 'reminder':
        return (
          <div className="w-full max-w-sm space-y-4">
            <motion.button
              onClick={() => setEnableReminder(true)}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'w-full rounded-xl p-5 text-left',
                'border-2 transition-all',
                enableReminder
                  ? 'border-accent bg-accent/10'
                  : 'border-border bg-subtle/30 hover:border-accent/50'
              )}
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl">🔔</div>
                <div>
                  <div className="font-medium text-foreground">
                    Remind me at {wakeTime} AM
                  </div>
                  <div className="text-sm text-muted mt-0.5">
                    Gentle nudge to capture your dreams
                  </div>
                </div>
              </div>
            </motion.button>

            <motion.button
              onClick={() => setEnableReminder(false)}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'w-full rounded-xl p-5 text-left',
                'border-2 transition-all',
                !enableReminder
                  ? 'border-accent bg-accent/10'
                  : 'border-border bg-subtle/30 hover:border-accent/50'
              )}
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl">🔕</div>
                <div>
                  <div className="font-medium text-foreground">
                    No reminder
                  </div>
                  <div className="text-sm text-muted mt-0.5">
                    I'll remember on my own
                  </div>
                </div>
              </div>
            </motion.button>
          </div>
        )
    }
  }

  const getTitle = () => {
    switch (subStep) {
      case 'wakeTime':
        return 'When will you wake up?'
      case 'reminder':
        return 'Want a reminder?'
    }
  }

  const getSubtitle = () => {
    switch (subStep) {
      case 'wakeTime':
        return `Wake at ${wakeTime} AM`
      case 'reminder':
        return enableReminder ? 'Reminder enabled' : 'No reminder set'
    }
  }

  const getStepValid = () => {
    switch (subStep) {
      case 'wakeTime':
        return !!wakeTime
      case 'reminder':
        return true // Always valid - user made a choice
    }
  }

  return (
    <FlowCard
      currentStep={localStep}
      totalSteps={totalSteps}
      direction={direction}
      title={getTitle()}
      subtitle={getSubtitle()}
      stepKey={subStep}
      isValid={getStepValid()}
      skipBehavior="optional"
      isLastStep={isLastSubStep}
      onNext={goNext}
      onBack={goBack}
      onSkip={onSkip}
      canGoBack={true}
      canGoForward={true}
    >
      {renderStep()}
    </FlowCard>
  )
}

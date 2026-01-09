'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { FlowCard, Switch, TimePicker } from '@/components/ui'
import { useSubStepFlow } from '@/hooks/use-sub-step-flow'
import { useAlarm } from '@/hooks/use-alarm'
import { cn } from '@/lib/utils'
import type { TomorrowSetupProps } from './types'

const SUB_STEPS = ['wakeTime', 'alarm'] as const

export function TomorrowSetup({
  direction: parentDirection,
  defaultWakeTime = '07:00',
  onComplete,
  onSkip,
  onBack,
}: TomorrowSetupProps) {
  const [wakeTime, setWakeTime] = useState(defaultWakeTime)
  const [enableReminder, setEnableReminder] = useState(true)
  const { isArmed: alarmIsArmed } = useAlarm()
  const [armAlarm, setArmAlarm] = useState(alarmIsArmed)

  const { subStep, direction, isLastSubStep, goNext, goBack } = useSubStepFlow({
    steps: SUB_STEPS,
    parentDirection,
    onComplete: () => onComplete({ wakeTime, enableReminder, armAlarm }),
    onBack,
  })

  // Render step content
  const renderStep = () => {
    switch (subStep) {
      case 'wakeTime':
        return (
          <TimePicker
            value={wakeTime}
            onChange={setWakeTime}
          />
        )

      case 'alarm':
        return (
          <div className="w-full max-w-sm">
            {/* Alarm toggle */}
            <div className="rounded-xl border-2 border-border bg-card-bg p-5 mb-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">
                    {armAlarm ? '🔔' : '🔕'}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
                      {armAlarm ? 'Your alarm' : 'Your alarm'}
                    </div>
                    <div className="text-sm text-muted mt-0.5">
                      {armAlarm ? `Set for ${wakeTime} AM` : 'Not set'}
                    </div>
                  </div>
                </div>
                <Switch
                  checked={armAlarm}
                  onChange={setArmAlarm}
                  size="lg"
                />
              </div>
            </div>

            {/* Optional reminder */}
            <div className="pt-2">
              <motion.button
                onClick={() => setEnableReminder(!enableReminder)}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'w-full rounded-xl p-4 text-left',
                  'border-2 transition-all',
                  armAlarm ? 'opacity-100' : 'opacity-50 cursor-not-allowed pointer-events-none',
                  enableReminder
                    ? 'border-accent/50 bg-accent/5'
                    : 'border-border bg-subtle/10 hover:border-accent/30'
                )}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={enableReminder}
                    onChange={(e) => {
                      e.stopPropagation()
                      setEnableReminder(e.target.checked)
                    }}
                    className="w-5 h-5"
                  />
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      Browser reminder
                    </div>
                    <div className="text-xs text-muted mt-0.5">
                      Backup notification if alarm doesn't ring
                    </div>
                  </div>
                </div>
              </motion.button>
            </div>
          </div>
        )
    }
  }

  const getTitle = () => {
    switch (subStep) {
      case 'wakeTime':
        return 'When do you want to wake up?'
      case 'alarm':
        return 'Want to set an alarm?'
    }
  }

  const getSubtitle = () => {
    return undefined
  }

  const getStepValid = () => {
    switch (subStep) {
      case 'wakeTime':
        return false // Show "Skip" - step is optional
      case 'alarm':
        return true // Always valid - user made a choice
    }
  }

  // Handle skip for each sub-step
  const handleSkip = () => {
    if (subStep === 'wakeTime') {
      // Skip to alarm step with default time
      goNext()
    } else {
      // Skip entire tomorrow setup
      onSkip()
    }
  }

  return (
    <FlowCard
      direction={direction}
      title={getTitle()}
      subtitle={getSubtitle()}
      stepKey={subStep}
      isValid={getStepValid()}
      skipBehavior="optional"
      isLastStep={isLastSubStep}
      onNext={goNext}
      onBack={goBack}
      onSkip={handleSkip}
      canGoBack={true}
      canGoForward={true}
    >
      {renderStep()}
    </FlowCard>
  )
}

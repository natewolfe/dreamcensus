'use client'

import { useState } from 'react'
import { FlowCard } from '@/components/ui'
import { useSubStepFlow } from '@/hooks/use-sub-step-flow'
import { useDebouncedCommit } from '@/hooks/use-debounced-commit'
import { VividnessSlider } from './VividnessSlider'
import { LucidityToggle } from './LucidityToggle'
import type { MicroStructureProps, MicroStructureData } from './types'

const SUB_STEPS = ['vividness', 'lucidity'] as const

export function MicroStructure({
  globalStep,
  totalSteps,
  direction: parentDirection,
  initialData,
  onComplete,
  onBack,
}: MicroStructureProps) {
  const [vividness, setVividness] = useState(initialData?.vividness ?? 50)
  const [lucidity, setLucidity] = useState<'no' | 'maybe' | 'yes' | null>(
    initialData?.lucidity ?? null
  )

  const { subStep, direction, localStep, goNext, goBack } = useSubStepFlow({
    steps: SUB_STEPS,
    globalStep,
    parentDirection,
    onComplete: () => onComplete({ vividness, lucidity }),
    onBack,
  })
  
  // Track if user is returning and hasn't changed their selection
  // Only disable auto-advance when returning with unchanged answer
  const isLucidityUnchanged = initialData?.lucidity !== null && initialData?.lucidity !== undefined && lucidity === initialData.lucidity
  
  const { scheduleCommit: commitLucidity } = useDebouncedCommit({
    onCommit: goNext,
    disabled: isLucidityUnchanged || subStep !== 'lucidity',
  })

  // Render step content
  const renderStep = () => {
    switch (subStep) {
      case 'vividness':
        return (
          <div className="w-full max-w-sm">
            <VividnessSlider
              value={vividness}
              onChange={setVividness}
            />
          </div>
        )

      case 'lucidity':
        return (
          <div className="flex justify-center">
            <LucidityToggle
              value={lucidity}
              onChange={setLucidity}
              onCommit={commitLucidity}
            />
          </div>
        )
    }
  }

  const getTitle = () => {
    switch (subStep) {
      case 'vividness':
        return 'How vivid was it?'
      case 'lucidity':
        return 'Were you aware it was a dream?'
    }
  }

  const getSubtitle = () => {
    switch (subStep) {
      case 'vividness':
        return 'Slide to indicate clarity'
      case 'lucidity':
        return undefined
    }
  }

  const getStepValid = () => {
    switch (subStep) {
      case 'vividness':
        return true // Slider always has a value
      case 'lucidity':
        return lucidity !== null
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
      isLastStep={false}
      onNext={goNext}
      onBack={goBack}
      canGoBack={true}
      canGoForward={true}
    >
      {renderStep()}
    </FlowCard>
  )
}

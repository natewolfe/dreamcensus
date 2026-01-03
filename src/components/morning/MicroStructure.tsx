'use client'

import { useState, useCallback } from 'react'
import { FlowCard } from '@/components/ui'
import { PoolSelector } from '@/components/ui'
import { CORE_EMOTIONS, EXPANDED_EMOTIONS } from './types'
import { VividnessSlider } from './VividnessSlider'
import { LucidityToggle } from './LucidityToggle'
import type { MicroStructureProps, MicroStructureData } from './types'

// Internal step types for single-prompt flow
type MicroStructureSubStep = 'emotions' | 'vividness' | 'lucidity'

const SUB_STEPS: MicroStructureSubStep[] = ['emotions', 'vividness', 'lucidity']

export function MicroStructure({
  globalStep,
  totalSteps,
  direction: parentDirection,
  initialData,
  onComplete,
  onBack,
}: MicroStructureProps) {
  const [subStep, setSubStep] = useState<MicroStructureSubStep>('emotions')
  const [direction, setDirection] = useState<'forward' | 'back'>(parentDirection || 'forward')
  
  const [emotions, setEmotions] = useState<string[]>(initialData?.emotions ?? [])
  const [vividness, setVividness] = useState(initialData?.vividness ?? 50)
  const [lucidity, setLucidity] = useState<'no' | 'maybe' | 'yes' | null>(
    initialData?.lucidity ?? null
  )

  const currentSubIndex = SUB_STEPS.indexOf(subStep)
  const localStep = globalStep + currentSubIndex
  const isLastSubStep = currentSubIndex === SUB_STEPS.length - 1

  const getData = useCallback((): MicroStructureData => ({
    emotions,
    vividness,
    lucidity,
  }), [emotions, vividness, lucidity])

  const goNext = useCallback(() => {
    if (isLastSubStep) {
      onComplete(getData())
    } else {
      setDirection('forward')
      setSubStep(SUB_STEPS[currentSubIndex + 1] as MicroStructureSubStep)
    }
  }, [isLastSubStep, currentSubIndex, getData, onComplete])

  const goBack = useCallback(() => {
    if (currentSubIndex === 0) {
      onBack()
    } else {
      setDirection('back')
      setSubStep(SUB_STEPS[currentSubIndex - 1] as MicroStructureSubStep)
    }
  }, [currentSubIndex, onBack])

  // Render step content
  const renderStep = () => {
    switch (subStep) {
      case 'emotions':
        return (
          <div className="w-full">
            <PoolSelector
              options={[...CORE_EMOTIONS, ...EXPANDED_EMOTIONS]}
              selected={emotions}
              onChange={setEmotions}
              max={5}
              size="md"
            />
          </div>
        )

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
            />
          </div>
        )
    }
  }

  const getTitle = () => {
    switch (subStep) {
      case 'emotions':
        return 'How did this dream feel?'
      case 'vividness':
        return 'How vivid was it?'
      case 'lucidity':
        return 'Were you aware it was a dream?'
    }
  }

  const getSubtitle = () => {
    switch (subStep) {
      case 'emotions':
        return emotions.length > 0 
          ? `${emotions.length} of 5 selected`
          : 'Select the strongest emotions'
      case 'vividness':
        return 'Slide to indicate clarity'
      case 'lucidity':
        return undefined
    }
  }

  const getStepValid = () => {
    switch (subStep) {
      case 'emotions':
        return emotions.length > 0
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

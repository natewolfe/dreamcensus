'use client'

import { useState, useCallback } from 'react'
import { FlowCard } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { CloseRitualProps } from './types'

// Internal step types for single-prompt flow
type CloseRitualSubStep = 'title' | 'wakingLife'

const SUB_STEPS: CloseRitualSubStep[] = ['title', 'wakingLife']

export function CloseRitual({
  globalStep,
  totalSteps,
  direction: parentDirection,
  suggestedTitle,
  onComplete,
  onSkip,
  onBack,
}: CloseRitualProps) {
  const [subStep, setSubStep] = useState<CloseRitualSubStep>('title')
  const [direction, setDirection] = useState<'forward' | 'back'>(parentDirection || 'forward')
  
  const [title, setTitle] = useState(suggestedTitle ?? '')
  const [wakingLife, setWakingLife] = useState('')

  const currentSubIndex = SUB_STEPS.indexOf(subStep)
  const localStep = globalStep + currentSubIndex
  const isLastSubStep = currentSubIndex === SUB_STEPS.length - 1

  const goNext = useCallback(() => {
    if (isLastSubStep) {
      onComplete({
        title: title.trim() || undefined,
        wakingLife: wakingLife.trim() || undefined,
      })
    } else {
      setDirection('forward')
      setSubStep(SUB_STEPS[currentSubIndex + 1] as CloseRitualSubStep)
    }
  }, [isLastSubStep, currentSubIndex, title, wakingLife, onComplete])

  const goBack = useCallback(() => {
    if (currentSubIndex === 0) {
      onBack()
    } else {
      setDirection('back')
      setSubStep(SUB_STEPS[currentSubIndex - 1] as CloseRitualSubStep)
    }
  }, [currentSubIndex, onBack])

  // Render step content
  const renderStep = () => {
    switch (subStep) {
      case 'title':
        return (
          <div className="w-full max-w-sm">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="The Endless Hallway..."
              autoFocus
              className={cn(
                'w-full rounded-xl px-4 py-3',
                'bg-subtle/30 border border-border text-foreground text-center',
                'placeholder:text-subtle',
                'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent',
                'transition-colors'
              )}
            />
          </div>
        )

      case 'wakingLife':
        return (
          <div className="w-full max-w-sm">
            <textarea
              value={wakingLife}
              onChange={(e) => setWakingLife(e.target.value)}
              placeholder="Been thinking about visiting grandma..."
              rows={4}
              autoFocus
              className={cn(
                'w-full rounded-xl px-4 py-3 resize-none',
                'bg-subtle/30 border border-border text-foreground',
                'placeholder:text-subtle',
                'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent',
                'transition-colors'
              )}
            />
          </div>
        )
    }
  }

  const getTitle = () => {
    switch (subStep) {
      case 'title':
        return 'If this dream had a title...'
      case 'wakingLife':
        return 'Anything from waking life connected?'
    }
  }

  const getSubtitle = () => {
    switch (subStep) {
      case 'title':
        return 'Give your dream a name'
      case 'wakingLife':
        return 'Optional reflection'
    }
  }

  const getStepValid = () => {
    switch (subStep) {
      case 'title':
        return title.trim().length > 0
      case 'wakingLife':
        return wakingLife.trim().length > 0
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

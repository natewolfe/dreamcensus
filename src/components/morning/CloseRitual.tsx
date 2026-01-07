'use client'

import { useState } from 'react'
import { FlowCard } from '@/components/ui'
import { useSubStepFlow } from '@/hooks/use-sub-step-flow'
import { cn } from '@/lib/utils'
import type { CloseRitualProps } from './types'

const SUB_STEPS = ['title', 'wakingLife'] as const

export function CloseRitual({
  globalStep,
  totalSteps,
  direction: parentDirection,
  suggestedTitle,
  onComplete,
  onSkip,
  onBack,
}: CloseRitualProps) {
  const [title, setTitle] = useState(suggestedTitle ?? '')
  const [wakingLife, setWakingLife] = useState('')

  const { subStep, direction, localStep, isLastSubStep, goNext, goBack } = useSubStepFlow({
    steps: SUB_STEPS,
    globalStep,
    parentDirection,
    onComplete: () => onComplete({
      title: title.trim() || undefined,
      wakingLife: wakingLife.trim() || undefined,
    }),
    onBack,
  })

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

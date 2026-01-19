'use client'

import { useState } from 'react'
import { FlowCard, PoolSelector, EmojiCard } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useSubStepFlow } from '@/hooks/use-sub-step-flow'
import { useDebouncedCommit } from '@/hooks/use-debounced-commit'
import type { QuickFactsProps, RecallLevel } from './types'
import { CORE_EMOTIONS } from './types'

const RECALL_LEVELS: { value: RecallLevel; label: string; description: string }[] = [
  { value: 'nothing', label: 'Nothing', description: 'No memory at all' },
  { value: 'fragments', label: 'Fragments', description: 'Brief flashes' },
  { value: 'scene', label: 'A scene', description: 'Partial story' },
  { value: 'full', label: 'Full story', description: 'Complete narrative' },
]

const SUB_STEPS = ['recall', 'emotions', 'flags'] as const

export function QuickFacts({ 
  globalStep,
  totalSteps,
  direction: parentDirection,
  initialData, 
  onComplete, 
  onSkip, 
  onBack 
}: QuickFactsProps) {
  const [recallLevel, setRecallLevel] = useState<RecallLevel | undefined>(
    initialData?.recallLevel
  )
  const [emotions, setEmotions] = useState<string[]>(initialData?.emotions ?? [])
  const [isLucid, setIsLucid] = useState(initialData?.isLucid ?? false)
  const [isNightmare, setIsNightmare] = useState(initialData?.isNightmare ?? false)
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring ?? false)

  const { subStep, direction, localStep, goNext, goBack } = useSubStepFlow({
    steps: SUB_STEPS,
    globalStep,
    parentDirection,
    onComplete: () => onComplete({
      recallLevel: recallLevel!,  // Will be validated before reaching here
      emotions,
      isLucid,
      isNightmare,
      isRecurring,
    }),
    onBack,
  })
  
  // Track if user is returning and hasn't changed their selection
  // Only disable auto-advance when returning with unchanged answer
  const isRecallUnchanged = initialData?.recallLevel !== undefined && recallLevel === initialData.recallLevel
  
  const { scheduleCommit: commitRecall } = useDebouncedCommit({
    onCommit: goNext,
    disabled: isRecallUnchanged || subStep !== 'recall',
  })

  // Render step content
  const renderStep = () => {
    switch (subStep) {
      case 'recall':
        return (
          <div className="w-full max-w-sm space-y-3">
            {RECALL_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => {
                  setRecallLevel(level.value)
                  commitRecall()
                }}
                className={cn(
                  'w-full rounded-xl px-5 py-4 text-center transition-all',
                  'border',
                  recallLevel === level.value
                    ? 'bg-muted/20 border-2 border-muted text-foreground'
                    : 'bg-card-bg border border-border text-muted hover:border-accent/50 hover:text-foreground'
                )}
              >
                <div className="font-medium text-foreground">{level.label}</div>
                <div className="text-sm text-muted mt-0.5">{level.description}</div>
              </button>
            ))}
          </div>
        )

      case 'emotions':
        return (
          <div className="w-full">
            <PoolSelector
              options={[...CORE_EMOTIONS]}
              selected={emotions}
              onChange={setEmotions}
              max={5}
              size="md"
            />
          </div>
        )

      case 'flags':
        return (
          <div className="flex flex-wrap justify-center gap-3">
            <EmojiCard
              emoji="✨"
              label="Lucid"
              description="Knew it was a dream"
              selected={isLucid}
              onChange={setIsLucid}
            />
            <EmojiCard
              emoji="😰"
              label="Nightmare"
              description="Distressing content"
              selected={isNightmare}
              onChange={setIsNightmare}
            />
            <EmojiCard
              emoji="🔄"
              label="Recurring"
              description="Had this before"
              selected={isRecurring}
              onChange={setIsRecurring}
            />
          </div>
        )
    }
  }

  const getTitle = () => {
    switch (subStep) {
      case 'recall':
        return 'How much do you remember?'
      case 'emotions':
        return 'How did it feel?'
      case 'flags':
        return 'Any of these apply?'
    }
  }

  const getSubtitle = () => {
    switch (subStep) {
      case 'recall':
        return undefined
      case 'emotions':
        return emotions.length > 0
          ? `${emotions.length} of 5 selected`
          : 'Select up to 5 emotions'
      case 'flags':
        return 'Tap any that match'
    }
  }

  const getStepValid = () => {
    switch (subStep) {
      case 'recall':
        return !!recallLevel
      case 'emotions':
        return emotions.length > 0
      case 'flags':
        return isLucid || isNightmare || isRecurring
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
      onSkip={subStep !== 'flags' ? onSkip : undefined}
      canGoBack={true}
      canGoForward={true}
    >
      {renderStep()}
    </FlowCard>
  )
}


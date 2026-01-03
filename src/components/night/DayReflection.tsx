'use client'

import { useState, useCallback } from 'react'
import { FlowCard, EmojiCardGroup } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { DayReflectionProps, MoodType } from './types'

// Internal step types for single-prompt flow
type DayReflectionSubStep = 'mood' | 'notes'

const SUB_STEPS: DayReflectionSubStep[] = ['mood', 'notes']

const MOODS = [
  { value: 'rough', emoji: '😔', label: 'rough' },
  { value: 'okay', emoji: '😐', label: 'okay' },
  { value: 'good', emoji: '🙂', label: 'good' },
  { value: 'great', emoji: '😊', label: 'great' },
  { value: 'amazing', emoji: '✨', label: 'amazing' },
] as const

export function DayReflection({ 
  globalStep,
  totalSteps,
  direction: parentDirection,
  onComplete, 
  onSkip,
  onBack
}: DayReflectionProps) {
  const [subStep, setSubStep] = useState<DayReflectionSubStep>('mood')
  const [direction, setDirection] = useState<'forward' | 'back'>(parentDirection || 'forward')
  
  const [mood, setMood] = useState<MoodType | null>(null)
  const [notes, setNotes] = useState('')

  const currentSubIndex = SUB_STEPS.indexOf(subStep)
  const localStep = globalStep + currentSubIndex
  const isLastSubStep = currentSubIndex === SUB_STEPS.length - 1

  const goNext = useCallback(() => {
    if (isLastSubStep) {
      if (mood) {
        onComplete({
          mood,
          dayNotes: notes.trim() || undefined,
        })
      }
    } else {
      setDirection('forward')
      setSubStep(SUB_STEPS[currentSubIndex + 1] as DayReflectionSubStep)
    }
  }, [isLastSubStep, currentSubIndex, mood, notes, onComplete])

  const goBack = useCallback(() => {
    if (currentSubIndex === 0) {
      onBack()
    } else {
      setDirection('back')
      setSubStep(SUB_STEPS[currentSubIndex - 1] as DayReflectionSubStep)
    }
  }, [currentSubIndex, onBack])

  // Render step content
  const renderStep = () => {
    switch (subStep) {
      case 'mood':
        return (
          <EmojiCardGroup
            options={MOODS.map(m => ({ ...m }))}
            value={mood}
            onChange={(v) => setMood(v as MoodType | null)}
            size="sm"
          />
        )

      case 'notes':
        return (
          <div className="w-full max-w-sm">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What's on your mind? (optional)"
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
      case 'mood':
        return 'How was today?'
      case 'notes':
        return 'Anything on your mind?'
    }
  }

  const getSubtitle = () => {
    switch (subStep) {
      case 'mood':
        return mood ? `Feeling ${mood}` : 'Tap to select'
      case 'notes':
        return 'Optional reflection'
    }
  }

  const getStepValid = () => {
    switch (subStep) {
      case 'mood':
        return !!mood
      case 'notes':
        return notes.trim().length > 0
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
      onSkip={onSkip}
      canGoBack={true}
      canGoForward={true}
    >
      {renderStep()}
    </FlowCard>
  )
}

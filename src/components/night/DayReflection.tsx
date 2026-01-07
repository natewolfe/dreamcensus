'use client'

import { useState } from 'react'
import { FlowCard, EmojiCardGroup } from '@/components/ui'
import { useSubStepFlow } from '@/hooks/use-sub-step-flow'
import { useDebouncedCommit } from '@/hooks/use-debounced-commit'
import { cn } from '@/lib/utils'
import type { DayReflectionProps, MoodType } from './types'

const SUB_STEPS = ['mood', 'notes'] as const

const MOODS = [
  { value: 'rough', emoji: '😔', label: 'rough' },
  { value: 'okay', emoji: '😐', label: 'okay' },
  { value: 'good', emoji: '🙂', label: 'good' },
  { value: 'great', emoji: '😊', label: 'great' },
  { value: 'amazing', emoji: '✨', label: 'amazing' },
] as const

export function DayReflection({ 
  direction: parentDirection,
  onComplete, 
  onSkip,
  onBack
}: DayReflectionProps) {
  const [mood, setMood] = useState<MoodType | null>(null)
  const [notes, setNotes] = useState('')

  const { subStep, direction, goNext, goBack } = useSubStepFlow({
    steps: SUB_STEPS,
    parentDirection,
    onComplete: () => {
      if (mood) {
        onComplete({
          mood,
          dayNotes: notes.trim() || undefined,
        })
      }
    },
    onBack,
  })
  
  // Track if mood was already set (user went back)
  const isMoodAnswered = mood !== null
  
  const { scheduleCommit: commitMood } = useDebouncedCommit({
    onCommit: goNext,
    disabled: isMoodAnswered || subStep !== 'mood',
  })

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
            onCommit={commitMood}
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

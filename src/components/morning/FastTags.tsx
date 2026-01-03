'use client'

import { useState } from 'react'
import { FlowCard, PoolSelector } from '@/components/ui'
import type { FastTagsProps } from './types'

export function FastTags({
  globalStep,
  totalSteps,
  direction = 'forward',
  suggestions,
  userLexicon,
  selectedTags,
  onComplete,
  onSkip,
  onBack,
}: FastTagsProps) {
  const [tags, setTags] = useState<string[]>(selectedTags)

  // Combine suggestions and user lexicon, remove duplicates
  const allOptions = [...new Set([...suggestions, ...userLexicon])]

  return (
    <FlowCard
      currentStep={globalStep}
      totalSteps={totalSteps}
      direction={direction}
      title="Add tags to find this dream later"
      subtitle={tags.length > 0 ? `${tags.length} tag${tags.length !== 1 ? 's' : ''} selected` : 'Select or create tags'}
      stepKey="tags"
      isValid={tags.length > 0}
      skipBehavior="optional"
      isLastStep={false}
      onNext={() => onComplete(tags)}
      onBack={onBack}
      onSkip={onSkip}
      canGoBack={true}
      canGoForward={true}
    >
      <div className="w-full">
        <PoolSelector
          options={allOptions}
          selected={tags}
          onChange={setTags}
          allowCustom={true}
          customPlaceholder="Add tag..."
          size="md"
        />
      </div>
    </FlowCard>
  )
}

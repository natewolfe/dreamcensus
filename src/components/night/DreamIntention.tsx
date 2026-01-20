'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { FlowCard } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { DreamIntentionProps } from './types'

const DEFAULT_SUGGESTIONS = [
  'A peaceful place',
  'Someone I miss',
  'Flying',
  'Solving a problem',
  'An imaginary world',
  'Feeling calm',
]

export function DreamIntention({
  direction,
  suggestions = DEFAULT_SUGGESTIONS,
  previousIntentions = [],
  onComplete,
  onSkip,
  onBack,
}: DreamIntentionProps) {
  const [intention, setIntention] = useState('')

  const handleSuggestionClick = (suggestion: string) => {
    setIntention(suggestion)
  }

  const handleContinue = () => {
    const trimmed = intention.trim()
    if (trimmed) {
      onComplete(trimmed)
    } else {
      onSkip()
    }
  }

  return (
    <FlowCard
      direction={direction || 'forward'}
      title="Set an intention for tonight"
      subtitle="What would you like to dream about?"
      stepKey="intention"
      isValid={!!intention.trim()}
      skipBehavior="optional"
      isLastStep={false}
      onNext={handleContinue}
      onBack={onBack}
      onSkip={onSkip}
      canGoBack={true}
      canGoForward={true}
    >
      <div className="w-full max-w-sm space-y-5">
        {/* Input */}
        <textarea
          value={intention}
          onChange={(e) => setIntention(e.target.value)}
          placeholder="I want to experience..."
          rows={3}
          autoFocus
          className={cn(
            'w-full rounded-xl px-4 py-3 resize-none',
            'bg-subtle/30 border border-border text-foreground',
            'placeholder:text-subtle',
            'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent',
            'transition-colors'
          )}
        />

        {/* Suggestions */}
        <div>
          <p className="text-sm text-muted mb-2">Suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <motion.button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm',
                  'border border-border bg-subtle/30 text-muted',
                  'hover:border-accent/50 hover:text-foreground transition-all',
                  intention === suggestion && 'border-muted text-muted'
                )}
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Previous intentions */}
        {previousIntentions.length > 0 && (
          <div>
            <p className="text-sm text-muted mb-2">Recent:</p>
            <div className="flex flex-wrap gap-2">
              {previousIntentions.slice(0, 3).map((prev, i) => (
                <button
                  key={i}
                  onClick={() => setIntention(prev)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-sm',
                    'bg-accent/10 border border-accent/30 text-accent',
                    'hover:bg-accent/20 transition-all'
                  )}
                >
                  {prev}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </FlowCard>
  )
}

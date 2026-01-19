'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { BinaryButtons, TextArea } from '@/components/ui'
import type { BinaryValue } from '@/lib/flow/types'
import type { PromptQuestion } from './usePromptState'

interface PromptDetailProps {
  question: PromptQuestion
  onSubmit: (response: BinaryValue, expandedText?: string) => void
  onSkip: () => void
  onBack: () => void
}

export function PromptDetail({
  question,
  onSubmit,
  onSkip,
  onBack,
}: PromptDetailProps) {
  const [expandedText, setExpandedText] = useState('')

  const handleResponse = (response: BinaryValue) => {
    onSubmit(response, expandedText.trim() || undefined)
  }

  return (
    <div className="min-h-screen flex flex-col max-w-3xl mx-auto justify-center">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted hover:text-foreground transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          onClick={onSkip}
          className="text-muted hover:text-foreground transition-colors opacity-50 hover:opacity-100"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto h-full flex items-center justify-center">
        <div className="container mx-auto max-w-2xl px-4 py-6 pt-0 space-y-4">
          {/* Question Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card-bg rounded-2xl border border-border p-8 pt-5"
          >
            {/* Category */}
            <div className="text-xs font-medium text-accent uppercase tracking-widest mb-4">
              {question.category}
            </div>

            {/* Question */}
            <h2 className="text-2xl md:text-3xl font-medium leading-relaxed">
              {question.text}
            </h2>
          </motion.div>

          {/* Optional Text Response */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <label className="block">
              <span className="text-sm text-muted mb-2 block">
              </span>
              <TextArea
                value={expandedText}
                onChange={setExpandedText}
                placeholder="Share details... (Optional)"
                maxLength={2000}
                rows={6}
                autoFocus
              />
            </label>
          </motion.div>

          {/* Response Buttons - selecting auto-submits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <BinaryButtons
              variant={question.variant}
              value={null}
              onChange={handleResponse}
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
}


'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { BinaryButtons, TextArea, type BinaryValue } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { PromptQuestion } from './usePromptState'

interface PromptDetailProps {
  question: PromptQuestion
  onSubmit: (response: BinaryValue, expandedText?: string) => void
  onBack: () => void
}

export function PromptDetail({
  question,
  onSubmit,
  onBack,
}: PromptDetailProps) {
  const [expandedText, setExpandedText] = useState('')
  const [selectedResponse, setSelectedResponse] = useState<BinaryValue | null>(null)

  const handleSubmit = () => {
    if (selectedResponse) {
      onSubmit(selectedResponse, expandedText.trim() || undefined)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted hover:text-foreground transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-2xl px-4 py-8 space-y-8">
          {/* Question Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card-bg rounded-2xl border border-border p-8"
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
                Want to share more? <span className="text-subtle">(Optional)</span>
              </span>
              <TextArea
                value={expandedText}
                onChange={setExpandedText}
                placeholder="Share your experience..."
                maxLength={2000}
                rows={6}
              />
            </label>
          </motion.div>

          {/* Response Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <BinaryButtons
              variant={question.variant}
              value={selectedResponse}
              onChange={setSelectedResponse}
            />
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={handleSubmit}
              disabled={!selectedResponse}
              className={cn(
                'w-full rounded-xl px-6 py-4 text-lg font-medium transition-all',
                'border-2 focus:outline-none focus:ring-2 focus:ring-offset-2',
                selectedResponse
                  ? 'bg-accent border-accent text-white hover:bg-accent/90'
                  : 'bg-subtle border-border text-muted cursor-not-allowed'
              )}
            >
              Submit →
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}


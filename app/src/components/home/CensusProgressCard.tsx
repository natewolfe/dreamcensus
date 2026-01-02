'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { Card, Button } from '@/components/ui'

interface CensusProgressCardProps {
  progress: {
    percentage: number
    answered: number
    total: number
    isComplete: boolean
  }
  nextTheme?: {
    slug: string
    name: string
    questionsRemaining: number
  }
}

export function CensusProgressCard({ progress, nextTheme }: CensusProgressCardProps) {
  return (
    <Card variant="elevated">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium mb-1">Your Census Progress</h3>
          <p className="text-sm text-[var(--foreground-muted)]">
            {progress.answered} of {progress.total} questions answered
          </p>
        </div>
        <div className="text-2xl font-bold text-[var(--accent)]">
          {progress.percentage.toFixed(0)}%
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar mb-4">
        <motion.div
          className="progress-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress.percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>

      {/* Next theme info */}
      {nextTheme && !progress.isComplete && (
        <div className="mb-4 p-3 bg-[var(--background-subtle)] rounded-lg">
          <div className="text-xs text-[var(--foreground-muted)] mb-1">
            Continue with:
          </div>
          <div className="font-medium">{nextTheme.name}</div>
          <div className="text-xs text-[var(--foreground-subtle)]">
            {nextTheme.questionsRemaining} questions remaining
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/census/cards" className="flex-1">
          <Button variant="primary" fullWidth>
            {progress.isComplete ? 'Review Answers' : 'Continue Cards'}
          </Button>
        </Link>
        <Link href="/census/map" className="flex-1">
          <Button variant="secondary" fullWidth>
            View Census Map
          </Button>
        </Link>
      </div>
    </Card>
  )
}


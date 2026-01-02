'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { Button, Card, Icon } from '@/components/ui'

interface ThemeProgress {
  id: string
  slug: string
  name: string
  description: string | null
  icon: string | null
  estimatedMinutes: number
  totalQuestions: number
  answeredQuestions: number
  percentage: number
  isComplete: boolean
  isLocked: boolean
  prerequisite?: {
    id: string
    slug: string
    name: string
  } | null
}

interface CensusMapProps {
  themes: ThemeProgress[]
  overallProgress: {
    total: number
    answered: number
    percentage: number
  }
}

export function CensusMap({ themes, overallProgress }: CensusMapProps) {
  const completedThemes = themes.filter(t => t.isComplete).length
  const estimatedTimeRemaining = themes
    .filter(t => !t.isComplete)
    .reduce((sum, t) => sum + t.estimatedMinutes, 0)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      {/* Overall Progress Card */}
      <Card className="mb-8" variant="elevated">
        <div className="text-center">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-2xl font-medium mb-2">
            {overallProgress.percentage}% Complete
          </h2>
          <p className="text-[var(--foreground-muted)] mb-4">
            {overallProgress.answered} of {overallProgress.total} questions answered
          </p>
          
          {/* Progress bar */}
          <div className="progress-bar mb-4">
            <motion.div
              className="progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress.percentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-[var(--foreground-muted)]">
            <div>
              <span className="font-medium text-[var(--accent)]">{completedThemes}</span> themes complete
            </div>
            <div>
              ~<span className="font-medium text-[var(--accent)]">{estimatedTimeRemaining}</span> min remaining
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-8">
        <Link href="/census/cards" className="flex-1">
          <Button variant="primary" fullWidth size="lg">
            Resume
            <Icon name="chevron-right" className="ml-2" />
          </Button>
        </Link>
      </div>

      {/* Themes Grid */}
      <div className="space-y-4">
        {themes.map((theme, index) => (
          <motion.div
            key={theme.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ThemeCard theme={theme} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function ThemeCard({ theme }: { theme: ThemeProgress }) {
  const statusColor = theme.isComplete 
    ? 'var(--success)' 
    : theme.isLocked 
    ? 'var(--foreground-muted)' 
    : 'var(--accent)'

  return (
    <Card
      variant="flat"
      padding="none"
      className={`overflow-hidden transition-all ${
        theme.isLocked 
          ? 'opacity-60' 
          : 'hover:border-[var(--accent)] cursor-pointer'
      }`}
    >
      <div className="flex items-center gap-4 p-6">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div 
            className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
            style={{
              backgroundColor: `${statusColor}15`,
              color: statusColor,
            }}
          >
            {theme.icon || '📋'}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-medium mb-1">
                {theme.name}
              </h3>
              {theme.description && (
                <p className="text-sm text-[var(--foreground-muted)] line-clamp-2">
                  {theme.description}
                </p>
              )}
            </div>
            
            {/* Status indicator */}
            <div className="flex-shrink-0">
              {theme.isComplete ? (
                <div className="w-8 h-8 rounded-full bg-[var(--success)] flex items-center justify-center">
                  <Icon name="check" size={20} className="text-white" />
                </div>
              ) : theme.isLocked ? (
                <div className="w-8 h-8 rounded-full bg-[var(--foreground-muted)]/20 flex items-center justify-center">
                  <Icon name="lock" size={20} className="text-[var(--foreground-muted)]" />
                </div>
              ) : (
                <div 
                  className="text-lg font-bold"
                  style={{ color: statusColor }}
                >
                  {theme.percentage}%
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          {!theme.isLocked && (
            <div className="progress-bar mb-3">
              <div
                className="progress-bar-fill"
                style={{ width: `${theme.percentage}%` }}
              />
            </div>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-4 text-xs text-[var(--foreground-muted)]">
            <span>{theme.totalQuestions} questions</span>
            <span>~{theme.estimatedMinutes} min</span>
            {theme.answeredQuestions > 0 && !theme.isComplete && (
              <span className="text-[var(--accent)]">
                {theme.answeredQuestions} answered
              </span>
            )}
          </div>

          {/* Locked message */}
          {theme.isLocked && theme.prerequisite && (
            <div className="mt-3 text-xs text-[var(--foreground-subtle)] italic">
              Complete "{theme.prerequisite.name}" to unlock
            </div>
          )}
        </div>

        {/* Actions */}
        {!theme.isLocked && (
          <div className="flex-shrink-0">
            {theme.isComplete ? (
              <Link href={`/census/cards?theme=${theme.slug}`}>
                <Button variant="ghost" size="sm">
                  Review
                </Button>
              </Link>
            ) : theme.answeredQuestions > 0 ? (
              <Link href={`/census/cards?theme=${theme.slug}`}>
                <Button variant="primary" size="sm">
                  Continue
                </Button>
              </Link>
            ) : (
              <Link href={`/census/cards?theme=${theme.slug}`}>
                <Button variant="secondary" size="sm">
                  Start
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}


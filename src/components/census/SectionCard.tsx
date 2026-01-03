'use client'

import { motion } from 'motion/react'
import { Card } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { SectionCardProps } from './types'

export function SectionCard({
  section,
  progress,
  isLocked = false,
  onClick,
}: SectionCardProps) {
  const completionPercentage = progress.totalQuestions > 0
    ? Math.round((progress.answeredQuestions / progress.totalQuestions) * 100)
    : 0
  
  const isComplete = progress.completedAt !== undefined
  const estimatedRemaining = section.estimatedMinutes
    ? Math.ceil(
        (section.estimatedMinutes * (progress.totalQuestions - progress.answeredQuestions)) / progress.totalQuestions
      )
    : undefined

  return (
    <motion.div
      whileHover={!isLocked ? { scale: 1.01 } : undefined}
      whileTap={!isLocked ? { scale: 0.99 } : undefined}
    >
      <Card
        variant={isLocked ? 'outlined' : 'interactive'}
        padding="lg"
        as={isLocked ? 'div' : 'button'}
        onClick={!isLocked ? onClick : undefined}
      >
        <div className={cn(
          'text-left',
          isLocked && 'opacity-50'
        )}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              {section.icon && (
                <div className="text-2xl">{section.icon}</div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {section.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted">
                    {progress.answeredQuestions}/{progress.totalQuestions} complete
                  </span>
                  {isComplete && (
                    <span className="text-accent text-sm">✓</span>
                  )}
                  {isLocked && (
                    <span className="text-subtle text-sm">🔒</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {section.description && (
            <p className="text-sm text-muted mb-4">
              {section.description}
            </p>
          )}

          {/* Progress bar */}
          <div className="mb-3">
            <div className="h-2 rounded-full bg-subtle/30 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-accent rounded-full"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            {estimatedRemaining !== undefined && estimatedRemaining > 0 ? (
              <span className="text-xs text-muted">
                ~{estimatedRemaining} min remaining
              </span>
            ) : isComplete ? (
              <span className="text-xs text-accent">
                Completed
              </span>
            ) : (
              <span className="text-xs text-muted">
                Not started
              </span>
            )}
            
            {!isLocked && (
              <span className="text-sm font-medium text-accent">
                {isComplete ? 'Review' : progress.answeredQuestions > 0 ? 'Continue' : 'Start'} →
              </span>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}


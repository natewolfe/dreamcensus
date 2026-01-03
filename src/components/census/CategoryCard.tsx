'use client'

import { motion } from 'motion/react'
import { Card } from '@/components/ui'

export interface CategoryCardProps {
  category: {
    id: string
    slug: string
    name: string
    description?: string
    icon?: string
    color?: string
  }
  progress: {
    formsCompleted: number
    totalForms: number
    promptAnswers: number
  }
  onClick: () => void
}

export function CategoryCard({
  category,
  progress,
  onClick,
}: CategoryCardProps) {
  const completionPercentage = progress.totalForms > 0
    ? Math.round((progress.formsCompleted / progress.totalForms) * 100)
    : 0

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        variant="interactive"
        padding="lg"
        className="cursor-pointer h-full"
        onClick={onClick}
      >
        <div className="space-y-4">
          {/* Icon and Title */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {category.icon && (
                <div className="text-3xl mb-2">{category.icon}</div>
              )}
              <h3 className="text-xl font-semibold text-foreground">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-sm text-muted mt-1">
                  {category.description}
                </p>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">
                {progress.formsCompleted} of {progress.totalForms} forms completed
              </span>
              <span className="text-accent font-medium">
                {completionPercentage}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 rounded-full bg-subtle/30 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-accent"
              />
            </div>

            {/* Prompt answers indicator */}
            {progress.promptAnswers > 0 && (
              <p className="text-xs text-subtle">
                {progress.promptAnswers} prompt{progress.promptAnswers !== 1 ? 's' : ''} answered
              </p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}


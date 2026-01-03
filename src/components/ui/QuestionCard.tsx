'use client'

import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export type ContentWidth = 'full' | 'sm' | 'md' | 'lg'

const widthClasses: Record<ContentWidth, string> = {
  full: '',
  sm: 'max-w-xs mx-auto',
  md: 'max-w-md mx-auto',
  lg: 'max-w-lg mx-auto',
}

export interface QuestionCardProps {
  question: {
    text: string
    description?: string
    category?: string
  }
  children: ReactNode
  contentWidth?: ContentWidth
  className?: string
}

export function QuestionCard({
  question,
  children,
  contentWidth = 'full',
  className,
}: QuestionCardProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Category badge - centered */}
      {question.category && (
        <div className="text-xs font-medium text-accent uppercase tracking-widest text-center">
          {question.category}
        </div>
      )}

      {/* Question text - centered */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-foreground mb-2">
          {question.text}
        </h3>
        {question.description && (
          <p className="text-sm text-muted">
            {question.description}
          </p>
        )}
      </div>

      {/* Question content with optional width constraint */}
      <div className={widthClasses[contentWidth]}>
        {children}
      </div>
    </div>
  )
}


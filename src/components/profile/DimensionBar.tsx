'use client'

import { useState } from 'react'
import { Card } from '@/components/ui'
import type { DimensionResult } from '@/lib/profile/types'

interface DimensionBarProps {
  dimension: DimensionResult
  label: string
  description: string
  lowLabel: string
  highLabel: string
}

export function DimensionBar({
  dimension,
  label,
  description,
  lowLabel,
  highLabel,
}: DimensionBarProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const score = dimension.score
  const { confidence, isEstimate } = dimension

  if (score === null) {
    return (
      <Card variant="outlined" padding="md" className="opacity-60">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted">{label}</span>
            <span className="text-xs text-subtle">Insufficient data</span>
          </div>
          <div className="h-2 bg-muted/10 rounded-full" />
          <p className="text-xs text-muted/80">{description}</p>
        </div>
      </Card>
    )
  }

  return (
    <Card variant="outlined" padding="md">
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between">
          <span className="text-sm font-medium text-foreground mb-1">{label}</span>
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="relative text-xs text-subtle hover:text-muted transition-colors"
          >
            {isEstimate ? 'Forming' : 'Stable'}
            {showTooltip && (
              <div className="absolute right-0 top-6 z-10 w-48 p-2 bg-card-bg border border-border rounded-md shadow-lg text-xs text-foreground">
                Based on {confidence}% confidence. More dreams and census answers improve accuracy.
              </div>
            )}
          </button>
        </div>

        {/* Description */}
        <div className="text-xs text-muted/90 mb-3">{description}</div>

        {/* Progress bar */}
        <div className="relative h-3 bg-muted/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isEstimate
                ? 'bg-gradient-to-r from-muted/60 to-muted'
                : 'bg-gradient-to-r from-accent/70 to-accent'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>

        {/* End labels */}
        <div className="flex justify-between text-xs text-subtle">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      </div>
    </Card>
  )
}

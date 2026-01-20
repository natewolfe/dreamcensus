'use client'

import { Card } from '@/components/ui'
import type { ArchetypeResult } from '@/lib/profile/types'

interface ArchetypeCardProps {
  archetype: ArchetypeResult
  isSecondary?: boolean
}

export function ArchetypeCard({ archetype, isSecondary = false }: ArchetypeCardProps) {
  return (
    <Card variant="elevated" padding="lg" className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <span className="text-[120px] leading-none">{archetype.icon}</span>
      </div>

      <div className="relative flex flex-col gap-4">
        {/* Header with icon */}
        <div className="flex items-center gap-4">
          <div className="text-5xl">{archetype.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold text-foreground">
                {archetype.name}
              </h3>
              {isSecondary && (
                <span className="text-xs text-muted/60 uppercase tracking-wide">
                  Secondary
                </span>
              )}
            </div>
            <p className="text-sm text-accent italic">{archetype.tagline}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted leading-relaxed">
          {archetype.description}
        </p>

        {/* Confidence indicator */}
        {!isSecondary && archetype.confidence < 70 && (
          <p className="text-xs text-muted/60 italic">
            Your current dream style. This can shift as you log more dreams.
          </p>
        )}
      </div>
    </Card>
  )
}

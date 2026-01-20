'use client'

import Link from 'next/link'
import { Card, Button } from '@/components/ui'
import type { UnlockProgress } from '@/lib/profile/types'

interface UnlockProgressProps {
  progress: UnlockProgress
}

export function UnlockProgress({ progress }: UnlockProgressProps) {
  const { currentPoints, currentLevel, nextLevel, nextLevelPoints, progress: progressPercent, nextFeature } = progress

  return (
    <Card variant="outlined" padding="lg">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Profile Progress</h3>
          <span className="text-sm text-muted">
            Level {currentLevel} • {currentPoints} points
          </span>
        </div>

        {/* Progress bar */}
        {nextLevel !== null && (
          <div className="flex flex-col gap-2">
            <div className="relative h-2 bg-muted/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent/70 to-accent rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-muted">
              {nextLevelPoints! - currentPoints} points until level {nextLevel}
            </p>
          </div>
        )}

        {/* Next unlock */}
        {nextFeature && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted">
              <span className="font-medium">Next unlock:</span> {nextFeature}
            </p>
            <p className="text-xs text-muted/70">
              Optional next steps: Complete census sections or log more dreams
            </p>
          </div>
        )}

        {/* CTA buttons */}
        {currentLevel < 2 && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/census">Explore Census</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/today/morning">Log a Dream</Link>
            </Button>
          </div>
        )}

        {/* Maxed out state */}
        {nextLevel === null && (
          <p className="text-sm text-accent">
            🎉 You've unlocked your full Dream Profile!
          </p>
        )}
      </div>
    </Card>
  )
}

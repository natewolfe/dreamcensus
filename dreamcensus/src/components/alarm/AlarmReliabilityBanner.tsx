'use client'

import { Card } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { AlarmReliabilityBannerProps } from './types'

export function AlarmReliabilityBanner({
  variant = 'info',
}: AlarmReliabilityBannerProps) {
  return (
    <Card
      variant="outlined"
      padding="sm"
      className={cn(
        'max-w-[300px] ml-3',
        variant === 'warning' && 'border-amber-500/30 bg-amber-500/5'
      )}
    >
      <div className="flex items-start gap-2">
        <span className="text-xl">
          {variant === 'info' ? 'ℹ️' : '⚠️'}
        </span>
        <div className="flex-1 space-y-2">
          <span className="inline-block text-sm font-medium text-foreground  leading-tight mb-0 mr-2">
            Heads up!
          </span>
          <span className="text-sm text-muted leading-relaxed leading-tight">
            This alarm only works with the app open in your browser.
          </span>
          {variant === 'warning' && (
            <p className="text-sm text-amber-500">
              Your browser may throttle alarms when the tab is inactive.
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}

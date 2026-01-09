'use client'

import { motion } from 'motion/react'
import { Card } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { TierToggleProps, ConsentTier } from './types'

const TIER_INFO: Record<ConsentTier, {
  icon: string
  title: string
  description: string
}> = {
  insights: {
    icon: '✨',
    title: 'Personal Insights',
    description: 'AI analyzes your dreams for patterns',
  },
  commons: {
    icon: '🌍',
    title: 'Dream Weather',
    description: 'Contribute to collective patterns',
  },
  studies: {
    icon: '🔬',
    title: 'Research Studies',
    description: 'Join time-limited research projects',
  },
}

export function TierToggle({
  tier,
  enabled,
  locked = false,
  onToggle,
  onLearnMore,
}: TierToggleProps) {
  const info = TIER_INFO[tier]

  return (
    <Card
      padding="md"
      variant={locked ? 'outlined' : 'elevated'}
    >
      <div className={cn(
        'flex items-start justify-between gap-4',
        locked && 'opacity-50'
      )}>
        <div className="flex items-start gap-3 flex-1">
          <div className="text-2xl">{info.icon}</div>
          <div className="flex-1">
            <h3 className="text-base font-medium text-foreground mb-1">
              {info.title}
            </h3>
            <p className="text-sm text-muted mb-2">
              {info.description}
            </p>
            <button
              onClick={onLearnMore}
              className="text-xs text-accent hover:underline"
            >
              What gets shared →
            </button>
          </div>
        </div>

        {/* Toggle */}
        <motion.button
          onClick={() => !locked && onToggle(!enabled)}
          disabled={locked}
          whileTap={!locked ? { scale: 0.95 } : undefined}
          className={cn(
            'relative w-12 h-7 rounded-full transition-colors',
            enabled ? 'bg-accent' : 'bg-subtle',
            locked && 'cursor-not-allowed'
          )}
          aria-label={`${enabled ? 'Disable' : 'Enable'} ${info.title}`}
          aria-checked={enabled}
          role="switch"
        >
          <motion.div
            animate={{ x: enabled ? 20 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white"
          />
        </motion.button>
      </div>
    </Card>
  )
}


'use client'

import { Card } from '@/components/ui'
import { DimensionBar } from './DimensionBar'
import { ArchetypeCard } from './ArchetypeCard'
import { UnlockProgress } from './UnlockProgress'
import type { DreamerProfileData, UnlockProgress as UnlockProgressType } from '@/lib/profile/types'

interface DreamProfileProps {
  profileData: DreamerProfileData
  progress: UnlockProgressType
}

// Dimension metadata for UI display
const DIMENSION_META = {
  boundary: {
    label: 'Boundary Permeability',
    description: 'The fluidity between your waking and dreaming consciousness',
    lowLabel: 'Structured',
    highLabel: 'Porous',
  },
  lucidity: {
    label: 'Lucid Capacity',
    description: 'Your awareness and control within the dream state',
    lowLabel: 'Passive',
    highLabel: 'Lucid',
  },
  emotion: {
    label: 'Emotional Intensity',
    description: 'The strength and density of emotions in your dreams',
    lowLabel: 'Quiet',
    highLabel: 'Intense',
  },
  meaning: {
    label: 'Meaning Orientation',
    description: 'Your interest in dream symbolism and interpretation',
    lowLabel: 'Experiential',
    highLabel: 'Symbolic',
  },
  engagement: {
    label: 'Dream Engagement',
    description: 'How actively you work with and reflect on your dreams',
    lowLabel: 'Separate',
    highLabel: 'Integrated',
  },
} as const

// Exported for use in separate grid layout
export { DIMENSION_META }

/**
 * Dimensions grid component for 2-column layout
 */
interface DimensionsGridProps {
  profileData: DreamerProfileData
}

export function DimensionsGrid({ profileData }: DimensionsGridProps) {
  const { dimensions, unlockLevel, lastCalculatedAt } = profileData

  if (unlockLevel < 1) return null

  const visibleDimensions = dimensions.filter((_, idx) => {
    if (unlockLevel === 1) return idx < 2
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold text-foreground">Dream Dimensions</h3>
        </div>
        {lastCalculatedAt && (
          <span className="text-xs text-muted/60">
            Updated {formatRelativeTime(lastCalculatedAt)}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleDimensions.map((dim) => {
          const meta = DIMENSION_META[dim.dimension]
          return (
            <DimensionBar
              key={dim.dimension}
              dimension={dim}
              label={meta.label}
              description={meta.description}
              lowLabel={meta.lowLabel}
              highLabel={meta.highLabel}
            />
          )
        })}
        
        {/* Disclaimer */}
        <Card variant="dashed" padding="md" className="flex items-center justify-center text-center">
          <div className="text-xs text-subtle leading-relaxed">
            Your Dream Profile is a research-based observation of your dream patterns, not a diagnostic tool. These dimensions reflect your current relationship with your dreams and can evolve over time.
          </div>
        </Card>
      </div>
    </div>
  )
}

/**
 * Archetype section component
 */
interface ArchetypeSectionProps {
  profileData: DreamerProfileData
}

export function ArchetypeSection({ profileData }: ArchetypeSectionProps) {
  const { primaryArchetype, secondaryArchetype, unlockLevel } = profileData

  if (unlockLevel < 3 || !primaryArchetype) return null

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-foreground">Your Dream Archetype</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ArchetypeCard archetype={primaryArchetype} />
        {secondaryArchetype && (
          <ArchetypeCard archetype={secondaryArchetype} isSecondary />
        )}
      </div>
    </div>
  )
}

/**
 * Full DreamProfile component (kept for level 0 / forming state)
 */
export function DreamProfile({ profileData, progress }: DreamProfileProps) {
  const { unlockLevel } = profileData

  // Show minimal state if level 0
  if (unlockLevel === 0) {
    return (
      <div className="space-y-6">
        <Card variant="outlined" padding="lg" className="text-center">
          <div className="flex flex-col items-center gap-3 py-6">
            <span className="text-5xl">🌱</span>
            <h3 className="text-lg font-semibold text-foreground">Your Dream Profile is Forming</h3>
            <p className="text-sm text-muted max-w-md">
              Complete census sections and log your dreams to discover your unique dreamer archetype and dimensional profile.
            </p>
          </div>
        </Card>
        <UnlockProgress progress={progress} />
      </div>
    )
  }

  // For level 1+, use the separated components in ProfileClient
  return null
}

/**
 * Format relative time for freshness display
 */
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'yesterday'
  return `${diffDays}d ago`
}

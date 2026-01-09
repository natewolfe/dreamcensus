// Census Constellation Types

import type { Star, ConstellationLine } from './constellation-layout'

// Re-export types from layout for convenience
export type { Star, ConstellationLine }

export interface CensusConstellationProps {
  kinds: ConstellationKindNode[]
  onSectionClick: (sectionId: string, slug: string) => void
}

// Keep existing types for data flow
export interface ConstellationKindNode {
  slug: string
  name: string
  description: string
  icon: string
  color: string
  progress: number
  isComplete: boolean
  hasUnlockedSections: boolean
  sections: ConstellationSectionNode[]
}

export interface ConstellationSectionNode {
  id: string
  slug: string
  name: string
  kindSlug: string
  progress: number
  isComplete: boolean
  isLocked: boolean
  isAvailable: boolean
}

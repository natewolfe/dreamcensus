import type { DimensionResult, ArchetypeResult, ArchetypeId, DimensionId } from './types'

/**
 * Archetype definitions with dimension profiles
 */
export const ARCHETYPES: Record<ArchetypeId, {
  name: string
  tagline: string
  description: string
  icon: string
  weights: Partial<Record<DimensionId, number>>
  thresholds?: Partial<Record<DimensionId, number>>
}> = {
  navigator: {
    name: 'The Navigator',
    tagline: 'Charting the dreamscape',
    description: 'You approach dreams with intention and awareness. When you realize you\'re dreaming, you seize the opportunity to explore, experiment, and discover. Your dreams are a practice space for consciousness itself.',
    icon: '🧭',
    weights: {
      lucidity: 0.45,
      engagement: 0.30,
      meaning: 0.15,
      boundary: 0.10,
    },
    thresholds: {
      lucidity: 55,  // Must have moderate-high lucidity
    },
  },
  oracle: {
    name: 'The Oracle',
    tagline: 'Reading the signs',
    description: 'You find personal meaning in dream imagery and treat dreams as messages from your unconscious. Symbols speak to you, and you actively work with your dreams to understand yourself and your life more deeply.',
    icon: '🔮',
    weights: {
      meaning: 0.40,
      engagement: 0.30,
      boundary: 0.20,
      emotion: 0.10,
    },
    thresholds: {
      meaning: 50,
      engagement: 45,
    },
  },
  witness: {
    name: 'The Witness',
    tagline: 'Immersed in feeling',
    description: 'You experience vivid emotional journeys in your dreams. As a surrendered observer, you feel deeply without trying to control or interpret. Your dreams are rich with atmosphere and intense with feeling.',
    icon: '👁️',
    weights: {
      emotion: 0.45,
      boundary: 0.25,
      engagement: 0.20,
      lucidity: 0.10,
    },
    thresholds: {
      emotion: 50,
    },
  },
  explorer: {
    name: 'The Explorer',
    tagline: 'Wandering strange lands',
    description: 'You live in rich, immersive dreamscapes where reality blurs and impossible things feel natural. With fluid boundaries between worlds, you wander through surreal landscapes without needing to control or decode them.',
    icon: '🌀',
    weights: {
      boundary: 0.45,
      emotion: 0.25,
      meaning: 0.15,
      lucidity: 0.15,
    },
    thresholds: {
      boundary: 55,
    },
  },
}

/**
 * Calculate fit score for an archetype given dimension scores
 */
function calculateArchetypeFit(
  archetype: typeof ARCHETYPES[ArchetypeId],
  dimensions: DimensionResult[]
): number {
  let totalScore = 0
  let totalWeight = 0

  // Check thresholds first
  if (archetype.thresholds) {
    for (const [dimId, threshold] of Object.entries(archetype.thresholds)) {
      const dim = dimensions.find((d) => d.dimension === dimId)
      if (!dim || dim.score === null || dim.score < threshold) {
        // Threshold not met, return low score
        return 0
      }
    }
  }

  // Calculate weighted score
  for (const [dimId, weight] of Object.entries(archetype.weights)) {
    const dim = dimensions.find((d) => d.dimension === dimId)
    if (dim && dim.score !== null) {
      totalScore += dim.score * weight
      totalWeight += weight
    }
  }

  return totalWeight > 0 ? totalScore / totalWeight : 0
}

/**
 * Assign primary and secondary archetypes based on dimension scores
 * Returns null if insufficient data
 */
export function assignArchetype(dimensions: DimensionResult[]): {
  primary: ArchetypeResult | null
  secondary: ArchetypeResult | null
} {
  // Count non-null dimensions and compute average confidence
  const validDimensions = dimensions.filter((d) => d.score !== null)
  const avgConfidence = validDimensions.length > 0
    ? validDimensions.reduce((sum, d) => sum + d.confidence, 0) / validDimensions.length
    : 0

  // Require at least 3 non-null dimensions and avg confidence >= 55
  if (validDimensions.length < 3 || avgConfidence < 55) {
    return { primary: null, secondary: null }
  }

  // Calculate fit for each archetype
  const fits: Array<{ id: ArchetypeId; score: number }> = []
  
  for (const [id, archetype] of Object.entries(ARCHETYPES)) {
    const score = calculateArchetypeFit(archetype, dimensions)
    fits.push({ id: id as ArchetypeId, score })
  }

  // Sort by score descending
  fits.sort((a, b) => b.score - a.score)

  // Get top 2
  const topFit = fits[0]
  const secondFit = fits[1]

  if (!topFit || topFit.score < 40) {
    // Score too low, no clear archetype
    return { primary: null, secondary: null }
  }

  const primaryArchetype = ARCHETYPES[topFit.id]
  const primary: ArchetypeResult = {
    id: topFit.id,
    name: primaryArchetype.name,
    tagline: primaryArchetype.tagline,
    description: primaryArchetype.description,
    icon: primaryArchetype.icon,
    confidence: Math.round(topFit.score),
  }

  // Only assign secondary if it's close (within 15 points)
  let secondary: ArchetypeResult | null = null
  if (secondFit && secondFit.score >= 40 && (topFit.score - secondFit.score) < 15) {
    const secondaryArchetype = ARCHETYPES[secondFit.id]
    secondary = {
      id: secondFit.id,
      name: secondaryArchetype.name,
      tagline: secondaryArchetype.tagline,
      description: secondaryArchetype.description,
      icon: secondaryArchetype.icon,
      confidence: Math.round(secondFit.score),
    }
  }

  return { primary, secondary }
}

import { computeJournalMetrics } from './metrics'
import { extractCensusSignals, CENSUS_DIMENSION_MAP } from './census-mapping'
import type { DimensionResult, JournalMetrics, DimensionId } from './types'

// Constants for confidence and scoring
const MIN_CONFIDENCE = 40  // Minimum confidence to show a score
const STABLE_CONFIDENCE = 70  // Confidence threshold for "stable" badge
const TARGET_DREAM_COUNT = 10  // Target dream count for full journal weight

/**
 * Clamp a value between 0 and 1
 */
function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

/**
 * Blend census and journal scores based on journal reliability
 */
function blendScores(
  censusScore: number | null,
  journalScore: number | null,
  journalReliability: number
): number | null {
  // If both are null, return null
  if (censusScore === null && journalScore === null) return null
  
  // If only census exists, use it
  if (journalScore === null) return censusScore
  
  // If only journal exists, use it (shouldn't happen but handle it)
  if (censusScore === null) return journalScore
  
  // Blend based on reliability
  const censusWeight = 1 - journalReliability
  const journalWeight = journalReliability
  
  return Math.round(censusScore * censusWeight + journalScore * journalWeight)
}

/**
 * Compute confidence score for a dimension
 */
function computeConfidence(
  censusCoverage: number | undefined,
  journalReliability: number
): number {
  const coverage = censusCoverage ?? 0
  // 50% from census coverage, 50% from journal reliability
  return Math.round(100 * (0.5 * coverage + 0.5 * journalReliability))
}

/**
 * Dimension definitions with journal computation functions
 */
const DIMENSIONS: Array<{
  id: DimensionId
  journalCompute: ((metrics: JournalMetrics) => number | null)
  minDreamsRequired: number
}> = [
  {
    id: 'boundary',
    minDreamsRequired: 3,
    journalCompute: (m) => {
      if (m.dreamCount < 3) return null
      // High vividness + high tag diversity suggests thin boundaries
      const vividnessScore = m.avgVividness ?? 50
      const diversityScore = m.tagDiversityIndex !== null 
        ? Math.min(m.tagDiversityIndex * 200, 100)  // Scale diversity (0-0.5 typical -> 0-100)
        : 50
      return Math.round((vividnessScore * 0.6 + diversityScore * 0.4))
    },
  },
  {
    id: 'lucidity',
    minDreamsRequired: 3,
    journalCompute: (m) => {
      if (m.dreamCount < 3) return null
      // Direct use of lucid percentage
      return m.lucidPercent
    },
  },
  {
    id: 'emotion',
    minDreamsRequired: 5,
    journalCompute: (m) => {
      if (m.dreamCount < 5 || m.emotionCountAvg === null) return null
      // More emotions per dream = higher emotional intensity
      // Scale: 0 emotions = 0, 5+ emotions = 100
      return Math.min(Math.round(m.emotionCountAvg * 20), 100)
    },
  },
  {
    id: 'meaning',
    minDreamsRequired: 3,
    journalCompute: (m) => {
      if (m.dreamCount < 3) return null
      // Tag diversity and recurring tags suggest meaning orientation
      const diversityScore = m.tagDiversityIndex !== null
        ? Math.min(m.tagDiversityIndex * 150, 100)
        : 50
      // Having tags at all suggests some meaning-seeking
      const hasTagsScore = m.topTags.length > 0 ? 100 : 0
      return Math.round((diversityScore * 0.4 + hasTagsScore * 0.6))
    },
  },
  {
    id: 'engagement',
    minDreamsRequired: 3,
    journalCompute: (m) => {
      if (m.dreamCount < 3) return null
      // Waking life link rate + recent activity score
      const linkScore = m.wakingLifeLinkRate ?? 0
      const activityScore = m.recentActivityScore
      return Math.round((linkScore * 0.4 + activityScore * 0.6))
    },
  },
]

/**
 * Calculate all dimension scores for a user
 * Implements dynamic blending of census and journal data
 */
export async function calculateDimensions(
  userId: string
): Promise<DimensionResult[]> {
  // Get census signals and journal metrics in parallel
  const [census, journal] = await Promise.all([
    extractCensusSignals(userId),
    computeJournalMetrics(userId),
  ])

  // Calculate journal reliability based on dream count
  const journalReliability = clamp01(
    Math.log1p(journal.dreamCount) / Math.log1p(TARGET_DREAM_COUNT)
  )

  // Calculate each dimension
  const results: DimensionResult[] = []

  for (const dim of DIMENSIONS) {
    const censusData = census[dim.id]
    const censusScore = censusData?.score ?? null

    // Check if we have minimum census coverage
    const hasMinCensus = censusData 
      && censusData.answeredCount >= CENSUS_DIMENSION_MAP[dim.id].minAnswersRequired

    // Compute journal score if enough dreams
    const journalScore = journal.dreamCount >= dim.minDreamsRequired
      ? dim.journalCompute(journal)
      : null

    // Blend scores
    const score = hasMinCensus || journalScore !== null
      ? blendScores(censusScore, journalScore, journalReliability)
      : null

    // Compute confidence
    const confidence = computeConfidence(censusData?.coverage, journalReliability)

    // Only show score if confidence meets minimum
    const finalScore = confidence >= MIN_CONFIDENCE ? score : null

    results.push({
      dimension: dim.id,
      score: finalScore,
      confidence,
      isEstimate: confidence < STABLE_CONFIDENCE,
    })
  }

  return results
}

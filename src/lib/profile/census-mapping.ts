import { db } from '../db'
import type { CensusSignals } from './types'

/**
 * Mapping of census questions to dimensions with weights
 * Each dimension has questions from various sections that contribute to its score
 */
export const CENSUS_DIMENSION_MAP = {
  boundary: {
    questions: [
      { section: 'personality', slug: 'vivid-thoughts', weight: 0.20 },
      { section: 'personality', slug: 'mind-wanders', weight: 0.15 },
      { section: 'personality', slug: 'thin-boundaries', weight: 0.25 },
      { section: 'personality', slug: 'imagine-being-someone-else', weight: 0.15 },
      { section: 'imagination', slug: 'vivid-imagination-waking', weight: 0.10 },
      { section: 'spacetime', slug: 'confuse-dream-with-reality', weight: 0.10 },
      { section: 'content', slug: 'impossible-surreal-scenarios', weight: 0.05 },
    ],
    minAnswersRequired: 2,
  },
  lucidity: {
    questions: [
      { section: 'lucidity', slug: 'lucid-dream-frequency', weight: 0.30 },
      { section: 'lucidity', slug: 'control-level-when-lucid', weight: 0.20 },
      { section: 'lucidity', slug: 'maintain-lucidity-duration', weight: 0.15 },
      { section: 'lucidity', slug: 'awareness-without-control', weight: 0.10 },
      { section: 'lucidity', slug: 'reality-testing-in-dreams', weight: 0.10 },
      { section: 'lucidity', slug: 'return-to-dream-after-waking', weight: 0.10 },
      { section: 'lucidity', slug: 'false-awakening-frequency', weight: 0.05 },
    ],
    minAnswersRequired: 2,
  },
  emotion: {
    questions: [
      { section: 'emotion', slug: 'emotional-intensity-rating', weight: 0.25 },
      { section: 'emotion', slug: 'wake-with-residual-emotion', weight: 0.20 },
      { section: 'emotion', slug: 'mood-atmosphere-prominence', weight: 0.15 },
      { section: 'emotion', slug: 'joy-happiness-frequency', weight: 0.10 },
      { section: 'emotion', slug: 'fear-anxiety-frequency', weight: 0.10 },
      { section: 'emotion', slug: 'sadness-frequency', weight: 0.05 },
      { section: 'emotion', slug: 'anger-frequency', weight: 0.05 },
      { section: 'emotion', slug: 'awe-wonder-frequency', weight: 0.05 },
      { section: 'emotion', slug: 'confusion-frequency', weight: 0.05 },
    ],
    minAnswersRequired: 2,
  },
  meaning: {
    questions: [
      { section: 'interiority', slug: 'search-for-dream-meaning', weight: 0.25 },
      { section: 'symbolism', slug: 'seek-symbol-interpretation', weight: 0.20 },
      { section: 'symbolism', slug: 'personal-symbol-dictionary', weight: 0.15 },
      { section: 'interiority', slug: 'dreams-reveal-hidden-feelings', weight: 0.15 },
      { section: 'symbolism', slug: 'recurring-dream-frequency', weight: 0.10 },
      { section: 'imagination', slug: 'inspiration-from-dreams', weight: 0.10 },
      { section: 'imagination', slug: 'problem-solving-in-dreams', weight: 0.05 },
    ],
    minAnswersRequired: 2,
  },
  engagement: {
    questions: [
      { section: 'interiority', slug: 'reflect-on-dreams', weight: 0.20 },
      { section: 'interiority', slug: 'dreams-influence-waking-life', weight: 0.20 },
      { section: 'interiority', slug: 'dreams-important-to-identity', weight: 0.20 },
      { section: 'interiority', slug: 'discuss-dreams-with-others', weight: 0.10 },
      { section: 'recall', slug: 'write-dreams-down', weight: 0.10 },
      { section: 'recall', slug: 'tell-others-about-dreams', weight: 0.10 },
      { section: 'imagination', slug: 'act-out-dream-inspired-ideas', weight: 0.10 },
    ],
    minAnswersRequired: 2,
  },
} as const

type DimensionMapKey = keyof typeof CENSUS_DIMENSION_MAP

/**
 * Normalize a census answer value to 0-1 scale
 * Handles different question types (frequency, scale, binary, etc.)
 */
function normalizeValue(value: unknown, questionType: string): number | null {
  if (value === null || value === undefined) return null

  // Handle frequency questions (0-4 scale typically)
  if (typeof value === 'number') {
    // Assume 0-4 scale for frequency questions, normalize to 0-1
    if (value >= 0 && value <= 4) {
      return value / 4
    }
    // VAS scales are typically 0-100
    if (value >= 0 && value <= 100) {
      return value / 100
    }
    // Already normalized
    if (value >= 0 && value <= 1) {
      return value
    }
  }

  // Handle boolean/binary
  if (typeof value === 'boolean') {
    return value ? 1 : 0
  }

  // Handle string representations
  if (typeof value === 'string') {
    const lower = value.toLowerCase()
    if (lower === 'yes' || lower === 'true') return 1
    if (lower === 'no' || lower === 'false') return 0
    
    // Try parsing as number
    const num = parseFloat(value)
    if (!isNaN(num)) {
      if (num >= 0 && num <= 4) return num / 4
      if (num >= 0 && num <= 100) return num / 100
      if (num >= 0 && num <= 1) return num
    }
  }

  // Handle objects with specific keys (from JSON responses)
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>
    if ('value' in obj) {
      return normalizeValue(obj.value, questionType)
    }
    if ('score' in obj) {
      return normalizeValue(obj.score, questionType)
    }
  }

  return null
}

/**
 * Extract census signals for all dimensions
 * Returns normalized scores and coverage metrics per dimension
 */
export async function extractCensusSignals(userId: string): Promise<CensusSignals> {
  // Get all census answers for this user with question metadata
  const answers = await db.censusAnswer.findMany({
    where: { userId },
    include: {
      question: {
        include: {
          section: true,
        },
      },
    },
  })

  const signals: CensusSignals = {}

  // Process each dimension
  for (const [dimensionId, config] of Object.entries(CENSUS_DIMENSION_MAP)) {
    const dimensionQuestions = config.questions
    let totalWeightedScore = 0
    let totalWeight = 0
    let answeredCount = 0

    for (const q of dimensionQuestions) {
      // Find matching answer
      const answer = answers.find(
        (a) => 
          a.question.section.slug === q.section && 
          a.question.slug === q.slug
      )

      if (answer) {
        const normalized = normalizeValue(answer.value, answer.question.type)
        if (normalized !== null) {
          totalWeightedScore += normalized * q.weight
          totalWeight += q.weight
          answeredCount++
        }
      }
    }

    // Compute score and coverage
    const score = totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 100) : null
    const coverage = dimensionQuestions.length > 0 ? answeredCount / dimensionQuestions.length : 0

    signals[dimensionId] = {
      score,
      coverage,
      answeredCount,
      totalCount: dimensionQuestions.length,
    }
  }

  return signals
}

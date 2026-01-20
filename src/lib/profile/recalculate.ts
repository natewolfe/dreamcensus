import { db } from '../db'
import { calculateDimensions } from './calculator'
import { assignArchetype } from './archetypes'
import { computeJournalMetrics } from './metrics'

/**
 * Calculate unlock points based on user activity
 */
async function calculateUnlockPoints(userId: string): Promise<{
  points: number
  level: number
}> {
  // Get census sections completed
  const censusProgress = await db.censusProgress.findUnique({
    where: { userId },
    select: { sectionProgress: true },
  })

  let points = 0

  // Points from census (10 per section completed)
  if (censusProgress && censusProgress.sectionProgress) {
    const sectionProg = censusProgress.sectionProgress as Record<string, { completed: boolean }>
    const completedSections = Object.values(sectionProg).filter((s) => s.completed).length
    points += completedSections * 10
  }

  // Points from dreams (5 per dream)
  const dreamCount = await db.dreamEntry.count({
    where: { userId },
  })
  points += dreamCount * 5

  // Bonus points for waking life links (2 per link)
  const linksCount = await db.dreamEntry.count({
    where: {
      userId,
      wakingLifeLink: {
        not: null,
      },
    },
  })
  points += linksCount * 2

  // Bonus for weekly consistency (10 points if 5+ dreams in last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentDreams = await db.dreamEntry.count({
    where: {
      userId,
      capturedAt: {
        gte: sevenDaysAgo,
      },
    },
  })
  if (recentDreams >= 5) {
    points += 10
  }

  // Determine level based on points
  const level = 
    points >= 100 ? 4 :
    points >= 60 ? 3 :
    points >= 30 ? 2 :
    points >= 10 ? 1 :
    0

  return { points, level }
}

/**
 * Recalculate the complete dream profile for a user
 * This is the main orchestrator that computes all profile aspects
 */
export async function recalculateProfile(userId: string) {
  // Calculate dimensions
  const dimensions = await calculateDimensions(userId)

  // Assign archetype
  const { primary, secondary } = assignArchetype(dimensions)

  // Calculate unlock progress
  const { points, level } = await calculateUnlockPoints(userId)

  // Get journal metrics for caching
  const journal = await computeJournalMetrics(userId)

  // Upsert profile
  const profile = await db.dreamerProfile.upsert({
    where: { userId },
    create: {
      userId,
      boundaryScore: dimensions.find((d) => d.dimension === 'boundary')?.score,
      lucidityScore: dimensions.find((d) => d.dimension === 'lucidity')?.score,
      emotionScore: dimensions.find((d) => d.dimension === 'emotion')?.score,
      meaningScore: dimensions.find((d) => d.dimension === 'meaning')?.score,
      engagementScore: dimensions.find((d) => d.dimension === 'engagement')?.score,
      boundaryConfidence: dimensions.find((d) => d.dimension === 'boundary')?.confidence,
      lucidityConfidence: dimensions.find((d) => d.dimension === 'lucidity')?.confidence,
      emotionConfidence: dimensions.find((d) => d.dimension === 'emotion')?.confidence,
      meaningConfidence: dimensions.find((d) => d.dimension === 'meaning')?.confidence,
      engagementConfidence: dimensions.find((d) => d.dimension === 'engagement')?.confidence,
      primaryArchetype: primary?.id ?? null,
      secondaryArchetype: secondary?.id ?? null,
      archetypeConfidence: primary?.confidence ?? null,
      unlockPoints: points,
      unlockLevel: level,
      journalDreamCount: journal.dreamCount,
      journalLucidPercent: journal.lucidPercent,
      journalAvgVividness: journal.avgVividness,
      journalTopEmotions: journal.topEmotions,
      journalTopTags: journal.topTags,
      journalWakingLinkRate: journal.wakingLifeLinkRate,
      isStale: false,
      lastCalculatedAt: new Date(),
    },
    update: {
      boundaryScore: dimensions.find((d) => d.dimension === 'boundary')?.score,
      lucidityScore: dimensions.find((d) => d.dimension === 'lucidity')?.score,
      emotionScore: dimensions.find((d) => d.dimension === 'emotion')?.score,
      meaningScore: dimensions.find((d) => d.dimension === 'meaning')?.score,
      engagementScore: dimensions.find((d) => d.dimension === 'engagement')?.score,
      boundaryConfidence: dimensions.find((d) => d.dimension === 'boundary')?.confidence,
      lucidityConfidence: dimensions.find((d) => d.dimension === 'lucidity')?.confidence,
      emotionConfidence: dimensions.find((d) => d.dimension === 'emotion')?.confidence,
      meaningConfidence: dimensions.find((d) => d.dimension === 'meaning')?.confidence,
      engagementConfidence: dimensions.find((d) => d.dimension === 'engagement')?.confidence,
      primaryArchetype: primary?.id ?? null,
      secondaryArchetype: secondary?.id ?? null,
      archetypeConfidence: primary?.confidence ?? null,
      unlockPoints: points,
      unlockLevel: level,
      journalDreamCount: journal.dreamCount,
      journalLucidPercent: journal.lucidPercent,
      journalAvgVividness: journal.avgVividness,
      journalTopEmotions: journal.topEmotions,
      journalTopTags: journal.topTags,
      journalWakingLinkRate: journal.wakingLifeLinkRate,
      isStale: false,
      lastCalculatedAt: new Date(),
    },
  })

  return profile
}

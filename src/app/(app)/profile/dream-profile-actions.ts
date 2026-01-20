'use server'

import { db } from '@/lib/db'
import { withAuth, type ActionResult } from '@/lib/actions'
import { recalculateProfile } from '@/lib/profile/recalculate'
import { ARCHETYPES } from '@/lib/profile/archetypes'
import type { DreamerProfileData, DimensionResult, UnlockProgress } from '@/lib/profile/types'

/**
 * Get the user's dream profile
 * Recalculates if stale or missing
 */
export async function getDreamerProfile(): Promise<ActionResult<DreamerProfileData>> {
  return withAuth(async (session) => {
    let profile = await db.dreamerProfile.findUnique({
      where: { userId: session.userId },
    })

    // Recalculate if stale or missing
    if (!profile || profile.isStale) {
      profile = await recalculateProfile(session.userId)
    }

    // Format dimensions
    const dimensions: DimensionResult[] = [
      {
        dimension: 'boundary',
        score: profile.boundaryScore,
        confidence: profile.boundaryConfidence ?? 0,
        isEstimate: (profile.boundaryConfidence ?? 0) < 70,
      },
      {
        dimension: 'lucidity',
        score: profile.lucidityScore,
        confidence: profile.lucidityConfidence ?? 0,
        isEstimate: (profile.lucidityConfidence ?? 0) < 70,
      },
      {
        dimension: 'emotion',
        score: profile.emotionScore,
        confidence: profile.emotionConfidence ?? 0,
        isEstimate: (profile.emotionConfidence ?? 0) < 70,
      },
      {
        dimension: 'meaning',
        score: profile.meaningScore,
        confidence: profile.meaningConfidence ?? 0,
        isEstimate: (profile.meaningConfidence ?? 0) < 70,
      },
      {
        dimension: 'engagement',
        score: profile.engagementScore,
        confidence: profile.engagementConfidence ?? 0,
        isEstimate: (profile.engagementConfidence ?? 0) < 70,
      },
    ]

    // Format archetypes
    const primary = profile.primaryArchetype
      ? {
          id: profile.primaryArchetype as keyof typeof ARCHETYPES,
          ...ARCHETYPES[profile.primaryArchetype as keyof typeof ARCHETYPES],
          confidence: profile.archetypeConfidence ?? 0,
        }
      : null

    const secondary = profile.secondaryArchetype
      ? {
          id: profile.secondaryArchetype as keyof typeof ARCHETYPES,
          ...ARCHETYPES[profile.secondaryArchetype as keyof typeof ARCHETYPES],
          confidence: profile.archetypeConfidence ? profile.archetypeConfidence - 10 : 0,
        }
      : null

    return {
      success: true,
      data: {
        dimensions,
        primaryArchetype: primary,
        secondaryArchetype: secondary,
        unlockPoints: profile.unlockPoints,
        unlockLevel: profile.unlockLevel,
        lastCalculatedAt: profile.lastCalculatedAt,
        isStale: profile.isStale,
      },
    }
  })
}

/**
 * Get unlock progress information
 */
export async function getProfileProgress(): Promise<ActionResult<UnlockProgress>> {
  return withAuth(async (session) => {
    const profile = await db.dreamerProfile.findUnique({
      where: { userId: session.userId },
      select: {
        unlockPoints: true,
        unlockLevel: true,
      },
    })

    const currentPoints = profile?.unlockPoints ?? 0
    const currentLevel = profile?.unlockLevel ?? 0

    // Define level thresholds
    const levelThresholds = [0, 10, 30, 60, 100]
    const nextLevel = currentLevel < 4 ? currentLevel + 1 : null
    const nextLevelPoints = nextLevel !== null ? levelThresholds[nextLevel] : null

    // Calculate progress toward next level
    const currentLevelPoints = levelThresholds[currentLevel] ?? 0
    const progress = nextLevelPoints !== null
      ? Math.round(((currentPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100)
      : 100

    // Define unlocked features per level
    const featuresByLevel = [
      'Profile forming',
      '1-2 estimated dimensions',
      'All computed dimensions',
      'Full archetype reveal',
      'Community comparisons',
    ]

    const unlockedFeatures = featuresByLevel.slice(0, currentLevel + 1)
    const nextFeature = nextLevel !== null ? featuresByLevel[nextLevel] : null

    return {
      success: true,
      data: {
        currentPoints,
        currentLevel,
        nextLevel,
        nextLevelPoints,
        progress,
        unlockedFeatures,
        nextFeature,
      },
    }
  })
}

/**
 * Manually trigger profile recalculation
 * Useful for testing or admin purposes
 */
export async function refreshDreamerProfile(): Promise<ActionResult<void>> {
  return withAuth(async (session) => {
    await recalculateProfile(session.userId)
    return { success: true, data: undefined }
  })
}

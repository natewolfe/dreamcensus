import { db } from '../db'
import type { JournalMetrics } from './types'

/**
 * Compute journal metrics for a user
 * Aggregates dream journal data for profile scoring
 */
export async function computeJournalMetrics(userId: string): Promise<JournalMetrics> {
  // Get all dreams for this user
  const dreams = await db.dreamEntry.findMany({
    where: { userId },
    select: {
      emotions: true,
      vividness: true,
      lucidity: true,
      wakingLifeLink: true,
      capturedAt: true,
      tags: {
        select: {
          tag: {
            select: {
              name: true,
            },
          },
          source: true,
        },
      },
    },
    orderBy: { capturedAt: 'desc' },
  })

  const dreamCount = dreams.length

  // If no dreams, return empty metrics
  if (dreamCount === 0) {
    return {
      dreamCount: 0,
      avgVividness: null,
      lucidPercent: null,
      emotionCountAvg: null,
      topEmotions: [],
      topTags: [],
      tagDiversityIndex: null,
      wakingLifeLinkRate: null,
      recentActivityScore: 0,
    }
  }

  // Compute average vividness
  const vividnessDreams = dreams.filter((d) => d.vividness !== null && d.vividness !== undefined)
  const avgVividness = vividnessDreams.length > 0
    ? Math.round(vividnessDreams.reduce((sum, d) => sum + (d.vividness ?? 0), 0) / vividnessDreams.length)
    : null

  // Compute lucid percentage (treat "maybe" as 0.5)
  let lucidScore = 0
  dreams.forEach((d) => {
    if (d.lucidity === 'yes') lucidScore += 1
    else if (d.lucidity === 'maybe') lucidScore += 0.5
  })
  const lucidPercent = Math.round((lucidScore / dreamCount) * 100)

  // Compute emotion stats
  const emotionCounts: Record<string, number> = {}
  let totalEmotions = 0
  dreams.forEach((d) => {
    d.emotions.forEach((emotion) => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
      totalEmotions++
    })
  })
  
  const emotionCountAvg = totalEmotions > 0 ? totalEmotions / dreamCount : null
  
  const topEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([emotion]) => emotion)

  // Compute tag stats (user tags only, not AI)
  const tagCounts: Record<string, number> = {}
  let totalTags = 0
  dreams.forEach((d) => {
    d.tags.forEach((dt) => {
      // Prefer user tags for profile
      if (dt.source === 'user' || dt.source === 'ai_accepted') {
        const tagName = dt.tag.name
        tagCounts[tagName] = (tagCounts[tagName] || 0) + 1
        totalTags++
      }
    })
  })
  
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag)
  
  const uniqueTags = Object.keys(tagCounts).length
  const tagDiversityIndex = totalTags > 0 ? uniqueTags / totalTags : null

  // Compute waking life link rate
  const dreamsWithLink = dreams.filter((d) => d.wakingLifeLink && d.wakingLifeLink.trim().length > 0).length
  const wakingLifeLinkRate = Math.round((dreamsWithLink / dreamCount) * 100)

  // Compute recent activity score (based on last 14 days)
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
  
  const recentDreams = dreams.filter((d) => d.capturedAt >= fourteenDaysAgo)
  // Score: 0-100 based on dream frequency in last 14 days
  // Target: 1 dream per day = 100 points
  const recentActivityScore = Math.min(Math.round((recentDreams.length / 14) * 100), 100)

  return {
    dreamCount,
    avgVividness,
    lucidPercent,
    emotionCountAvg,
    topEmotions,
    topTags,
    tagDiversityIndex,
    wakingLifeLinkRate,
    recentActivityScore,
  }
}

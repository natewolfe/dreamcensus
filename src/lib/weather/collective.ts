import { db } from '../db'
import type { CollectiveWeatherData, EmotionDistribution, SymbolFrequency, TimeRange } from './types'

/**
 * Compute collective weather from dream data
 * Only returns data if sample size >= 3 (lowered threshold for development)
 */
export async function computeCollectiveWeather(
  timeRange: TimeRange = '7d'
): Promise<CollectiveWeatherData | null> {
  const now = new Date()
  const startDate = getStartDate(now, timeRange)
  const today = new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours

  // Get all dreams with Commons consent
  const dreams = await db.dreamEntry.findMany({
    where: {
      capturedAt: { gte: startDate },
      user: {
        consents: {
          some: {
            scope: 'commons',
            granted: true,
          },
        },
      },
    },
    select: {
      userId: true,
      emotions: true,
      vividness: true,
      lucidity: true,
      dreamTypes: true,
      capturedAt: true,
    },
  })

  // Enforce minimum sample size (lowered to 3 for development)
  if (dreams.length < 3) {
    return null
  }

  // Count unique dreamers
  const uniqueUserIds = new Set(dreams.map(d => d.userId))
  const dreamerCount = uniqueUserIds.size

  // Count dreams captured today
  const dreamsToday = dreams.filter(d => d.capturedAt >= today).length

  // Compute emotion distribution
  const emotionCounts = new Map<string, number>()
  let totalEmotions = 0

  dreams.forEach((dream) => {
    const emotions = dream.emotions as string[]
    emotions.forEach((emotion) => {
      emotionCounts.set(emotion, (emotionCounts.get(emotion) ?? 0) + 1)
      totalEmotions++
    })
  })

  const emotions: EmotionDistribution[] = Array.from(emotionCounts.entries())
    .map(([emotion, count]) => ({
      emotion,
      count,
      percentage: totalEmotions > 0 ? (count / totalEmotions) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)

  // Get trending emotion (most common)
  const trendingEmotion = emotions[0]?.emotion ?? 'calm'

  // Compute symbol frequency (placeholder for now)
  const topSymbols: SymbolFrequency[] = []
  // TODO: Query DreamTag relation for actual symbols

  // Compute average vividness
  const vividnessDreams = dreams.filter((d) => d.vividness !== null)
  const avgVividness =
    vividnessDreams.length > 0
      ? vividnessDreams.reduce((sum, d) => sum + (d.vividness ?? 0), 0) / vividnessDreams.length
      : 50

  // Compute lucid percentage
  const lucidDreams = dreams.filter((d) => d.lucidity === 'yes')
  const lucidPercentage = dreams.length > 0 ? (lucidDreams.length / dreams.length) * 100 : 0

  // Compute nightmare rate
  const nightmareDreams = dreams.filter((d) => {
    const types = d.dreamTypes as string[]
    return types.includes('nightmare')
  })
  const nightmareRate = dreams.length > 0 ? (nightmareDreams.length / dreams.length) * 100 : 0

  // Compute recurring rate
  const recurringDreams = dreams.filter((d) => {
    const types = d.dreamTypes as string[]
    return types.includes('recurring')
  })
  const recurringRate = dreams.length > 0 ? (recurringDreams.length / dreams.length) * 100 : 0

  return {
    timeRange,
    sampleSize: dreamerCount,
    dreamCount: dreams.length,
    emotions: emotions.slice(0, 12),
    topSymbols,
    avgVividness,
    lucidPercentage,
    nightmareRate,
    recurringRate,
    updatedAt: now,
    dreamerCount,
    dreamsToday,
    trendingEmotion,
  }
}

/**
 * Compute collective weather aggregate (run as background job)
 * This would be called by a cron job or queue worker
 */
export async function computeCollectiveAggregate(
  timeRange: TimeRange
): Promise<void> {
  const now = new Date()
  const startDate = getStartDate(now, timeRange)

  // Get all dreams with Commons consent
  const dreams = await db.dreamEntry.findMany({
    where: {
      capturedAt: { gte: startDate },
      user: {
        consents: {
          some: {
            scope: 'commons',
            granted: true,
          },
        },
      },
    },
    select: {
      emotions: true,
      vividness: true,
      lucidity: true,
      tags: true,
    },
  })

  if (dreams.length < 50) {
    // Not enough data for privacy-safe aggregate
    return
  }

  // Compute emotion distribution
  const emotionCounts = new Map<string, number>()
  let totalEmotions = 0

  dreams.forEach((dream) => {
    const emotions = dream.emotions as string[]
    emotions.forEach((emotion) => {
      emotionCounts.set(emotion, (emotionCounts.get(emotion) ?? 0) + 1)
      totalEmotions++
    })
  })

  const emotions: EmotionDistribution[] = Array.from(emotionCounts.entries())
    .map(([emotion, count]) => ({
      emotion,
      count,
      percentage: (count / totalEmotions) * 100,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) // Top 10

  // Compute symbol frequency
  const symbolCounts = new Map<string, number>()

  // Tags are stored in DreamTag relation, not as JSON array
  // For now, skip symbol computation
  // TODO: Query DreamTag relation properly

  const topSymbols: SymbolFrequency[] = Array.from(symbolCounts.entries())
    .map(([symbol, count]) => ({
      symbol,
      count,
      lastSeen: now, // Approximate
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)

  // Compute average vividness
  const vividnessDreams = dreams.filter((d) => d.vividness !== null)
  const avgVividness =
    vividnessDreams.length > 0
      ? vividnessDreams.reduce((sum, d) => sum + (d.vividness ?? 0), 0) / vividnessDreams.length
      : 50

  // Compute lucid percentage
  const lucidDreams = dreams.filter((d) => d.lucidity === 'yes')
  const lucidPercentage = (lucidDreams.length / dreams.length) * 100

  // Store aggregate
  await db.weatherAggregate.create({
    data: {
      metric: 'collective_weather',
      period: timeRange,
      periodStart: startDate,
      sampleN: dreams.length,
      value: {
        sampleSize: dreams.length,
        emotions: emotions.map(e => ({ emotion: e.emotion, count: e.count, percentage: e.percentage })),
        topSymbols: topSymbols.map(s => ({ symbol: s.symbol, count: s.count })),
        avgVividness,
        lucidPercentage,
      } as any,
      methodVersion: 1,
      minNThreshold: 50,
      computedAt: now,
    },
  })
}

function getStartDate(now: Date, timeRange: TimeRange): Date {
  const start = new Date(now)
  
  switch (timeRange) {
    case '1d':
      start.setDate(start.getDate() - 1)
      break
    case '3d':
      start.setDate(start.getDate() - 3)
      break
    case '7d':
      start.setDate(start.getDate() - 7)
      break
    case '30d':
      start.setDate(start.getDate() - 30)
      break
    case '90d':
      start.setDate(start.getDate() - 90)
      break
  }
  
  return start
}


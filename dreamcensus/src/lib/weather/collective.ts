import { db } from '../db'
import type { CollectiveWeatherData, EmotionDistribution, SymbolFrequency, TimeRange } from './types'
import { getStartDate, computeEmotionDistribution } from './utils'

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
  const emotions = computeEmotionDistribution(dreams)

  // Get trending emotion (most common)
  const trendingEmotion = emotions[0]?.emotion ?? 'calm'

  // Compute symbol frequency across all consenting users
  // Note: This aggregates across users, so we need to query differently
  const dreamTags = await db.dreamTag.findMany({
    where: {
      dreamEntry: {
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
    },
    include: {
      tag: true,
      dreamEntry: { select: { capturedAt: true } },
    },
  })

  const symbolMap = new Map<string, { count: number; lastSeen: Date }>()
  
  dreamTags.forEach(({ tag, dreamEntry }) => {
    const existing = symbolMap.get(tag.name)
    symbolMap.set(tag.name, {
      count: (existing?.count ?? 0) + 1,
      lastSeen: existing?.lastSeen && existing.lastSeen > dreamEntry.capturedAt 
        ? existing.lastSeen 
        : dreamEntry.capturedAt,
    })
  })

  const topSymbols: SymbolFrequency[] = Array.from(symbolMap.entries())
    .map(([symbol, data]) => ({ symbol, ...data }))
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
  const emotions = computeEmotionDistribution(dreams).slice(0, 10) // Top 10

  // Compute symbol frequency across all consenting users
  const dreamTags = await db.dreamTag.findMany({
    where: {
      dreamEntry: {
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
    },
    include: {
      tag: true,
      dreamEntry: { select: { capturedAt: true } },
    },
  })

  const symbolMap = new Map<string, { count: number; lastSeen: Date }>()
  
  dreamTags.forEach(({ tag, dreamEntry }) => {
    const existing = symbolMap.get(tag.name)
    symbolMap.set(tag.name, {
      count: (existing?.count ?? 0) + 1,
      lastSeen: existing?.lastSeen && existing.lastSeen > dreamEntry.capturedAt 
        ? existing.lastSeen 
        : dreamEntry.capturedAt,
    })
  })

  const topSymbols: SymbolFrequency[] = Array.from(symbolMap.entries())
    .map(([symbol, data]) => ({ symbol, ...data }))
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



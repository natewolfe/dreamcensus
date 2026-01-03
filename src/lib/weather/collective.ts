import { db } from '../db'
import type { CollectiveWeatherData, EmotionDistribution, SymbolFrequency } from './types'

/**
 * Compute collective weather from aggregated data
 * Only returns data if sample size >= 50 (differential privacy)
 */
export async function computeCollectiveWeather(
  timeRange: '7d' | '30d' | '90d' = '30d'
): Promise<CollectiveWeatherData | null> {
  const now = new Date()
  const startDate = getStartDate(now, timeRange)

  // Get aggregate data
  const aggregate = await db.weatherAggregate.findFirst({
    where: {
      period: timeRange,
      computedAt: { gte: startDate },
    },
    orderBy: { computedAt: 'desc' },
  })

  if (!aggregate) {
    // No aggregate computed yet
    return null
  }

  const data = aggregate.value as any

  // Enforce minimum sample size for privacy
  if (data.sampleSize < 50) {
    return null
  }

  return {
    timeRange,
    sampleSize: data.sampleSize,
    emotions: data.emotions ?? [],
    topSymbols: data.topSymbols ?? [],
    avgVividness: data.avgVividness ?? 50,
    lucidPercentage: data.lucidPercentage ?? 0,
    updatedAt: aggregate.computedAt,
  }
}

/**
 * Compute collective weather aggregate (run as background job)
 * This would be called by a cron job or queue worker
 */
export async function computeCollectiveAggregate(
  timeRange: '7d' | '30d' | '90d'
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

function getStartDate(now: Date, timeRange: '7d' | '30d' | '90d'): Date {
  const start = new Date(now)
  
  switch (timeRange) {
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


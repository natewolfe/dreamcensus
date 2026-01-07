import { db } from '../db'
import type { PersonalWeatherData, EmotionDistribution, SymbolFrequency, TimeRange } from './types'

/**
 * Compute personal weather for a user
 */
export async function computePersonalWeather(
  userId: string,
  timeRange: TimeRange | 'all' = '7d'
): Promise<PersonalWeatherData> {
  const now = new Date()
  const startDate = getStartDate(now, timeRange)

  // Get dreams in time range
  const dreams = await db.dreamEntry.findMany({
    where: {
      userId,
      capturedAt: timeRange !== 'all' ? { gte: startDate } : undefined,
    },
    select: {
      emotions: true,
      vividness: true,
      lucidity: true,
      tags: true,
      capturedAt: true,
    },
    orderBy: { capturedAt: 'desc' },
  })

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

  // Compute symbol frequency (from tags)
  // Tags are stored in DreamTag relation, not as JSON array
  // For now, return empty array
  // TODO: Query DreamTag relation properly
  const symbolCounts = new Map<string, { count: number; lastSeen: Date }>()

  const symbols: SymbolFrequency[] = Array.from(symbolCounts.entries())
    .map(([symbol, data]) => ({
      symbol,
      count: data.count,
      lastSeen: data.lastSeen,
    }))
    .sort((a, b) => b.count - a.count)

  // Compute average vividness
  const vividnessDreams = dreams.filter((d) => d.vividness !== null)
  const avgVividness =
    vividnessDreams.length > 0
      ? vividnessDreams.reduce((sum, d) => sum + (d.vividness ?? 0), 0) / vividnessDreams.length
      : undefined

  // Compute lucid dream stats
  const lucidDreams = dreams.filter((d) => d.lucidity === 'yes')
  const lucidPercentage =
    dreams.length > 0 ? (lucidDreams.length / dreams.length) * 100 : 0

  // Compute capture streak
  const captureStreak = await computeCaptureStreak(userId)

  return {
    userId,
    timeRange,
    dreamCount: dreams.length,
    emotions,
    symbols,
    avgVividness,
    lucidDreamCount: lucidDreams.length,
    lucidPercentage,
    captureStreak,
  }
}

/**
 * Compute current capture streak
 */
async function computeCaptureStreak(userId: string): Promise<number> {
  const dreams = await db.dreamEntry.findMany({
    where: { userId },
    select: { capturedAt: true },
    orderBy: { capturedAt: 'desc' },
    take: 365, // Check up to a year
  })

  if (dreams.length === 0) return 0

  // Get unique dates
  const dates = new Set(
    dreams.map((d) => d.capturedAt.toISOString().split('T')[0])
  )

  let streak = 0
  const today = new Date()

  // Check backwards from today
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(checkDate.getDate() - i)
    const dateStr = checkDate.toISOString().split('T')[0]

    if (dates.has(dateStr)) {
      streak++
    } else if (i > 0) {
      // Streak broken
      break
    }
  }

  return streak
}

/**
 * Get start date for time range
 */
function getStartDate(now: Date, timeRange: TimeRange | 'all'): Date {
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
    case 'all':
      start.setFullYear(2000) // Far past
      break
  }
  
  return start
}


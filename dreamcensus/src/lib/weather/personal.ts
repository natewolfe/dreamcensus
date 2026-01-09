import { db } from '../db'
import type { PersonalWeatherData, EmotionDistribution, SymbolFrequency, TimeRange } from './types'
import { getStartDate, computeEmotionDistribution, computeSymbolFrequency } from './utils'
import { computeStreak } from '../streak'

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
  const emotions = computeEmotionDistribution(dreams)

  // Compute symbol frequency (from tags)
  const symbols = await computeSymbolFrequency(userId, timeRange !== 'all' ? startDate : undefined)

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
  const captureStreak = await computeStreak(userId)

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




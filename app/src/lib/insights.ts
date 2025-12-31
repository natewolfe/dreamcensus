/**
 * Personal and collective insights calculations
 */

import { db } from './db'

export interface UserStats {
  totalDreams: number
  averageClarity: number | null
  averageLucidity: number | null
  lucidDreamCount: number
  nightmareCount: number
  recurringDreamCount: number
  averageSleepDuration: number | null
  averageSleepQuality: number | null
  dreamsThisMonth: number
  dreamsThisWeek: number
}

export interface CollectiveStats {
  totalDreams: number
  totalDreamers: number
  averageClarity: number | null
  averageLucidity: number | null
  lucidRate: number
  nightmareRate: number
  recurringRate: number
}

export interface ComparisonStats {
  clarityPercentile: number
  lucidityPercentile: number
  frequencyPercentile: number
  topSymbolsOverlap: number
}

/**
 * Get user statistics
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  const dreams = await db.dreamEntry.findMany({
    where: { userId },
    select: {
      clarity: true,
      lucidity: true,
      isLucid: true,
      isNightmare: true,
      isRecurring: true,
      sleepDuration: true,
      sleepQuality: true,
      capturedAt: true,
    },
  })

  const totalDreams = dreams.length

  if (totalDreams === 0) {
    return {
      totalDreams: 0,
      averageClarity: null,
      averageLucidity: null,
      lucidDreamCount: 0,
      nightmareCount: 0,
      recurringDreamCount: 0,
      averageSleepDuration: null,
      averageSleepQuality: null,
      dreamsThisMonth: 0,
      dreamsThisWeek: 0,
    }
  }

  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const clarityValues = dreams.filter((d) => d.clarity !== null).map((d) => d.clarity!)
  const lucidityValues = dreams.filter((d) => d.lucidity !== null).map((d) => d.lucidity!)
  const sleepDurations = dreams.filter((d) => d.sleepDuration !== null).map((d) => d.sleepDuration!)
  const sleepQualities = dreams.filter((d) => d.sleepQuality !== null).map((d) => d.sleepQuality!)

  return {
    totalDreams,
    averageClarity: clarityValues.length > 0
      ? clarityValues.reduce((sum, v) => sum + v, 0) / clarityValues.length
      : null,
    averageLucidity: lucidityValues.length > 0
      ? lucidityValues.reduce((sum, v) => sum + v, 0) / lucidityValues.length
      : null,
    lucidDreamCount: dreams.filter((d) => d.isLucid).length,
    nightmareCount: dreams.filter((d) => d.isNightmare).length,
    recurringDreamCount: dreams.filter((d) => d.isRecurring).length,
    averageSleepDuration: sleepDurations.length > 0
      ? sleepDurations.reduce((sum, v) => sum + v, 0) / sleepDurations.length
      : null,
    averageSleepQuality: sleepQualities.length > 0
      ? sleepQualities.reduce((sum, v) => sum + v, 0) / sleepQualities.length
      : null,
    dreamsThisMonth: dreams.filter((d) => d.capturedAt > oneMonthAgo).length,
    dreamsThisWeek: dreams.filter((d) => d.capturedAt > oneWeekAgo).length,
  }
}

/**
 * Get collective statistics
 */
export async function getCollectiveStats(): Promise<CollectiveStats> {
  const [totalDreams, totalDreamers, aggregates] = await Promise.all([
    db.dreamEntry.count({ where: { isPublicAnon: true } }),
    db.user.count(),
    db.dreamEntry.aggregate({
      where: { isPublicAnon: true },
      _avg: {
        clarity: true,
        lucidity: true,
      },
      _count: {
        isLucid: true,
        isNightmare: true,
        isRecurring: true,
      },
    }),
  ])

  const lucidCount = await db.dreamEntry.count({
    where: { isPublicAnon: true, isLucid: true },
  })
  
  const nightmareCount = await db.dreamEntry.count({
    where: { isPublicAnon: true, isNightmare: true },
  })
  
  const recurringCount = await db.dreamEntry.count({
    where: { isPublicAnon: true, isRecurring: true },
  })

  return {
    totalDreams,
    totalDreamers,
    averageClarity: aggregates._avg.clarity,
    averageLucidity: aggregates._avg.lucidity,
    lucidRate: totalDreams > 0 ? lucidCount / totalDreams : 0,
    nightmareRate: totalDreams > 0 ? nightmareCount / totalDreams : 0,
    recurringRate: totalDreams > 0 ? recurringCount / totalDreams : 0,
  }
}

/**
 * Compare user statistics to collective
 */
export async function getUserVsCollective(userId: string): Promise<ComparisonStats> {
  const [userStats, collective] = await Promise.all([
    getUserStats(userId),
    getCollectiveStats(),
  ])

  // Calculate percentiles (simplified - in production, use proper percentile calculation)
  const clarityPercentile = userStats.averageClarity && collective.averageClarity
    ? Math.min(100, Math.max(0, (userStats.averageClarity / collective.averageClarity) * 50))
    : 50

  const lucidityPercentile = userStats.averageLucidity && collective.averageLucidity
    ? Math.min(100, Math.max(0, (userStats.averageLucidity / collective.averageLucidity) * 50))
    : 50

  const userLucidRate = userStats.totalDreams > 0
    ? userStats.lucidDreamCount / userStats.totalDreams
    : 0
  
  const frequencyPercentile = Math.min(100, Math.max(0, (userLucidRate / collective.lucidRate) * 50))

  return {
    clarityPercentile,
    lucidityPercentile,
    frequencyPercentile,
    topSymbolsOverlap: 0, // TODO: Implement symbol overlap calculation
  }
}


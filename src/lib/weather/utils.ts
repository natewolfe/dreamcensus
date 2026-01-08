import type { TimeRange, EmotionDistribution, SymbolFrequency } from './types'
import { db } from '../db'

/**
 * Get start date for time range
 */
export function getStartDate(now: Date, timeRange: TimeRange | 'all'): Date {
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
      start.setFullYear(2000)
      break
  }
  
  return start
}

/**
 * Compute emotion distribution from dreams
 */
export function computeEmotionDistribution(
  dreams: Array<{ emotions: string[] }>
): EmotionDistribution[] {
  const emotionCounts = new Map<string, number>()
  let totalEmotions = 0

  dreams.forEach((dream) => {
    const emotions = dream.emotions as string[]
    emotions.forEach((emotion) => {
      emotionCounts.set(emotion, (emotionCounts.get(emotion) ?? 0) + 1)
      totalEmotions++
    })
  })

  return Array.from(emotionCounts.entries())
    .map(([emotion, count]) => ({
      emotion,
      count,
      percentage: totalEmotions > 0 ? (count / totalEmotions) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Compute symbol frequency from dream tags
 */
export async function computeSymbolFrequency(
  userId: string,
  startDate?: Date
): Promise<SymbolFrequency[]> {
  const dreamTags = await db.dreamTag.findMany({
    where: {
      dreamEntry: {
        userId,
        capturedAt: startDate ? { gte: startDate } : undefined,
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

  return Array.from(symbolMap.entries())
    .map(([symbol, data]) => ({ symbol, ...data }))
    .sort((a, b) => b.count - a.count)
}

'use server'

import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { getStreak } from '../today/actions'
import type { ActionResult } from '@/lib/actions'

/**
 * Get user insights statistics
 */
export async function getInsightsStats(): Promise<ActionResult<{
  dreamCount: number
  streak: number
  censusProgress: number
}>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get dream count
    const dreamCount = await db.dreamEntry.count({
      where: { userId: session.userId },
    })

    // Get streak
    const streak = await getStreak()

    // Get census progress
    const totalQuestions = await db.censusQuestion.count()
    const answeredQuestions = await db.censusAnswer.count({
      where: { userId: session.userId },
    })

    const censusProgress = totalQuestions > 0
      ? Math.round((answeredQuestions / totalQuestions) * 100)
      : 0

    return {
      success: true,
      data: {
        dreamCount,
        streak,
        censusProgress,
      },
    }
  } catch (error) {
    console.error('getInsightsStats error:', error)
    return { success: false, error: 'Failed to load insights' }
  }
}

/**
 * Get dream entities for constellation view
 */
export async function getDreamEntities(): Promise<ActionResult<Array<{
  id: string
  label: string
  frequency: number
  lastSeen: Date
  type: 'emotion' | 'tag' | 'theme'
}>>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get emotion frequencies
    const dreams = await db.dreamEntry.findMany({
      where: { userId: session.userId },
      select: {
        emotions: true,
        capturedAt: true,
      },
      orderBy: { capturedAt: 'desc' },
      take: 100, // Last 100 dreams
    })

    const emotionMap = new Map<string, { count: number; lastSeen: Date }>()

    dreams.forEach((dream) => {
      dream.emotions.forEach((emotion) => {
        const existing = emotionMap.get(emotion)
        if (!existing || dream.capturedAt > existing.lastSeen) {
          emotionMap.set(emotion, {
            count: (existing?.count ?? 0) + 1,
            lastSeen: dream.capturedAt,
          })
        }
      })
    })

    const entities = Array.from(emotionMap.entries()).map(([label, data]) => ({
      id: `emotion-${label}`,
      label,
      frequency: data.count,
      lastSeen: data.lastSeen,
      type: 'emotion' as const,
    }))

    return {
      success: true,
      data: entities,
    }
  } catch (error) {
    console.error('getDreamEntities error:', error)
    return { success: false, error: 'Failed to load entities' }
  }
}


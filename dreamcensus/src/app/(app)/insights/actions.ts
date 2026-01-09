'use server'

import { db } from '@/lib/db'
import { getStreak } from '../today/actions'
import { withAuth, type ActionResult } from '@/lib/actions'

/**
 * Get user insights statistics
 */
export async function getInsightsStats(): Promise<ActionResult<{
  dreamCount: number
  streak: number
  censusProgress: number
}>> {
  return withAuth(async (session) => {
    try {
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
  })
}


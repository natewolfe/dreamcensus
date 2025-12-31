/**
 * Stream-related utilities
 */

import { db } from './db'

/**
 * Get stream statistics for a user
 */
export async function getStreamStats(userId?: string) {
  if (!userId) {
    // Return empty stats if no user provided
    return {
      total: 0,
      yesCount: 0,
      noCount: 0,
      withTextCount: 0,
      expandRate: 0,
    }
  }

  const [total, yesCount, noCount, withTextCount] = await Promise.all([
    db.streamResponse.count({
      where: { userId },
    }),
    db.streamResponse.count({
      where: { userId, response: 'yes' },
    }),
    db.streamResponse.count({
      where: { userId, response: 'no' },
    }),
    db.streamResponse.count({
      where: {
        userId,
        expandedText: { not: null },
      },
    }),
  ])

  return {
    total,
    yesCount,
    noCount,
    withTextCount,
    expandRate: total > 0 ? (withTextCount / total) * 100 : 0,
  }
}


import { db } from './db'

/**
 * Compute capture streak for a user
 * Counts consecutive days with at least one dream entry
 * 
 * @param userId - User ID to compute streak for
 * @returns Number of consecutive days with dreams (0 if no dreams or streak broken)
 */
export async function computeStreak(userId: string): Promise<number> {
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
      // Streak broken (allow today to be empty on day 0)
      break
    }
  }

  return streak
}

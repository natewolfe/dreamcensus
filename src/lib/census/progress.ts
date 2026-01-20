import { db } from '../db'

export interface CensusProgressSummary {
  answered: number
  total: number
  percentage: number
}

export async function getCensusProgressSummary(userId: string): Promise<CensusProgressSummary> {
  const progress = await db.censusProgress.findUnique({
    where: { userId },
    select: { totalCompleted: true, totalQuestions: true },
  })

  if (!progress || progress.totalQuestions === 0) {
    return { answered: 0, total: 0, percentage: 0 }
  }

  return {
    answered: progress.totalCompleted,
    total: progress.totalQuestions,
    percentage: Math.round((progress.totalCompleted / progress.totalQuestions) * 100),
  }
}

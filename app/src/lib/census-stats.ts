import type { CensusChapterData } from './chapters'

/**
 * Calculate a gamified "Dream Awareness Score" based on progress
 * Score ranges from 0-100 based on completion percentage
 */
export function calculateDreamScore(completedChapters: number, totalChapters: number = 8): number {
  if (totalChapters === 0) return 0
  const baseScore = Math.round((completedChapters / totalChapters) * 100)
  
  // Add bonus points for milestones
  let bonus = 0
  if (completedChapters >= 1) bonus += 5 // Threshold crossed
  if (completedChapters >= 4) bonus += 10 // Halfway
  if (completedChapters === totalChapters) bonus += 15 // Complete
  
  return Math.min(100, baseScore + bonus)
}

/**
 * Calculate how many "insights" the user has unlocked
 * Insights are unlocked at certain completion thresholds
 */
export function calculateInsightsUnlocked(chapters: CensusChapterData[]): number {
  const totalSteps = chapters.reduce((sum, ch) => sum + ch.stepCount, 0)
  const answeredSteps = chapters.reduce((sum, ch) => sum + ch.answeredCount, 0)
  
  if (totalSteps === 0) return 0
  
  const percentComplete = (answeredSteps / totalSteps) * 100
  
  // Unlock insights at milestones
  let insights = 0
  if (percentComplete >= 10) insights++ // Dream frequency patterns
  if (percentComplete >= 25) insights++ // Sleep habits analysis
  if (percentComplete >= 40) insights++ // Dream content themes
  if (percentComplete >= 60) insights++ // Lucidity indicators
  if (percentComplete >= 75) insights++ // Emotional landscape
  if (percentComplete >= 90) insights++ // Complete dream profile
  if (percentComplete === 100) insights++ // Bonus insight
  
  return insights
}

/**
 * Calculate total time invested in minutes
 */
export function calculateTimeInvested(chapters: CensusChapterData[]): number {
  return chapters.reduce((sum, chapter) => {
    // Calculate proportion of chapter completed
    const proportion = chapter.stepCount > 0 
      ? chapter.answeredCount / chapter.stepCount 
      : 0
    return sum + Math.round(chapter.estimatedMinutes * proportion)
  }, 0)
}

/**
 * Determine the recommended next chapter for the user
 * Returns the first incomplete, unlocked chapter
 */
export function getRecommendedChapter(chapters: CensusChapterData[]): CensusChapterData | null {
  // First, find chapters that are started but not complete
  const inProgress = chapters.find(
    ch => !ch.isComplete && !ch.isLocked && ch.answeredCount > 0
  )
  if (inProgress) return inProgress
  
  // Otherwise, return first incomplete unlocked chapter
  return chapters.find(ch => !ch.isComplete && !ch.isLocked) || null
}

/**
 * Format progress in a human-friendly way
 */
export function formatProgressLabel(count: number, total: number): string {
  if (count === 0) return 'Not started'
  if (count === total) return 'Complete'
  return `${count} of ${total}`
}

/**
 * Get a motivational message based on progress
 */
export function getMotivationalMessage(completedChapters: number, totalChapters: number): string {
  const percent = (completedChapters / totalChapters) * 100
  
  if (percent === 0) return "Begin your journey into the realm of dreams"
  if (percent < 25) return "You've taken the first step"
  if (percent < 50) return "Your dream profile is taking shape"
  if (percent < 75) return "You're more than halfway there"
  if (percent < 100) return "Almost complete—your insights await"
  return "You've mapped your entire dream landscape"
}


import type { CensusChapterData } from './chapters'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  condition: (progress: AchievementProgress) => boolean
}

export interface AchievementProgress {
  completedChapters: string[] // chapter slugs
  totalChapters: number
  extendedResponses: number
  totalTimeMinutes: number
  estimatedTimeMinutes: number
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'threshold_crossed',
    name: 'Threshold Crossed',
    description: 'Completed the opening chapter',
    icon: '🚪',
    condition: (progress) => progress.completedChapters.includes('threshold')
  },
  {
    id: 'lucid_explorer',
    name: 'Lucid Explorer',
    description: 'Explored the realm of conscious dreaming',
    icon: '💡',
    condition: (progress) => progress.completedChapters.includes('lucidity')
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Completed the dreaming chapter',
    icon: '🦉',
    condition: (progress) => progress.completedChapters.includes('dreaming')
  },
  {
    id: 'pattern_seeker',
    name: 'Pattern Seeker',
    description: 'Explored recurring themes and symbols',
    icon: '🔄',
    condition: (progress) => progress.completedChapters.includes('patterns')
  },
  {
    id: 'emotional_navigator',
    name: 'Emotional Navigator',
    description: 'Mapped your emotional dream landscape',
    icon: '❤️',
    condition: (progress) => progress.completedChapters.includes('emotions')
  },
  {
    id: 'deep_diver',
    name: 'Deep Diver',
    description: 'Wrote extended responses on 5+ questions',
    icon: '🌊',
    condition: (progress) => progress.extendedResponses >= 5
  },
  {
    id: 'quick_thinker',
    name: 'Quick Thinker',
    description: 'Completed a chapter faster than estimated',
    icon: '⚡',
    condition: (progress) => 
      progress.totalTimeMinutes > 0 && 
      progress.totalTimeMinutes < progress.estimatedTimeMinutes * 0.8
  },
  {
    id: 'halfway_there',
    name: 'Halfway There',
    description: 'Completed 4 or more chapters',
    icon: '🌓',
    condition: (progress) => progress.completedChapters.length >= 4
  },
  {
    id: 'dream_master',
    name: 'Dream Master',
    description: 'Completed all 8 chapters',
    icon: '🌟',
    condition: (progress) => 
      progress.completedChapters.length === progress.totalChapters
  },
]

/**
 * Check which achievements a user has unlocked
 */
export function checkAchievements(progress: AchievementProgress): Achievement[] {
  return ACHIEVEMENTS.filter(achievement => achievement.condition(progress))
}

/**
 * Get newly unlocked achievements by comparing before and after states
 */
export function getNewlyUnlocked(
  before: Achievement[],
  after: Achievement[]
): Achievement[] {
  const beforeIds = new Set(before.map(a => a.id))
  return after.filter(a => !beforeIds.has(a.id))
}

/**
 * Calculate achievement progress from chapters data
 */
export function calculateAchievementProgress(
  chapters: CensusChapterData[],
  extendedResponses: number = 0,
  actualTimeMinutes: number = 0
): AchievementProgress {
  const completedChapters = chapters
    .filter(ch => ch.isComplete)
    .map(ch => ch.slug)
  
  const estimatedTimeMinutes = chapters
    .filter(ch => ch.isComplete)
    .reduce((sum, ch) => sum + ch.estimatedMinutes, 0)

  return {
    completedChapters,
    totalChapters: chapters.length,
    extendedResponses,
    totalTimeMinutes: actualTimeMinutes,
    estimatedTimeMinutes,
  }
}

/**
 * Get locked achievements (not yet unlocked)
 */
export function getLockedAchievements(unlockedAchievements: Achievement[]): Achievement[] {
  const unlockedIds = new Set(unlockedAchievements.map(a => a.id))
  return ACHIEVEMENTS.filter(a => !unlockedIds.has(a.id))
}


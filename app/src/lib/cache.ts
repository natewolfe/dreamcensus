/**
 * Cache utilities with tagging support for Next.js 15+
 */

import { unstable_cache, revalidateTag } from 'next/cache'
import { SCHEMA_VERSION } from './constants'

/**
 * Cache tags for fine-grained invalidation
 */
export const CacheTags = {
  // Census-related
  CENSUS_STEPS: 'census-steps',
  CENSUS_CHAPTERS: 'census-chapters',
  CENSUS_PROGRESS: (userId: string) => `census-progress-${userId}`,
  CENSUS_VERSION: (version: number) => `census-v${version}`,
  
  // Stream-related
  STREAM_QUESTIONS: 'stream-questions',
  STREAM_RESPONSES: (userId: string) => `stream-responses-${userId}`,
  
  // User-related
  USER_PROFILE: (userId: string) => `user-${userId}`,
  USER_SESSION: (sessionId: string) => `session-${sessionId}`,
} as const

/**
 * Cached census steps with automatic tagging
 */
export function getCachedCensusSteps() {
  return unstable_cache(
    async () => {
      const { getCensusSteps } = await import('./census')
      return getCensusSteps()
    },
    ['census-steps'],
    {
      tags: [
        CacheTags.CENSUS_STEPS,
        CacheTags.CENSUS_VERSION(SCHEMA_VERSION),
      ],
      revalidate: 3600, // 1 hour
    }
  )()
}

/**
 * Cached chapters with progress
 */
export function getCachedChaptersWithProgress(userId: string) {
  return unstable_cache(
    async () => {
      const { getChaptersWithProgress } = await import('./chapters')
      return getChaptersWithProgress(userId)
    },
    [`chapters-progress-${userId}`],
    {
      tags: [
        CacheTags.CENSUS_CHAPTERS,
        CacheTags.CENSUS_PROGRESS(userId),
        CacheTags.CENSUS_VERSION(SCHEMA_VERSION),
      ],
      revalidate: 300, // 5 minutes
    }
  )()
}

/**
 * Invalidate census-related caches
 */
export function invalidateCensusCache(userId?: string) {
  revalidateTag(CacheTags.CENSUS_STEPS)
  revalidateTag(CacheTags.CENSUS_CHAPTERS)
  
  if (userId) {
    revalidateTag(CacheTags.CENSUS_PROGRESS(userId))
  }
}

/**
 * Invalidate stream-related caches
 */
export function invalidateStreamCache(userId?: string) {
  revalidateTag(CacheTags.STREAM_QUESTIONS)
  
  if (userId) {
    revalidateTag(CacheTags.STREAM_RESPONSES(userId))
  }
}

/**
 * Invalidate user-related caches
 */
export function invalidateUserCache(userId: string) {
  revalidateTag(CacheTags.USER_PROFILE(userId))
  invalidateCensusCache(userId)
  invalidateStreamCache(userId)
}


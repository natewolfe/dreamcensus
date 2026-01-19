/**
 * Barrel export for shared action utilities
 */

export type { ActionResult } from './types'
export { getTodayRange } from './types'
export { withAuth, requireAuth } from './auth'

// Re-export dream actions for unified access
export { deleteDreamEntry } from '@/app/(app)/today/actions'
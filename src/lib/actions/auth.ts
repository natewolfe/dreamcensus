import { getSession, type Session } from '@/lib/auth'
import type { ActionResult } from './types'

/**
 * Wrap a server action with authentication check
 * Eliminates repetitive auth guard pattern across all action files
 * 
 * @example
 * export async function getDreams(): Promise<ActionResult<Dreams>> {
 *   return withAuth(async (session) => {
 *     const dreams = await db.dreamEntry.findMany({
 *       where: { userId: session.userId }
 *     })
 *     return { success: true, data: dreams }
 *   })
 * }
 */
export async function withAuth<T>(
  handler: (session: Session) => Promise<ActionResult<T>>
): Promise<ActionResult<T>> {
  const session = await getSession()
  if (!session) {
    return { success: false, error: 'Not authenticated' }
  }
  return handler(session)
}

/**
 * Require auth and return session or throw (for non-ActionResult functions)
 * Use this for utility functions that don't return ActionResult
 */
export async function requireAuth(): Promise<Session> {
  const session = await getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }
  return session
}

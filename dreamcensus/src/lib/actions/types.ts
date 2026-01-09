/**
 * Shared types for server actions
 */

/**
 * Standard result type for all server actions
 * Ensures consistent error handling across the application
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Get today's date range (midnight to midnight)
 * Useful for filtering queries by "today"
 */
export function getTodayRange(): { start: Date; end: Date } {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start, end }
}

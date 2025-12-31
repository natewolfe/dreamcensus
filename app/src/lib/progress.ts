/**
 * Progress calculation utilities
 */

/**
 * Calculate progress percentage
 * @param completed Number of completed items
 * @param total Total number of items
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(completed: number, total: number): number {
  return total > 0 ? Math.round((completed / total) * 100) : 0
}

/**
 * Format progress as a readable string
 * @param completed Number of completed items
 * @param total Total number of items
 * @returns Formatted string like "5 of 10"
 */
export function formatProgress(completed: number, total: number): string {
  return `${completed} of ${total}`
}


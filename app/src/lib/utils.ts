/**
 * Utility functions for Dream Census
 */

/**
 * Safely parse JSON with fallback value
 * Prevents crashes from corrupted database data
 */
export function safeParseJSON<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T
  } catch (e) {
    console.error('[JSON Parse Error]', { json, error: e })
    return fallback
  }
}


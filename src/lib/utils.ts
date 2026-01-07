import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with proper precedence
 * Combines clsx for conditional classes with tailwind-merge for conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date relative to now (e.g., "2 hours ago", "yesterday")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay === 1) return 'yesterday'
  if (diffDay < 7) return `${diffDay}d ago`

  return date.toLocaleDateString()
}

/**
 * Format a time of day (e.g., "7:32 AM")
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format a date for dream display (e.g., "Jan 3")
 */
export function formatDreamDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format a date for dream display with year (e.g., "Jan 3, 2026")
 */
export function formatDreamDateWithYear(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Get vividness label from 0-100 scale
 */
export function getVividnessLabel(vividness?: number): string | null {
  if (vividness === undefined) return null
  if (vividness < 25) return 'faint'
  if (vividness < 50) return 'hazy'
  if (vividness < 75) return 'clear'
  return 'vivid'
}

/**
 * Get number of vividness dots (0-5) from 0-100 scale
 */
export function getVividnessDots(vividness?: number): number {
  if (vividness === undefined) return 0
  return Math.ceil(vividness / 20) // 0-5 dots
}

/**
 * Get time-aware greeting
 */
export function getTimeGreeting(): string {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 17) return 'Good day'
  if (hour >= 17 && hour < 21) return 'Good evening'
  return 'Sweet dreams'
}

/**
 * Get night mode greeting
 */
export function getNightGreeting(): string {
  const hour = new Date().getHours()

  if (hour >= 18 && hour < 21) return 'Good evening'
  if (hour >= 21 && hour < 24) return 'Getting sleepy?'
  if (hour >= 0 && hour < 3) return 'Late night?'
  return 'Rest well'
}

/**
 * Debounce a function call
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Sleep for a given number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Format a countdown from now until a target time
 * @param targetISO - Target time as ISO string
 * @returns Formatted string like "7h 23m" or "23m" or null if past
 */
export function formatCountdown(targetISO: string): string | null {
  const now = new Date()
  const target = new Date(targetISO)
  
  const diffMs = target.getTime() - now.getTime()
  if (diffMs <= 0) return null
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (diffHours === 0) {
    return `${diffMins}m`
  }
  return `${diffHours}h ${diffMins}m`
}

/**
 * Get display title for a dream entry
 * Returns the dream's title if set, otherwise "Dream #X" based on chronological order
 * @param title - Optional dream title
 * @param dreamNumber - The dream's chronological position (1-indexed, oldest = 1)
 */
export function getDreamDisplayTitle(title?: string, dreamNumber?: number): string {
  if (title?.trim()) return title
  if (dreamNumber !== undefined) return `Dream #${dreamNumber}`
  return 'Untitled Dream'
}

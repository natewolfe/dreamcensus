'use server'

import { getSession } from '@/lib/auth'
import { computePersonalWeather, computeCollectiveWeather } from '@/lib/weather'
import type { PersonalWeatherData, CollectiveWeatherData } from '@/lib/weather/types'

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Get personal weather for current user
 */
export async function getPersonalWeather(
  timeRange: '7d' | '30d' | '90d' | 'all' = '30d'
): Promise<ActionResult<PersonalWeatherData>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    const weather = await computePersonalWeather(session.userId, timeRange)

    return { success: true, data: weather }
  } catch (error) {
    console.error('getPersonalWeather error:', error)
    return { success: false, error: 'Failed to compute personal weather' }
  }
}

/**
 * Get collective weather
 */
export async function getCollectiveWeather(
  timeRange: '7d' | '30d' | '90d' = '30d'
): Promise<ActionResult<CollectiveWeatherData | null>> {
  try {
    const weather = await computeCollectiveWeather(timeRange)

    return { success: true, data: weather }
  } catch (error) {
    console.error('getCollectiveWeather error:', error)
    return { success: false, error: 'Failed to fetch collective weather' }
  }
}


'use server'

import { getSession } from '@/lib/auth'
import { computePersonalWeather, computeCollectiveWeather, computeWeatherChartData } from '@/lib/weather'
import type { PersonalWeatherData, CollectiveWeatherData, DreamWeatherChartData, TimeRange } from '@/lib/weather/types'
import type { ActionResult } from '@/lib/actions'

/**
 * Get personal weather for current user
 */
export async function getPersonalWeather(
  timeRange: TimeRange | 'all' = '30d'
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
  timeRange: TimeRange = '7d'
): Promise<ActionResult<CollectiveWeatherData | null>> {
  try {
    const weather = await computeCollectiveWeather(timeRange)

    return { success: true, data: weather }
  } catch (error) {
    console.error('getCollectiveWeather error:', error)
    return { success: false, error: 'Failed to fetch collective weather' }
  }
}

/**
 * Get dream weather chart data (time-series sentiment)
 */
export async function getWeatherChart(
  timeRange: TimeRange = '7d'
): Promise<ActionResult<DreamWeatherChartData | null>> {
  try {
    const data = await computeWeatherChartData(timeRange)

    return { success: true, data }
  } catch (error) {
    console.error('getWeatherChart error:', error)
    return { success: false, error: 'Failed to compute weather chart' }
  }
}


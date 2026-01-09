/**
 * Dream Weather Chart Data Computation
 * 
 * Aggregates dream sentiment over time into hourly buckets for visualization
 * Adapted from legacy aggregates.ts for v2 data model
 */

import { db } from '../db'
import { getEmotionValence } from './emotion-valence'
import type { 
  DreamWeatherChartData, 
  DreamWeatherPoint, 
  WeatherCondition, 
  WeatherTrend,
  TimeRange
} from './types'

// Map TimeRange to hours
const TIMERANGE_TO_HOURS: Record<TimeRange, number> = {
  '1d': 24,
  '3d': 72,
  '7d': 168,
  '30d': 720,
  '90d': 2160,
}

// Bucket granularity (in hours) based on time range
// Adaptive bucketing keeps visualization readable at all scales
const BUCKET_HOURS: Record<TimeRange, number> = {
  '1d': 1,    // hourly buckets for 1 day
  '3d': 1,    // hourly buckets for 3 days
  '7d': 4,    // 4-hour blocks for 7 days
  '30d': 24,  // daily buckets for 30 days
  '90d': 24,  // daily buckets for 90 days
}

/**
 * Compute weather chart data for collective dreams
 * 
 * @param timeRange - Time range to look back ('1d', '3d', '7d', '30d', '90d')
 * @returns Chart data or null if insufficient data
 */
export async function computeWeatherChartData(
  timeRange: TimeRange = '7d'
): Promise<DreamWeatherChartData | null> {
  const hours = TIMERANGE_TO_HOURS[timeRange]
  const bucketSize = BUCKET_HOURS[timeRange]
  const since = new Date(Date.now() - hours * 60 * 60 * 1000)
  
  // Fetch dreams with commons consent
  const dreams = await db.dreamEntry.findMany({
    where: {
      capturedAt: { gte: since },
      user: {
        consents: {
          some: {
            scope: 'commons',
            granted: true,
          },
        },
      },
    },
    select: {
      emotions: true,
      vividness: true,
      dreamTypes: true,
      capturedAt: true,
    },
    orderBy: { capturedAt: 'asc' },
  })
  
  // Need minimum data for meaningful chart
  if (dreams.length < 3) {
    return null
  }
  
  // Bucket dreams with adaptive granularity
  const buckets = new Map<string, DreamWeatherPoint>()
  const bucketMs = bucketSize * 60 * 60 * 1000 // Convert bucket size to milliseconds
  
  for (const dream of dreams) {
    // Create bucket key based on adaptive granularity
    const timestamp = dream.capturedAt.getTime()
    const bucketStart = new Date(Math.floor(timestamp / bucketMs) * bucketMs)
    const bucketKey = bucketStart.toISOString()
    
    if (!buckets.has(bucketKey)) {
      buckets.set(bucketKey, {
        timestamp: bucketKey,
        hour: bucketStart.getHours(),
        avgValence: 0,
        avgIntensity: 0,
        dreamCount: 0,
        nightmareRate: 0,
        lucidRate: 0,
        recurringRate: 0,
      })
    }
    
    const bucket = buckets.get(bucketKey)!
    const emotions = dream.emotions as string[]
    const dreamTypes = dream.dreamTypes as string[]
    
    // Compute valence from emotions
    const valences = emotions.map(getEmotionValence)
    const avgEmotionValence = valences.length > 0
      ? valences.reduce((a, b) => a + b, 0) / valences.length
      : 0
    
    // Check dream types
    const isNightmare = dreamTypes.includes('nightmare')
    const isLucid = dreamTypes.includes('lucid')
    const isRecurring = dreamTypes.includes('recurring')
    const dreamValence = isNightmare ? -0.8 : avgEmotionValence
    
    // Map vividness (0-100) to intensity (0-1)
    const dreamIntensity = (dream.vividness ?? 50) / 100
    
    // Update running averages
    const n = bucket.dreamCount
    bucket.avgValence = (bucket.avgValence * n + dreamValence) / (n + 1)
    bucket.avgIntensity = (bucket.avgIntensity * n + dreamIntensity) / (n + 1)
    bucket.nightmareRate = (bucket.nightmareRate * n + (isNightmare ? 1 : 0)) / (n + 1)
    bucket.lucidRate = (bucket.lucidRate * n + (isLucid ? 1 : 0)) / (n + 1)
    bucket.recurringRate = (bucket.recurringRate * n + (isRecurring ? 1 : 0)) / (n + 1)
    bucket.dreamCount++
  }
  
  // Convert to sorted array
  const points = Array.from(buckets.values()).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
  
  // Compute current weather state from recent 6 hours
  const recent6h = points.slice(-6)
  const currentValence = recent6h.length > 0
    ? recent6h.reduce((sum, p) => sum + p.avgValence, 0) / recent6h.length
    : 0
  const currentIntensity = recent6h.length > 0
    ? recent6h.reduce((sum, p) => sum + p.avgIntensity, 0) / recent6h.length
    : 0.5
  
  // Determine trend by comparing recent 6h to prior 6h
  const older6h = points.slice(-12, -6)
  const olderValence = older6h.length > 0
    ? older6h.reduce((sum, p) => sum + p.avgValence, 0) / older6h.length
    : currentValence
  
  const trend: WeatherTrend = 
    currentValence > olderValence + 0.1 ? 'rising' :
    currentValence < olderValence - 0.1 ? 'falling' : 
    'stable'
  
  // Map valence to weather condition
  const condition: WeatherCondition =
    currentValence < -0.4 ? 'stormy' :
    currentValence < -0.1 ? 'cloudy' :
    currentValence < 0.2 ? 'calm' :
    currentValence < 0.5 ? 'pleasant' : 
    'radiant'
  
  return {
    points,
    current: {
      condition,
      valence: currentValence,
      intensity: currentIntensity,
      trend,
    },
    totalDreams: dreams.length,
    timeRange,
  }
}


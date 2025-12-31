/**
 * Aggregate statistics calculations for Data Explorer
 */

import { db } from '../db'

export interface DreamWeatherPoint {
  timestamp: string  // ISO string for JSON serialization
  hour: number
  avgValence: number      // -1 to 1 (negative to positive)
  avgIntensity: number    // 0 to 1 (calm to intense)
  dreamCount: number
  nightmareRate: number   // 0 to 1
}

export interface DreamWeatherData {
  points: DreamWeatherPoint[]
  current: {
    condition: 'stormy' | 'cloudy' | 'calm' | 'pleasant' | 'radiant'
    valence: number
    intensity: number
    trend: 'rising' | 'falling' | 'stable'
  }
}

export interface AggregateStatsData {
  totalDreams: number
  totalDreamers: number
  averageClarity: number
  lucidRate: number
  nightmareRate: number
  emotionDistribution: Array<{ emotion: string; count: number }>
  symbolFrequency: Array<{ symbol: string; count: number }>
  temporalPatterns: Array<{ hour: number; count: number }>
  dreamWeather: DreamWeatherData
}

/**
 * Calculate and cache aggregate statistics
 */
export async function calculateAggregateStats(): Promise<void> {
  console.log('Calculating aggregate statistics...')

  try {
    // Total counts
    const totalDreams = await db.dreamEntry.count({
      where: { isPublicAnon: true },
    })

    const totalDreamers = await db.user.count()

    // Average metrics
    const averages = await db.dreamEntry.aggregate({
      where: { isPublicAnon: true, clarity: { not: null } },
      _avg: { clarity: true, lucidity: true },
    })

    // Rates
    // A dream is considered "lucid" if lucidity rating is >= 3 (moderate awareness)
    const lucidCount = await db.dreamEntry.count({
      where: { isPublicAnon: true, lucidity: { gte: 3 } },
    })
    
    const nightmareCount = await db.dreamEntry.count({
      where: { isPublicAnon: true, isNightmare: true },
    })

    // Emotion distribution
    const emotionData = await db.dreamEntryEmotion.groupBy({
      by: ['emotionId'],
      _count: true,
      take: 20,
      orderBy: { _count: { emotionId: 'desc' } },
    })

    const emotions = await db.emotion.findMany({
      where: { id: { in: emotionData.map((e) => e.emotionId) } },
    })

    const emotionDistribution = emotionData.map((e) => {
      const emotion = emotions.find((em) => em.id === e.emotionId)
      return {
        emotion: emotion?.name || 'Unknown',
        count: e._count,
      }
    })

    // Symbol frequency
    const symbolData = await db.dreamEntrySymbol.groupBy({
      by: ['symbolId'],
      _count: true,
      take: 30,
      orderBy: { _count: { symbolId: 'desc' } },
    })

    const symbols = await db.symbol.findMany({
      where: { id: { in: symbolData.map((s) => s.symbolId) } },
    })

    const symbolFrequency = symbolData.map((s) => {
      const symbol = symbols.find((sym) => sym.id === s.symbolId)
      return {
        symbol: symbol?.name || 'Unknown',
        count: s._count,
      }
    })

    // Temporal patterns (mock data for now)
    const temporalPatterns = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: Math.floor(Math.random() * 100), // TODO: Implement real temporal analysis
    }))

    // Dream Weather - last 72 hours
    const since72h = new Date(Date.now() - 72 * 60 * 60 * 1000)
    const recentDreams = await db.dreamEntry.findMany({
      where: {
        isPublicAnon: true,
        capturedAt: { gte: since72h },
      },
      include: {
        emotions: {
          include: { emotion: true }
        }
      },
      orderBy: { capturedAt: 'asc' }
    })

    // Group by hour
    const weatherBuckets = new Map<string, DreamWeatherPoint>()

    for (const dream of recentDreams) {
      const hourKey = new Date(dream.capturedAt).toISOString().slice(0, 13) // YYYY-MM-DDTHH
      
      if (!weatherBuckets.has(hourKey)) {
        weatherBuckets.set(hourKey, {
          timestamp: new Date(hourKey + ':00:00Z').toISOString(),
          hour: new Date(hourKey + ':00:00Z').getHours(),
          avgValence: 0,
          avgIntensity: 0,
          dreamCount: 0,
          nightmareRate: 0,
        })
      }
      
      const bucket = weatherBuckets.get(hourKey)!
      
      // Calculate valence from emotions
      const emotionValences = dream.emotions
        .filter(e => e.emotion.valence !== null)
        .map(e => (e.emotion.valence ?? 0) * e.intensity)
      
      const avgEmotionValence = emotionValences.length > 0
        ? emotionValences.reduce((a, b) => a + b, 0) / emotionValences.length
        : 0
      
      const dreamValence = dream.isNightmare ? -0.8 : avgEmotionValence
      const dreamIntensity = (dream.emotional ?? 3) / 5
      
      // Running average
      const prevCount = bucket.dreamCount
      bucket.avgValence = (bucket.avgValence * prevCount + dreamValence) / (prevCount + 1)
      bucket.avgIntensity = (bucket.avgIntensity * prevCount + dreamIntensity) / (prevCount + 1)
      bucket.nightmareRate = (bucket.nightmareRate * prevCount + (dream.isNightmare ? 1 : 0)) / (prevCount + 1)
      bucket.dreamCount++
    }

    const weatherPoints = Array.from(weatherBuckets.values()).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    // Calculate current condition
    const recent6h = weatherPoints.slice(-6)
    const currentValence = recent6h.length > 0
      ? recent6h.reduce((sum, p) => sum + p.avgValence, 0) / recent6h.length
      : 0
    const currentIntensity = recent6h.length > 0
      ? recent6h.reduce((sum, p) => sum + p.avgIntensity, 0) / recent6h.length
      : 0.5

    // Determine trend
    const older6h = weatherPoints.slice(-12, -6)
    const olderValence = older6h.length > 0
      ? older6h.reduce((sum, p) => sum + p.avgValence, 0) / older6h.length
      : currentValence

    const trend = currentValence > olderValence + 0.1 
      ? 'rising' 
      : currentValence < olderValence - 0.1 
        ? 'falling' 
        : 'stable'

    // Map to weather condition
    let condition: DreamWeatherData['current']['condition']
    if (currentValence < -0.4) condition = 'stormy'
    else if (currentValence < -0.1) condition = 'cloudy'
    else if (currentValence < 0.2) condition = 'calm'
    else if (currentValence < 0.5) condition = 'pleasant'
    else condition = 'radiant'

    const dreamWeather: DreamWeatherData = {
      points: weatherPoints,
      current: { condition, valence: currentValence, intensity: currentIntensity, trend }
    }

    // Store in cache
    const statsData: AggregateStatsData = {
      totalDreams,
      totalDreamers,
      averageClarity: averages._avg.clarity || 0,
      lucidRate: totalDreams > 0 ? lucidCount / totalDreams : 0,
      nightmareRate: totalDreams > 0 ? nightmareCount / totalDreams : 0,
      emotionDistribution,
      symbolFrequency,
      temporalPatterns,
      dreamWeather,
    }

    await db.aggregateStats.upsert({
      where: { statKey: 'global_stats' },
      update: {
        statValue: statsData,
        lastUpdated: new Date(),
      },
      create: {
        statKey: 'global_stats',
        statValue: statsData,
      },
    })

    console.log('✅ Aggregate statistics updated')
  } catch (error) {
    console.error('Error calculating aggregate stats:', error)
    throw error
  }
}

/**
 * Get cached aggregate statistics
 */
export async function getAggregateStats(): Promise<AggregateStatsData | null> {
  const cached = await db.aggregateStats.findUnique({
    where: { statKey: 'global_stats' },
  })

  if (!cached) {
    // Calculate if not cached
    await calculateAggregateStats()
    return getAggregateStats()
  }

  return cached.statValue as AggregateStatsData
}

/**
 * Get total dream count
 */
export async function getTotalDreamCount(): Promise<number> {
  return db.dreamEntry.count({ where: { isPublicAnon: true } })
}

/**
 * Get emotion distribution
 */
export async function getEmotionDistribution(): Promise<Array<{ name: string; count: number; valence?: number }>> {
  const data = await db.dreamEntryEmotion.groupBy({
    by: ['emotionId'],
    _count: true,
    orderBy: { _count: { emotionId: 'desc' } },
    take: 20,
  })

  const emotions = await db.emotion.findMany({
    where: { id: { in: data.map((e) => e.emotionId) } },
  })

  return data.map((e) => {
    const emotion = emotions.find((em) => em.id === e.emotionId)
    return {
      name: emotion?.name || 'Unknown',
      count: e._count,
      valence: emotion?.valence || undefined,
    }
  })
}

/**
 * Get symbol frequency
 */
export async function getSymbolFrequency(): Promise<Array<{ name: string; count: number }>> {
  const data = await db.dreamEntrySymbol.groupBy({
    by: ['symbolId'],
    _count: true,
    orderBy: { _count: { symbolId: 'desc' } },
    take: 50,
  })

  const symbols = await db.symbol.findMany({
    where: { id: { in: data.map((s) => s.symbolId) } },
  })

  return data.map((s) => {
    const symbol = symbols.find((sym) => sym.id === s.symbolId)
    return {
      name: symbol?.name || 'Unknown',
      count: s._count,
    }
  })
}


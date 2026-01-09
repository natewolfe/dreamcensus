// Weather System Types

// Unified time range for all weather data
export type TimeRange = '1d' | '3d' | '7d' | '30d' | '90d'

export interface EmotionDistribution {
  emotion: string
  count: number
  percentage: number
}

export interface SymbolFrequency {
  symbol: string
  count: number
  lastSeen: Date
}

export interface PersonalWeatherData {
  userId: string
  timeRange: TimeRange | 'all'
  dreamCount: number
  emotions: EmotionDistribution[]
  symbols: SymbolFrequency[]
  avgVividness?: number
  lucidDreamCount: number
  lucidPercentage: number
  captureStreak: number
}

export interface CollectiveWeatherData {
  timeRange: TimeRange
  sampleSize: number
  dreamCount: number
  emotions: EmotionDistribution[]
  topSymbols: SymbolFrequency[]
  avgVividness: number
  lucidPercentage: number
  nightmareRate: number
  recurringRate: number
  updatedAt: Date
  
  // Community pulse metrics
  dreamerCount: number        // Unique users with dreams in period
  dreamsToday: number         // Dreams captured in last 24h
  trendingEmotion: string     // Most common emotion
}

export interface WeatherComparisonData {
  personal: PersonalWeatherData
  collective: CollectiveWeatherData
  insights: string[]
}

// Dream Weather Chart Types
export type WeatherCondition = 'stormy' | 'cloudy' | 'calm' | 'pleasant' | 'radiant'
export type WeatherTrend = 'rising' | 'falling' | 'stable'

// Single data point (hourly bucket)
export interface DreamWeatherPoint {
  timestamp: string      // ISO string
  hour: number           // 0-23
  avgValence: number     // -1 to 1 (negative to positive)
  avgIntensity: number   // 0 to 1
  dreamCount: number
  nightmareRate: number  // 0 to 1
  lucidRate: number      // 0 to 1
  recurringRate: number  // 0 to 1
}

// Current weather summary
export interface DreamWeatherCurrent {
  condition: WeatherCondition
  valence: number
  intensity: number
  trend: WeatherTrend
}

// Complete chart data structure
export interface DreamWeatherChartData {
  points: DreamWeatherPoint[]
  current: DreamWeatherCurrent
  totalDreams: number
  timeRange: TimeRange
}


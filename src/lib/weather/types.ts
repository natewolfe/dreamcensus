// Weather System Types

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
  timeRange: '7d' | '30d' | '90d' | 'all'
  dreamCount: number
  emotions: EmotionDistribution[]
  symbols: SymbolFrequency[]
  avgVividness?: number
  lucidDreamCount: number
  lucidPercentage: number
  captureStreak: number
}

export interface CollectiveWeatherData {
  timeRange: '7d' | '30d' | '90d'
  sampleSize: number
  emotions: EmotionDistribution[]
  topSymbols: SymbolFrequency[]
  avgVividness: number
  lucidPercentage: number
  updatedAt: Date
}

export interface WeatherComparisonData {
  personal: PersonalWeatherData
  collective: CollectiveWeatherData
  insights: string[]
}


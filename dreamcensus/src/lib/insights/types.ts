import type { 
  PersonalWeatherData, 
  CollectiveWeatherData,
  DreamWeatherChartData 
} from '../weather/types'

/**
 * Data available for insight generation
 * All fields optional to handle partial data gracefully
 */
export interface InsightData {
  // Personal weather (from getPersonalWeather)
  personal?: PersonalWeatherData | null
  
  // Collective weather (optional, for comparison insights)
  collective?: CollectiveWeatherData | null
  
  // Chart data (from getWeatherChart - already fetched)
  chart?: DreamWeatherChartData | null
  
  // Census progress (already calculated on today page)
  censusProgress: number     // 0-100
  censusAnswered: number     // questions answered
  censusTotal: number        // total questions
  
  // Activity data (already fetched)
  streakCount?: number
  weekDreams?: number[]      // Last 7 days
}

/**
 * Template for generating a single insight
 */
export interface InsightTemplate {
  id: string
  category: 'weather' | 'emotion' | 'activity' | 'comparison' | 'milestone'
  
  /** Return true if insight should be considered */
  condition: (data: InsightData) => boolean
  
  /** Return 0-100 priority (higher = stronger signal) */
  priority: (data: InsightData) => number
  
  /** Display label (small text above message) */
  label: string
  
  /** Generate the insight message */
  message: (data: InsightData) => string
}

/**
 * Generated insight ready for display
 */
export interface GeneratedInsight {
  id: string
  label: string
  message: string
  priority: number
}

// Existing profile types
export interface ProfileData {
  displayName: string | null
  avatarEmoji: string
  avatarBgColor: string
  memberSince: Date
}

export interface ProfileStats {
  totalDreams: number
  journalStreak: number
  lucidPercentage: number    // 0-100, null-safe
  censusProgress: number     // 0-100
  promptsAnswered: number
  topEmotions: string[]      // top 3
}

export interface ShareableStats {
  totalDreams: number
  journalStreak: number
  lucidPercentage: number
  memberSince: string        // formatted date
}

// Dream Profile types
export interface JournalMetrics {
  dreamCount: number
  avgVividness: number | null        // null if no vividness data
  lucidPercent: number | null        // treats "maybe" as 0.5
  emotionCountAvg: number | null     // avg emotions per dream
  topEmotions: string[]              // top 3
  topTags: string[]                  // top 5
  tagDiversityIndex: number | null   // unique/total ratio
  wakingLifeLinkRate: number | null  // 0-100
  recentActivityScore: number        // based on last 14 days
}

export interface CensusSignals {
  [dimensionId: string]: {
    score: number | null       // 0-100 normalized
    coverage: number           // 0-1, how many questions answered
    answeredCount: number
    totalCount: number
  }
}

export interface DimensionResult {
  dimension: DimensionId
  score: number | null         // 0-100 or null if insufficient data
  confidence: number           // 0-100
  isEstimate: boolean          // true if confidence < STABLE_CONFIDENCE
}

export type DimensionId = 'boundary' | 'lucidity' | 'emotion' | 'meaning' | 'engagement'

export interface DreamerProfileData {
  // Dimension scores
  dimensions: DimensionResult[]
  
  // Archetype
  primaryArchetype: ArchetypeResult | null
  secondaryArchetype: ArchetypeResult | null
  
  // Unlock progress
  unlockPoints: number
  unlockLevel: number
  
  // Metadata
  lastCalculatedAt: Date | null
  isStale: boolean
}

export interface ArchetypeResult {
  id: ArchetypeId
  name: string
  tagline: string
  description: string
  icon: string
  confidence: number  // 0-100
}

export type ArchetypeId = 'navigator' | 'oracle' | 'witness' | 'explorer'

export interface UnlockProgress {
  currentPoints: number
  currentLevel: number
  nextLevel: number | null
  nextLevelPoints: number | null
  progress: number  // 0-100 toward next level
  unlockedFeatures: string[]
  nextFeature: string | null
}

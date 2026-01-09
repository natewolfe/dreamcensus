/**
 * Emotion to valence mapping for Dream Weather calculations
 * 
 * Valence ranges from -1 (negative) to 1 (positive)
 * Based on affective psychology research and dimensional models of emotion
 */

export const EMOTION_VALENCE: Record<string, number> = {
  // Positive emotions (0.5 to 1.0)
  joy: 0.9,
  bliss: 0.95,
  ecstasy: 0.95,
  love: 0.8,
  peace: 0.7,
  contentment: 0.6,
  wonder: 0.6,
  excitement: 0.5,
  hope: 0.6,
  gratitude: 0.7,
  awe: 0.6,
  serenity: 0.7,
  relief: 0.5,
  
  // Neutral to slightly positive (0 to 0.4)
  surprise: 0.1,
  curiosity: 0.3,
  nostalgia: 0.2,
  anticipation: 0.2,
  confusion: 0,
  contemplation: 0.1,
  
  // Slightly negative (-0.4 to -0.1)
  disappointment: -0.3,
  frustration: -0.4,
  boredom: -0.2,
  loneliness: -0.4,
  embarrassment: -0.3,
  
  // Negative emotions (-0.5 to -0.7)
  sadness: -0.5,
  grief: -0.6,
  anger: -0.6,
  anxiety: -0.6,
  fear: -0.7,
  guilt: -0.5,
  shame: -0.6,
  jealousy: -0.5,
  
  // Strongly negative (-0.8 to -1.0)
  dread: -0.8,
  terror: -0.9,
  panic: -0.85,
  despair: -0.85,
  horror: -0.9,
  anguish: -0.85,
  rage: -0.75,
}

/**
 * Get valence value for an emotion string
 * Returns 0 for unknown emotions (neutral default)
 */
export function getEmotionValence(emotion: string): number {
  const normalized = emotion.toLowerCase().trim()
  return EMOTION_VALENCE[normalized] ?? 0
}

/**
 * Get all known emotion strings
 */
export function getKnownEmotions(): string[] {
  return Object.keys(EMOTION_VALENCE)
}

/**
 * Check if an emotion is known in the valence map
 */
export function isKnownEmotion(emotion: string): boolean {
  const normalized = emotion.toLowerCase().trim()
  return normalized in EMOTION_VALENCE
}


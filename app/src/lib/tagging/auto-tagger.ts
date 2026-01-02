/**
 * Auto-tagging service for dream entries
 * Extracts tags (symbols, emotions, themes, actions) from dream text
 */

export interface TagMatch {
  tagName: string
  tagType: 'symbol' | 'emotion' | 'theme' | 'action'
  startIndex: number
  endIndex: number
  confidence: number
}

// Common dream symbols dictionary
const SYMBOL_DICTIONARY: Record<string, string> = {
  // Nature
  'water': 'nature',
  'ocean': 'nature',
  'sea': 'nature',
  'river': 'nature',
  'lake': 'nature',
  'rain': 'nature',
  'storm': 'nature',
  'fire': 'nature',
  'flames': 'nature',
  'forest': 'nature',
  'tree': 'nature',
  'trees': 'nature',
  'mountain': 'nature',
  'mountains': 'nature',
  'sky': 'nature',
  'clouds': 'nature',
  'sun': 'nature',
  'moon': 'nature',
  'stars': 'nature',
  
  // Animals
  'dog': 'animal',
  'cat': 'animal',
  'bird': 'animal',
  'snake': 'animal',
  'spider': 'animal',
  'fish': 'animal',
  'horse': 'animal',
  'wolf': 'animal',
  'bear': 'animal',
  
  // Architecture
  'house': 'architecture',
  'home': 'architecture',
  'building': 'architecture',
  'door': 'architecture',
  'window': 'architecture',
  'room': 'architecture',
  'stairs': 'architecture',
  'staircase': 'architecture',
  'elevator': 'architecture',
  'bridge': 'architecture',
  'path': 'architecture',
  'road': 'architecture',
  'street': 'architecture',
  
  // Transportation
  'car': 'transportation',
  'train': 'transportation',
  'plane': 'transportation',
  'airplane': 'transportation',
  'boat': 'transportation',
  'ship': 'transportation',
  'bus': 'transportation',
  
  // People
  'stranger': 'people',
  'crowd': 'people',
  'baby': 'people',
  'child': 'people',
  'children': 'people',
  
  // Objects
  'mirror': 'object',
  'phone': 'object',
  'book': 'object',
  'money': 'object',
  'key': 'object',
  'clock': 'object',
  'light': 'object',
  'darkness': 'object',
  'shadow': 'object',
}

// Common emotions in dreams
const EMOTION_DICTIONARY: Record<string, { valence: number; arousal: number }> = {
  // Positive, low arousal
  'peaceful': { valence: 0.8, arousal: 0.2 },
  'calm': { valence: 0.7, arousal: 0.2 },
  'content': { valence: 0.7, arousal: 0.3 },
  'relaxed': { valence: 0.7, arousal: 0.2 },
  
  // Positive, high arousal
  'happy': { valence: 0.8, arousal: 0.7 },
  'excited': { valence: 0.8, arousal: 0.9 },
  'joyful': { valence: 0.9, arousal: 0.8 },
  'thrilled': { valence: 0.9, arousal: 0.9 },
  'ecstatic': { valence: 1.0, arousal: 1.0 },
  
  // Negative, low arousal
  'sad': { valence: -0.7, arousal: 0.3 },
  'melancholy': { valence: -0.6, arousal: 0.2 },
  'lonely': { valence: -0.7, arousal: 0.3 },
  'depressed': { valence: -0.9, arousal: 0.2 },
  'hopeless': { valence: -0.9, arousal: 0.2 },
  
  // Negative, high arousal
  'angry': { valence: -0.7, arousal: 0.8 },
  'anxious': { valence: -0.6, arousal: 0.8 },
  'scared': { valence: -0.8, arousal: 0.9 },
  'terrified': { valence: -1.0, arousal: 1.0 },
  'panicked': { valence: -0.9, arousal: 1.0 },
  'frightened': { valence: -0.8, arousal: 0.9 },
  'worried': { valence: -0.5, arousal: 0.7 },
  'nervous': { valence: -0.5, arousal: 0.8 },
  'stressed': { valence: -0.6, arousal: 0.8 },
  
  // Neutral/Mixed
  'confused': { valence: -0.3, arousal: 0.6 },
  'curious': { valence: 0.3, arousal: 0.6 },
  'surprised': { valence: 0.0, arousal: 0.8 },
  'shocked': { valence: -0.2, arousal: 0.9 },
}

// Common dream themes
const THEME_DICTIONARY: string[] = [
  'flying',
  'falling',
  'chasing',
  'being chased',
  'losing teeth',
  'being naked',
  'taking a test',
  'being late',
  'death',
  'dying',
  'transformation',
  'lost',
  'trapped',
  'drowning',
  'paralyzed',
  'unable to move',
]

// Common actions in dreams
const ACTION_DICTIONARY: string[] = [
  'running',
  'walking',
  'swimming',
  'flying',
  'falling',
  'climbing',
  'jumping',
  'driving',
  'searching',
  'hiding',
  'escaping',
  'fighting',
  'crying',
  'laughing',
  'screaming',
  'talking',
  'singing',
  'dancing',
]

/**
 * Extract tags from dream entry text
 */
export async function extractTags(text: string): Promise<TagMatch[]> {
  const matches: TagMatch[] = []
  const normalized = text.toLowerCase()
  
  // Extract symbols
  for (const [symbol, category] of Object.entries(SYMBOL_DICTIONARY)) {
    const regex = new RegExp(`\\b${symbol}\\b`, 'gi')
    let match
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        tagName: symbol,
        tagType: 'symbol',
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        confidence: 0.9,
      })
    }
  }
  
  // Extract emotions
  for (const [emotion, data] of Object.entries(EMOTION_DICTIONARY)) {
    const regex = new RegExp(`\\b${emotion}\\b`, 'gi')
    let match
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        tagName: emotion,
        tagType: 'emotion',
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        confidence: 0.95,
      })
    }
  }
  
  // Extract themes
  for (const theme of THEME_DICTIONARY) {
    const regex = new RegExp(theme.replace(/\s+/g, '\\s+'), 'gi')
    let match
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        tagName: theme,
        tagType: 'theme',
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        confidence: 0.85,
      })
    }
  }
  
  // Extract actions
  for (const action of ACTION_DICTIONARY) {
    const regex = new RegExp(`\\b${action}\\b`, 'gi')
    let match
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        tagName: action,
        tagType: 'action',
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        confidence: 0.8,
      })
    }
  }
  
  // Sort by start index
  return matches.sort((a, b) => a.startIndex - b.startIndex)
}

/**
 * Get or create tag in database
 */
export async function getOrCreateTag(
  name: string,
  type: 'symbol' | 'emotion' | 'theme' | 'action',
  category?: string
) {
  const { db } = await import('@/lib/db')
  
  const normalizedName = name.toLowerCase().trim()
  
  // Try to find existing tag
  let tag = await db.tag.findUnique({
    where: {
      name_type: {
        name,
        type,
      },
    },
  })
  
  if (!tag) {
    // Create new tag
    tag = await db.tag.create({
      data: {
        name,
        normalizedName,
        type,
        category: category || null,
        aliases: [],
      },
    })
  }
  
  return tag
}

/**
 * Save tag occurrences for a dream entry
 */
export async function saveTagOccurrences(
  dreamEntryId: string,
  tags: TagMatch[]
) {
  const { db } = await import('@/lib/db')
  
  // Delete existing tag occurrences
  await db.tagOccurrence.deleteMany({
    where: { dreamEntryId },
  })
  
  // Create new tag occurrences
  for (const tagMatch of tags) {
    const tag = await getOrCreateTag(
      tagMatch.tagName,
      tagMatch.tagType,
      SYMBOL_DICTIONARY[tagMatch.tagName.toLowerCase()]
    )
    
    await db.tagOccurrence.create({
      data: {
        dreamEntryId,
        tagId: tag.id,
        startIndex: tagMatch.startIndex,
        endIndex: tagMatch.endIndex,
        confidence: tagMatch.confidence,
        source: 'auto',
      },
    })
    
    // Increment total occurrences
    await db.tag.update({
      where: { id: tag.id },
      data: {
        totalOccurrences: { increment: 1 },
      },
    })
  }
}


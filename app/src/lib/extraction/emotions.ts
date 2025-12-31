/**
 * Emotion extraction from dream text using LLM
 */

export interface EmotionMatch {
  emotionName: string
  intensity: number  // 0-1
  valence?: number   // -1 to 1 (negative to positive)
  arousal?: number   // 0 to 1 (calm to excited)
}

/**
 * Extract emotions from dream text using LLM
 * 
 * Integrates with OpenAI GPT-4 for emotion identification
 */
export async function extractEmotions(dreamText: string): Promise<EmotionMatch[]> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.warn('OPENAI_API_KEY not set, skipping emotion extraction')
    return []
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a dream analyst. Identify emotions in dreams and return them as JSON.',
          },
          {
            role: 'user',
            content: `Analyze this dream and identify emotions experienced. For each emotion:
- emotionName: the emotion
- intensity: strength (0-1)
- valence: negative to positive (-1 to 1)
- arousal: calm to excited (0 to 1)

Return as JSON array.

Dream: "${dreamText}"`,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      console.error('OpenAI API error:', response.status)
      return []
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content
    
    if (!content) return []

    const parsed = JSON.parse(content)
    return parsed.emotions || []
  } catch (error) {
    console.error('Emotion extraction error:', error)
    return []
  }
}

/**
 * Match extracted emotions against existing taxonomy
 */
export async function matchEmotionsToTaxonomy(
  emotions: EmotionMatch[],
  locale: string = 'en'
): Promise<Array<{ emotionId: string; intensity: number }>> {
  const { db } = await import('../db')
  
  const matches: Array<{ emotionId: string; intensity: number }> = []

  for (const emotion of emotions) {
    // Try exact match first
    let dbEmotion = await db.emotion.findFirst({
      where: {
        name: { equals: emotion.emotionName, mode: 'insensitive' },
        locale,
      },
    })

    // If not found, create it with valence/arousal if provided
    if (!dbEmotion) {
      dbEmotion = await db.emotion.create({
        data: {
          name: emotion.emotionName,
          valence: emotion.valence,
          arousal: emotion.arousal,
          locale,
        },
      })
    }

    matches.push({
      emotionId: dbEmotion.id,
      intensity: emotion.intensity,
    })
  }

  return matches
}


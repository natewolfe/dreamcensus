/**
 * Symbol extraction from dream text using LLM
 */

export interface SymbolMatch {
  symbolName: string
  strength: number  // 0-1 confidence
  context: string   // Where it appeared in the text
}

/**
 * Extract symbols from dream text using LLM
 * 
 * Integrates with OpenAI GPT-4 for symbol identification
 */
export async function extractSymbols(dreamText: string): Promise<SymbolMatch[]> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.warn('OPENAI_API_KEY not set, skipping symbol extraction')
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
            content: 'You are a dream analyst. Identify symbolic elements in dreams and return them as JSON.',
          },
          {
            role: 'user',
            content: `Analyze this dream and identify symbolic elements. For each symbol, provide:
- symbolName: the name of the symbol
- strength: confidence score (0-1)
- context: brief quote showing where it appears

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
    return parsed.symbols || []
  } catch (error) {
    console.error('Symbol extraction error:', error)
    return []
  }
}

/**
 * Match extracted symbols against existing taxonomy
 */
export async function matchSymbolsToTaxonomy(
  symbols: SymbolMatch[],
  locale: string = 'en'
): Promise<Array<{ symbolId: string; strength: number }>> {
  const { db } = await import('../db')
  
  const matches: Array<{ symbolId: string; strength: number }> = []

  for (const symbol of symbols) {
    // Try exact match first
    let dbSymbol = await db.symbol.findFirst({
      where: {
        name: { equals: symbol.symbolName, mode: 'insensitive' },
        locale,
      },
    })

    // If not found, create it
    if (!dbSymbol) {
      dbSymbol = await db.symbol.create({
        data: {
          name: symbol.symbolName,
          locale,
        },
      })
    }

    matches.push({
      symbolId: dbSymbol.id,
      strength: symbol.strength,
    })
  }

  return matches
}


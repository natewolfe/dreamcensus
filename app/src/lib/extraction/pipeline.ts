/**
 * Entity extraction pipeline orchestration
 */

import { db } from '../db'
import { extractSymbols, matchSymbolsToTaxonomy } from './symbols'
import { extractEmotions, matchEmotionsToTaxonomy } from './emotions'

export interface ExtractionResult {
  symbols: Array<{ symbolId: string; strength: number }>
  emotions: Array<{ emotionId: string; intensity: number }>
}

/**
 * Run full extraction pipeline on a dream entry
 */
export async function extractEntitiesFromDream(
  dreamId: string
): Promise<ExtractionResult> {
  // Get dream text
  const dream = await db.dreamEntry.findUnique({
    where: { id: dreamId },
    select: { textRaw: true },
  })

  if (!dream) {
    throw new Error(`Dream ${dreamId} not found`)
  }

  // Extract symbols and emotions in parallel
  const [rawSymbols, rawEmotions] = await Promise.all([
    extractSymbols(dream.textRaw),
    extractEmotions(dream.textRaw),
  ])

  // Match against taxonomy
  const [symbols, emotions] = await Promise.all([
    matchSymbolsToTaxonomy(rawSymbols),
    matchEmotionsToTaxonomy(rawEmotions),
  ])

  return { symbols, emotions }
}

/**
 * Save extracted entities to database
 */
export async function saveExtractedEntities(
  dreamId: string,
  result: ExtractionResult
): Promise<void> {
  await db.$transaction(async (tx) => {
    // Save symbols
    for (const { symbolId, strength } of result.symbols) {
      await tx.dreamEntrySymbol.upsert({
        where: {
          entryId_symbolId: {
            entryId: dreamId,
            symbolId,
          },
        },
        update: { strength },
        create: {
          entryId: dreamId,
          symbolId,
          strength,
        },
      })
    }

    // Save emotions
    for (const { emotionId, intensity } of result.emotions) {
      await tx.dreamEntryEmotion.upsert({
        where: {
          entryId_emotionId: {
            entryId: dreamId,
            emotionId,
          },
        },
        update: { intensity },
        create: {
          entryId: dreamId,
          emotionId,
          intensity,
        },
      })
    }
  })
}

/**
 * Full pipeline: extract and save entities
 */
export async function processDreamEntities(dreamId: string): Promise<void> {
  const result = await extractEntitiesFromDream(dreamId)
  await saveExtractedEntities(dreamId, result)
}


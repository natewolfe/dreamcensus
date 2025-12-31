/**
 * Vector similarity search utilities for PostgreSQL + pgvector
 */

import { db } from './db'

export interface DreamSearchResult {
  id: string
  textRaw: string
  capturedAt: Date
  similarity: number
  userId: string
}

/**
 * Find similar dreams using pgvector cosine similarity
 * 
 * Requires pgvector extension and embedding column populated
 */
export async function findSimilarDreams(
  dreamId: string,
  limit: number = 10
): Promise<DreamSearchResult[]> {
  // Get the source dream's embedding
  const sourceDream = await db.dreamEntry.findUnique({
    where: { id: dreamId },
    select: { embedding: true, userId: true },
  })

  if (!sourceDream?.embedding) {
    throw new Error('Source dream has no embedding')
  }

  // Use raw SQL for pgvector similarity search
  // Note: This requires pgvector extension and proper vector type
  const results = await db.$queryRaw<DreamSearchResult[]>`
    SELECT 
      id,
      "textRaw",
      "capturedAt",
      "userId",
      1 - (embedding <=> ${sourceDream.embedding}::vector) as similarity
    FROM "DreamEntry"
    WHERE 
      id != ${dreamId}
      AND embedding IS NOT NULL
      AND "userId" = ${sourceDream.userId}
    ORDER BY embedding <=> ${sourceDream.embedding}::vector
    LIMIT ${limit}
  `

  return results
}

/**
 * Search dreams by text query using embedding similarity
 */
export async function searchDreamsByEmbedding(
  queryEmbedding: number[],
  userId: string,
  limit: number = 10
): Promise<DreamSearchResult[]> {
  const results = await db.$queryRaw<DreamSearchResult[]>`
    SELECT 
      id,
      "textRaw",
      "capturedAt",
      "userId",
      1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) as similarity
    FROM "DreamEntry"
    WHERE 
      embedding IS NOT NULL
      AND "userId" = ${userId}
    ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector
    LIMIT ${limit}
  `

  return results
}

/**
 * Find dreams with similar symbols
 */
export async function findDreamsWithSymbol(
  symbolId: string,
  userId: string,
  limit: number = 10
): Promise<Array<{ id: string; textRaw: string; capturedAt: Date; strength: number }>> {
  const dreams = await db.dreamEntry.findMany({
    where: {
      userId,
      symbols: {
        some: {
          symbolId,
        },
      },
    },
    select: {
      id: true,
      textRaw: true,
      capturedAt: true,
      symbols: {
        where: { symbolId },
        select: { strength: true },
      },
    },
    take: limit,
    orderBy: {
      capturedAt: 'desc',
    },
  })

  return dreams.map((dream) => ({
    id: dream.id,
    textRaw: dream.textRaw,
    capturedAt: dream.capturedAt,
    strength: dream.symbols[0]?.strength || 0,
  }))
}


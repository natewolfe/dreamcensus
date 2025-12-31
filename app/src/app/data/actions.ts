'use server'

import { db } from '@/lib/db'
import { z } from 'zod'

const SearchDreamsSchema = z.object({
  query: z.string().optional(),
  symbols: z.array(z.string()).optional(),
  emotions: z.array(z.string()).optional(),
  minClarity: z.number().optional(),
  maxClarity: z.number().optional(),
  isLucid: z.boolean().optional(),
  limit: z.number().default(20),
})

export async function searchDreams(filters: unknown) {
  const parsed = SearchDreamsSchema.safeParse(filters)
  if (!parsed.success) {
    return { error: 'Invalid search parameters' }
  }

  const { query, symbols, emotions, minClarity, maxClarity, isLucid, limit } = parsed.data

  try {
    const dreams = await db.dreamEntry.findMany({
      where: {
        isPublicAnon: true,
        ...(query && { textRaw: { contains: query, mode: 'insensitive' } }),
        ...(minClarity && { clarity: { gte: minClarity } }),
        ...(maxClarity && { clarity: { lte: maxClarity } }),
        ...(isLucid !== undefined && { isLucid }),
        ...(symbols && symbols.length > 0 && {
          symbols: {
            some: {
              symbol: {
                name: { in: symbols },
              },
            },
          },
        }),
        ...(emotions && emotions.length > 0 && {
          emotions: {
            some: {
              emotion: {
                name: { in: emotions },
              },
            },
          },
        }),
      },
      include: {
        symbols: {
          include: { symbol: true },
        },
        emotions: {
          include: { emotion: true },
        },
      },
      orderBy: { capturedAt: 'desc' },
      take: limit,
    })

    return { success: true, dreams }
  } catch (error) {
    console.error('Search dreams error:', error)
    return { error: 'Search failed. Please try again.' }
  }
}


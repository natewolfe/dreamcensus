'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

// =============================================================================
// SCHEMAS
// =============================================================================

const SearchDreamsSchema = z.object({
  query: z.string().optional(),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
})

const GetTagSuggestionsSchema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(20).optional().default(10),
})

// =============================================================================
// TYPES
// =============================================================================

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

interface DreamListItem {
  id: string
  userId: string
  title?: string
  emotions: string[]
  vividness?: number
  lucidity?: 'no' | 'maybe' | 'yes' | null
  tags: string[]
  keyVersion: number
  capturedAt: Date
  updatedAt: Date
}

// =============================================================================
// ACTIONS
// =============================================================================

/**
 * Get paginated list of dreams
 */
export async function getDreams(
  limit: number = 20,
  offset: number = 0
): Promise<ActionResult<{ dreams: DreamListItem[]; hasMore: boolean }>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    const dreams = await db.dreamEntry.findMany({
      where: { userId: session.userId },
      select: {
        id: true,
        userId: true,
        title: true,
        emotions: true,
        vividness: true,
        lucidity: true,
        tags: true,
        keyVersion: true,
        capturedAt: true,
        updatedAt: true,
        // Don't return encrypted content for list view
      },
      orderBy: { capturedAt: 'desc' },
      take: limit + 1, // Fetch one extra to check if there are more
      skip: offset,
    })

    const hasMore = dreams.length > limit
    const dreamList = hasMore ? dreams.slice(0, limit) : dreams

    return {
      success: true,
      data: {
        dreams: dreamList.map((d: any) => ({
          ...d,
          emotions: d.emotions as string[],
          tags: d.tags as string[],
        })),
        hasMore,
      },
    }
  } catch (error) {
    console.error('getDreams error:', error)
    return { success: false, error: 'Failed to fetch dreams' }
  }
}

/**
 * Get single dream by ID
 */
export async function getDream(
  dreamId: string
): Promise<ActionResult<DreamListItem & {
  ciphertext?: string
  iv?: string
  wakingLifeLink?: string
}>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    const dream = await db.dreamEntry.findFirst({
      where: {
        id: dreamId,
        userId: session.userId,
      },
    })

    if (!dream) {
      return { success: false, error: 'Dream not found' }
    }

    return {
      success: true,
      data: {
        id: dream.id,
        userId: dream.userId,
        title: dream.title ?? undefined,
        emotions: dream.emotions as string[],
        vividness: dream.vividness ?? undefined,
        lucidity: dream.lucidity as 'no' | 'maybe' | 'yes' | null | undefined,
        tags: (dream as any).tags as string[] ?? [],
        keyVersion: dream.keyVersion,
        ciphertext: dream.ciphertext ? Buffer.from(dream.ciphertext).toString('base64') : undefined,
        iv: dream.iv ? Buffer.from(dream.iv).toString('base64') : undefined,
        wakingLifeLink: dream.wakingLifeLink ?? undefined,
        capturedAt: dream.capturedAt,
        updatedAt: dream.updatedAt,
      },
    }
  } catch (error) {
    console.error('getDream error:', error)
    return { success: false, error: 'Failed to fetch dream' }
  }
}

/**
 * Search dreams by query
 */
export async function searchDreams(
  input: z.infer<typeof SearchDreamsSchema>
): Promise<ActionResult<{ dreams: DreamListItem[]; hasMore: boolean }>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    const { query, limit = 20, offset = 0 } = SearchDreamsSchema.parse(input)

    if (!query || !query.trim()) {
      // If no query, return recent dreams
      return getDreams(limit, offset)
    }

    // Basic search - in production would use full-text search
    const dreams = await db.dreamEntry.findMany({
      where: {
        userId: session.userId,
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive',
            },
          },
          // Note: Can't easily search in JSON arrays with Prisma
          // Would need to use raw SQL or PostgreSQL full-text search
        ],
      },
        select: {
        id: true,
        userId: true,
        title: true,
        emotions: true,
        vividness: true,
        lucidity: true,
        tags: true,
        keyVersion: true,
        capturedAt: true,
        updatedAt: true,
      },
      orderBy: { capturedAt: 'desc' },
      take: limit + 1,
      skip: offset,
    })

    const hasMore = dreams.length > limit
    const dreamList = hasMore ? dreams.slice(0, limit) : dreams

    return {
      success: true,
      data: {
        dreams: dreamList.map((d: any) => ({
          ...d,
          emotions: d.emotions as string[],
          tags: d.tags as string[],
        })),
        hasMore,
      },
    }
  } catch (error) {
    console.error('searchDreams error:', error)
    return { success: false, error: 'Failed to search dreams' }
  }
}

/**
 * Get tag suggestions for autocomplete
 */
export async function getTagSuggestions(
  input: z.infer<typeof GetTagSuggestionsSchema>
): Promise<ActionResult<string[]>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    const { query, limit } = GetTagSuggestionsSchema.parse(input)

    // Get all dreams for this user
    const dreams = await db.dreamEntry.findMany({
      where: { userId: session.userId },
      select: { tags: true },
    })

    // Extract unique tags
    const allTags = new Set<string>()
    dreams.forEach((dream: any) => {
      const tags = dream.tags as string[]
      tags.forEach((tag: string) => allTags.add(tag))
    })

    // Filter by query
    const filtered = Array.from(allTags)
      .filter((tag) => tag.toLowerCase().includes(query.toLowerCase()))
      .slice(0, limit)

    return { success: true, data: filtered }
  } catch (error) {
    console.error('getTagSuggestions error:', error)
    return { success: false, error: 'Failed to fetch tag suggestions' }
  }
}

/**
 * Update dream (title, tags, waking life link)
 */
export async function updateDreamMetadata(
  dreamId: string,
  updates: {
    title?: string
    tags?: string[]
    wakingLifeLink?: string
  }
): Promise<ActionResult<void>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    // Verify ownership
    const dream = await db.dreamEntry.findFirst({
      where: {
        id: dreamId,
        userId: session.userId,
      },
    })

    if (!dream) {
      return { success: false, error: 'Dream not found' }
    }

    // Update (tags are handled via relations, not directly)
    await db.dreamEntry.update({
      where: { id: dreamId },
      data: {
        title: updates.title,
        wakingLifeLink: updates.wakingLifeLink,
        updatedAt: new Date(),
      },
    })
    
    // TODO: Handle tag updates via DreamTag relation

    revalidatePath('/journal')
    revalidatePath(`/journal/${dreamId}`)

    return { success: true, data: undefined }
  } catch (error) {
    console.error('updateDreamMetadata error:', error)
    return { success: false, error: 'Failed to update dream' }
  }
}

/**
 * Delete dream
 */
export async function deleteDream(dreamId: string): Promise<ActionResult<void>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    // Verify ownership
    const dream = await db.dreamEntry.findFirst({
      where: {
        id: dreamId,
        userId: session.userId,
      },
    })

    if (!dream) {
      return { success: false, error: 'Dream not found' }
    }

    // Delete
    await db.dreamEntry.delete({
      where: { id: dreamId },
    })

    revalidatePath('/journal')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('deleteDream error:', error)
    return { success: false, error: 'Failed to delete dream' }
  }
}


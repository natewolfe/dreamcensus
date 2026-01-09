'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { emitEvent } from '@/lib/events'
import { db } from '@/lib/db'
import { withAuth, requireAuth, type ActionResult, getTodayRange } from '@/lib/actions'
import { computeStreak } from '@/lib/streak'

// =============================================================================
// SCHEMAS
// =============================================================================

const CreateDreamEntrySchema = z.object({
  // Encrypted content (optional if emotion-only)
  ciphertext: z.string().optional(),
  iv: z.string().optional(),
  keyVersion: z.number().optional(),
  
  // Plaintext metadata (not encrypted)
  recallLevel: z.enum(['nothing', 'fragments', 'scene', 'full']).optional(),
  emotions: z.array(z.string()).max(10),
  vividness: z.number().min(0).max(100).optional(),
  lucidity: z.enum(['no', 'maybe', 'yes']).nullable().optional(),
  
  // Tags
  tags: z.array(z.string()).max(20).optional(),
  
  // Close ritual data
  title: z.string().max(200).optional(),
  wakingLifeLink: z.string().max(2000).optional(),
  
  // Flags
  isLucid: z.boolean().optional(),
  isNightmare: z.boolean().optional(),
  isRecurring: z.boolean().optional(),
  
  // Capture metadata
  captureMethod: z.enum(['voice', 'text', 'emotion-only']).optional(),
  capturedAt: z.string().datetime().optional(),
  
  // Alarm metadata (for tracking wake-triggered captures)
  alarmTriggered: z.boolean().optional(),
  alarmScheduledTime: z.string().datetime().optional(),
  alarmStopTime: z.string().datetime().optional(),
  alarmSnoozeCount: z.number().optional(),
})

const SaveNightCheckInSchema = z.object({
  mood: z.enum(['rough', 'okay', 'good', 'great', 'amazing']).optional(),
  dayNotes: z.string().max(1000).optional(),
  intention: z.string().max(500).optional(),
  plannedWakeTime: z.string().optional(),
  reminderEnabled: z.boolean().optional(),
})

// =============================================================================
// ACTIONS
// =============================================================================

/**
 * Create a new dream entry
 * 
 * This emits a journal.entry.created event which triggers:
 * 1. Creating the DreamEntry record
 * 2. Creating JournalFact records (if Insights consent)
 * 3. Updating personal weather (if Insights consent)
 * 4. Contributing to collective weather (if Commons consent)
 */
export async function createDreamEntry(
  input: z.infer<typeof CreateDreamEntrySchema>
): Promise<ActionResult<{ id: string; dreamNumber: number }>> {
  return withAuth(async (session) => {
    try {
      // Validate input
      const data = CreateDreamEntrySchema.parse(input)

      // Generate ID for the dream entry
      const dreamId = crypto.randomUUID()

      // Emit event (event handlers will create the actual record)
      await emitEvent({
        type: 'journal.entry.created',
        userId: session.userId,
        aggregateId: dreamId,
        aggregateType: 'DreamEntry',
        payload: {
          ciphertext: data.ciphertext ?? '',
          iv: data.iv ?? '',
          keyVersion: data.keyVersion ?? 1,
          emotions: data.emotions,
          vividness: data.vividness,
          lucidity: data.lucidity,
          isLucid: data.isLucid,
          isNightmare: data.isNightmare,
          isRecurring: data.isRecurring,
          wakingLifeLink: data.wakingLifeLink,
          capturedAt: data.capturedAt ?? new Date().toISOString(),
          tags: data.tags,
          title: data.title,
        },
      })

      // Calculate dream number: total dreams for this user (including the new one)
      const dreamNumber = await db.dreamEntry.count({
        where: { userId: session.userId },
      })

      // Revalidate journal and today pages
      revalidatePath('/journal')
      revalidatePath('/today')

      return { success: true, data: { id: dreamId, dreamNumber } }
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error)
        return { success: false, error: 'Invalid input data' }
      }
      
      console.error('createDreamEntry error:', error)
      return { success: false, error: 'Failed to save dream' }
    }
  })
}

/**
 * Update an existing dream entry
 */
export async function updateDreamEntry(
  dreamId: string,
  input: Partial<z.infer<typeof CreateDreamEntrySchema>>
): Promise<ActionResult<void>> {
  return withAuth(async (session) => {
    try {
      // Emit update event
      await emitEvent({
        type: 'journal.entry.updated',
        userId: session.userId,
        aggregateId: dreamId,
        aggregateType: 'DreamEntry',
        payload: input,
      })

      revalidatePath('/journal')
      revalidatePath(`/journal/${dreamId}`)

      return { success: true, data: undefined }
    } catch (error) {
      console.error('updateDreamEntry error:', error)
      return { success: false, error: 'Failed to update dream' }
    }
  })
}

/**
 * Delete a dream entry
 */
export async function deleteDreamEntry(
  dreamId: string
): Promise<ActionResult<void>> {
  return withAuth(async (session) => {
    try {
      // Emit delete event
      await emitEvent({
        type: 'journal.entry.deleted',
        userId: session.userId,
        aggregateId: dreamId,
        aggregateType: 'DreamEntry',
        payload: { dreamId },
      })

      revalidatePath('/journal')

      return { success: true, data: undefined }
    } catch (error) {
      console.error('deleteDreamEntry error:', error)
      return { success: false, error: 'Failed to delete dream' }
    }
  })
}

/**
 * Save night check-in
 */
export async function saveNightCheckIn(
  input: z.infer<typeof SaveNightCheckInSchema>
): Promise<ActionResult<void>> {
  return withAuth(async (session) => {
    try {
      const data = SaveNightCheckInSchema.parse(input)
      const today = new Date().toISOString().split('T')[0] ?? ''

      // Emit event
      await emitEvent({
        type: 'night.checked_in',
        userId: session.userId,
        payload: {
          ...data,
          date: today,
          checkedInAt: new Date().toISOString(),
        },
      })

      // Note: Morning reminder scheduling would be handled by a job system
      // For now, the reminder time is stored in the event payload
      // A future job scheduler can query for users with reminders and send notifications

      revalidatePath('/today')

      return { success: true, data: undefined }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: 'Invalid input data' }
      }
      
      console.error('saveNightCheckIn error:', error)
      return { success: false, error: 'Failed to save check-in' }
    }
  })
}

/**
 * Get today's data (dreams, check-ins, prompts)
 */
export async function getTodayData(): Promise<ActionResult<{
  dreams: Array<{ id: string; title?: string; emotions: string[] }>
  nightCheckIn: { intention?: string } | null
  promptResponse: boolean
}>> {
  return withAuth(async (session) => {
    try {
      const { start: today, end: tomorrow } = getTodayRange()

    // Fetch today's dreams
    const dreams = await db.dreamEntry.findMany({
      where: {
        userId: session.userId,
        capturedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: {
        id: true,
        title: true,
        emotions: true,
      },
      orderBy: { capturedAt: 'desc' },
    })

    // Fetch last night check-in event
    const nightEvent = await db.event.findFirst({
      where: {
        userId: session.userId,
        type: 'night.checked_in',
        createdAt: {
          gte: new Date(today.getTime() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const nightCheckIn = nightEvent
      ? { intention: (nightEvent.payload as any)?.intention }
      : null

    // Check if user responded to today's prompt
    const promptResponse = await db.promptResponse.findFirst({
      where: {
        userId: session.userId,
        respondedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

      return {
        success: true,
        data: {
          dreams: dreams.map((d) => ({
            id: d.id,
            title: d.title ?? undefined,
            emotions: d.emotions,
          })),
          nightCheckIn,
          promptResponse: !!promptResponse,
        },
      }
    } catch (error) {
      console.error('getTodayData error:', error)
      return { success: false, error: 'Failed to load today data' }
    }
  })
}

/**
 * Calculate the user's current dream journaling streak
 * A streak counts consecutive days with at least one dream entry
 */
export async function getStreak(): Promise<number> {
  try {
    const session = await requireAuth()
    return await computeStreak(session.userId)
  } catch (error) {
    // User not authenticated or other error - return 0
    console.error('getStreak error:', error)
    return 0
  }
}

/**
 * Get dream counts for the last 7 days
 * Returns array of 7 numbers [6 days ago, 5 days ago, ..., yesterday, today]
 * Index 6 is always today (rightmost in UI)
 */
export async function getWeekDreams(): Promise<number[]> {
  try {
    const session = await requireAuth()

    // Get start of 7-day window (6 days ago at midnight)
    const { start: today } = getTodayRange()
    
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - 6)

    const weekEnd = new Date(today)
    weekEnd.setDate(today.getDate() + 1) // End of today

    // Get entries for the last 7 days
    const entries = await db.dreamEntry.findMany({
      where: {
        userId: session.userId,
        capturedAt: {
          gte: weekStart,
          lt: weekEnd,
        },
      },
      select: { capturedAt: true },
    })

    // Map to counts array (index 0 = 6 days ago, index 6 = today)
    const weekDays: number[] = Array(7).fill(0)
    
    entries.forEach((entry) => {
      const entryDate = new Date(entry.capturedAt)
      entryDate.setHours(0, 0, 0, 0)
      const dayIndex = Math.floor(
        (entryDate.getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000)
      )
      if (dayIndex >= 0 && dayIndex < 7) {
        weekDays[dayIndex]++
      }
    })

    return weekDays
  } catch (error) {
    // User not authenticated or other error - return empty week
    console.error('getWeekDreams error:', error)
    return Array(7).fill(0)
  }
}

// =============================================================================
// TAG SUGGESTIONS
// =============================================================================

/**
 * Get tag suggestions based on narrative and user history
 * Returns AI suggestions (or keyword extraction) and user's lexicon (most-used tags)
 */
export async function getTagSuggestions(
  narrative: string
): Promise<ActionResult<{ suggestions: string[]; lexicon: string[] }>> {
  return withAuth(async (session) => {
    try {
      // Get user's most-used tags
    const userTags = await db.dreamTag.findMany({
      where: { 
        dreamEntry: { userId: session.userId }
      },
      include: { tag: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    // Count tag usage
    const tagCounts = new Map<string, number>()
    userTags.forEach(dt => {
      const name = dt.tag.name
      tagCounts.set(name, (tagCounts.get(name) ?? 0) + 1)
    })

    // Sort by frequency and take top 10
    const lexicon = [...tagCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name]) => name)

      // Basic keyword extraction from narrative (placeholder for AI)
      const suggestions = extractKeywords(narrative).slice(0, 5)

      return { 
        success: true, 
        data: { suggestions, lexicon } 
      }
    } catch (error) {
      console.error('getTagSuggestions error:', error)
      return { 
        success: false, 
        error: 'Failed to get tag suggestions' 
      }
    }
  })
}

/**
 * Simple keyword extraction
 * This is a placeholder - in production, use proper NLP or AI
 */
function extractKeywords(text: string): string[] {
  if (!text || text.trim().length === 0) {
    return []
  }

  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'was', 'i', 'my', 'me', 'we', 'us', 'our',
    'you', 'your', 'he', 'she', 'it', 'they', 'them', 'their', 'this',
    'that', 'these', 'those', 'am', 'are', 'been', 'being', 'have', 'has',
    'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
    'might', 'must', 'can', 'of', 'at', 'by', 'for', 'with', 'about',
    'against', 'between', 'into', 'through', 'during', 'before', 'after',
    'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off',
    'over', 'under', 'again', 'then', 'once', 'here', 'there', 'when',
    'where', 'why', 'how', 'all', 'both', 'each', 'few', 'more', 'most',
    'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
    'than', 'too', 'very', 'just', 'but', 'if', 'or', 'because', 'as',
    'until', 'while', 'what', 'which', 'who', 'whom', 'whose',
  ])

  // Split into words and normalize
  const words = text.toLowerCase().split(/\s+/)
    .map(w => w.replace(/[^\w]/g, '')) // Remove punctuation
    .filter(w => w.length > 3 && !stopWords.has(w)) // Filter out short words and stop words

  // Count frequencies
  const wordCounts = new Map<string, number>()
  words.forEach(word => {
    wordCounts.set(word, (wordCounts.get(word) ?? 0) + 1)
  })

  // Get unique words sorted by frequency
  return [...new Set(words)]
    .sort((a, b) => (wordCounts.get(b) ?? 0) - (wordCounts.get(a) ?? 0))
}


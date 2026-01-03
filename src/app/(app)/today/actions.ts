'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import { emitEvent } from '@/lib/events'
import { db } from '@/lib/db'

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
})

const SaveNightCheckInSchema = z.object({
  mood: z.enum(['rough', 'okay', 'good', 'great', 'amazing']).optional(),
  dayNotes: z.string().max(1000).optional(),
  intention: z.string().max(500).optional(),
  plannedWakeTime: z.string().optional(),
  reminderEnabled: z.boolean().optional(),
})

// =============================================================================
// TYPES
// =============================================================================

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

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
): Promise<ActionResult<{ id: string }>> {
  try {
    // Auth check
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

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
        ...data,
        capturedAt: data.capturedAt ?? new Date().toISOString(),
      },
    })

    // Revalidate journal and today pages
    revalidatePath('/journal')
    revalidatePath('/today')

    return { success: true, data: { id: dreamId } }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error)
      return { success: false, error: 'Invalid input data' }
    }
    
    console.error('createDreamEntry error:', error)
    return { success: false, error: 'Failed to save dream' }
  }
}

/**
 * Update an existing dream entry
 */
export async function updateDreamEntry(
  dreamId: string,
  input: Partial<z.infer<typeof CreateDreamEntrySchema>>
): Promise<ActionResult<void>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

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
}

/**
 * Delete a dream entry
 */
export async function deleteDreamEntry(
  dreamId: string
): Promise<ActionResult<void>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

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
}

/**
 * Save night check-in
 */
export async function saveNightCheckIn(
  input: z.infer<typeof SaveNightCheckInSchema>
): Promise<ActionResult<void>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

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

    // TODO: Schedule morning reminder if enabled
    // if (data.plannedWakeTime && data.reminderEnabled) {
    //   await scheduleMorningReminder(session.userId, data.plannedWakeTime)
    // }

    revalidatePath('/today')

    return { success: true, data: undefined }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input data' }
    }
    
    console.error('saveNightCheckIn error:', error)
    return { success: false, error: 'Failed to save check-in' }
  }
}

/**
 * Get today's data (dreams, check-ins, prompts)
 */
export async function getTodayData(): Promise<ActionResult<{
  dreams: Array<{ id: string; title?: string; emotions: string[] }>
  nightCheckIn: { intention?: string } | null
  promptResponse: boolean
}>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    // TODO: Fetch from database
    // For now, return mock data
    return {
      success: true,
      data: {
        dreams: [],
        nightCheckIn: null,
        promptResponse: false,
      },
    }
  } catch (error) {
    console.error('getTodayData error:', error)
    return { success: false, error: 'Failed to load today data' }
  }
}

/**
 * Calculate the user's current dream journaling streak
 * A streak counts consecutive days with at least one dream entry
 */
export async function getStreak(): Promise<number> {
  try {
    const session = await getSession()
    if (!session) return 0

    // Get all dream entries for this user, ordered by date descending
    const entries = await db.dreamEntry.findMany({
      where: { userId: session.userId },
      select: { capturedAt: true },
      orderBy: { capturedAt: 'desc' },
    })

    if (entries.length === 0) return 0

    // Get unique dates (in user's local date, using UTC for simplicity)
    const uniqueDates = new Set<string>()
    entries.forEach((entry) => {
      const date = entry.capturedAt.toISOString().split('T')[0] ?? ''
      if (date) uniqueDates.add(date)
    })

    const sortedDates = Array.from(uniqueDates).sort().reverse()
    
    // Check if today or yesterday has an entry (streak must be current)
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0] ?? ''
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0] ?? ''

    // If neither today nor yesterday has an entry, streak is 0
    const firstDate = sortedDates[0]
    if (firstDate !== todayStr && firstDate !== yesterdayStr) {
      return 0
    }

    // Count consecutive days
    let streak = 0
    const firstDateStr = sortedDates[0]
    if (!firstDateStr) return 0
    
    const checkDate = new Date(firstDateStr)
    
    for (const dateStr of sortedDates) {
      const expectedStr = checkDate.toISOString().split('T')[0] ?? ''
      
      if (dateStr === expectedStr) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  } catch (error) {
    console.error('getStreak error:', error)
    return 0
  }
}

/**
 * Get which days this week have dream entries
 * Returns array of 7 booleans [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
 */
export async function getWeekDreams(): Promise<boolean[]> {
  try {
    const session = await getSession()
    if (!session) return Array(7).fill(false)

    // Get start of this week (Monday)
    const today = new Date()
    const dayOfWeek = today.getDay()
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - daysFromMonday)
    weekStart.setHours(0, 0, 0, 0)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    // Get entries for this week
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

    // Map to boolean array
    const weekDays = Array(7).fill(false)
    
    entries.forEach((entry) => {
      const entryDate = new Date(entry.capturedAt)
      const dayIndex = Math.floor(
        (entryDate.getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000)
      )
      if (dayIndex >= 0 && dayIndex < 7) {
        weekDays[dayIndex] = true
      }
    })

    return weekDays
  } catch (error) {
    console.error('getWeekDreams error:', error)
    return Array(7).fill(false)
  }
}


'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { emitEvent } from '@/lib/events'
import { selectDailyPrompt, hasRespondedToday } from '@/lib/prompts'

// =============================================================================
// SCHEMAS
// =============================================================================

const RespondToPromptSchema = z.object({
  promptId: z.string(),
  value: z.unknown(),
})

const SaveStreamResponseSchema = z.object({
  questionId: z.string(),
  response: z.string(),
  expandedText: z.string().optional(),
})

// =============================================================================
// TYPES
// =============================================================================

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

interface TodayPrompt {
  id: string
  question: string
  description?: string
  responseType: string
  config?: Record<string, unknown>
  hasResponded: boolean
}

// =============================================================================
// ACTIONS
// =============================================================================

/**
 * Get today's prompt for the user
 */
export async function getTodayPrompt(): Promise<ActionResult<TodayPrompt | null>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get user's prompt response history
    const responses = await db.promptResponse.findMany({
      where: { userId: session.userId },
      select: {
        promptId: true,
        shownAt: true,
        skipped: true,
      },
      orderBy: { shownAt: 'desc' },
    })

    // Build user history
    const historyMap = new Map<string, any>()
    responses.forEach((r: any) => {
      if (!historyMap.has(r.promptId)) {
        historyMap.set(r.promptId, {
          promptId: r.promptId,
          shownCount: 0,
          skippedCount: 0,
          lastShownAt: null,
          lastRespondedAt: null,
        })
      }
      
      const history = historyMap.get(r.promptId)
      history.shownCount++
      if (r.skipped) {
        history.skippedCount++
      } else {
        history.lastRespondedAt = r.shownAt
      }
      if (!history.lastShownAt || r.shownAt > history.lastShownAt) {
        history.lastShownAt = r.shownAt
      }
    })

    const userHistory = Array.from(historyMap.values())

    // Check if already responded today
    if (hasRespondedToday(userHistory)) {
      return { success: true, data: null }
    }

    // Get dream count
    const dreamCount = await db.dreamEntry.count({
      where: { userId: session.userId },
    })

    // Select today's prompt
    const prompt = selectDailyPrompt(userHistory, dreamCount)
    
    if (!prompt) {
      return { success: true, data: null }
    }

    return {
      success: true,
      data: {
        id: prompt.id,
        question: prompt.question,
        description: prompt.description,
        responseType: prompt.responseType,
        config: prompt.config as Record<string, unknown> | undefined,
        hasResponded: false,
      },
    }
  } catch (error) {
    console.error('getTodayPrompt error:', error)
    return { success: false, error: 'Failed to fetch prompt' }
  }
}

/**
 * Respond to a prompt
 */
export async function respondToPrompt(
  input: z.infer<typeof RespondToPromptSchema>
): Promise<ActionResult<void>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    const { promptId, value } = RespondToPromptSchema.parse(input)

    // Emit event
    await emitEvent({
      type: 'prompt.responded',
      userId: session.userId,
      payload: {
        promptId,
        value,
        shownAt: new Date().toISOString(),
      },
    })

    revalidatePath('/today')

    return { success: true, data: undefined }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input' }
    }
    
    console.error('respondToPrompt error:', error)
    return { success: false, error: 'Failed to save response' }
  }
}

/**
 * Skip today's prompt
 */
export async function skipPrompt(promptId: string): Promise<ActionResult<void>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    // Emit event
    await emitEvent({
      type: 'prompt.skipped',
      userId: session.userId,
      payload: {
        promptId,
        shownAt: new Date().toISOString(),
      },
    })

    revalidatePath('/today')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('skipPrompt error:', error)
    return { success: false, error: 'Failed to skip prompt' }
  }
}

// =============================================================================
// STREAM ACTIONS
// =============================================================================

/**
 * Get stream questions for endless prompt flow
 */
export async function getStreamQuestions(_limit: number = 10): Promise<ActionResult<any[]>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    // For now, return mock data until schema is updated
    // TODO: Replace with actual DB query after migration
    const mockQuestions = [
      {
        id: 'q1',
        text: 'I often remember my dreams in vivid detail',
        category: 'Dream Recall',
        variant: 'agree_disagree',
      },
      {
        id: 'q2',
        text: 'Do you ever realize you\'re dreaming while still in the dream?',
        category: 'Lucidity',
        variant: 'yes_no',
      },
      {
        id: 'q3',
        text: 'Water appears frequently in my dreams',
        category: 'Symbolism',
        variant: 'agree_disagree',
      },
    ]

    return { success: true, data: mockQuestions }
  } catch (error) {
    console.error('getStreamQuestions error:', error)
    return { success: false, error: 'Failed to fetch questions' }
  }
}

/**
 * Save a stream response
 */
export async function saveStreamResponse(
  input: z.infer<typeof SaveStreamResponseSchema>
): Promise<ActionResult<void>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    const { questionId, response, expandedText } = SaveStreamResponseSchema.parse(input)

    // Emit event
    await emitEvent({
      type: 'prompt.responded',
      userId: session.userId,
      payload: {
        promptId: questionId,
        value: { response, expandedText },
        shownAt: new Date().toISOString(),
      },
    })

    revalidatePath('/prompts')

    return { success: true, data: undefined }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input' }
    }
    
    console.error('saveStreamResponse error:', error)
    return { success: false, error: 'Failed to save response' }
  }
}

/**
 * Get category progress for funnel triggers
 */
export async function getCategoryProgress(_categoryId: string): Promise<ActionResult<{ promptAnswers: number }>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    // TODO: Query actual CategoryProgress table after migration
    return { success: true, data: { promptAnswers: 0 } }
  } catch (error) {
    console.error('getCategoryProgress error:', error)
    return { success: false, error: 'Failed to fetch progress' }
  }
}


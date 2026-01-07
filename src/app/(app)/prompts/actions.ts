'use server'

import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import { emitEvent } from '@/lib/events'
import { db } from '@/lib/db'
import type { ActionResult } from '@/lib/actions'

/**
 * Get stream of questions for prompts page
 */
export async function getStreamQuestions(limit: number = 10): Promise<ActionResult<Array<{
  id: string
  text: string
  type: string
}>>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    const prompts = await db.prompt.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        text: true,
        type: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    return {
      success: true,
      data: prompts,
    }
  } catch (error) {
    console.error('getStreamQuestions error:', error)
    return { success: false, error: 'Failed to load questions' }
  }
}

/**
 * Get today's prompt for the user
 */
export async function getTodayPrompt(): Promise<ActionResult<{
  id: string
  text: string
  type: string
  responseType: string
  options?: string[]
} | null>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if user already responded today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const existingResponse = await db.promptResponse.findFirst({
      where: {
        userId: session.userId,
        respondedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    if (existingResponse) {
      return { success: true, data: null }
    }

    // Get a prompt the user hasn't seen recently
    const recentResponses = await db.promptResponse.findMany({
      where: {
        userId: session.userId,
        respondedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      select: { promptId: true },
    })

    const recentPromptIds = recentResponses.map((r) => r.promptId)

    const prompt = await db.prompt.findFirst({
      where: {
        isActive: true,
        id: {
          notIn: recentPromptIds,
        },
      },
      orderBy: {
        createdAt: 'asc', // Rotate through prompts
      },
    })

    if (!prompt) {
      return { success: true, data: null }
    }

    // Emit prompt shown event
    await emitEvent({
      type: 'prompt.shown',
      userId: session.userId,
      payload: {
        promptId: prompt.id,
        shownAt: new Date().toISOString(),
      },
    })

    return {
      success: true,
      data: {
        id: prompt.id,
        text: prompt.text,
        type: prompt.type,
        responseType: prompt.responseType,
      },
    }
  } catch (error) {
    console.error('getTodayPrompt error:', error)
    return { success: false, error: 'Failed to load prompt' }
  }
}

/**
 * Submit a response to a prompt
 */
export async function respondToPrompt(
  promptId: string,
  value: Record<string, unknown>
): Promise<ActionResult<void>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    await emitEvent({
      type: 'prompt.responded',
      userId: session.userId,
      payload: {
        promptId,
        value,
        shownAt: new Date().toISOString(),
      },
    })

    revalidatePath('/prompts')
    revalidatePath('/today')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('respondToPrompt error:', error)
    return { success: false, error: 'Failed to submit response' }
  }
}

/**
 * Skip a prompt
 */
export async function skipPrompt(promptId: string): Promise<ActionResult<void>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    await emitEvent({
      type: 'prompt.skipped',
      userId: session.userId,
      payload: {
        promptId,
        shownAt: new Date().toISOString(),
      },
    })

    revalidatePath('/prompts')
    revalidatePath('/today')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('skipPrompt error:', error)
    return { success: false, error: 'Failed to skip prompt' }
  }
}

/**
 * Save a stream response (binary question format)
 * Used by the prompt stream and embedded prompt stack
 */
export async function saveStreamResponse(input: {
  questionId: string
  response: string
  expandedText?: string
}): Promise<ActionResult<void>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    await emitEvent({
      type: 'prompt.responded',
      userId: session.userId,
      payload: {
        promptId: input.questionId,
        value: {
          response: input.response,
          expandedText: input.expandedText,
        },
        shownAt: new Date().toISOString(),
      },
    })

    revalidatePath('/prompts')
    revalidatePath('/today')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('saveStreamResponse error:', error)
    return { success: false, error: 'Failed to save response' }
  }
}

/**
 * Get stream questions formatted for the binary card UI
 * Returns questions with category and variant fields for the frontend
 */
export async function getStreamQuestionsFormatted(limit: number = 10): Promise<ActionResult<Array<{
  id: string
  text: string
  category: string
  variant: 'yes_no' | 'agree_disagree' | 'true_false'
}>>> {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    const prompts = await db.prompt.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        text: true,
        type: true,
        responseType: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    // Transform to frontend format
    const formatted = prompts.map(p => ({
      id: p.id,
      text: p.text,
      category: formatCategory(p.type),
      variant: deriveVariant(p.responseType),
    }))

    return {
      success: true,
      data: formatted,
    }
  } catch (error) {
    console.error('getStreamQuestionsFormatted error:', error)
    return { success: false, error: 'Failed to load questions' }
  }
}

// Helper: Format category for display
function formatCategory(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

// Helper: Derive binary variant from responseType
function deriveVariant(responseType: string): 'yes_no' | 'agree_disagree' | 'true_false' {
  // Map response types to binary variants
  // Default to 'agree_disagree' for statement-style prompts
  switch (responseType) {
    case 'choice':
      return 'yes_no'
    case 'scale':
      return 'agree_disagree'
    default:
      return 'agree_disagree'
  }
}
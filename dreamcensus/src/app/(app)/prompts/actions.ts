'use server'

import { revalidatePath } from 'next/cache'
import { emitEvent } from '@/lib/events'
import { db } from '@/lib/db'
import { withAuth, type ActionResult } from '@/lib/actions'

/**
 * Get stream of questions for prompts page
 */
export async function getStreamQuestions(limit: number = 10): Promise<ActionResult<Array<{
  id: string
  text: string
  type: string
}>>> {
  return withAuth(async (session) => {
    try {
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
  })
}

/**
 * Skip a prompt
 */
export async function skipPrompt(promptId: string): Promise<ActionResult<void>> {
  return withAuth(async (session) => {
    try {
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
  })
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
  return withAuth(async (session) => {
    try {
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
  })
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
  return withAuth(async (session) => {
    try {
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
  })
}

/**
 * Get a single question by ID for the detail page
 */
export async function getQuestionById(questionId: string): Promise<ActionResult<{
  id: string
  text: string
  category: string
  variant: 'yes_no' | 'agree_disagree' | 'true_false'
} | null>> {
  return withAuth(async () => {
    try {
      const prompt = await db.prompt.findUnique({
        where: { id: questionId },
        select: { id: true, text: true, type: true, responseType: true, isActive: true },
      })

      if (!prompt || !prompt.isActive) {
        return { success: true, data: null }
      }

      return {
        success: true,
        data: {
          id: prompt.id,
          text: prompt.text,
          category: formatCategory(prompt.type),
          variant: deriveVariant(prompt.responseType),
        },
      }
    } catch (error) {
      console.error('getQuestionById error:', error)
      return { success: false, error: 'Failed to load question' }
    }
  })
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
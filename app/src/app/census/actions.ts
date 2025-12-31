'use server'

import { db } from '@/lib/db'
import { getSession, ensureSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { SCHEMA_VERSION } from '@/lib/constants'
import type { AnswersState, AnswerValue } from '@/lib/types'
import { trackCensusComplete } from '@/lib/analytics'

// Validation schemas
const AnswerValueSchema = z.union([
  z.string(),
  z.array(z.string()),
  z.number(),
  z.boolean(),
  z.null(),
])

const SaveAnswerSchema = z.object({
  stepId: z.string().min(1),
  value: AnswerValueSchema,
})

const SubmitCensusSchema = z.object({
  answers: z.record(z.string(), AnswerValueSchema),
})

/**
 * Save a single answer during the census
 */
export async function saveAnswer(formData: FormData) {
  const session = await ensureSession()
  
  const rawValue = formData.get('value') as string || 'null'
  let parsedValue: AnswerValue = null
  try {
    parsedValue = JSON.parse(rawValue)
  } catch {
    parsedValue = null
  }

  const parsed = SaveAnswerSchema.safeParse({
    stepId: formData.get('stepId'),
    value: parsedValue,
  })

  if (!parsed.success) {
    return { error: 'Invalid answer data' }
  }

  const { stepId, value } = parsed.data

  // Get or create census response for this session
  // Look for any response (in_progress or completed) since chapters can be done individually
  let response = await db.censusResponse.findFirst({
    where: {
      userId: session.userId,
      version: SCHEMA_VERSION,
      status: { in: ['in_progress', 'completed'] },
    },
  })

  if (!response) {
    response = await db.censusResponse.create({
      data: {
        userId: session.userId,
        version: SCHEMA_VERSION,
        status: 'in_progress',
      },
    })
  } else if (response.status === 'completed') {
    // If response was marked completed prematurely, set it back to in_progress
    response = await db.censusResponse.update({
      where: { id: response.id },
      data: { status: 'in_progress' },
    })
  }

  // Upsert the answer part
  await db.censusResponsePart.upsert({
    where: {
      responseId_stepId: {
        responseId: response.id,
        stepId,
      },
    },
    update: {
      answer: value,
      answeredAt: new Date(),
    },
    create: {
      responseId: response.id,
      stepId,
      answer: value,
    },
  })

  // Revalidate census pages
  revalidatePath('/census')

  return { success: true }
}

/**
 * Submit the complete census
 */
export async function submitCensus(data: unknown) {
  const session = await ensureSession()

  const parsed = SubmitCensusSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Invalid census data' }
  }

  const { answers } = parsed.data

  // 1. Batch fetch all steps (1 query instead of N)
  const allSteps = await db.censusStep.findMany({
    where: { version: SCHEMA_VERSION },
    select: { id: true, analyticsKey: true },
  })

  // Build lookup map for O(1) access
  const stepMap = new Map<string, string>()
  for (const s of allSteps) {
    stepMap.set(s.id, s.id)
    if (s.analyticsKey) stepMap.set(s.analyticsKey, s.id)
  }

  // 2. Use transaction for atomicity
  try {
    const result = await db.$transaction(async (tx) => {
      // Get or create response
      let response = await tx.censusResponse.findFirst({
        where: { userId: session.userId, version: SCHEMA_VERSION, status: 'in_progress' },
      })

      if (!response) {
        response = await tx.censusResponse.create({
          data: { userId: session.userId, version: SCHEMA_VERSION, status: 'in_progress' },
        })
      }

      // Batch upsert answers
      const answerData = Object.entries(answers)
        .filter(([key]) => stepMap.has(key))
        .map(([key, value]) => ({
          responseId: response.id,
          stepId: stepMap.get(key)!,
          answer: value,
          answeredAt: new Date(),
        }))

      // Delete existing parts and recreate (simpler than individual upserts)
      await tx.censusResponsePart.deleteMany({
        where: { responseId: response.id },
      })
      
      if (answerData.length > 0) {
        await tx.censusResponsePart.createMany({ data: answerData })
      }

      // Mark complete
      await tx.censusResponse.update({
        where: { id: response.id },
        data: { status: 'completed', completedAt: new Date() },
      })

      return { success: true, responseId: response.id }
    })

    // Track completion event
    await trackCensusComplete(session.userId)

    // Revalidate any cached data
    revalidatePath('/census')
    revalidatePath('/profile')
    revalidatePath('/insights')

    return result
  } catch (error) {
    console.error('Census submission error:', error)
    return { error: 'Failed to submit census. Please try again.' }
  }
}

/**
 * Check if all chapters are complete and mark census as complete if so
 */
export async function checkAndCompleteCensus() {
  const session = await ensureSession()
  
  const { areAllChaptersComplete } = await import('@/lib/chapters')
  const allComplete = await areAllChaptersComplete(session.userId)
  
  if (allComplete) {
    // Find the in_progress response and mark it complete
    const response = await db.censusResponse.findFirst({
      where: {
        userId: session.userId,
        version: SCHEMA_VERSION,
        status: 'in_progress',
      },
    })
    
    if (response) {
      await db.censusResponse.update({
        where: { id: response.id },
        data: { status: 'completed', completedAt: new Date() },
      })
      
      // Track completion event
      await trackCensusComplete(session.userId)
      
      // Revalidate cached pages
      revalidatePath('/census')
      revalidatePath('/profile')
    }
  }
  
  return { allComplete }
}

/**
 * Get saved progress for current user
 */
export async function getSavedProgress() {
  const session = await getSession()
  
  // Return null if no session exists yet
  if (!session) {
    return null
  }

  const response = await db.censusResponse.findFirst({
    where: {
      userId: session.userId,
      version: SCHEMA_VERSION,
      status: 'in_progress',
    },
    include: {
      parts: {
        include: { step: true }, // JOIN instead of N queries
      },
    },
    orderBy: {
      startedAt: 'desc',
    },
  })

  if (!response) {
    return null
  }

  // Convert parts to answers map
  const answers: AnswersState = {}
  for (const part of response.parts) {
    const key = part.step.analyticsKey || part.stepId
    answers[key] = part.answer as AnswerValue
  }

  return {
    responseId: response.id,
    answers,
    startedAt: response.startedAt,
  }
}


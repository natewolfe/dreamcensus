'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { emitEvent } from '@/lib/events'
import type { CensusSection, CensusProgress } from '@/components/census/types'
import { withAuth, type ActionResult } from '@/lib/actions'

// =============================================================================
// SCHEMAS
// =============================================================================

const SubmitAnswersSchema = z.object({
  sectionId: z.string(),
  answers: z.array(z.object({
    questionId: z.string(),
    value: z.unknown(),
  })),
})

// =============================================================================
// ACTIONS
// =============================================================================

/**
 * Get all census sections with questions
 */
export async function getCensusSections(): Promise<ActionResult<CensusSection[]>> {
  try {
    const sections = await db.censusSection.findMany({
      include: {
        questions: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    return {
      success: true,
      data: sections.map((s) => ({
        id: s.id,
        slug: s.slug,
        instrumentId: s.instrumentId,
        name: s.name,
        description: s.description ?? undefined,
        icon: s.icon ?? undefined,
        order: s.sortOrder,
        questions: s.questions.map((q: any) => ({
          id: q.id,
          sectionId: q.sectionId,
          type: q.type as any,
          text: q.text,
          description: q.helpText ?? undefined,
          required: q.isRequired,
          order: q.sortOrder,
          config: q.props as any,
        })),
        estimatedMinutes: Math.ceil(s.estimatedTime / 60),
      })),
    }
  } catch (error) {
    console.error('getCensusSections error:', error)
    return { success: false, error: 'Failed to fetch census sections' }
  }
}

/**
 * Get census progress for current user
 */
export async function getCensusProgress(): Promise<ActionResult<Record<string, CensusProgress>>> {
  return withAuth(async (session) => {
    try {
      const progressRecord = await db.censusProgress.findUnique({
        where: { userId: session.userId },
      })

      const progressMap: Record<string, CensusProgress> = {}
      
      if (progressRecord) {
        const sectionProgress = progressRecord.sectionProgress as any
        
        Object.keys(sectionProgress).forEach((sectionId) => {
          const section = sectionProgress[sectionId]
          progressMap[sectionId] = {
            sectionId,
            totalQuestions: section.total ?? 0,
            answeredQuestions: section.completed ?? 0,
            completedAt: section.completedAt ? new Date(section.completedAt) : undefined,
          }
        })
      }

      return { success: true, data: progressMap }
    } catch (error) {
      console.error('getCensusProgress error:', error)
      return { success: false, error: 'Failed to fetch progress' }
    }
  })
}

/**
 * Get answers for a specific section
 */
export async function getSectionAnswers(
  sectionId: string
): Promise<ActionResult<Map<string, unknown>>> {
  return withAuth(async (session) => {
    try {
      // Get questions for this section
      const section = await db.censusSection.findUnique({
        where: { id: sectionId },
        include: { questions: true },
      })

      if (!section) {
        return { success: false, error: 'Section not found' }
      }

      // Get answers
      const questionIds = section.questions.map((q) => q.id)
      const answers = await db.censusAnswer.findMany({
        where: {
          userId: session.userId,
          questionId: { in: questionIds },
        },
      })

      const answerMap = new Map<string, unknown>()
      answers.forEach((a) => {
        answerMap.set(a.questionId, a.value)
      })

      return { success: true, data: answerMap }
    } catch (error) {
      console.error('getSectionAnswers error:', error)
      return { success: false, error: 'Failed to fetch answers' }
    }
  })
}

/**
 * Submit answers for a section
 */
export async function submitSectionAnswers(
  input: z.infer<typeof SubmitAnswersSchema>
): Promise<ActionResult<void>> {
  return withAuth(async (session) => {
    try {
      const { sectionId, answers } = SubmitAnswersSchema.parse(input)

      // Get section to validate
      const section = await db.censusSection.findUnique({
        where: { id: sectionId },
        include: { questions: true },
      })

      if (!section) {
        return { success: false, error: 'Section not found' }
      }

      // Emit events for each answer
      for (const answer of answers) {
        await emitEvent({
          type: 'census.answer.submitted',
          userId: session.userId,
          payload: {
            questionId: answer.questionId,
            value: answer.value,
            sectionId,
            instrumentVersion: 1,
          },
        })
      }

      // Update progress (stored in JSON field)
      const existingProgress = await db.censusProgress.findUnique({
        where: { userId: session.userId },
      })

      const sectionProgress = (existingProgress?.sectionProgress as any) ?? {}
      sectionProgress[sectionId] = {
        completed: answers.length,
        total: section.questions.length,
        completedAt: answers.length === section.questions.length ? new Date().toISOString() : null,
      }

      await db.censusProgress.upsert({
        where: { userId: session.userId },
        create: {
          userId: session.userId,
          sectionProgress,
          totalCompleted: answers.length,
          totalQuestions: section.questions.length,
          lastActivityAt: new Date(),
        },
        update: {
          sectionProgress,
          totalCompleted: Object.values(sectionProgress).reduce((sum: number, s: any) => sum + s.completed, 0),
          lastActivityAt: new Date(),
        },
      })

      revalidatePath('/census')

      return { success: true, data: undefined }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: 'Invalid input' }
      }
      
      console.error('submitSectionAnswers error:', error)
      return { success: false, error: 'Failed to submit answers' }
    }
  })
}


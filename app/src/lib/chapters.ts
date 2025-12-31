/**
 * Chapter-related utilities for the census
 */

import { db } from './db'
import type { CensusStepData, StepProps, StepKind, AnswersState, AnswerValue } from './types'
import { SCHEMA_VERSION } from './constants'

export interface CensusChapterData {
  id: string
  slug: string
  name: string
  description: string | null
  orderIndex: number
  iconEmoji: string | null
  estimatedMinutes: number
  stepCount: number
  answeredCount: number
  isComplete: boolean
  isLocked: boolean // True if prerequisites aren't met
}

/**
 * Get all census chapters with progress information
 */
export async function getChaptersWithProgress(
  userId?: string
): Promise<CensusChapterData[]> {
  // Fetch all chapters with their steps in a single query (eager loading)
  const chapters = await db.censusChapter.findMany({
    orderBy: { orderIndex: 'asc' },
    include: {
      steps: {
        where: {
          version: SCHEMA_VERSION,
          block: {
            kind: { not: 'group' },
          },
        },
        include: {
          block: true,
        },
      },
    },
  })

  // Get user's saved answers if userId provided
  let userAnswers: AnswersState = {}
  if (userId) {
    const response = await db.censusResponse.findFirst({
      where: {
        userId,
        version: SCHEMA_VERSION,
        status: { in: ['in_progress', 'completed'] },
      },
      include: {
        parts: {
          include: {
            step: {
              include: {
                block: true,
              },
            },
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    })

    if (response) {
      userAnswers = response.parts.reduce((acc, part) => {
        const key = part.step.analyticsKey || part.step.id
        acc[key] = part.answer as AnswerValue
        return acc
      }, {} as AnswersState)
    }
  }

  // Find threshold chapter and calculate its completion once
  const thresholdChapter = chapters.find((c) => c.orderIndex === 1)
  let thresholdComplete = false
  if (thresholdChapter) {
    const thresholdSteps = thresholdChapter.steps
    const thresholdAnswered = thresholdSteps.filter((step) => {
      const key = step.analyticsKey || step.id
      return userAnswers[key] !== undefined
    }).length
    thresholdComplete = thresholdSteps.length > 0 && thresholdAnswered === thresholdSteps.length
  }

  // Build chapter progress data (no more queries in loop)
  const chaptersWithProgress: CensusChapterData[] = chapters.map((chapter) => {
    const steps = chapter.steps
    const stepCount = steps.length
    
    // Count answered steps
    const answeredCount = steps.filter((step) => {
      const key = step.analyticsKey || step.id
      return userAnswers[key] !== undefined
    }).length

    const isComplete = stepCount > 0 && answeredCount === stepCount
    
    // Chapter 1 (threshold) is always unlocked, others require chapter 1 completion
    const isLocked = chapter.orderIndex > 1 && !thresholdComplete

    return {
      id: chapter.id,
      slug: chapter.slug,
      name: chapter.name,
      description: chapter.description,
      orderIndex: chapter.orderIndex,
      iconEmoji: chapter.iconEmoji,
      estimatedMinutes: chapter.estimatedMinutes,
      stepCount,
      answeredCount,
      isComplete,
      isLocked,
    }
  })

  return chaptersWithProgress
}

/**
 * Get steps for a specific chapter
 */
export async function getChapterSteps(chapterSlug: string): Promise<CensusStepData[]> {
  const chapter = await db.censusChapter.findUnique({
    where: { slug: chapterSlug },
  })

  if (!chapter) {
    throw new Error(`Chapter not found: ${chapterSlug}`)
  }

  const steps = await db.censusStep.findMany({
    where: {
      chapterId: chapter.id,
      version: SCHEMA_VERSION,
      block: {
        kind: { not: 'group' },
      },
    },
    include: {
      block: true,
    },
    orderBy: { orderHint: 'asc' },
  })

  return steps.map((step) => ({
    id: step.id,
    blockId: step.blockId,
    orderHint: step.orderHint,
    analyticsKey: step.analyticsKey,
    parentId: step.parentId,
    kind: step.block.kind as StepKind,
    label: step.block.label,
    help: step.block.help,
    props: step.block.props as StepProps,
  }))
}

/**
 * Get chapter by slug
 */
export async function getChapter(chapterSlug: string) {
  return await db.censusChapter.findUnique({
    where: { slug: chapterSlug },
  })
}

/**
 * Check if all chapters are complete for a user
 */
export async function areAllChaptersComplete(userId: string): Promise<boolean> {
  const chapters = await getChaptersWithProgress(userId)
  return chapters.every((chapter) => chapter.isComplete)
}

/**
 * Get preview questions for a chapter (first 3 questions for teasing)
 */
export async function getChapterPreviews(chapterSlug: string, limit: number = 3): Promise<CensusStepData[]> {
  const chapter = await db.censusChapter.findUnique({
    where: { slug: chapterSlug },
  })

  if (!chapter) {
    return []
  }

  const steps = await db.censusStep.findMany({
    where: {
      chapterId: chapter.id,
      version: SCHEMA_VERSION,
      block: {
        kind: { not: 'group' },
      },
    },
    include: {
      block: true,
    },
    orderBy: { orderHint: 'asc' },
    take: limit,
  })

  return steps.map((step) => ({
    id: step.id,
    blockId: step.blockId,
    orderHint: step.orderHint,
    analyticsKey: step.analyticsKey,
    parentId: step.parentId,
    kind: step.block.kind as StepKind,
    label: step.block.label,
    help: step.block.help,
    props: step.block.props as StepProps,
  }))
}


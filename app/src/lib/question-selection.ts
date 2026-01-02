'use server'

import { db } from './db'
import type { Question } from './types'

export interface SelectionOptions {
  userId: string
  mode?: 'mixed' | 'theme-focus'
  themeSlug?: string
  limit?: number
  excludeAnswered?: boolean
}

export interface SelectionResult {
  questions: Question[]
  themeProgress?: {
    themeId: string
    themeSlug: string
    themeName: string
    answered: number
    total: number
  }
}

/**
 * Smart question selection algorithm
 * 
 * Priority logic:
 * 1. Tier 1 (census-core) questions get 70% allocation if incomplete
 * 2. Tier 2 (census-extended) questions get 20% allocation for variety
 * 3. Tier 3 (exploration) questions get 10% allocation
 * 4. Never repeat answered questions (unless excludeAnswered = false)
 * 5. Balance by theme to avoid fatigue
 */
export async function selectQuestions(options: SelectionOptions): Promise<SelectionResult> {
  const {
    userId,
    mode = 'mixed',
    themeSlug,
    limit = 10,
    excludeAnswered = true,
  } = options

  // Get answered question IDs
  let answeredIds = new Set<string>()
  if (excludeAnswered) {
    const answered = await db.questionResponse.findMany({
      where: { userId },
      select: { questionId: true },
    })
    answeredIds = new Set(answered.map(r => r.questionId))
  }

  if (mode === 'theme-focus' && themeSlug) {
    return selectThemeFocusQuestions(userId, themeSlug, limit, answeredIds)
  }

  return selectMixedQuestions(userId, limit, answeredIds)
}

/**
 * Theme-focus mode: Select only questions from a specific theme
 */
async function selectThemeFocusQuestions(
  userId: string,
  themeSlug: string,
  limit: number,
  answeredIds: Set<string>
): Promise<SelectionResult> {
  // Get theme
  const theme = await db.theme.findUnique({
    where: { slug: themeSlug },
    include: {
      questions: {
        orderBy: { orderInTheme: 'asc' },
      },
    },
  })

  if (!theme) {
    throw new Error(`Theme not found: ${themeSlug}`)
  }

  // Filter unanswered questions
  const unansweredQuestions = theme.questions
    .filter(q => !answeredIds.has(q.id))
    .slice(0, limit)

  const questions: Question[] = unansweredQuestions.map(q => ({
    id: q.id,
    text: q.text,
    category: q.category,
    kind: q.kind as any,
    props: q.props as any,
    tier: q.tier as 1 | 2 | 3,
    themeId: q.themeId || undefined,
    themeSlug: theme.slug,
    help: q.help,
    tags: q.tags as string[],
  }))

  // Calculate theme progress
  const totalInTheme = theme.questions.length
  const answeredInTheme = theme.questions.filter(q => answeredIds.has(q.id)).length

  return {
    questions,
    themeProgress: {
      themeId: theme.id,
      themeSlug: theme.slug,
      themeName: theme.name,
      answered: answeredInTheme,
      total: totalInTheme,
    },
  }
}

/**
 * Mixed mode: Smart mix of tier 1, 2, and 3 questions
 */
async function selectMixedQuestions(
  userId: string,
  limit: number,
  answeredIds: Set<string>
): Promise<SelectionResult> {
  // Calculate distribution
  const tier1Limit = Math.ceil(limit * 0.7)
  const tier2Limit = Math.ceil(limit * 0.2)
  const tier3Limit = limit - tier1Limit - tier2Limit

  // Fetch tier 1 questions (census-core)
  const tier1Questions = await db.question.findMany({
    where: {
      tier: 1,
      id: { notIn: Array.from(answeredIds) },
    },
    orderBy: [
      { timesShown: 'asc' },  // Prioritize less-shown questions
      { orderInTheme: 'asc' },
    ],
    take: tier1Limit * 2,  // Fetch extra for filtering
  })

  // Fetch tier 2 questions (census-extended)
  const tier2Questions = await db.question.findMany({
    where: {
      tier: 2,
      id: { notIn: Array.from(answeredIds) },
    },
    orderBy: [
      { timesShown: 'asc' },
      { orderInTheme: 'asc' },
    ],
    take: tier2Limit * 2,
  })

  // Fetch tier 3 questions (exploration)
  const tier3Questions = await db.question.findMany({
    where: {
      tier: 3,
      id: { notIn: Array.from(answeredIds) },
    },
    orderBy: [
      { timesShown: 'asc' },
    ],
    take: tier3Limit * 2,
  })

  // Balance by theme to avoid consecutive questions from same theme
  const selectedQuestions = balanceByTheme([
    ...tier1Questions.slice(0, tier1Limit),
    ...tier2Questions.slice(0, tier2Limit),
    ...tier3Questions.slice(0, tier3Limit),
  ])

  const questions: Question[] = selectedQuestions.map(q => ({
    id: q.id,
    text: q.text,
    category: q.category,
    kind: q.kind as any,
    props: q.props as any,
    tier: q.tier as 1 | 2 | 3,
    themeId: q.themeId || undefined,
    themeSlug: q.theme?.slug,
    help: q.help,
    tags: q.tags as string[],
  }))

  return { questions }
}

/**
 * Balance questions to avoid consecutive questions from the same theme
 */
function balanceByTheme(questions: any[]): any[] {
  if (questions.length <= 1) return questions

  const balanced: any[] = []
  const byTheme = new Map<string | null, any[]>()

  // Group by theme
  questions.forEach(q => {
    const themeId = q.themeId || null
    if (!byTheme.has(themeId)) {
      byTheme.set(themeId, [])
    }
    byTheme.get(themeId)!.push(q)
  })

  // Round-robin selection from themes
  const themeQueues = Array.from(byTheme.values())
  let currentThemeIndex = 0

  while (balanced.length < questions.length) {
    const queue = themeQueues[currentThemeIndex]
    
    if (queue && queue.length > 0) {
      balanced.push(queue.shift()!)
    }
    
    currentThemeIndex = (currentThemeIndex + 1) % themeQueues.length
    
    // Remove empty queues
    if (queue && queue.length === 0) {
      themeQueues.splice(currentThemeIndex, 1)
      if (themeQueues.length === 0) break
      currentThemeIndex = currentThemeIndex % Math.max(1, themeQueues.length)
    }
  }

  return balanced
}

/**
 * Get theme progress for a user
 */
export async function getThemeProgress(userId: string, themeSlug: string) {
  const theme = await db.theme.findUnique({
    where: { slug: themeSlug },
    include: {
      questions: {
        select: { id: true },
      },
    },
  })

  if (!theme) return null

  const answered = await db.questionResponse.count({
    where: {
      userId,
      questionId: { in: theme.questions.map(q => q.id) },
    },
  })

  return {
    themeId: theme.id,
    themeSlug: theme.slug,
    themeName: theme.name,
    answered,
    total: theme.questions.length,
    percentage: theme.questions.length > 0 ? (answered / theme.questions.length) * 100 : 0,
  }
}

/**
 * Get overall census progress for a user
 */
export async function getCensusProgress(userId: string) {
  const totalCensusQuestions = await db.question.count({
    where: { tier: { in: [1, 2] } },  // Only count tier 1 and 2 as "census"
  })

  const answeredCensusQuestions = await db.questionResponse.count({
    where: {
      userId,
      question: {
        tier: { in: [1, 2] },
      },
    },
  })

  // If there are no questions in the database yet, return 0% progress
  if (totalCensusQuestions === 0) {
    return {
      total: 0,
      answered: 0,
      percentage: 0,
      isComplete: false,
    }
  }

  return {
    total: totalCensusQuestions,
    answered: answeredCensusQuestions,
    percentage: (answeredCensusQuestions / totalCensusQuestions) * 100,
    isComplete: answeredCensusQuestions >= totalCensusQuestions && totalCensusQuestions > 0,
  }
}


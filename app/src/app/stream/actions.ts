'use server'

import { db } from '@/lib/db'
import { getSession, ensureSession } from '@/lib/auth'
import { trackStreamResponse } from '@/lib/analytics'

/**
 * Get a batch of stream questions for the user
 * Uses a simple algorithm for now - can be enhanced with ML/preferences later
 * 
 * Note: Reads session but doesn't create one (to avoid cookie errors in Server Components)
 */
export async function getStreamQuestions(limit: number = 10) {
  const session = await getSession()

  let answeredIdSet = new Set<string>()
  
  // Only filter answered questions if user has a session
  if (session) {
    const answeredIds = await db.streamResponse.findMany({
      where: { userId: session.userId },
      select: { questionId: true },
    })
    answeredIdSet = new Set(answeredIds.map((r) => r.questionId))
  }

  // Fetch questions, prioritizing approved and balancing by tier
  const allQuestions = await db.streamQuestion.findMany({
    where: {
      approved: true,
    },
    orderBy: [
      { timesShown: 'asc' }, // Show less-seen questions first
      { tier: 'asc' }, // Prioritize census questions
    ],
    take: limit * 3, // Fetch extra to filter out answered ones
  })

  // Filter out answered questions (if applicable)
  const unanswered = allQuestions.filter((q) => !answeredIdSet.has(q.id))

  // Take the requested limit
  return unanswered.slice(0, limit).map((q) => ({
    id: q.id,
    text: q.text,
    category: q.category,
    tags: q.tags as string[],
  }))
}

/**
 * Save a user's response to a stream question
 */
export async function saveStreamResponse(
  questionId: string,
  response: 'yes' | 'no' | 'skip',
  expandedText?: string,
  timeOnCard?: number
) {
  const session = await ensureSession()

  // Save the response
  await db.streamResponse.create({
    data: {
      userId: session.userId,
      questionId,
      response,
      expandedText,
      timeOnCard,
      threadPath: '[]', // TODO: Implement thread tracking
    },
  })

  // Track analytics event
  await trackStreamResponse(session.userId, questionId, response, !!expandedText)

  // Update question analytics
  await db.streamQuestion.update({
    where: { id: questionId },
    data: {
      timesShown: { increment: 1 },
      ...(response === 'yes' && { yesCount: { increment: 1 } }),
      ...(response === 'no' && { noCount: { increment: 1 } }),
      ...(expandedText && { expandRate: { increment: 0.01 } }), // Rough calculation
    },
  })

  return { success: true }
}

/**
 * Clear a user's response to a stream question (but optionally preserve text for resubmission)
 */
export async function clearStreamResponse(
  questionId: string,
  preserveText?: boolean,
  expandedText?: string
) {
  const session = await ensureSession()

  // Delete all responses for this question (in case of duplicates)
  await db.streamResponse.deleteMany({
    where: {
      userId: session.userId,
      questionId,
    },
  })

  // Return the preserved text if requested (client will handle re-saving)
  return {
    success: true,
    preservedText: preserveText ? expandedText : undefined,
  }
}

/**
 * Get user's answered stream questions (for review)
 */
export async function getAnsweredQuestions() {
  const session = await getSession()
  if (!session) return []

  // Get user's responses with associated questions
  const responses = await db.streamResponse.findMany({
    where: { userId: session.userId },
    include: {
      question: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Deduplicate by question ID (keep most recent response per question)
  const uniqueResponses = new Map<string, typeof responses[0]>()
  responses.forEach((r) => {
    if (!uniqueResponses.has(r.questionId)) {
      uniqueResponses.set(r.questionId, r)
    }
  })

  return Array.from(uniqueResponses.values()).map((r) => ({
    question: {
      id: r.question.id,
      text: r.question.text,
      category: r.question.category,
      tags: r.question.tags as string[],
    },
    response: r.response as 'yes' | 'no',
    expandedText: r.expandedText,
  }))
}



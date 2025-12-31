/**
 * Background job: Update stream question analytics
 */

import { db } from '../lib/db'

/**
 * Recalculate expand rates for stream questions
 */
export async function updateStreamAnalytics() {
  const questions = await db.streamQuestion.findMany({
    select: {
      id: true,
      responses: {
        select: {
          expandedText: true,
        },
      },
    },
  })

  console.log(`Updating analytics for ${questions.length} questions...`)

  for (const question of questions) {
    const totalResponses = question.responses.length
    const expandedResponses = question.responses.filter(
      (r) => r.expandedText && r.expandedText.length > 0
    ).length

    const expandRate = totalResponses > 0 ? expandedResponses / totalResponses : 0

    await db.streamQuestion.update({
      where: { id: question.id },
      data: { expandRate },
    })
  }

  console.log('✅ Analytics updated')
}

// Run if executed directly
if (require.main === module) {
  updateStreamAnalytics()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}


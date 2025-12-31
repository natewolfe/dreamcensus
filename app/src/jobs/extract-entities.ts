/**
 * Background job: Extract symbols and emotions from dreams
 */

import { db } from '../lib/db'
import { processDreamEntities } from '../lib/extraction/pipeline'

const BATCH_SIZE = 10

/**
 * Process dreams that need entity extraction
 */
export async function extractPendingEntities() {
  // Find dreams without symbol/emotion links
  const dreams = await db.dreamEntry.findMany({
    where: {
      AND: [
        { textRaw: { not: '' } },
        {
          OR: [
            { symbols: { none: {} } },
            { emotions: { none: {} } },
          ],
        },
      ],
    },
    select: {
      id: true,
    },
    take: BATCH_SIZE,
  })

  if (dreams.length === 0) {
    console.log('No pending dreams for entity extraction')
    return
  }

  console.log(`Processing ${dreams.length} dreams...`)

  let successCount = 0
  let errorCount = 0

  for (const dream of dreams) {
    try {
      await processDreamEntities(dream.id)
      successCount++
    } catch (error) {
      console.error(`Error processing dream ${dream.id}:`, error)
      errorCount++
    }
  }

  console.log(`✅ Processed ${successCount} dreams, ${errorCount} errors`)
}

// Run if executed directly
if (require.main === module) {
  extractPendingEntities()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}


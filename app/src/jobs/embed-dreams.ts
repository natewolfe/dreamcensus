/**
 * Background job: Generate embeddings for dreams
 */

import { db } from '../lib/db'
import { OpenAIEmbeddingProvider } from '../lib/embeddings/openai'

const BATCH_SIZE = 50

/**
 * Process pending dream embeddings
 */
export async function embedPendingDreams() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.error('OPENAI_API_KEY not set')
    return
  }

  const provider = new OpenAIEmbeddingProvider(apiKey)

  // Find dreams without embeddings
  const dreams = await db.dreamEntry.findMany({
    where: {
      embedding: null,
      textRaw: { not: '' },
    },
    select: {
      id: true,
      textRaw: true,
    },
    take: BATCH_SIZE,
  })

  if (dreams.length === 0) {
    console.log('No pending dreams to embed')
    return
  }

  console.log(`Processing ${dreams.length} dreams...`)

  try {
    // Generate embeddings in batch
    const texts = dreams.map((d) => d.textRaw)
    const embeddings = await provider.embedBatch(texts)

    // Save embeddings
    await Promise.all(
      dreams.map((dream, index) =>
        db.dreamEntry.update({
          where: { id: dream.id },
          data: {
            embedding: embeddings[index] as any, // pgvector type
            embeddingModel: provider.model,
            embeddedAt: new Date(),
          },
        })
      )
    )

    console.log(`✅ Embedded ${dreams.length} dreams`)
  } catch (error) {
    console.error('Error embedding dreams:', error)
    throw error
  }
}

// Run if executed directly
if (require.main === module) {
  embedPendingDreams()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}


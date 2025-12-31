/**
 * Vector similarity utilities
 */

/**
 * Calculate cosine similarity between two vectors
 * Returns a value between -1 and 1, where 1 means identical
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB)
  
  if (denominator === 0) {
    return 0
  }

  return dotProduct / denominator
}

/**
 * Calculate Euclidean distance between two vectors
 * Lower values indicate more similar vectors
 */
export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
  }

  let sum = 0
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i]
    sum += diff * diff
  }

  return Math.sqrt(sum)
}

/**
 * Find the top K most similar vectors to a query vector
 */
export function findTopK<T>(
  query: number[],
  candidates: Array<{ vector: number[]; data: T }>,
  k: number,
  similarityFn: (a: number[], b: number[]) => number = cosineSimilarity
): Array<{ data: T; similarity: number }> {
  const similarities = candidates.map(({ vector, data }) => ({
    data,
    similarity: similarityFn(query, vector),
  }))

  // Sort by similarity (descending for cosine, ascending for distance)
  similarities.sort((a, b) => b.similarity - a.similarity)

  return similarities.slice(0, k)
}


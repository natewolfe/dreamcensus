/**
 * Abstract embedding provider interface
 */

export interface EmbeddingProvider {
  /**
   * Generate embedding for a single text
   */
  embed(text: string): Promise<number[]>
  
  /**
   * Generate embeddings for multiple texts in batch
   */
  embedBatch(texts: string[]): Promise<number[][]>
  
  /**
   * Dimension of the embedding vectors
   */
  readonly dimensions: number
  
  /**
   * Model identifier
   */
  readonly model: string
}

export interface EmbeddingOptions {
  /**
   * Maximum number of texts to process in a single batch
   */
  batchSize?: number
  
  /**
   * Retry attempts for failed requests
   */
  retries?: number
  
  /**
   * Timeout in milliseconds
   */
  timeout?: number
}

export class EmbeddingError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly originalError?: unknown
  ) {
    super(message)
    this.name = 'EmbeddingError'
  }
}


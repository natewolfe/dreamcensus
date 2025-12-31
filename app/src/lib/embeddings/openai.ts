/**
 * OpenAI embeddings implementation
 */

import type { EmbeddingProvider, EmbeddingOptions } from './provider'
import { EmbeddingError } from './provider'

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  readonly dimensions: number
  readonly model: string
  private apiKey: string
  private options: Required<EmbeddingOptions>

  constructor(
    apiKey: string,
    model: 'text-embedding-3-small' | 'text-embedding-3-large' | 'text-embedding-ada-002' = 'text-embedding-3-small',
    options?: EmbeddingOptions
  ) {
    this.apiKey = apiKey
    this.model = model
    this.dimensions = model === 'text-embedding-3-large' ? 3072 : 1536
    this.options = {
      batchSize: options?.batchSize || 100,
      retries: options?.retries || 3,
      timeout: options?.timeout || 30000,
    }
  }

  async embed(text: string): Promise<number[]> {
    const [embedding] = await this.embedBatch([text])
    return embedding
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
      return []
    }

    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          input: texts,
        }),
        signal: AbortSignal.timeout(this.options.timeout),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
        throw new Error(error.error?.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      
      // Sort by index to ensure correct order
      const sorted = data.data.sort((a: any, b: any) => a.index - b.index)
      return sorted.map((item: any) => item.embedding)
    } catch (error) {
      throw new EmbeddingError(
        `OpenAI embedding failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'openai',
        error
      )
    }
  }

  /**
   * Process large batches with automatic chunking
   */
  async embedLargeBatch(texts: string[]): Promise<number[][]> {
    const results: number[][] = []
    
    for (let i = 0; i < texts.length; i += this.options.batchSize) {
      const batch = texts.slice(i, i + this.options.batchSize)
      const embeddings = await this.embedBatch(batch)
      results.push(...embeddings)
    }
    
    return results
  }
}


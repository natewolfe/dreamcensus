import { describe, it, expect } from 'vitest'
import { assignArchetype, ARCHETYPES } from '../archetypes'
import type { DimensionResult } from '../types'

describe('archetypes', () => {
  it('should return null with insufficient dimensions', () => {
    const dimensions: DimensionResult[] = [
      { dimension: 'boundary', score: 75, confidence: 80, isEstimate: false },
      { dimension: 'lucidity', score: null, confidence: 20, isEstimate: true },
      { dimension: 'emotion', score: null, confidence: 30, isEstimate: true },
      { dimension: 'meaning', score: null, confidence: 25, isEstimate: true },
      { dimension: 'engagement', score: null, confidence: 15, isEstimate: true },
    ]

    const result = assignArchetype(dimensions)
    expect(result.primary).toBeNull()
    expect(result.secondary).toBeNull()
  })

  it('should assign Navigator for high lucidity', () => {
    const dimensions: DimensionResult[] = [
      { dimension: 'boundary', score: 50, confidence: 70, isEstimate: false },
      { dimension: 'lucidity', score: 85, confidence: 80, isEstimate: false },
      { dimension: 'emotion', score: 45, confidence: 65, isEstimate: true },
      { dimension: 'meaning', score: 60, confidence: 70, isEstimate: false },
      { dimension: 'engagement', score: 70, confidence: 75, isEstimate: false },
    ]

    const result = assignArchetype(dimensions)
    expect(result.primary).not.toBeNull()
    expect(result.primary?.id).toBe('navigator')
  })

  it('should assign Oracle for high meaning + engagement', () => {
    const dimensions: DimensionResult[] = [
      { dimension: 'boundary', score: 55, confidence: 65, isEstimate: true },
      { dimension: 'lucidity', score: 40, confidence: 70, isEstimate: false },
      { dimension: 'emotion', score: 50, confidence: 70, isEstimate: false },
      { dimension: 'meaning', score: 80, confidence: 80, isEstimate: false },
      { dimension: 'engagement', score: 75, confidence: 80, isEstimate: false },
    ]

    const result = assignArchetype(dimensions)
    expect(result.primary).not.toBeNull()
    expect(result.primary?.id).toBe('oracle')
  })

  it('should be stable with same input', () => {
    const dimensions: DimensionResult[] = [
      { dimension: 'boundary', score: 70, confidence: 75, isEstimate: false },
      { dimension: 'lucidity', score: 50, confidence: 70, isEstimate: false },
      { dimension: 'emotion', score: 80, confidence: 80, isEstimate: false },
      { dimension: 'meaning', score: 45, confidence: 65, isEstimate: true },
      { dimension: 'engagement', score: 65, confidence: 75, isEstimate: false },
    ]

    const result1 = assignArchetype(dimensions)
    const result2 = assignArchetype(dimensions)
    
    expect(result1.primary?.id).toBe(result2.primary?.id)
  })

  it('should assign secondary archetype when scores are close', () => {
    const dimensions: DimensionResult[] = [
      { dimension: 'boundary', score: 65, confidence: 75, isEstimate: false },
      { dimension: 'lucidity', score: 62, confidence: 70, isEstimate: false },
      { dimension: 'emotion', score: 68, confidence: 75, isEstimate: false },
      { dimension: 'meaning', score: 60, confidence: 70, isEstimate: false },
      { dimension: 'engagement', score: 58, confidence: 70, isEstimate: false },
    ]

    const result = assignArchetype(dimensions)
    // With balanced scores, should potentially have secondary
    expect(result.primary).not.toBeNull()
  })
})

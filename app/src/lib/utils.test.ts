import { describe, it, expect, vi } from 'vitest'
import { safeParseJSON } from './utils'

describe('safeParseJSON', () => {
  it('should parse valid JSON correctly', () => {
    const result = safeParseJSON('{"name": "test"}', {})
    expect(result).toEqual({ name: 'test' })
  })

  it('should parse arrays correctly', () => {
    const result = safeParseJSON<string[]>('["a", "b", "c"]', [])
    expect(result).toEqual(['a', 'b', 'c'])
  })

  it('should return fallback on invalid JSON', () => {
    const fallback = { error: true }
    const result = safeParseJSON('invalid json{', fallback)
    expect(result).toEqual(fallback)
  })

  it('should return fallback on empty string', () => {
    const fallback = []
    const result = safeParseJSON('', fallback)
    expect(result).toEqual(fallback)
  })

  it('should log error on parse failure', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    safeParseJSON('bad{json', {})
    expect(consoleErrorSpy).toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  })

  it('should handle null values correctly', () => {
    const result = safeParseJSON('null', 'fallback')
    expect(result).toBeNull()
  })

  it('should handle numbers correctly', () => {
    const result = safeParseJSON('42', 0)
    expect(result).toBe(42)
  })

  it('should handle booleans correctly', () => {
    const result = safeParseJSON('true', false)
    expect(result).toBe(true)
  })
})


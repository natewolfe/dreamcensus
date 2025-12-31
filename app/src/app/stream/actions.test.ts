import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getStreamQuestions, saveStreamResponse } from './actions'
import { db } from '@/lib/db'
import { ensureSession } from '@/lib/auth'

// Mock dependencies
vi.mock('@/lib/db', () => ({
  db: {
    streamResponse: {
      findMany: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
    streamQuestion: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth', () => ({
  ensureSession: vi.fn(),
}))

describe('Stream Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(ensureSession).mockResolvedValue({
      userId: 'test-user-id',
      sessionId: 'test-session-id',
      isNew: false,
    })
  })

  describe('getStreamQuestions', () => {
    it('should return unanswered questions', async () => {
      const mockAnsweredResponses = [
        { questionId: 'q1' },
        { questionId: 'q2' },
      ]
      
      const mockQuestions = [
        {
          id: 'q1',
          text: 'Question 1',
          category: 'dreams',
          tags: JSON.stringify(['tag1']),
        },
        {
          id: 'q2',
          text: 'Question 2',
          category: 'sleep',
          tags: JSON.stringify(['tag2']),
        },
        {
          id: 'q3',
          text: 'Question 3',
          category: 'dreams',
          tags: JSON.stringify(['tag3']),
        },
      ]

      vi.mocked(db.streamResponse.findMany).mockResolvedValue(mockAnsweredResponses as any)
      vi.mocked(db.streamQuestion.findMany).mockResolvedValue(mockQuestions as any)

      const result = await getStreamQuestions(10)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('q3')
      expect(result[0].tags).toEqual(['tag3'])
    })

    it('should limit results to requested amount', async () => {
      vi.mocked(db.streamResponse.findMany).mockResolvedValue([])
      
      const mockQuestions = Array.from({ length: 50 }, (_, i) => ({
        id: `q${i}`,
        text: `Question ${i}`,
        category: 'dreams',
        tags: JSON.stringify([]),
      }))

      vi.mocked(db.streamQuestion.findMany).mockResolvedValue(mockQuestions as any)

      const result = await getStreamQuestions(5)

      expect(result).toHaveLength(5)
    })

    it('should prioritize less-shown questions', async () => {
      vi.mocked(db.streamResponse.findMany).mockResolvedValue([])
      
      const mockQuestions = [
        {
          id: 'q1',
          text: 'Question 1',
          category: 'dreams',
          tags: JSON.stringify([]),
          timesShown: 10,
          tier: 1,
        },
        {
          id: 'q2',
          text: 'Question 2',
          category: 'dreams',
          tags: JSON.stringify([]),
          timesShown: 1,
          tier: 1,
        },
      ]

      vi.mocked(db.streamQuestion.findMany).mockResolvedValue(mockQuestions as any)

      const result = await getStreamQuestions(10)

      // Should be ordered by timesShown ascending
      expect(db.streamQuestion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [
            { timesShown: 'asc' },
            { tier: 'asc' },
          ],
        })
      )
    })

    it('should only return approved questions', async () => {
      vi.mocked(db.streamResponse.findMany).mockResolvedValue([])
      vi.mocked(db.streamQuestion.findMany).mockResolvedValue([])

      await getStreamQuestions(10)

      expect(db.streamQuestion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            approved: true,
          },
        })
      )
    })

    it('should handle malformed JSON tags gracefully', async () => {
      vi.mocked(db.streamResponse.findMany).mockResolvedValue([])
      
      const mockQuestions = [
        {
          id: 'q1',
          text: 'Question 1',
          category: 'dreams',
          tags: 'invalid json{',
        },
      ]

      vi.mocked(db.streamQuestion.findMany).mockResolvedValue(mockQuestions as any)

      const result = await getStreamQuestions(10)

      expect(result[0].tags).toEqual([]) // Fallback to empty array
    })
  })

  describe('saveStreamResponse', () => {
    it('should save a yes response', async () => {
      vi.mocked(db.streamResponse.create).mockResolvedValue({} as any)
      vi.mocked(db.streamQuestion.update).mockResolvedValue({} as any)

      const result = await saveStreamResponse('q1', 'yes')

      expect(result).toEqual({ success: true })
      expect(db.streamResponse.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'test-user-id',
          questionId: 'q1',
          response: 'yes',
        }),
      })
    })

    it('should save a no response', async () => {
      vi.mocked(db.streamResponse.create).mockResolvedValue({} as any)
      vi.mocked(db.streamQuestion.update).mockResolvedValue({} as any)

      const result = await saveStreamResponse('q1', 'no')

      expect(result).toEqual({ success: true })
      expect(db.streamResponse.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          response: 'no',
        }),
      })
    })

    it('should save expanded text when provided', async () => {
      vi.mocked(db.streamResponse.create).mockResolvedValue({} as any)
      vi.mocked(db.streamQuestion.update).mockResolvedValue({} as any)

      await saveStreamResponse('q1', 'yes', 'This is my detailed response')

      expect(db.streamResponse.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          expandedText: 'This is my detailed response',
        }),
      })
    })

    it('should save time on card when provided', async () => {
      vi.mocked(db.streamResponse.create).mockResolvedValue({} as any)
      vi.mocked(db.streamQuestion.update).mockResolvedValue({} as any)

      await saveStreamResponse('q1', 'yes', undefined, 5000)

      expect(db.streamResponse.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          timeOnCard: 5000,
        }),
      })
    })

    it('should update question analytics for yes response', async () => {
      vi.mocked(db.streamResponse.create).mockResolvedValue({} as any)
      vi.mocked(db.streamQuestion.update).mockResolvedValue({} as any)

      await saveStreamResponse('q1', 'yes')

      expect(db.streamQuestion.update).toHaveBeenCalledWith({
        where: { id: 'q1' },
        data: expect.objectContaining({
          timesShown: { increment: 1 },
          yesCount: { increment: 1 },
        }),
      })
    })

    it('should update question analytics for no response', async () => {
      vi.mocked(db.streamResponse.create).mockResolvedValue({} as any)
      vi.mocked(db.streamQuestion.update).mockResolvedValue({} as any)

      await saveStreamResponse('q1', 'no')

      expect(db.streamQuestion.update).toHaveBeenCalledWith({
        where: { id: 'q1' },
        data: expect.objectContaining({
          timesShown: { increment: 1 },
          noCount: { increment: 1 },
        }),
      })
    })

    it('should update expand rate when expanded text provided', async () => {
      vi.mocked(db.streamResponse.create).mockResolvedValue({} as any)
      vi.mocked(db.streamQuestion.update).mockResolvedValue({} as any)

      await saveStreamResponse('q1', 'yes', 'Expanded text')

      expect(db.streamQuestion.update).toHaveBeenCalledWith({
        where: { id: 'q1' },
        data: expect.objectContaining({
          expandRate: { increment: 0.01 },
        }),
      })
    })

    it('should not increment yes/no count for skip response', async () => {
      vi.mocked(db.streamResponse.create).mockResolvedValue({} as any)
      vi.mocked(db.streamQuestion.update).mockResolvedValue({} as any)

      await saveStreamResponse('q1', 'skip')

      expect(db.streamQuestion.update).toHaveBeenCalledWith({
        where: { id: 'q1' },
        data: expect.objectContaining({
          timesShown: { increment: 1 },
        }),
      })
      
      const updateCall = vi.mocked(db.streamQuestion.update).mock.calls[0][0]
      expect(updateCall.data).not.toHaveProperty('yesCount')
      expect(updateCall.data).not.toHaveProperty('noCount')
    })
  })
})


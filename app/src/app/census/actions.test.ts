import { describe, it, expect, vi, beforeEach } from 'vitest'
import { saveAnswer, submitCensus, getSavedProgress } from './actions'
import { db } from '@/lib/db'
import { ensureSession } from '@/lib/auth'
import { SCHEMA_VERSION } from '@/lib/constants'

// Mock dependencies
vi.mock('@/lib/db', () => ({
  db: {
    censusResponse: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    censusResponsePart: {
      upsert: vi.fn(),
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    censusStep: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

vi.mock('@/lib/auth', () => ({
  ensureSession: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('Census Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(ensureSession).mockResolvedValue({
      userId: 'test-user-id',
      sessionId: 'test-session-id',
      isNew: false,
    })
  })

  describe('saveAnswer', () => {
    it('should save a new answer', async () => {
      const mockResponse = { id: 'response-1', userId: 'test-user-id', version: SCHEMA_VERSION }
      
      vi.mocked(db.censusResponse.findFirst).mockResolvedValue(mockResponse as any)
      vi.mocked(db.censusResponsePart.upsert).mockResolvedValue({} as any)

      const formData = new FormData()
      formData.set('stepId', 'step-1')
      formData.set('value', JSON.stringify('test answer'))

      const result = await saveAnswer(formData)

      expect(result).toEqual({ success: true })
      expect(db.censusResponsePart.upsert).toHaveBeenCalledWith({
        where: {
          responseId_stepId: {
            responseId: 'response-1',
            stepId: 'step-1',
          },
        },
        update: expect.objectContaining({
          answer: JSON.stringify('test answer'),
        }),
        create: expect.objectContaining({
          responseId: 'response-1',
          stepId: 'step-1',
          answer: JSON.stringify('test answer'),
        }),
      })
    })

    it('should create a new census response if none exists', async () => {
      const newResponse = { id: 'new-response', userId: 'test-user-id', version: SCHEMA_VERSION }
      
      vi.mocked(db.censusResponse.findFirst).mockResolvedValue(null)
      vi.mocked(db.censusResponse.create).mockResolvedValue(newResponse as any)
      vi.mocked(db.censusResponsePart.upsert).mockResolvedValue({} as any)

      const formData = new FormData()
      formData.set('stepId', 'step-1')
      formData.set('value', JSON.stringify('test answer'))

      const result = await saveAnswer(formData)

      expect(result).toEqual({ success: true })
      expect(db.censusResponse.create).toHaveBeenCalledWith({
        data: {
          userId: 'test-user-id',
          version: SCHEMA_VERSION,
          status: 'in_progress',
        },
      })
    })

    it('should handle invalid data', async () => {
      const formData = new FormData()
      // Missing stepId and value

      const result = await saveAnswer(formData)

      expect(result).toEqual({ error: 'Invalid answer data' })
    })

    it('should handle array values', async () => {
      const mockResponse = { id: 'response-1', userId: 'test-user-id', version: SCHEMA_VERSION }
      
      vi.mocked(db.censusResponse.findFirst).mockResolvedValue(mockResponse as any)
      vi.mocked(db.censusResponsePart.upsert).mockResolvedValue({} as any)

      const formData = new FormData()
      formData.set('stepId', 'step-1')
      formData.set('value', JSON.stringify(['option1', 'option2']))

      const result = await saveAnswer(formData)

      expect(result).toEqual({ success: true })
      expect(db.censusResponsePart.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            answer: JSON.stringify(['option1', 'option2']),
          }),
        })
      )
    })
  })

  describe('submitCensus', () => {
    it('should submit census with all answers', async () => {
      const mockSteps = [
        { id: 'step-1', analyticsKey: 'q1' },
        { id: 'step-2', analyticsKey: 'q2' },
      ]
      const mockResponse = { id: 'response-1', userId: 'test-user-id', version: SCHEMA_VERSION }

      vi.mocked(db.censusStep.findMany).mockResolvedValue(mockSteps as any)
      vi.mocked(db.$transaction).mockImplementation(async (callback: any) => {
        vi.mocked(db.censusResponse.findFirst).mockResolvedValue(mockResponse as any)
        vi.mocked(db.censusResponsePart.deleteMany).mockResolvedValue({} as any)
        vi.mocked(db.censusResponsePart.createMany).mockResolvedValue({} as any)
        vi.mocked(db.censusResponse.update).mockResolvedValue(mockResponse as any)
        
        return await callback(db)
      })

      const result = await submitCensus({
        answers: {
          q1: 'answer1',
          q2: 'answer2',
        },
      })

      expect(result).toEqual({ success: true, responseId: 'response-1' })
    })

    it('should handle invalid census data', async () => {
      const result = await submitCensus({
        answers: 'invalid',
      })

      expect(result).toEqual({ error: 'Invalid census data' })
    })

    it('should handle database errors', async () => {
      vi.mocked(db.censusStep.findMany).mockRejectedValue(new Error('Database error'))

      const result = await submitCensus({
        answers: { q1: 'answer1' },
      })

      expect(result).toEqual({ error: 'Failed to submit census. Please try again.' })
    })

    it('should filter out invalid step keys', async () => {
      const mockSteps = [
        { id: 'step-1', analyticsKey: 'q1' },
      ]
      const mockResponse = { id: 'response-1', userId: 'test-user-id', version: SCHEMA_VERSION }

      vi.mocked(db.censusStep.findMany).mockResolvedValue(mockSteps as any)
      
      let capturedAnswerData: any[] = []
      vi.mocked(db.$transaction).mockImplementation(async (callback: any) => {
        vi.mocked(db.censusResponse.findFirst).mockResolvedValue(mockResponse as any)
        vi.mocked(db.censusResponsePart.deleteMany).mockResolvedValue({} as any)
        vi.mocked(db.censusResponsePart.createMany).mockImplementation((data: any) => {
          capturedAnswerData = data.data
          return Promise.resolve({} as any)
        })
        vi.mocked(db.censusResponse.update).mockResolvedValue(mockResponse as any)
        
        return await callback(db)
      })

      await submitCensus({
        answers: {
          q1: 'answer1',
          invalidKey: 'should be filtered',
        },
      })

      expect(capturedAnswerData).toHaveLength(1)
      expect(capturedAnswerData[0].stepId).toBe('step-1')
    })
  })

  describe('getSavedProgress', () => {
    it('should return saved progress', async () => {
      const mockResponse = {
        id: 'response-1',
        startedAt: new Date(),
        parts: [
          {
            stepId: 'step-1',
            answer: JSON.stringify('answer1'),
            step: { analyticsKey: 'q1' },
          },
          {
            stepId: 'step-2',
            answer: JSON.stringify('answer2'),
            step: { analyticsKey: null },
          },
        ],
      }

      vi.mocked(db.censusResponse.findFirst).mockResolvedValue(mockResponse as any)

      const result = await getSavedProgress()

      expect(result).toEqual({
        responseId: 'response-1',
        answers: {
          q1: 'answer1',
          'step-2': 'answer2',
        },
        startedAt: mockResponse.startedAt,
      })
    })

    it('should return null if no progress exists', async () => {
      vi.mocked(db.censusResponse.findFirst).mockResolvedValue(null)

      const result = await getSavedProgress()

      expect(result).toBeNull()
    })

    it('should handle malformed JSON gracefully', async () => {
      const mockResponse = {
        id: 'response-1',
        startedAt: new Date(),
        parts: [
          {
            stepId: 'step-1',
            answer: 'invalid json{',
            step: { analyticsKey: 'q1' },
          },
        ],
      }

      vi.mocked(db.censusResponse.findFirst).mockResolvedValue(mockResponse as any)

      const result = await getSavedProgress()

      expect(result).toEqual({
        responseId: 'response-1',
        answers: {
          q1: null, // Fallback value from safeParseJSON
        },
        startedAt: mockResponse.startedAt,
      })
    })
  })
})


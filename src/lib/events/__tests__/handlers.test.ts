import { describe, it, expect, beforeEach, vi } from 'vitest'
import { dispatchEventHandlers } from '../handlers'
import { db } from '../../db'
import type { Event } from '@/generated/prisma'
import { EVENT_TYPES } from '../../constants'

// Mock the database
vi.mock('../../db', () => ({
  db: {
    dreamEntry: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    censusAnswer: {
      upsert: vi.fn(),
    },
    consent: {
      create: vi.fn(),
    },
    promptResponse: {
      create: vi.fn(),
    },
    nightCheckIn: {
      upsert: vi.fn(),
    },
    tag: {
      upsert: vi.fn(),
    },
    dreamTag: {
      create: vi.fn(),
    },
  },
}))

describe('Event Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('JOURNAL_ENTRY_CREATED', () => {
    it('should create dream entry projection', async () => {
      const event: Event = {
        id: 'evt1',
        sequence: BigInt(1),
        type: EVENT_TYPES.JOURNAL_ENTRY_CREATED,
        userId: 'user1',
        aggregateId: 'dream1',
        aggregateType: 'dream',
        payload: {
          ciphertext: 'encrypted',
          iv: 'iv123',
          keyVersion: 1,
          title: 'Test Dream',
          emotions: ['joy', 'curious'],
          vividness: 75,
          lucidity: 'yes',
          isLucid: true,
          isNightmare: false,
          isRecurring: false,
          capturedAt: new Date().toISOString(),
        },
        createdAt: new Date(),
      }

      await dispatchEventHandlers(event)

      expect(db.dreamEntry.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: 'dream1',
          userId: 'user1',
          title: 'Test Dream',
          emotions: ['joy', 'curious'],
          vividness: 75,
          lucidity: 'yes',
          dreamTypes: ['lucid'],
        }),
      })
    })

    it('should handle tags in payload', async () => {
      const event: Event = {
        id: 'evt2',
        sequence: BigInt(2),
        type: EVENT_TYPES.JOURNAL_ENTRY_CREATED,
        userId: 'user1',
        aggregateId: 'dream2',
        aggregateType: 'dream',
        payload: {
          title: 'Tagged Dream',
          tags: ['flying', 'water'],
          emotions: [],
          capturedAt: new Date().toISOString(),
        },
        createdAt: new Date(),
      }

      vi.mocked(db.tag.upsert).mockResolvedValue({
        id: 'tag1',
        name: 'flying',
        slug: 'flying',
        category: 'custom',
        usageCount: 1,
        createdAt: new Date(),
      })

      vi.mocked(db.dreamEntry.create).mockResolvedValue({
        id: 'dream2',
        userId: 'user1',
        title: 'Tagged Dream',
        ciphertext: null,
        iv: null,
        keyVersion: 1,
        audioUrl: null,
        emotions: [],
        vividness: null,
        lucidity: null,
        dreamTypes: [],
        wakingLifeLink: null,
        capturedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await dispatchEventHandlers(event)

      expect(db.tag.upsert).toHaveBeenCalledTimes(2)
      expect(db.dreamTag.create).toHaveBeenCalledTimes(2)
    })
  })

  describe('JOURNAL_ENTRY_UPDATED', () => {
    it('should update dream entry projection', async () => {
      const event: Event = {
        id: 'evt3',
        sequence: BigInt(3),
        type: EVENT_TYPES.JOURNAL_ENTRY_UPDATED,
        userId: 'user1',
        aggregateId: 'dream1',
        aggregateType: 'dream',
        payload: {
          title: 'Updated Title',
          emotions: ['calm'],
          vividness: 50,
        },
        createdAt: new Date(),
      }

      await dispatchEventHandlers(event)

      expect(db.dreamEntry.update).toHaveBeenCalledWith({
        where: { id: 'dream1' },
        data: expect.objectContaining({
          title: 'Updated Title',
          emotions: ['calm'],
          vividness: 50,
        }),
      })
    })
  })

  describe('JOURNAL_ENTRY_DELETED', () => {
    it('should delete dream entry projection', async () => {
      const event: Event = {
        id: 'evt4',
        sequence: BigInt(4),
        type: EVENT_TYPES.JOURNAL_ENTRY_DELETED,
        userId: 'user1',
        aggregateId: 'dream1',
        aggregateType: 'dream',
        payload: {},
        createdAt: new Date(),
      }

      await dispatchEventHandlers(event)

      expect(db.dreamEntry.delete).toHaveBeenCalledWith({
        where: { id: 'dream1' },
      })
    })
  })

  describe('CENSUS_ANSWER_SUBMITTED', () => {
    it('should upsert census answer', async () => {
      const event: Event = {
        id: 'evt5',
        sequence: BigInt(5),
        type: EVENT_TYPES.CENSUS_ANSWER_SUBMITTED,
        userId: 'user1',
        aggregateId: null,
        aggregateType: null,
        payload: {
          questionId: 'q1',
          value: { answer: 'agree' },
          instrumentVersion: 1,
        },
        createdAt: new Date(),
      }

      await dispatchEventHandlers(event)

      expect(db.censusAnswer.upsert).toHaveBeenCalledWith({
        where: {
          userId_questionId: {
            userId: 'user1',
            questionId: 'q1',
          },
        },
        create: expect.objectContaining({
          userId: 'user1',
          questionId: 'q1',
          value: { answer: 'agree' },
        }),
        update: expect.objectContaining({
          value: { answer: 'agree' },
        }),
      })
    })
  })

  describe('NIGHT_CHECKED_IN', () => {
    it('should upsert night check-in', async () => {
      const event: Event = {
        id: 'evt6',
        sequence: BigInt(6),
        type: EVENT_TYPES.NIGHT_CHECKED_IN,
        userId: 'user1',
        aggregateId: null,
        aggregateType: null,
        payload: {
          date: '2026-01-08',
          mood: 'good',
          dayNotes: 'Had a productive day',
          intention: 'Dream of flying',
          plannedWakeTime: '07:00',
          reminderEnabled: true,
        },
        createdAt: new Date(),
      }

      await dispatchEventHandlers(event)

      expect(db.nightCheckIn.upsert).toHaveBeenCalledWith({
        where: {
          userId_date: {
            userId: 'user1',
            date: '2026-01-08',
          },
        },
        create: expect.objectContaining({
          userId: 'user1',
          date: '2026-01-08',
          mood: 'good',
        }),
        update: expect.objectContaining({
          mood: 'good',
        }),
      })
    })
  })

  describe('Unknown event types', () => {
    it('should ignore unknown event types gracefully', async () => {
      const event: Event = {
        id: 'evt7',
        sequence: BigInt(7),
        type: 'unknown.event.type',
        userId: 'user1',
        aggregateId: null,
        aggregateType: null,
        payload: {},
        createdAt: new Date(),
      }

      // Should not throw
      await expect(dispatchEventHandlers(event)).resolves.not.toThrow()
    })
  })
})

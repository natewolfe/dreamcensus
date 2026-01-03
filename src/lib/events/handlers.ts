import type { Event } from '@/generated/prisma'
import { EVENT_TYPES } from '../constants'
import { db } from '../db'

/**
 * Event handler function type
 */
type EventHandler = (event: Event) => Promise<void>

/**
 * Registry of event handlers
 * Maps event types to arrays of handler functions
 */
const handlers: Partial<Record<string, EventHandler[]>> = {
  // Journal entry created - build projection
  [EVENT_TYPES.JOURNAL_ENTRY_CREATED]: [
    async (event) => {
      const payload = event.payload as any

      // Map boolean flags to dreamTypes array
      const dreamTypes: string[] = []
      if (payload.isLucid) dreamTypes.push('lucid')
      if (payload.isNightmare) dreamTypes.push('nightmare')
      if (payload.isRecurring) dreamTypes.push('recurring')

      // Create dream entry
      const entry = await db.dreamEntry.create({
        data: {
          id: event.aggregateId!,
          userId: event.userId,
          ciphertext: payload.ciphertext 
            ? Buffer.from(payload.ciphertext, 'base64') 
            : null,
          iv: payload.iv 
            ? Buffer.from(payload.iv, 'base64') 
            : null,
          keyVersion: payload.keyVersion ?? 1,
          audioUrl: payload.audioUrl,
          title: payload.title,
          emotions: payload.emotions || [],
          vividness: payload.vividness,
          lucidity: payload.lucidity,
          dreamTypes,
          wakingLifeLink: payload.wakingLifeLink,
          capturedAt: payload.capturedAt 
            ? new Date(payload.capturedAt) 
            : new Date(),
        },
      })

      // Create tag associations if tags provided
      if (payload.tags?.length) {
        for (const tagName of payload.tags) {
          const tag = await db.tag.upsert({
            where: { slug: tagName.toLowerCase().replace(/\s+/g, '-') },
            create: {
              name: tagName,
              slug: tagName.toLowerCase().replace(/\s+/g, '-'),
              category: 'custom',
            },
            update: { usageCount: { increment: 1 } },
          })
          
          await db.dreamTag.create({
            data: {
              dreamEntryId: entry.id,
              tagId: tag.id,
              source: 'user',
            },
          })
        }
      }
    },
  ],

  // Journal entry updated - update projection
  [EVENT_TYPES.JOURNAL_ENTRY_UPDATED]: [
    async (event) => {
      const payload = event.payload as any

      await db.dreamEntry.update({
        where: { id: event.aggregateId! },
        data: {
          ciphertext: payload.ciphertext,
          iv: payload.iv,
          emotions: payload.emotions,
          vividness: payload.vividness,
          lucidity: payload.lucidity,
          title: payload.title,
          wakingLifeLink: payload.wakingLifeLink,
        },
      })
    },
  ],

  // Journal entry deleted - soft delete projection
  [EVENT_TYPES.JOURNAL_ENTRY_DELETED]: [
    async (event) => {
      await db.dreamEntry.delete({
        where: { id: event.aggregateId! },
      })
    },
  ],

  // Census answer submitted - upsert projection
  [EVENT_TYPES.CENSUS_ANSWER_SUBMITTED]: [
    async (event) => {
      const payload = event.payload as any

      await db.censusAnswer.upsert({
        where: {
          userId_questionId: {
            userId: event.userId,
            questionId: payload.questionId,
          },
        },
        create: {
          userId: event.userId,
          questionId: payload.questionId,
          value: payload.value,
          instrumentVersion: payload.instrumentVersion || 1,
        },
        update: {
          value: payload.value,
        },
      })
    },
  ],

  // Consent granted/revoked - upsert projection
  [EVENT_TYPES.CONSENT_GRANTED]: [
    async (event) => {
      const payload = event.payload as any

      await db.consent.create({
        data: {
          userId: event.userId,
          scope: payload.scope,
          version: payload.version || 1,
          granted: true,
          receiptHash: payload.receiptHash,
          policyHash: payload.policyHash,
          jurisdiction: payload.jurisdiction,
          ipHash: payload.ipHash,
        },
      })
    },
  ],

  [EVENT_TYPES.CONSENT_REVOKED]: [
    async (event) => {
      const payload = event.payload as any

      await db.consent.create({
        data: {
          userId: event.userId,
          scope: payload.scope,
          version: payload.version || 1,
          granted: false,
          receiptHash: payload.receiptHash,
          policyHash: payload.policyHash,
          jurisdiction: payload.jurisdiction,
          ipHash: payload.ipHash,
        },
      })
    },
  ],

  // Prompt responses
  [EVENT_TYPES.PROMPT_RESPONDED]: [
    async (event) => {
      const payload = event.payload as any

      await db.promptResponse.create({
        data: {
          userId: event.userId,
          promptId: payload.promptId,
          value: payload.value,
          shownAt: payload.shownAt ? new Date(payload.shownAt) : new Date(),
          skipped: false,
        },
      })
    },
  ],

  [EVENT_TYPES.PROMPT_SKIPPED]: [
    async (event) => {
      const payload = event.payload as any

      await db.promptResponse.create({
        data: {
          userId: event.userId,
          promptId: payload.promptId,
          value: {},
          shownAt: payload.shownAt ? new Date(payload.shownAt) : new Date(),
          skipped: true,
        },
      })
    },
  ],

  // Night check-in
  [EVENT_TYPES.NIGHT_CHECKED_IN]: [
    async (event) => {
      const payload = event.payload as any

      // Night check-ins are stored in a separate model
      // For now, we just log the event
      // TODO: Create NightCheckIn model and store
      console.log('Night check-in:', event.userId, payload)
    },
  ],
}

/**
 * Dispatch all registered handlers for an event
 */
export async function dispatchEventHandlers(event: Event): Promise<void> {
  const eventHandlers = handlers[event.type]

  if (!eventHandlers || eventHandlers.length === 0) {
    // No handlers registered for this event type
    return
  }

  // Run all handlers in parallel
  await Promise.all(eventHandlers.map((handler) => handler(event)))
}

/**
 * Register a new event handler
 * Useful for adding handlers from feature modules
 */
export function registerEventHandler(
  eventType: string,
  handler: EventHandler
): void {
  if (!handlers[eventType]) {
    handlers[eventType] = []
  }
  handlers[eventType]!.push(handler)
}


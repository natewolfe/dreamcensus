import type { Event } from '@/generated/prisma'
import { getUserConsents } from '../consent'
import { EVENT_TYPES } from '../constants'
import { db } from '../db'
import { setDreamTags } from '../tags'
import type {
  JournalEntryCreatedPayload,
  JournalEntryUpdatedPayload,
  CensusAnswerSubmittedPayload,
  ConsentGrantedPayload,
  ConsentRevokedPayload,
  PromptRespondedPayload,
  PromptSkippedPayload,
  NightCheckedInPayload,
} from './types'

/**
 * Event handler function type (untyped for registry)
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
      const payload = event.payload as unknown as JournalEntryCreatedPayload

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
        await setDreamTags(entry.id, payload.tags)
      }

      // Gate AI and weather operations by consent
      const consents = await getUserConsents(event.userId)

      // Only queue AI extraction if user consented to insights
      if (consents.has('insights')) {
        // Future: Queue AI fact extraction job
        // await queueJob('ai.extract', { dreamId: entry.id })
      }

      // Only contribute to weather if consented to commons
      if (consents.has('commons')) {
        // Future: Queue weather contribution
        // await queueJob('weather.contribute', { dreamId: entry.id })
      }
    },
  ],

  // Journal entry updated - update projection
  [EVENT_TYPES.JOURNAL_ENTRY_UPDATED]: [
    async (event) => {
      const payload = event.payload as unknown as JournalEntryUpdatedPayload

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
      const payload = event.payload as unknown as CensusAnswerSubmittedPayload

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
      const payload = event.payload as unknown as ConsentGrantedPayload

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
      const payload = event.payload as unknown as ConsentRevokedPayload

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
      const payload = event.payload as unknown as PromptRespondedPayload

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
      const payload = event.payload as unknown as PromptSkippedPayload

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
      const payload = event.payload as unknown as NightCheckedInPayload

      await db.nightCheckIn.upsert({
        where: {
          userId_date: {
            userId: event.userId,
            date: payload.date ?? new Date().toISOString().split('T')[0] ?? '',
          },
        },
        create: {
          userId: event.userId,
          date: payload.date ?? new Date().toISOString().split('T')[0] ?? '',
          mood: payload.mood,
          dayNotes: payload.dayNotes,
          intention: payload.intention,
          plannedWakeTime: payload.plannedWakeTime,
          reminderEnabled: payload.reminderEnabled ?? false,
        },
        update: {
          mood: payload.mood,
          dayNotes: payload.dayNotes,
          intention: payload.intention,
          plannedWakeTime: payload.plannedWakeTime,
          reminderEnabled: payload.reminderEnabled ?? false,
        },
      })
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


import { db } from './db'
import type { Event } from '@/generated/prisma'
import type { EventType } from './constants'
import { dispatchEventHandlers } from './events/handlers'

/**
 * Input for emitting an event
 */
export interface EmitEventInput {
  type: EventType
  userId: string
  payload: Record<string, unknown>
  aggregateId?: string
  aggregateType?: string
}

/**
 * Emit an event to the event store
 * This is the primary way to record state changes in the system
 */
export async function emitEvent(input: EmitEventInput): Promise<Event> {
  // Create event in database
  const event = await db.event.create({
    data: {
      type: input.type,
      userId: input.userId,
      payload: input.payload as any,
      aggregateId: input.aggregateId,
      aggregateType: input.aggregateType,
    },
  })

  // Dispatch to handlers asynchronously (non-blocking)
  // Errors in handlers won't fail the mutation
  dispatchEventHandlers(event).catch((error) => {
    console.error('Error dispatching event handlers:', error)
  })

  return event
}

/**
 * Get events for a user
 */
export async function getEvents(
  userId: string,
  options?: {
    type?: EventType
    limit?: number
    afterSequence?: bigint
  }
): Promise<Event[]> {
  return db.event.findMany({
    where: {
      userId,
      type: options?.type,
      sequence: options?.afterSequence
        ? { gt: options.afterSequence }
        : undefined,
    },
    orderBy: { sequence: 'asc' },
    take: options?.limit,
  })
}

/**
 * Get events for an aggregate
 */
export async function getAggregateEvents(
  aggregateId: string,
  aggregateType: string
): Promise<Event[]> {
  return db.event.findMany({
    where: {
      aggregateId,
      aggregateType,
    },
    orderBy: { sequence: 'asc' },
  })
}

/**
 * Replay events to rebuild projections
 * Use with caution - this is for debugging and recovery
 */
export async function replayEvents(
  options?: {
    userId?: string
    type?: EventType
    fromSequence?: bigint
  }
): Promise<number> {
  const events = await db.event.findMany({
    where: {
      userId: options?.userId,
      type: options?.type,
      sequence: options?.fromSequence
        ? { gte: options.fromSequence }
        : undefined,
    },
    orderBy: { sequence: 'asc' },
  })

  let processed = 0

  for (const event of events) {
    try {
      await dispatchEventHandlers(event)
      processed++
    } catch (error) {
      console.error(`Failed to replay event ${event.id}:`, error)
    }
  }

  return processed
}


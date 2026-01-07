import type { EventType, EVENT_TYPES } from '../constants'

/**
 * Typed event payload definitions
 * Each event type has a specific payload structure
 */

// Journal Events
export interface JournalEntryCreatedPayload {
  ciphertext: string
  iv: string
  keyVersion: number
  audioUrl?: string
  title?: string
  emotions: string[]
  vividness?: number
  lucidity?: 'no' | 'maybe' | 'yes' | null
  isLucid?: boolean
  isNightmare?: boolean
  isRecurring?: boolean
  wakingLifeLink?: string
  capturedAt?: string
  tags?: string[]
}

export interface JournalEntryUpdatedPayload {
  ciphertext?: string
  iv?: string
  emotions?: string[]
  vividness?: number
  lucidity?: 'no' | 'maybe' | 'yes' | null
  title?: string
  wakingLifeLink?: string
}

export interface JournalEntryDeletedPayload {
  dreamId?: string
  reason?: string
}

export interface JournalFactsExtractedPayload {
  facts: Array<{
    type: string
    value: string
    confidence: number
  }>
}

// Census Events
export interface CensusAnswerSubmittedPayload {
  questionId: string
  value: Record<string, unknown>
  instrumentVersion?: number
}

export interface CensusSectionCompletedPayload {
  sectionId: string
  completedAt: string
}

// Prompt Events
export interface PromptShownPayload {
  promptId: string
  shownAt: string
}

export interface PromptRespondedPayload {
  promptId: string
  value: Record<string, unknown>
  shownAt?: string
}

export interface PromptSkippedPayload {
  promptId: string
  shownAt?: string
}

// Consent Events
export interface ConsentGrantedPayload {
  scope: string
  version?: number
  receiptHash?: string
  policyHash?: string
  jurisdiction?: string
  ipHash?: string
}

export interface ConsentRevokedPayload {
  scope: string
  version?: number
  receiptHash?: string
  policyHash?: string
  jurisdiction?: string
  ipHash?: string
}

// Auth Events
export interface UserCreatedPayload {
  email?: string
  method: 'email' | 'anonymous'
}

export interface UserKeyRotatedPayload {
  oldKeyVersion: number
  newKeyVersion: number
}

// Night Mode Events
export interface NightCheckedInPayload {
  mood?: string
  dayNotes?: string
  dayReflection?: string
  intention?: string
  reminderTime?: string
  plannedWakeTime?: string
  reminderEnabled?: boolean
  breathingPattern?: string
  breathingDuration?: number
  date?: string
  checkedInAt?: string
}

// Alarm Events
export interface AlarmSettingsUpdatedPayload {
  schedule?: Array<{ dayOfWeek: number; enabled: boolean; wakeTimeLocal: string }>
  soundId?: string
  volume?: number
  snoozeMinutes?: number
  maxSnoozes?: number
}

export interface AlarmArmedPayload {
  armedAt: string
  nextAlarmAt: string | null
}

export interface AlarmDisarmedPayload {
  disarmedAt: string
}

export interface AlarmRangPayload {
  scheduledFor: string
  actualRingAt: string
  source: 'schedule' | 'override'
}

export interface AlarmSnoozedPayload {
  snoozeNumber: number
  snoozeUntil: string
}

export interface AlarmStoppedPayload {
  stoppedAt: string
  snoozeCount: number
  routedToCapture: boolean
  dreamEntryId?: string
}

export interface AlarmMissedPayload {
  scheduledFor: string
  missedAt: string
  reason: 'tab_closed' | 'browser_closed' | 'unknown'
}

/**
 * Map of event types to their payload types
 */
export interface EventPayloadMap {
  [EVENT_TYPES.JOURNAL_ENTRY_CREATED]: JournalEntryCreatedPayload
  [EVENT_TYPES.JOURNAL_ENTRY_UPDATED]: JournalEntryUpdatedPayload
  [EVENT_TYPES.JOURNAL_ENTRY_DELETED]: JournalEntryDeletedPayload
  [EVENT_TYPES.JOURNAL_FACTS_EXTRACTED]: JournalFactsExtractedPayload
  [EVENT_TYPES.CENSUS_ANSWER_SUBMITTED]: CensusAnswerSubmittedPayload
  [EVENT_TYPES.CENSUS_SECTION_COMPLETED]: CensusSectionCompletedPayload
  [EVENT_TYPES.PROMPT_SHOWN]: PromptShownPayload
  [EVENT_TYPES.PROMPT_RESPONDED]: PromptRespondedPayload
  [EVENT_TYPES.PROMPT_SKIPPED]: PromptSkippedPayload
  [EVENT_TYPES.CONSENT_GRANTED]: ConsentGrantedPayload
  [EVENT_TYPES.CONSENT_REVOKED]: ConsentRevokedPayload
  [EVENT_TYPES.USER_CREATED]: UserCreatedPayload
  [EVENT_TYPES.USER_KEY_ROTATED]: UserKeyRotatedPayload
  [EVENT_TYPES.NIGHT_CHECKED_IN]: NightCheckedInPayload
  [EVENT_TYPES.ALARM_SETTINGS_UPDATED]: AlarmSettingsUpdatedPayload
  [EVENT_TYPES.ALARM_ARMED]: AlarmArmedPayload
  [EVENT_TYPES.ALARM_DISARMED]: AlarmDisarmedPayload
  [EVENT_TYPES.ALARM_RANG]: AlarmRangPayload
  [EVENT_TYPES.ALARM_SNOOZED]: AlarmSnoozedPayload
  [EVENT_TYPES.ALARM_STOPPED]: AlarmStoppedPayload
  [EVENT_TYPES.ALARM_MISSED]: AlarmMissedPayload
}

/**
 * Typed event structure
 * Provides type safety for event payloads based on event type
 */
export type TypedEvent<T extends EventType = EventType> = {
  id: string
  type: T
  userId: string
  payload: EventPayloadMap[T]
  aggregateId?: string | null
  aggregateType?: string | null
  sequence: bigint
  createdAt: Date
}

/**
 * Input for emitting a typed event
 */
export type EmitEventInput<T extends EventType = EventType> = {
  type: T
  userId: string
  payload: EventPayloadMap[T]
  aggregateId?: string
  aggregateType?: string
}

/**
 * Typed event handler function
 */
export type TypedEventHandler<T extends EventType = EventType> = (
  event: TypedEvent<T>
) => Promise<void>


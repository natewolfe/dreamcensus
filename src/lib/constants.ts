/**
 * Core emotion tags used in Morning Mode
 */
export const CORE_EMOTIONS = [
  'anxious',
  'awe',
  'tender',
  'shame',
  'joy',
  'fear',
  'calm',
  'confused',
] as const

/**
 * Expanded emotion list (shown when user taps "more")
 */
export const EXPANDED_EMOTIONS = [
  'anger',
  'sadness',
  'surprise',
  'disgust',
  'love',
  'longing',
  'curiosity',
  'peace',
  'dread',
  'wonder',
  'grief',
  'relief',
] as const

/**
 * All available emotions
 */
export const ALL_EMOTIONS = [...CORE_EMOTIONS, ...EXPANDED_EMOTIONS] as const

export type Emotion = (typeof ALL_EMOTIONS)[number]

/**
 * Event types for event sourcing
 */
export const EVENT_TYPES = {
  // Journal
  JOURNAL_ENTRY_CREATED: 'journal.entry.created',
  JOURNAL_ENTRY_UPDATED: 'journal.entry.updated',
  JOURNAL_ENTRY_DELETED: 'journal.entry.deleted',
  JOURNAL_FACTS_EXTRACTED: 'journal.facts.extracted',

  // Census
  CENSUS_ANSWER_SUBMITTED: 'census.answer.submitted',
  CENSUS_SECTION_COMPLETED: 'census.section.completed',

  // Prompts
  PROMPT_SHOWN: 'prompt.shown',
  PROMPT_RESPONDED: 'prompt.responded',
  PROMPT_SKIPPED: 'prompt.skipped',

  // Consent
  CONSENT_GRANTED: 'consent.granted',
  CONSENT_REVOKED: 'consent.revoked',

  // Auth
  USER_CREATED: 'user.created',
  USER_KEY_ROTATED: 'user.key.rotated',

  // Night mode
  NIGHT_CHECKED_IN: 'night.checked_in',

  // Alarm
  ALARM_SETTINGS_UPDATED: 'alarm.settings.updated',
  ALARM_ARMED: 'alarm.armed',
  ALARM_DISARMED: 'alarm.disarmed',
  ALARM_RANG: 'alarm.rang',
  ALARM_SNOOZED: 'alarm.snoozed',
  ALARM_STOPPED: 'alarm.stopped',
  ALARM_MISSED: 'alarm.missed',

  // Profile
  USER_PROFILE_UPDATED: 'user.profile.updated',
  
  // Dream Profile
  PROFILE_RECALCULATED: 'profile.recalculated',
  PROFILE_LEVEL_UNLOCKED: 'profile.level.unlocked',
} as const

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES]

/**
 * Cache tags for Next.js cache invalidation
 */
export const CACHE_TAGS = {
  USER_PROFILE: (userId: string) => `user:${userId}`,
  USER_JOURNAL: (userId: string) => `journal:${userId}`,
  USER_INSIGHTS: (userId: string) => `insights:${userId}`,

  CENSUS_SECTIONS: 'census:sections',
  CENSUS_PROGRESS: (userId: string) => `census:progress:${userId}`,

  WEATHER_METRIC: (metric: string) => `weather:${metric}`,
  WEATHER_COLLECTIVE: 'weather:collective',
} as const

/**
 * Consent tiers
 */
export const CONSENT_TIERS = {
  PERSONAL: 'personal',
  INSIGHTS: 'insights',
  COMMONS: 'commons',
  STUDY: (studyId: string) => `study:${studyId}`,
} as const

/**
 * Lucidity levels
 */
export const LUCIDITY_LEVELS = ['no', 'maybe', 'yes'] as const
export type LucidityLevel = (typeof LUCIDITY_LEVELS)[number]

/**
 * Dream types
 */
export const DREAM_TYPES = [
  'nightmare',
  'recurring',
  'lucid',
  'prophetic',
  'healing',
  'visitation',
] as const

export type DreamType = (typeof DREAM_TYPES)[number]

/**
 * Prompt types
 */
export const PROMPT_TYPES = ['reflection', 'exploration', 'research', 'creative'] as const

export type PromptType = (typeof PROMPT_TYPES)[number]

/**
 * Response types for prompts
 */
export const RESPONSE_TYPES = ['text', 'scale', 'choice', 'multi_choice'] as const

export type ResponseType = (typeof RESPONSE_TYPES)[number]

/**
 * Census question types
 */
export const QUESTION_TYPES = [
  'statement',
  'single_choice',
  'multi_choice',
  'scale',
  'text',
  'number',
] as const

export type QuestionType = (typeof QUESTION_TYPES)[number]

/**
 * Maximum values
 */
export const MAX_VALUES = {
  EMOTIONS_PER_DREAM: 10,
  TAGS_PER_DREAM: 20,
  NARRATIVE_LENGTH: 50000, // characters
  VOICE_RECORDING_DURATION: 300, // seconds (5 minutes)
} as const

/**
 * Navigation items
 */
export const NAV_ITEMS = [
  { href: '/today', label: 'Dashboard', icon: 'home' },
  { href: '/weather', label: 'Weather', icon: 'cloud' },
  { href: '/census', label: 'Census', icon: 'clipboard' },
  { href: '/journal', label: 'Journal', icon: 'book' },
  { href: '/learn', label: 'Learn', icon: 'academic' },
] as const


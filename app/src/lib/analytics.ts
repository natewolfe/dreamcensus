/**
 * Analytics event tracking system
 */

export interface AnalyticsEvent {
  name: string
  properties: Record<string, any>
  timestamp: Date
  userId?: string
  sessionId?: string
}

export interface UserTraits {
  email?: string
  locale?: string
  timezone?: string
  consentData?: boolean
  consentMarketing?: boolean
}

/**
 * Track an analytics event
 * 
 * In production, integrate with:
 * - Vercel Analytics
 * - PostHog
 * - Mixpanel
 * - Amplitude
 * - Custom analytics backend
 */
export async function track(event: AnalyticsEvent): Promise<void> {
  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event.name, event.properties)
  }

  // TODO: Send to analytics service
  // Example: await fetch('/api/analytics', { method: 'POST', body: JSON.stringify(event) })
}

/**
 * Identify a user with traits
 */
export async function identify(userId: string, traits: UserTraits): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Identify', userId, traits)
  }

  // TODO: Send to analytics service
}

/**
 * Track page view
 */
export async function pageView(path: string, properties?: Record<string, any>): Promise<void> {
  await track({
    name: 'Page View',
    properties: {
      path,
      ...properties,
    },
    timestamp: new Date(),
  })
}

// Convenience functions for common events

export async function trackCensusStart(userId: string, chapterSlug?: string): Promise<void> {
  await track({
    name: 'Census Started',
    properties: { chapterSlug },
    timestamp: new Date(),
    userId,
  })
}

export async function trackCensusComplete(userId: string, chapterSlug?: string): Promise<void> {
  await track({
    name: 'Census Completed',
    properties: { chapterSlug },
    timestamp: new Date(),
    userId,
  })
}

export async function trackStreamResponse(
  userId: string,
  questionId: string,
  response: string,
  hasExpandedText: boolean
): Promise<void> {
  await track({
    name: 'Stream Response',
    properties: {
      questionId,
      response,
      hasExpandedText,
    },
    timestamp: new Date(),
    userId,
  })
}

export async function trackError(
  error: Error,
  context?: Record<string, any>
): Promise<void> {
  await track({
    name: 'Error',
    properties: {
      message: error.message,
      stack: error.stack,
      ...context,
    },
    timestamp: new Date(),
  })
}


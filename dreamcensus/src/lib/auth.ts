import { cookies } from 'next/headers'
import { cache } from 'react'
import { db } from './db'

/**
 * Session object returned by getSession()
 */
export interface Session {
  userId: string
  sessionId: string
  expiresAt: Date
  keyVersion: number
  deviceId?: string
}

/**
 * Get the current session from cookie
 * Cached per request to avoid multiple DB lookups
 */
export const getSession = cache(async (): Promise<Session | null> => {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session')?.value

  if (!sessionToken) {
    return null
  }

  // Hash the token for DB lookup
  const tokenHash = await hashToken(sessionToken)

  // Look up session in database
  const session = await db.session.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          encryptionKeyVersion: true,
        },
      },
    },
  })

  if (!session) {
    return null
  }

  // Check if session is expired
  if (session.expiresAt < new Date()) {
    // Clean up expired session
    await db.session.delete({ where: { id: session.id } })
    return null
  }

  // Update last active time
  await db.session.update({
    where: { id: session.id },
    data: { lastActiveAt: new Date() },
  })

  return {
    userId: session.userId,
    sessionId: session.id,
    expiresAt: session.expiresAt,
    keyVersion: session.user.encryptionKeyVersion,
    deviceId: session.deviceId ?? undefined,
  }
})

/**
 * Ensure a session exists, throw if not authenticated
 */
export async function ensureSession(): Promise<Session> {
  const session = await getSession()

  if (!session) {
    throw new Error('Unauthorized: No active session')
  }

  return session
}

/**
 * Create a new session for a user
 */
export async function createSession(
  userId: string,
  deviceId?: string,
  deviceName?: string
): Promise<string> {
  // Generate a random session token
  const sessionToken = generateSessionToken()
  const tokenHash = await hashToken(sessionToken)

  // Set expiry to 30 days from now
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)

  // Create session in database
  await db.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      deviceId,
      deviceName,
    },
  })

  // Set cookie
  const cookieStore = await cookies()
  cookieStore.set('session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })

  return sessionToken
}

/**
 * Destroy the current session
 */
export async function destroySession(): Promise<void> {
  const session = await getSession()

  if (session) {
    // Delete from database
    await db.session.delete({ where: { id: session.sessionId } })
  }

  // Clear cookie
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

/**
 * Generate a cryptographically secure session token
 */
function generateSessionToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Hash a session token using SHA-256
 */
export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}


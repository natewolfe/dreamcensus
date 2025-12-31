import { cookies } from 'next/headers'
import { db } from './db'
import * as crypto from 'crypto'
import { SESSION_DURATION_MS } from './constants'

const SESSION_COOKIE_NAME = 'dream_census_session'

/**
 * Generate a cryptographically secure session token
 */
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Hash a session token for storage
 */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * Create a new anonymous user and session
 */
export async function createAnonymousSession(): Promise<{
  userId: string
  sessionId: string
  token: string
}> {
  // Create anonymous user
  const user = await db.user.create({
    data: {
      // No email for anonymous users
      locale: 'en',
      timezone: 'UTC',
    },
  })

  // Create session
  const token = generateSessionToken()
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)

  const session = await db.session.create({
    data: {
      id: tokenHash, // Use hash as ID for lookup
      userId: user.id,
      expiresAt,
    },
  })

  return {
    userId: user.id,
    sessionId: session.id,
    token,
  }
}

/**
 * Get current session from cookies
 */
export async function getSession(): Promise<{
  userId: string
  sessionId: string
} | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  const tokenHash = hashToken(token)
  
  const session = await db.session.findUnique({
    where: { id: tokenHash },
    include: { user: true },
  })

  if (!session) {
    return null
  }

  // Check if session is expired
  if (session.expiresAt < new Date()) {
    // Clean up expired session
    await db.session.delete({ where: { id: tokenHash } })
    return null
  }

  return {
    userId: session.userId,
    sessionId: session.id,
  }
}

/**
 * Set session cookie
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_MS / 1000, // in seconds
    path: '/',
  })
}

/**
 * Clear session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

/**
 * Ensure user has a session, creating anonymous one if needed
 */
export async function ensureSession(): Promise<{
  userId: string
  sessionId: string
  isNew: boolean
}> {
  const existing = await getSession()
  
  if (existing) {
    return { ...existing, isNew: false }
  }

  // Create new anonymous session
  const { userId, sessionId, token } = await createAnonymousSession()
  await setSessionCookie(token)
  
  return { userId, sessionId, isNew: true }
}

/**
 * Get or create user for current request
 * Call this in Server Components or Server Actions
 */
export async function getCurrentUser() {
  const session = await ensureSession()
  
  const user = await db.user.findUnique({
    where: { id: session.userId },
  })

  return user
}


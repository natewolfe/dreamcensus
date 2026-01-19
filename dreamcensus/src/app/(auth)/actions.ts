'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { createSession, hashToken } from '@/lib/auth'
import type { ActionResult } from '@/lib/actions'

/**
 * Mock verification codes storage (in-memory for dev)
 * In production, this would use Redis or similar
 */
const pendingCodes = new Map<string, { code: string; expiresAt: Date; isNewUser: boolean }>()

// Mock code for easy testing (also shown in UI)
const MOCK_CODE = '123456'

/**
 * Initiate auth flow - send "email" with confirmation code
 */
export async function sendAuthCode(
  email: string,
  isNewUser: boolean
): Promise<ActionResult<void>> {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Please enter a valid email address' }
    }

    // For "Sign In" mode, check if user exists
    if (!isNewUser) {
      const existingUser = await db.user.findUnique({
        where: { email: email.toLowerCase() },
      })
      if (!existingUser) {
        return {
          success: false,
          error: 'No account found with this email. Did you mean to Get Started?',
        }
      }
    }

    // For "Get Started" mode, check if user already exists
    if (isNewUser) {
      const existingUser = await db.user.findUnique({
        where: { email: email.toLowerCase() },
      })
      if (existingUser) {
        return {
          success: false,
          error: 'An account already exists with this email. Please Sign In instead.',
        }
      }
    }

    // Store pending verification (expires in 10 minutes)
    pendingCodes.set(email.toLowerCase(), {
      code: MOCK_CODE,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      isNewUser,
    })

    // In production: send actual email here
    // For mock: code is always 123456 and shown in UI

    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Failed to send verification code' }
  }
}

/**
 * Verify code and complete authentication
 */
export async function verifyAuthCode(
  email: string,
  code: string
): Promise<ActionResult<{ redirectTo: string }>> {
  try {
    const pending = pendingCodes.get(email.toLowerCase())

    if (!pending) {
      return { success: false, error: 'No pending verification. Please request a new code.' }
    }

    if (pending.expiresAt < new Date()) {
      pendingCodes.delete(email.toLowerCase())
      return { success: false, error: 'Code expired. Please request a new one.' }
    }

    if (pending.code !== code) {
      return { success: false, error: 'Invalid code. Please try again.' }
    }

    // Code is valid - clean up
    pendingCodes.delete(email.toLowerCase())

    let user
    if (pending.isNewUser) {
      // Create new user
      user = await db.user.create({
        data: {
          email: email.toLowerCase(),
          emailVerifiedAt: new Date(),
        },
      })
    } else {
      // Find existing user
      user = await db.user.findUnique({
        where: { email: email.toLowerCase() },
      })
      if (!user) {
        return { success: false, error: 'User not found' }
      }
    }

    // Create session
    await createSession(user.id)

    // Determine redirect destination
    const redirectTo = pending.isNewUser ? '/onboarding/setup' : '/today'

    return { success: true, data: { redirectTo } }
  } catch {
    return { success: false, error: 'Verification failed. Please try again.' }
  }
}

/**
 * Reset database for fresh "Get Started" experience (dev only)
 */
export async function resetUserDatabase(): Promise<ActionResult<void>> {
  if (process.env.NODE_ENV === 'production') {
    return { success: false, error: 'Not allowed in production' }
  }

  try {
    // Delete all users and cascade to related data
    await db.user.deleteMany({})

    // Clear any existing session cookie
    const cookieStore = await cookies()
    cookieStore.delete('session')

    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Failed to reset database' }
  }
}

/**
 * Create a private (device-only) session without email
 * User can later upgrade to email-based account
 */
export async function createPrivateSession(): Promise<ActionResult<void>> {
  try {
    // Create user without email (private/local mode)
    const user = await db.user.create({
      data: {
        // No email - this is a private session
        displayName: null,
        keyRecoveryMethod: 'device', // Keys stored on device only
      },
    })

    // Create session
    await createSession(user.id)

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Failed to create private session:', error)
    return { success: false, error: 'Failed to create session' }
  }
}

/**
 * Sign out - destroy session and redirect
 */
export async function signOut(): Promise<void> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session')?.value

  if (sessionToken) {
    // Hash the token for DB lookup
    const tokenHash = await hashToken(sessionToken)

    // Delete session from database
    await db.session.deleteMany({ where: { tokenHash } })
  }

  cookieStore.delete('session')
  redirect('/')
}


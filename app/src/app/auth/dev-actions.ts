'use server'

import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { getSession, clearSessionCookie, createAnonymousSession, setSessionCookie } from '@/lib/auth'

/**
 * Development-only actions for testing authentication
 * These should NOT be available in production
 */

/**
 * Sign out and clear session cookie
 */
export async function devSignOut() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Dev actions not available in production')
  }

  await clearSessionCookie()
  redirect('/')
}

/**
 * Sign out and delete ALL user data for current session
 * WARNING: This permanently deletes the user and all associated data
 */
export async function devSignOutAndClearData() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Dev actions not available in production')
  }

  const session = await getSession()
  
  if (session) {
    // Delete user and all associated data (cascading deletes)
    await db.user.delete({
      where: { id: session.userId },
    })
  }

  await clearSessionCookie()
  redirect('/')
}

/**
 * Create a fresh anonymous session (mock sign in)
 */
export async function devCreateFreshSession() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Dev actions not available in production')
  }

  const { token } = await createAnonymousSession()
  await setSessionCookie(token)
  redirect('/')
}

/**
 * Mock sign in with email (creates user with email)
 */
export async function devSignInWithEmail(email: string) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Dev actions not available in production')
  }

  // Check if user exists
  let user = await db.user.findUnique({
    where: { email },
  })

  if (!user) {
    // Create user with email
    user = await db.user.create({
      data: {
        email,
        locale: 'en',
        timezone: 'UTC',
      },
    })
  }

  // Create session for this user
  const { token } = await createAnonymousSession()
  
  // Update session to use the email user
  const cookieStore = await cookies()
  const currentToken = cookieStore.get('dream_census_session')?.value
  
  if (currentToken) {
    const crypto = await import('crypto')
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    
    await db.session.update({
      where: { id: tokenHash },
      data: { userId: user.id },
    })
  }

  await setSessionCookie(token)
  redirect('/')
}


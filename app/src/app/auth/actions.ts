'use server'

import { db } from '@/lib/db'
import { ensureSession, setSessionCookie } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import * as crypto from 'crypto'

const EmailSchema = z.object({
  email: z.string().email(),
})

const VerifyCodeSchema = z.object({
  code: z.string().length(6),
})

const OnboardingSchema = z.object({
  displayName: z.string().optional(),
  birthYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  country: z.string().optional(),
  dreamFrequency: z.enum(['rarely', 'sometimes', 'often', 'always']).optional(),
})

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function sendMagicLink(data: unknown) {
  const parsed = EmailSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Invalid email address' }
  }

  const { email } = parsed.data
  const session = await ensureSession()

  try {
    // Check if user already has email
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    let userId = session.userId

    // If email exists and it's not the current user, they're signing in
    if (existingUser && existingUser.id !== session.userId) {
      userId = existingUser.id
    } else if (!existingUser) {
      // Update current anonymous user with email
      await db.user.update({
        where: { id: session.userId },
        data: { email },
      })
    }

    // Generate verification token and code
    const token = generateToken()
    const code = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    await db.verificationToken.create({
      data: {
        userId,
        token,
        code,
        type: 'magic_link',
        expiresAt,
      },
    })

    // TODO: Send email with magic link and code
    // For development, just log it
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Magic link: ${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`)
      console.log(`[DEV] Code: ${code}`)
    }

    return { success: true, email }
  } catch (error) {
    console.error('Send magic link error:', error)
    return { error: 'Failed to send magic link. Please try again.' }
  }
}

export async function verifyCode(data: unknown) {
  const parsed = VerifyCodeSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Invalid code' }
  }

  const { code } = parsed.data

  try {
    const verification = await db.verificationToken.findFirst({
      where: {
        code,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    })

    if (!verification) {
      return { error: 'Invalid or expired code' }
    }

    // Mark as used
    await db.verificationToken.update({
      where: { id: verification.id },
      data: { usedAt: new Date() },
    })

    // Update email verified
    await db.user.update({
      where: { id: verification.userId },
      data: { emailVerified: new Date() },
    })

    revalidatePath('/profile')

    return { success: true, needsOnboarding: verification.user.onboardingStep === 0 }
  } catch (error) {
    console.error('Verify code error:', error)
    return { error: 'Verification failed. Please try again.' }
  }
}

export async function completeOnboarding(data: unknown) {
  const session = await ensureSession()

  const parsed = OnboardingSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Invalid onboarding data' }
  }

  try {
    await db.user.update({
      where: { id: session.userId },
      data: {
        ...parsed.data,
        onboardingStep: 5,
      },
    })

    revalidatePath('/profile')

    return { success: true }
  } catch (error) {
    console.error('Onboarding error:', error)
    return { error: 'Failed to save profile. Please try again.' }
  }
}


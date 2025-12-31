'use server'

import { db } from '@/lib/db'
import { ensureSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const UpdateProfileSchema = z.object({
  displayName: z.string().optional(),
  birthYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  country: z.string().optional(),
  dreamFrequency: z.enum(['rarely', 'sometimes', 'often', 'always']).optional(),
  locale: z.string().optional(),
  timezone: z.string().optional(),
  consentData: z.boolean().optional(),
  consentMarketing: z.boolean().optional(),
})

export async function updateProfile(data: unknown) {
  const session = await ensureSession()

  const parsed = UpdateProfileSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Invalid profile data' }
  }

  try {
    await db.user.update({
      where: { id: session.userId },
      data: parsed.data,
    })

    revalidatePath('/profile')
    revalidatePath('/profile/settings')

    return { success: true }
  } catch (error) {
    console.error('Update profile error:', error)
    return { error: 'Failed to update profile. Please try again.' }
  }
}


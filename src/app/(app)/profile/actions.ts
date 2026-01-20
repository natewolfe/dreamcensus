'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { emitEvent } from '@/lib/events'
import { db } from '@/lib/db'
import { withAuth, type ActionResult } from '@/lib/actions'
import { computeLongestStreak } from '@/lib/streak'
import { getCensusProgressSummary } from '@/lib/census/progress'
import type { ProfileData, ProfileStats } from '@/lib/profile'

// Schema for profile updates
const UpdateProfileSchema = z.object({
  displayName: z.string().max(50).optional(),
  avatarEmoji: z.string().max(4).optional(),
  avatarBgColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
})

/**
 * Get user profile identity data
 */
export async function getProfileData(): Promise<ActionResult<ProfileData>> {
  return withAuth(async (session) => {
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        displayName: true,
        avatarEmoji: true,
        avatarBgColor: true,
        createdAt: true,
      },
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    return {
      success: true,
      data: {
        displayName: user.displayName,
        avatarEmoji: user.avatarEmoji ?? '🌙',
        avatarBgColor: user.avatarBgColor ?? '#5c6bc0',
        memberSince: user.createdAt,
      },
    }
  })
}

/**
 * Get aggregated profile statistics
 */
export async function getProfileStats(): Promise<ActionResult<ProfileStats>> {
  return withAuth(async (session) => {
    const [
      totalDreams,
      lucidCount,
      journalStreak,
      censusProgress,
      promptsAnswered,
      recentEmotions,
    ] = await Promise.all([
      // Total dreams
      db.dreamEntry.count({ where: { userId: session.userId } }),
      
      // Lucid dreams count
      db.dreamEntry.count({
        where: { userId: session.userId, lucidity: 'yes' },
      }),
      
      // Longest journal streak
      computeLongestStreak(session.userId),
      
      // Census progress (using shared utility)
      getCensusProgressSummary(session.userId),
      
      // Prompts answered (not skipped)
      db.promptResponse.count({
        where: { userId: session.userId, skipped: false },
      }),
      
      // Recent dreams for emotion aggregation
      db.dreamEntry.findMany({
        where: { userId: session.userId },
        select: { emotions: true },
        take: 100,
        orderBy: { capturedAt: 'desc' },
      }),
    ])

    // Aggregate top 3 emotions
    const emotionCounts = new Map<string, number>()
    recentEmotions.forEach((d) =>
      d.emotions.forEach((e) =>
        emotionCounts.set(e, (emotionCounts.get(e) ?? 0) + 1)
      )
    )
    const topEmotions = [...emotionCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name)

    // Calculate lucid percentage (handle 0 dreams)
    const lucidPercentage = totalDreams > 0
      ? Math.round((lucidCount / totalDreams) * 100)
      : 0

    return {
      success: true,
      data: {
        totalDreams,
        journalStreak,
        lucidPercentage,
        censusProgress: censusProgress.percentage,
        promptsAnswered,
        topEmotions,
      },
    }
  })
}

/**
 * Update user profile via event sourcing
 */
export async function updateProfile(
  input: z.infer<typeof UpdateProfileSchema>
): Promise<ActionResult<void>> {
  return withAuth(async (session) => {
    try {
      const data = UpdateProfileSchema.parse(input)

      await emitEvent({
        type: 'user.profile.updated',
        userId: session.userId,
        payload: data,
      })

      revalidatePath('/profile')
      revalidatePath('/settings')
      // Revalidate layout for ProfileMenu avatar
      revalidatePath('/', 'layout')

      return { success: true, data: undefined }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: 'Invalid profile data' }
      }
      console.error('updateProfile error:', error)
      return { success: false, error: 'Failed to update profile' }
    }
  })
}

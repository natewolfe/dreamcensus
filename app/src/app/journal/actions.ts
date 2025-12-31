'use server'

import { db } from '@/lib/db'
import { ensureSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const CreateDreamSchema = z.object({
  textRaw: z.string().min(1),
  captureMode: z.enum(['text', 'voice', 'drawing']).default('text'),
  clarity: z.number().int().min(1).max(5).optional(),
  lucidity: z.number().int().min(1).max(5).optional(),
  emotional: z.number().int().min(1).max(5).optional(),
  isNightmare: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
  sleepDuration: z.number().optional(),
  sleepQuality: z.number().int().min(1).max(5).optional(),
  audioUrl: z.string().optional(),
  drawingUrl: z.string().optional(),
  transcript: z.string().optional(),
})

const UpdateDreamSchema = CreateDreamSchema.partial()

export async function createDreamEntry(data: unknown) {
  const session = await ensureSession()

  const parsed = CreateDreamSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Invalid dream data' }
  }

  try {
    const dream = await db.dreamEntry.create({
      data: {
        userId: session.userId,
        ...parsed.data,
      },
    })

    revalidatePath('/journal')
    revalidatePath('/profile')

    return { success: true, dreamId: dream.id }
  } catch (error) {
    console.error('Create dream error:', error)
    return { error: 'Failed to save dream. Please try again.' }
  }
}

export async function updateDreamEntry(dreamId: string, data: unknown) {
  const session = await ensureSession()

  const parsed = UpdateDreamSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Invalid dream data' }
  }

  try {
    // Verify ownership
    const existing = await db.dreamEntry.findUnique({
      where: { id: dreamId },
      select: { userId: true },
    })

    if (!existing || existing.userId !== session.userId) {
      return { error: 'Dream not found' }
    }

    const dream = await db.dreamEntry.update({
      where: { id: dreamId },
      data: parsed.data,
    })

    revalidatePath('/journal')
    revalidatePath(`/journal/${dreamId}`)

    return { success: true, dream }
  } catch (error) {
    console.error('Update dream error:', error)
    return { error: 'Failed to update dream. Please try again.' }
  }
}

export async function deleteDreamEntry(dreamId: string) {
  const session = await ensureSession()

  try {
    // Verify ownership
    const existing = await db.dreamEntry.findUnique({
      where: { id: dreamId },
      select: { userId: true },
    })

    if (!existing || existing.userId !== session.userId) {
      return { error: 'Dream not found' }
    }

    await db.dreamEntry.delete({
      where: { id: dreamId },
    })

    revalidatePath('/journal')

    return { success: true }
  } catch (error) {
    console.error('Delete dream error:', error)
    return { error: 'Failed to delete dream. Please try again.' }
  }
}

export async function getDreamEntry(dreamId: string) {
  const session = await ensureSession()

  const dream = await db.dreamEntry.findFirst({
    where: {
      id: dreamId,
      userId: session.userId,
    },
    include: {
      symbols: {
        include: {
          symbol: true,
        },
      },
      emotions: {
        include: {
          emotion: true,
        },
      },
    },
  })

  return dream
}


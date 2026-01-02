'use server'

import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function getThemePreference(): Promise<string> {
  try {
    const session = await getSession()
    if (!session) return 'dark'
    
    const prefs = await db.userPreferences.findUnique({
      where: { userId: session.userId },
      select: { theme: true },
    })
    
    return prefs?.theme || 'dark'
  } catch (error) {
    console.error('Failed to get theme preference:', error)
    return 'dark'
  }
}


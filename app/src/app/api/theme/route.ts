import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { theme } = await request.json()
    
    if (!theme || typeof theme !== 'string') {
      return NextResponse.json({ error: 'Invalid theme' }, { status: 400 })
    }
    
    // Upsert user preferences
    await db.userPreferences.upsert({
      where: { userId: session.userId },
      create: {
        userId: session.userId,
        theme,
      },
      update: {
        theme,
      },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Theme API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


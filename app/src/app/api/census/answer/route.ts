import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { questionId, answer, source = 'card' } = await request.json()

    if (!questionId || answer === undefined || answer === null) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Update question analytics
    await db.question.update({
      where: { id: questionId },
      data: {
        timesShown: { increment: 1 },
      },
    })

    // Upsert response
    await db.questionResponse.upsert({
      where: {
        userId_questionId: {
          userId: session.userId,
          questionId,
        },
      },
      create: {
        userId: session.userId,
        questionId,
        answer,
        source,
      },
      update: {
        answer,
        source,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Answer API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


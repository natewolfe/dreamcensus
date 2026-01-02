import { Suspense } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCensusProgress } from '@/lib/question-selection'
import { DreamWeatherCompact } from '@/components/data/DreamWeatherCompact'
import { RitualPrompt } from '@/components/home/RitualPrompt'
import { CensusProgressCard } from '@/components/home/CensusProgressCard'
import { Card, Button, SpinnerFullScreen } from '@/components/ui'

export const metadata = {
  title: 'The Dream Census',
  description: 'Explore your relationship with dreams, sleep, and the inner life',
}

async function HomeContent() {
  const session = await getSession()

  // Get aggregate stats for Dream Weather
  const [totalDreams, avgClarity, lucidCount, nightmareCount, topSymbolsData] = await Promise.all([
    db.dreamEntry.count({ where: { isPublicAnon: true } }),
    db.dreamEntry.aggregate({
      where: { isPublicAnon: true, clarity: { not: null } },
      _avg: { clarity: true },
    }),
    db.dreamEntry.count({ where: { isPublicAnon: true, lucidity: { gte: 3 } } }),
    db.dreamEntry.count({ where: { isPublicAnon: true, isNightmare: true } }),
    db.dreamEntrySymbol.groupBy({
      by: ['symbolId'],
      _count: true,
      orderBy: { _count: { symbolId: 'desc' } },
      take: 5,
    }),
  ])

  // Get symbol names
  const symbolIds = topSymbolsData.map(s => s.symbolId)
  const symbols = await db.symbol.findMany({
    where: { id: { in: symbolIds } },
    select: { id: true, name: true },
  })

  const topSymbols = topSymbolsData.map(s => {
    const symbol = symbols.find(sym => sym.id === s.symbolId)
    return {
      symbol: symbol?.name || 'Unknown',
      count: s._count,
    }
  })

  const lucidRate = totalDreams > 0 ? lucidCount / totalDreams : 0
  const nightmareRate = totalDreams > 0 ? nightmareCount / totalDreams : 0

  // Calculate emotional intensity (simplified)
  const emotionalIntensity = nightmareRate * 0.7 + (1 - lucidRate) * 0.3

  const dreamWeatherStats = {
    totalDreams,
    averageClarity: avgClarity._avg.clarity || 0,
    lucidRate,
    nightmareRate,
    topSymbols,
    emotionalIntensity,
  }

  // Get census progress if logged in
  let censusProgressData = null
  let nextTheme = null
  if (session) {
    censusProgressData = await getCensusProgress(session.userId)

    // Get next incomplete theme
    const themes = await db.theme.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        questions: {
          where: { tier: { in: [1, 2] } },
          select: { id: true },
        },
      },
    })

    const answeredQuestionIds = await db.questionResponse.findMany({
      where: { userId: session.userId },
      select: { questionId: true },
    })

    const answeredSet = new Set(answeredQuestionIds.map(r => r.questionId))

    for (const theme of themes) {
      const remaining = theme.questions.filter(q => !answeredSet.has(q.id)).length
      if (remaining > 0) {
        nextTheme = {
          slug: theme.slug,
          name: theme.name,
          questionsRemaining: remaining,
        }
        break
      }
    }
  }

  // Check if user has captured dreams today
  const hasDreamsToday = session
    ? await db.dreamEntry.count({
        where: {
          userId: session.userId,
          capturedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }) > 0
    : false

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 space-y-6">
      {/* Dream Weather - Collective Data Hero */}
      <DreamWeatherCompact stats={dreamWeatherStats} />

      {/* Time-aware Ritual Prompt (morning/evening only) */}
      <RitualPrompt hasDreamsToday={hasDreamsToday} />

      {/* Census Progress (if logged in) */}
      {session && censusProgressData && (
        <CensusProgressCard
          progress={{
            percentage: censusProgressData.percentage,
            answered: censusProgressData.answered,
            total: censusProgressData.total,
            isComplete: censusProgressData.isComplete,
          }}
          nextTheme={nextTheme || undefined}
        />
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/journal">
          <Card className="hover:border-[var(--accent)] transition-colors cursor-pointer h-full">
            <div className="text-center">
              <div className="text-3xl mb-2">📔</div>
              <div className="font-medium mb-1">Journal</div>
              <div className="text-xs text-[var(--foreground-muted)]">
                View your dreams
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/explore">
          <Card className="hover:border-[var(--accent)] transition-colors cursor-pointer h-full">
            <div className="text-center">
              <div className="text-3xl mb-2">🔭</div>
              <div className="font-medium mb-1">Explore</div>
              <div className="text-xs text-[var(--foreground-muted)]">
                Collective insights
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Invite Friends (if logged in) */}
      {session && (
        <Card variant="glass" className="border-2 border-[var(--accent)]/20">
          <div className="text-center">
            <div className="text-3xl mb-3">👥</div>
            <h3 className="font-medium mb-2">Invite Friends</h3>
            <p className="text-sm text-[var(--foreground-muted)] mb-4">
              Help map the collective unconscious
            </p>
            <Link href="/invite">
              <Button variant="secondary" size="sm">
                Share Dream Census
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Not logged in prompt */}
      {!session && (
        <Card variant="flat">
          <div className="text-center">
            <div className="text-3xl mb-3">🌙</div>
            <h3 className="font-medium mb-2">Start Your Journey</h3>
            <p className="text-sm text-[var(--foreground-muted)] mb-4">
              Create an account to save your progress and unlock personalized insights
            </p>
            <Link href="/auth/signin">
              <Button variant="primary">
                Sign In
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}

export default function HomePage() {
  return (
    <AppShell activeNav="home">
      <Suspense fallback={<SpinnerFullScreen />}>
        <HomeContent />
      </Suspense>
    </AppShell>
  )
}

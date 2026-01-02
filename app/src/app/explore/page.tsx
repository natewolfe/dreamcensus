import { Suspense } from 'react'
import Link from 'next/link'
import { AppShell, PageHeader, ContentContainer } from '@/components/layout'
import { SpinnerFullScreen } from '@/components/ui'
import { db } from '@/lib/db'
import { DreamWeather } from '@/components/data/DreamWeather'

export const metadata = {
  title: 'Explore | Dream Census',
  description: 'Explore collective dream data and insights',
}

async function ExploreContent() {
  // Get aggregate stats
  const [totalDreams, avgClarity, lucidCount, nightmareCount, topSymbolsData, topEmotionsData] = await Promise.all([
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
      take: 20,
    }),
    db.dreamEntryEmotion.groupBy({
      by: ['emotionId'],
      _count: true,
      orderBy: { _count: { emotionId: 'desc' } },
      take: 12,
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

  // Get emotion names
  const emotionIds = topEmotionsData.map(e => e.emotionId)
  const emotions = await db.emotion.findMany({
    where: { id: { in: emotionIds } },
    select: { id: true, name: true },
  })

  const topEmotions = topEmotionsData.map(e => {
    const emotion = emotions.find(em => em.id === e.emotionId)
    return {
      emotion: emotion?.name || 'Unknown',
      count: e._count,
    }
  })

  const lucidRate = totalDreams > 0 ? lucidCount / totalDreams : 0
  const nightmareRate = totalDreams > 0 ? nightmareCount / totalDreams : 0

  const stats = {
    totalDreams,
    averageClarity: avgClarity._avg.clarity || 0,
    lucidRate,
    nightmareRate,
    symbolFrequency: topSymbols,
    emotionDistribution: topEmotions,
  }

  return (
    <ContentContainer>
      <div className="pb-12">
        {/* Dream Weather - Hero Feature */}
        <div className="mb-12">
          <h2 className="text-2xl font-medium mb-6">Dream Weather</h2>
          <Suspense fallback={
            <div className="h-96 bg-[var(--background-elevated)] rounded-xl animate-pulse border border-[var(--border)]" />
          }>
            <DreamWeather />
          </Suspense>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="p-6 bg-[var(--background-elevated)]/30 rounded-xl border border-[var(--border)]/50">
            <div className="text-3xl font-bold text-[var(--accent)] mb-1">
              {stats.totalDreams.toLocaleString()}
            </div>
            <div className="text-sm text-[var(--foreground-muted)]">Dreams</div>
          </div>
          
          <div className="p-6 bg-[var(--background-elevated)]/30 rounded-xl border border-[var(--border)]/50">
            <div className="text-3xl font-bold text-[var(--accent)] mb-1">
              {stats.averageClarity.toFixed(1)}
            </div>
            <div className="text-sm text-[var(--foreground-muted)]">Avg Clarity</div>
          </div>
          
          <div className="p-6 bg-[var(--background-elevated)]/30 rounded-xl border border-[var(--border)]/50">
            <div className="text-3xl font-bold text-[var(--accent)] mb-1">
              {(stats.lucidRate * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-[var(--foreground-muted)]">Lucid Rate</div>
          </div>
          
          <div className="p-6 bg-[var(--background-elevated)]/30 rounded-xl border border-[var(--border)]/50">
            <div className="text-3xl font-bold text-[var(--accent)] mb-1">
              {(stats.nightmareRate * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-[var(--foreground-muted)]">Nightmare Rate</div>
          </div>
        </div>

        {/* Top Symbols */}
        <div className="mb-12">
          <h2 className="text-2xl font-medium mb-6">Most Common Symbols</h2>
          {stats.symbolFrequency.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {stats.symbolFrequency.map((symbol) => (
                <Link
                  key={symbol.symbol}
                  href={`/explore/tag/${encodeURIComponent(symbol.symbol)}`}
                  className="px-4 py-2 bg-[var(--background-elevated)] border border-[var(--border)] rounded-full hover:border-[var(--accent)] transition-all"
                >
                  <span className="font-medium">{symbol.symbol}</span>
                  <span className="text-sm text-[var(--foreground-subtle)] ml-2">
                    ({symbol.count})
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-12 bg-[var(--background-elevated)]/30 border border-[var(--border)]/50 border-dashed rounded-xl text-center">
              <div className="text-4xl mb-3">🏷️</div>
              <p className="text-[var(--foreground-muted)]">
                Symbol data will appear here once dreams are captured
              </p>
            </div>
          )}
        </div>

        {/* Emotion Distribution */}
        <div className="mb-12">
          <h2 className="text-2xl font-medium mb-6">Dream Emotions</h2>
          {stats.emotionDistribution.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.emotionDistribution.map((emotion) => (
                <div
                  key={emotion.emotion}
                  className="p-4 bg-[var(--background-elevated)]/30 border border-[var(--border)]/50 rounded-lg"
                >
                  <div className="text-xl font-medium mb-1">{emotion.emotion}</div>
                  <div className="text-sm text-[var(--foreground-subtle)]">
                    {emotion.count} dreams
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 bg-[var(--background-elevated)]/30 border border-[var(--border)]/50 border-dashed rounded-xl text-center">
              <div className="text-4xl mb-3">💭</div>
              <p className="text-[var(--foreground-muted)]">
                Emotion distribution will appear here once dreams are captured
              </p>
            </div>
          )}
        </div>
      </div>
    </ContentContainer>
  )
}

export default function ExplorePage() {
  return (
    <AppShell activeNav="explore">
      <PageHeader
        title="Explore"
        subtitle="Collective dream data and insights"
      />
      <Suspense fallback={<SpinnerFullScreen />}>
        <ExploreContent />
      </Suspense>
    </AppShell>
  )
}


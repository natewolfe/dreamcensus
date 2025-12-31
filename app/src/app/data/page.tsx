import { Suspense } from 'react'
import Link from 'next/link'
import { AppShell, PageHeader, ContentContainer } from '@/components/layout'
import { getAggregateStats } from '@/lib/data/aggregates'
import { DreamWeather } from '@/components/data/DreamWeather'

export const metadata = {
  title: 'Dream Observatory | Dream Census',
  description: 'Explore collective dream data and insights',
}

async function DataOverviewContent() {
  const stats = await getAggregateStats()

  if (!stats) {
    return (
      <ContentContainer>
        <div className="text-center py-12 mb-12">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-medium mb-2">No Data Yet</h2>
          <p className="text-[var(--foreground-muted)]">
            Aggregate statistics will appear as dreams are collected
          </p>
        </div>

        {/* Placeholder: Symbols */}
        <div className="mb-12">
          <h2 className="text-2xl font-medium mb-6">Most Common Symbols</h2>
          <div className="p-12 bg-[var(--background-elevated)] border border-[var(--border)] border-dashed rounded-xl text-center">
            <div className="text-4xl mb-3">🏷️</div>
            <p className="text-[var(--foreground-muted)]">
              Symbol data will appear here once dreams are captured
            </p>
          </div>
        </div>

        {/* Placeholder: Emotions */}
        <div className="mb-12">
          <h2 className="text-2xl font-medium mb-6">Dream Emotions</h2>
          <div className="p-12 bg-[var(--background-elevated)] border border-[var(--border)] border-dashed rounded-xl text-center">
            <div className="text-4xl mb-3">💭</div>
            <p className="text-[var(--foreground-muted)]">
              Emotion distribution will appear here once dreams are captured
            </p>
          </div>
        </div>

        {/* Navigation to deeper views */}
        <div className="grid sm:grid-cols-3 gap-6">
          <Link
            href="/data/insights"
            className="p-6 bg-[var(--background-elevated)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)] transition-all"
          >
            <div className="text-4xl mb-3">📈</div>
            <div className="font-medium mb-2">Visual Insights</div>
            <div className="text-sm text-[var(--foreground-subtle)]">
              Interactive charts and graphs
            </div>
          </Link>
          
          <Link
            href="/data/search"
            className="p-6 bg-[var(--background-elevated)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)] transition-all"
          >
            <div className="text-4xl mb-3">🔍</div>
            <div className="font-medium mb-2">Search Dreams</div>
            <div className="text-sm text-[var(--foreground-subtle)]">
              Filter and explore the collection
            </div>
          </Link>
          
          <Link
            href="/data/symbols"
            className="p-6 bg-[var(--background-elevated)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)] transition-all"
          >
            <div className="text-4xl mb-3">🏷️</div>
            <div className="font-medium mb-2">Symbol Browser</div>
            <div className="text-sm text-[var(--foreground-subtle)]">
              Explore the dream taxonomy
            </div>
          </Link>
        </div>
      </ContentContainer>
    )
  }

  return (
    <ContentContainer>
      <div className="pb-12">
        {/* Dream Weather - Hero Feature */}
        <div className="mb-4">
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
              {stats.symbolFrequency.slice(0, 20).map((symbol) => (
                <Link
                  key={symbol.symbol}
                  href={`/data/symbols?q=${encodeURIComponent(symbol.symbol)}`}
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
              {stats.emotionDistribution.slice(0, 12).map((emotion) => (
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

        {/* Navigation to deeper views */}
        <div className="grid sm:grid-cols-3 gap-6">
          <Link
            href="/data/insights"
            className="p-6 bg-[var(--background-elevated)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)] transition-all"
          >
            <div className="text-4xl mb-3">📈</div>
            <div className="font-medium mb-2">Visual Insights</div>
            <div className="text-sm text-[var(--foreground-subtle)]">
              Interactive charts and graphs
            </div>
          </Link>
          
          <Link
            href="/data/search"
            className="p-6 bg-[var(--background-elevated)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)] transition-all"
          >
            <div className="text-4xl mb-3">🔍</div>
            <div className="font-medium mb-2">Search Dreams</div>
            <div className="text-sm text-[var(--foreground-subtle)]">
              Filter and explore the collection
            </div>
          </Link>
          
          <Link
            href="/data/symbols"
            className="p-6 bg-[var(--background-elevated)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)] transition-all"
          >
            <div className="text-4xl mb-3">🏷️</div>
            <div className="font-medium mb-2">Symbol Browser</div>
            <div className="text-sm text-[var(--foreground-subtle)]">
              Explore the dream taxonomy
            </div>
          </Link>
        </div>
      </div>
    </ContentContainer>
  )
}

export default function DataPage() {
  return (
    <AppShell activeNav="data">
      <PageHeader
        title="Dream Observatory"
        subtitle="Explore collective dream data and insights"
      />
      <Suspense
        fallback={
          <ContentContainer>
            <div className="text-center py-8">
              <div className="animate-spin w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full mx-auto" />
            </div>
          </ContentContainer>
        }
      >
        <DataOverviewContent />
      </Suspense>
    </AppShell>
  )
}

